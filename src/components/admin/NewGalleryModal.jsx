"use client";

import { useRef, useState } from "react";
import ModalShell from "./ModalShell";

const CATS = [
  ["cyclisme", "Cyclisme / VTT"],
  ["motorsport", "Motorsport"],
];
const VIS = [
  ["publique", "Publique"],
  ["privee", "Privée"],
];

export default function NewGalleryModal({ onClose, onCreate }) {
  const [nom, setNom] = useState("");
  const [date, setDate] = useState("");
  const [lieu, setLieu] = useState("");
  const [cat, setCat] = useState("cyclisme");
  const [vis, setVis] = useState("publique");
  const [files, setFiles] = useState([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const addFiles = (list) => {
    const imgs = Array.from(list || []).filter((f) => /^image\//.test(f.type));
    if (!imgs.length) return;
    setFiles((fs) => [...fs, ...imgs.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))]);
    setErr("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!nom.trim()) {
      setErr("Indiquez le nom de la course.");
      return;
    }
    if (!files.length) {
      setErr("Ajoutez au moins une photo.");
      return;
    }
    onCreate({ nom: nom.trim(), date: date || null, lieu: lieu.trim(), categorie: cat, vis, files, coverIdx });
  };

  return (
    <ModalShell title="Nouvelle galerie" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-5.5 overflow-y-auto px-6 py-5.5">
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-3">
            <span className="text-[13px] text-[#444444]">Nom de la course</span>
            <input
              type="text"
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                setErr("");
              }}
              className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)" }}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[13px] text-[#444444]">Date</span>
            <input
              type="date"
              value={date}
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
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] text-[#444444]">Visibilité</span>
            <div role="radiogroup" aria-label="Visibilité" className="flex" style={{ border: "1px solid rgba(17,17,17,0.16)" }}>
              {VIS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={vis === id}
                  onClick={() => setVis(id)}
                  className="min-h-10 flex-1 border-0 text-[13px] text-[#111111] transition-colors duration-150"
                  style={{ background: vis === id ? "#efefec" : "transparent", fontWeight: vis === id ? 500 : 400 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] text-[#444444]">Photos</span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className="flex min-h-[150px] flex-col items-center justify-center gap-2.5 p-5 text-center transition-colors duration-150"
            style={{
              border: `1.5px dashed ${dragOver ? "#FF4F00" : "rgba(17,17,17,0.24)"}`,
              background: dragOver ? "#fdf0ea" : "transparent",
            }}
          >
            <span className="text-sm font-medium">Glissez les photos ici</span>
            <span className="text-xs text-[#555555]">JPEG ou PNG, plusieurs fichiers à la fois</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="min-h-9 px-3.5 text-[13px] text-[#111111]"
              style={{ border: "1px solid rgba(17,17,17,0.3)", background: "#fbfbfa" }}
            >
              Parcourir…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <>
              <span className="text-xs text-[#555555]">{files.length} photo{files.length > 1 ? "s" : ""} · cliquez sur une photo pour en faire la couverture</span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
                {files.map((f, i) => (
                  <button
                    key={f.url}
                    type="button"
                    onClick={() => setCoverIdx(i)}
                    aria-pressed={i === coverIdx}
                    className="relative block aspect-square overflow-hidden border-0 bg-[#e4e4e1] p-0"
                    style={{ outline: i === coverIdx ? "2px solid #FF4F00" : "2px solid transparent", outlineOffset: 2 }}
                  >
                    <img src={f.url} alt="" draggable="false" className="block h-full w-full object-cover" />
                    {i === coverIdx && (
                      <span className="absolute bottom-1 left-1 bg-accent px-1.5 py-0.5 text-[10px] font-medium text-black">Couverture</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {err && (
          <p role="alert" className="m-0 text-[13px] font-medium">
            {err}
          </p>
        )}

        <div className="flex justify-end gap-2">
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
            className="min-h-11 border-0 bg-accent px-5 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
          >
            Créer la galerie
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
