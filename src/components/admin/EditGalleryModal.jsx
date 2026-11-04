"use client";

import { useEffect, useRef, useState } from "react";
import ModalShell from "./ModalShell";
import { getGalleryDetail, updateGallery, deletePhoto, deleteGallery, prepareAddPhotos, finalizeGalleryPhotos } from "../../app/admin/galleriesActions";
import { uploadToSignedUrl } from "../../lib/uploadToSignedUrl";

const CATS = [
  ["cyclisme", "Cyclisme / VTT"],
  ["motorsport", "Motorsport"],
];

export default function EditGalleryModal({ galleryId, onClose, onSaved, onDeleted }) {
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [cat, setCat] = useState("cyclisme");
  const [prix, setPrix] = useState(15);
  const [photos, setPhotos] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getGalleryDetail(galleryId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setErr(result.message);
        setLoading(false);
        return;
      }
      setNom(result.gallery.nom);
      setDate(result.gallery.date);
      setLieu(result.gallery.lieu);
      setCat(result.gallery.categorie);
      setPrix(result.prix);
      setPhotos(result.photos);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [galleryId]);

  const addFiles = (list) => {
    const imgs = Array.from(list || []).filter((f) => /^image\//.test(f.type));
    if (!imgs.length) return;
    setNewFiles((fs) => [...fs, ...imgs.map((f) => ({ name: f.name, url: URL.createObjectURL(f), file: f }))]);
  };

  const removePhoto = async (photo) => {
    if (!confirm(`Supprimer la photo n°${photo.numero} ?`)) return;
    setRemovingId(photo.id);
    const result = await deletePhoto(galleryId, photo.id, photo.numero);
    setRemovingId(null);
    if (!result.ok) {
      setErr(result.message);
      return;
    }
    setPhotos((ps) => ps.filter((p) => p.id !== photo.id));
  };

  const removeNewFile = (url) => setNewFiles((fs) => fs.filter((f) => f.url !== url));

  const save = async (e) => {
    e.preventDefault();
    if (!nom.trim()) {
      setErr("Indiquez le nom de la course.");
      return;
    }
    setErr("");
    setSaving(true);

    const metaResult = await updateGallery(galleryId, { nom: nom.trim(), date, lieu: lieu.trim(), categorie: cat, prix: Number(prix) || 15 });
    if (!metaResult.ok) {
      setSaving(false);
      setErr(metaResult.message);
      return;
    }

    if (newFiles.length) {
      const prepared = await prepareAddPhotos(galleryId, newFiles.length);
      if (!prepared.ok) {
        setSaving(false);
        setErr(prepared.message);
        return;
      }
      try {
        for (let i = 0; i < newFiles.length; i++) {
          const { path, webToken, originalToken } = prepared.uploads[i];
          await Promise.all([
            uploadToSignedUrl("gallery-web", path, webToken, newFiles[i].file),
            uploadToSignedUrl("gallery-originals", path, originalToken, newFiles[i].file),
          ]);
        }
      } catch {
        setSaving(false);
        setErr("Échec de l'envoi des nouvelles photos.");
        return;
      }
      const finalized = await finalizeGalleryPhotos({
        galleryId,
        photos: prepared.uploads.map(({ numero, path }) => ({ numero, path })),
        prix: Number(prix) || 15,
      });
      if (!finalized.ok) {
        setSaving(false);
        setErr(finalized.message);
        return;
      }
    }

    setSaving(false);
    onSaved();
  };

  const removeGallery = async () => {
    if (!confirm(`Supprimer définitivement la galerie « ${nom} » et toutes ses photos ?`)) return;
    setDeleting(true);
    const result = await deleteGallery(galleryId);
    setDeleting(false);
    if (!result.ok) {
      setErr(result.message);
      return;
    }
    onDeleted();
  };

  if (loading) {
    return (
      <ModalShell title="Modifier la galerie" onClose={onClose}>
        <div className="p-6 text-sm text-[#555555]">Chargement…</div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Modifier la galerie" onClose={onClose}>
      <form onSubmit={save} noValidate className="flex flex-1 flex-col gap-5.5 overflow-y-auto px-6 py-5.5">
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-3">
            <span className="text-[13px] text-[#444444]">Nom de la course</span>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)" }}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[13px] text-[#444444]">Date</span>
            <input
              type="date"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)" }}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
            <span className="text-[13px] text-[#444444]">Lieu</span>
            <input
              type="text"
              value={lieu}
              onChange={(e) => setLieu(e.target.value)}
              className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)" }}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-[#444444]">Catégorie</span>
            <div role="radiogroup" aria-label="Catégorie" className="flex" style={{ border: "1px solid rgba(17,17,17,0.16)" }}>
              {CATS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={cat === id}
                  onClick={() => setCat(id)}
                  className="min-h-10 flex-1 whitespace-nowrap border-0 text-[13px] text-[#111111] transition-colors duration-150"
                  style={{ background: cat === id ? "#efefec" : "transparent", fontWeight: cat === id ? 500 : 400 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[13px] text-[#444444]">Prix par photo (€)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)" }}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] text-[#444444]">Photos ({photos.length})</span>
          {photos.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {photos.map((p) => (
                <div key={p.id} className="relative aspect-square overflow-hidden bg-[#e4e4e1]">
                  <img src={p.src} alt="" draggable="false" className="block h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(p)}
                    disabled={removingId === p.id}
                    aria-label={`Supprimer la photo ${p.numero}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center border-0 bg-black/70 text-xs leading-none text-white disabled:opacity-50"
                  >
                    {removingId === p.id ? "…" : "×"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="flex min-h-[90px] flex-col items-center justify-center gap-2 p-4 text-center"
            style={{ border: "1.5px dashed rgba(17,17,17,0.24)" }}
          >
            <span className="text-xs text-[#555555]">Ajouter des photos (JPEG/PNG)</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="min-h-9 px-3.5 text-[13px] text-[#111111]"
              style={{ border: "1px solid rgba(17,17,17,0.3)", background: "#fbfbfa" }}
            >
              Parcourir…
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
          </div>

          {newFiles.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {newFiles.map((f) => (
                <div key={f.url} className="relative aspect-square overflow-hidden bg-[#e4e4e1]">
                  <img src={f.url} alt="" draggable="false" className="block h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-accent px-1.5 py-0.5 text-[10px] font-medium text-black">Nouvelle</span>
                  <button
                    type="button"
                    onClick={() => removeNewFile(f.url)}
                    aria-label="Retirer"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center border-0 bg-black/70 text-xs leading-none text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {err && (
          <p role="alert" className="m-0 text-[13px] font-medium">
            {err}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={removeGallery}
            disabled={deleting}
            className="min-h-11 px-4 text-sm text-[#111111] disabled:opacity-60"
            style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
          >
            {deleting ? "Suppression…" : "Supprimer la galerie"}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4.5 text-sm text-[#111111]"
              style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 border-0 bg-accent px-5 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97] disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
