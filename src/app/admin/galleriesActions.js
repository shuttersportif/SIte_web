"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { getAdminUser } from "../../lib/requireAdmin";

const TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function slugify(nom) {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function genToken() {
  return Array.from({ length: 6 }, () => TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)]).join("");
}

// étape 1 : crée la galerie et réserve, pour chaque photo, une URL signée
// d'upload direct vers Supabase Storage — le fichier ne transite jamais par
// le serveur Next.js (dont la limite de taille de requête, même augmentée,
// reste inadaptée à plusieurs photos HD envoyées d'un coup sur Vercel)
export async function prepareGalleryUpload({ nom, date, lieu, categorie, vis, photoCount }) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };
  if (!nom?.trim() || !photoCount) return { ok: false, message: "Données manquantes." };

  const base = slugify(nom) || "galerie";
  let id = base;
  let suffix = 1;
  for (;;) {
    const { data: existing } = await supabaseAdmin.from("galleries").select("id").eq("id", id).maybeSingle();
    if (!existing) break;
    suffix += 1;
    id = `${base}-${suffix}`;
  }

  const token = vis === "privee" ? genToken() : null;

  const { error: galError } = await supabaseAdmin.from("galleries").insert({
    id,
    nom: nom.trim(),
    categorie,
    lieu: lieu?.trim() || "",
    date: date || new Date().toISOString().slice(0, 10),
    visibilite: vis,
    token,
  });
  if (galError) return { ok: false, message: galError.message };

  const uploads = [];
  for (let i = 0; i < photoCount; i++) {
    const numero = i + 1;
    const path = `${id}/${numero}.jpg`;

    const [{ data: webSigned, error: webErr }, { data: origSigned, error: origErr }] = await Promise.all([
      supabaseAdmin.storage.from("gallery-web").createSignedUploadUrl(path),
      supabaseAdmin.storage.from("gallery-originals").createSignedUploadUrl(path),
    ]);
    if (webErr || origErr) {
      await supabaseAdmin.from("galleries").delete().eq("id", id);
      return { ok: false, message: (webErr || origErr).message };
    }

    uploads.push({ numero, path, webToken: webSigned.token, originalToken: origSigned.token });
  }

  return { ok: true, galleryId: id, token, uploads };
}

// étape 2 : une fois les fichiers envoyés directement depuis le navigateur
// (voir src/lib/uploadToSignedUrl.js), enregistre les lignes photos
export async function finalizeGalleryPhotos({ galleryId, photos, prix }) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const rows = photos.map(({ numero, path }) => ({
    gallery_id: galleryId,
    numero,
    src: supabaseAdmin.storage.from("gallery-web").getPublicUrl(path).data.publicUrl,
    original_path: path,
    prix: prix || 15,
  }));

  const { error } = await supabaseAdmin.from("photos").insert(rows);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/galerie");
  return { ok: true };
}

// nettoyage si l'upload échoue en cours de route (fichiers déjà envoyés
// orphelins compris, pour ne pas laisser traîner des galeries vides)
export async function cancelGalleryUpload(galleryId) {
  const admin = await getAdminUser();
  if (!admin) return;

  for (const bucket of ["gallery-web", "gallery-originals"]) {
    const { data: files } = await supabaseAdmin.storage.from(bucket).list(galleryId);
    if (files?.length) {
      await supabaseAdmin.storage.from(bucket).remove(files.map((f) => `${galleryId}/${f.name}`));
    }
  }

  await supabaseAdmin.from("galleries").delete().eq("id", galleryId);
}

// liste pour l'onglet Galeries de l'admin — via la clé service_role pour
// voir aussi les galeries privées (la policy RLS publique ne couvre que
// visibilite = 'publique')
export async function listGalleries() {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const { data, error } = await supabaseAdmin
    .from("galleries")
    .select("id, nom, categorie, lieu, date, visibilite, token, photos(src, numero)")
    .order("date", { ascending: false });
  if (error) return { ok: false, message: error.message };

  const galleries = data.map((g) => {
    const sorted = [...g.photos].sort((a, b) => a.numero - b.numero);
    return {
      id: g.id,
      nom: g.nom,
      categorie: g.categorie,
      lieu: g.lieu,
      date: g.date,
      visibilite: g.visibilite,
      token: g.token,
      photoCount: g.photos.length,
      cover: sorted[0]?.src || null,
    };
  });

  return { ok: true, galleries };
}

export async function toggleGalleryVisibility(galleryId, nextVisibilite) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const token = nextVisibilite === "privee" ? genToken() : null;
  const { error } = await supabaseAdmin
    .from("galleries")
    .update({ visibilite: nextVisibilite, token })
    .eq("id", galleryId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/galerie");
  return { ok: true, token };
}

export async function regenerateGalleryToken(galleryId) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const token = genToken();
  const { error } = await supabaseAdmin.from("galleries").update({ token }).eq("id", galleryId);
  if (error) return { ok: false, message: error.message };

  return { ok: true, token };
}

// détail complet pour la modale d'édition : infos de la galerie + toutes
// ses photos (le prix affiché/édité est celui de la première photo, les
// photos d'une même galerie partagent toujours le même prix dans l'admin)
export async function getGalleryDetail(galleryId) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const { data, error } = await supabaseAdmin
    .from("galleries")
    .select("id, nom, categorie, lieu, date, visibilite, token, photos(id, numero, src, prix)")
    .eq("id", galleryId)
    .single();
  if (error) return { ok: false, message: error.message };

  const photos = [...data.photos].sort((a, b) => a.numero - b.numero);
  return {
    ok: true,
    gallery: {
      id: data.id,
      nom: data.nom,
      categorie: data.categorie,
      lieu: data.lieu,
      date: data.date,
      visibilite: data.visibilite,
      token: data.token,
    },
    photos,
    prix: photos[0]?.prix ?? 15,
  };
}

// modifie les infos de la galerie et, si fourni, le prix de toutes ses
// photos (prix unique par galerie côté admin)
export async function updateGallery(galleryId, { nom, date, lieu, categorie, prix }) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };
  if (!nom?.trim()) return { ok: false, message: "Indiquez le nom de la course." };

  const { error: galError } = await supabaseAdmin
    .from("galleries")
    .update({ nom: nom.trim(), date, lieu: lieu?.trim() || "", categorie })
    .eq("id", galleryId);
  if (galError) return { ok: false, message: galError.message };

  if (prix != null) {
    const { error: prixError } = await supabaseAdmin.from("photos").update({ prix }).eq("gallery_id", galleryId);
    if (prixError) return { ok: false, message: prixError.message };
  }

  revalidatePath("/galerie");
  return { ok: true };
}

// réserve des URLs signées pour ajouter des photos à une galerie existante,
// en poursuivant la numérotation après la dernière photo en place
export async function prepareAddPhotos(galleryId, photoCount) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };
  if (!photoCount) return { ok: false, message: "Aucune photo à ajouter." };

  const { data: last } = await supabaseAdmin
    .from("photos")
    .select("numero")
    .eq("gallery_id", galleryId)
    .order("numero", { ascending: false })
    .limit(1);
  const start = (last?.[0]?.numero || 0) + 1;

  const uploads = [];
  for (let i = 0; i < photoCount; i++) {
    const numero = start + i;
    const path = `${galleryId}/${numero}.jpg`;

    const [{ data: webSigned, error: webErr }, { data: origSigned, error: origErr }] = await Promise.all([
      supabaseAdmin.storage.from("gallery-web").createSignedUploadUrl(path),
      supabaseAdmin.storage.from("gallery-originals").createSignedUploadUrl(path),
    ]);
    if (webErr || origErr) return { ok: false, message: (webErr || origErr).message };

    uploads.push({ numero, path, webToken: webSigned.token, originalToken: origSigned.token });
  }

  return { ok: true, uploads };
}

// retire une photo (fichiers Storage + ligne photos) — échoue si elle fait
// partie d'une commande existante (order_items en restreint la suppression,
// pour ne jamais perdre l'historique d'une vente)
export async function deletePhoto(galleryId, photoId, numero) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const { error } = await supabaseAdmin.from("photos").delete().eq("id", photoId);
  if (error) {
    return { ok: false, message: "Cette photo fait partie d'une commande et ne peut pas être supprimée." };
  }

  const path = `${galleryId}/${numero}.jpg`;
  await supabaseAdmin.storage.from("gallery-web").remove([path]);
  await supabaseAdmin.storage.from("gallery-originals").remove([path]);

  revalidatePath("/galerie");
  return { ok: true };
}

// supprime entièrement une galerie : fichiers Storage puis ligne galleries
// (cascade sur photos) — échoue si une de ses photos fait partie d'une
// commande existante
export async function deleteGallery(galleryId) {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, message: "Accès refusé." };

  const { error } = await supabaseAdmin.from("galleries").delete().eq("id", galleryId);
  if (error) {
    return { ok: false, message: "Cette galerie a des photos vendues et ne peut pas être supprimée." };
  }

  for (const bucket of ["gallery-web", "gallery-originals"]) {
    const { data: files } = await supabaseAdmin.storage.from(bucket).list(galleryId);
    if (files?.length) {
      await supabaseAdmin.storage.from(bucket).remove(files.map((f) => `${galleryId}/${f.name}`));
    }
  }

  revalidatePath("/galerie");
  return { ok: true };
}
