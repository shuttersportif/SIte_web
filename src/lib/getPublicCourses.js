import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

// lecture publique (catalogue visible de tous, policy RLS "publique") : un
// client supabase-js nu, sans lien aux cookies de la requête, pour que la
// page /galerie reste prérendue statiquement au lieu de devenir dynamique
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

// recharge le catalogue (galleries publiques + leurs photos) depuis Supabase,
// dans la même forme que l'ancien COURSES statique de galleryData.js, pour
// que Galerie.jsx/GalleryEngine.jsx n'aient rien à changer côté affichage
export const getPublicCourses = cache(async function getPublicCourses() {

  const { data: galleries } = await supabase
    .from("galleries")
    .select("id, nom, categorie, lieu, date, photos(id, numero, src, prix)")
    .eq("visibilite", "publique")
    .order("date", { ascending: false });

  if (!galleries) return [];

  return galleries.map((g) => ({
    id: g.id,
    nom: g.nom,
    categorie: g.categorie,
    lieu: g.lieu,
    date: g.date,
    photos: [...g.photos]
      .sort((a, b) => a.numero - b.numero)
      .map((p) => ({ id: p.id, src: p.src, prix: p.prix })),
  }));
});
