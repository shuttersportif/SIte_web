"use client";

import { useState } from "react";
import { euro } from "../../lib/adminData";

const DEFAULTS = {
  prix: 15,
  remiseOn: true,
  remiseMin: 3,
  remisePct: 20,
  email: "contact@theo-photographe.fr",
  tel: "06 00 00 00 00",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/",
  filigrane: "© Théo",
};

function Field({ label, ...props }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] text-[#444444]">{label}</span>
      <input
        {...props}
        className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
        style={{ borderColor: "rgba(17,17,17,0.3)", fontVariantNumeric: "tabular-nums" }}
      />
    </label>
  );
}

export default function Settings({ toast }) {
  const [set, setSet] = useState(DEFAULTS);
  const [saved, setSaved] = useState(DEFAULTS);

  const dirty = JSON.stringify(set) !== JSON.stringify(saved);
  const update = (key) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setSet((s) => ({ ...s, [key]: value }));
  };

  const save = () => {
    setSaved(set);
    toast("Paramètres enregistrés.");
  };

  const remiseExample = set.remiseOn
    ? `À partir de ${set.remiseMin} photos, ${set.remisePct} % de remise s'applique automatiquement dans le panier.`
    : "La remise dégressive est désactivée.";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Paramètres</h1>
          <span className="text-[13px] text-[#555555]">Prix, remises, informations de contact et filigrane</span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="min-h-11 px-5 text-sm font-medium transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
          style={{
            border: 0,
            background: dirty ? "#FF4F00" : "rgba(17,17,17,0.12)",
            color: dirty ? "#0a0a0a" : "rgba(17,17,17,0.4)",
            cursor: dirty ? "pointer" : "default",
          }}
        >
          Enregistrer les modifications
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 bg-[#fbfbfa] p-5.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[15px] font-medium">Prix de vente</h2>
          <span className="text-xs leading-relaxed text-[#555555]">Prix d&rsquo;une photo numérique et remise dégressive appliquée dans le panier.</span>
        </div>
        <div className="flex max-w-[620px] flex-col gap-5">
          <div className="max-w-[240px]">
            <Field label="Prix d'une photo numérique (€)" type="number" min="0" value={set.prix} onChange={update("prix")} />
          </div>
          <button
            role="switch"
            aria-checked={set.remiseOn}
            onClick={() => setSet((s) => ({ ...s, remiseOn: !s.remiseOn }))}
            className="flex min-h-10 items-center gap-3 self-start border-0 bg-transparent p-0 text-sm text-[#111111]"
          >
            <span aria-hidden="true" className="relative h-[22px] w-10 rounded-full" style={{ background: set.remiseOn ? "#FF4F00" : "rgba(17,17,17,0.25)" }}>
              <span
                className="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-[#fbfbfa] transition-transform duration-200 ease-[cubic-bezier(.23,1,.32,1)]"
                style={{ transform: set.remiseOn ? "translateX(18px)" : "none", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
              />
            </span>
            Remise dégressive {set.remiseOn ? "activée" : "désactivée"}
          </button>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2" style={{ opacity: set.remiseOn ? 1 : 0.4 }}>
            <Field label="À partir de (photos)" type="number" min="0" value={set.remiseMin} onChange={update("remiseMin")} disabled={!set.remiseOn} />
            <Field label="Pourcentage de remise (%)" type="number" min="0" value={set.remisePct} onChange={update("remisePct")} disabled={!set.remiseOn} />
          </div>
          <p className="m-0 text-[13px] text-[#444444]">{remiseExample}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 bg-[#fbfbfa] p-5.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[15px] font-medium">Informations de Théo</h2>
          <span className="text-xs leading-relaxed text-[#555555]">Affichées sur les pages Contact, À propos et dans le pied de page.</span>
        </div>
        <div className="grid max-w-[620px] grid-cols-1 gap-4.5 sm:grid-cols-2">
          <Field label="E-mail" type="email" value={set.email} onChange={update("email")} />
          <Field label="Téléphone" type="tel" value={set.tel} onChange={update("tel")} />
          <Field label="Instagram" type="url" value={set.instagram} onChange={update("instagram")} />
          <Field label="Facebook" type="url" value={set.facebook} onChange={update("facebook")} />
          <Field label="YouTube" type="url" value={set.youtube} onChange={update("youtube")} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 bg-[#fbfbfa] p-5.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[15px] font-medium">Filigrane</h2>
          <span className="text-xs leading-relaxed text-[#555555]">Posé en coin et répété en diagonale sur les photos du site.</span>
        </div>
        <div className="flex max-w-[620px] flex-col gap-4.5">
          <Field label="Texte du filigrane" type="text" value={set.filigrane} onChange={update("filigrane")} />
          <div className="relative aspect-video overflow-hidden bg-[#e4e4e1]">
            <div className="absolute inset-0 bg-cover bg-center grayscale" style={{ backgroundImage: "url(/Photo/voiture.png)" }} />
            <span
              className="pointer-events-none absolute bottom-3 right-3.5 select-none text-xs tracking-wide text-white/80"
              style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
            >
              {set.filigrane}
            </span>
          </div>
        </div>
      </section>

      <p className="m-0 text-xs text-[#555555]">
        Exemple : 3 photos à {euro(set.prix)} {set.remiseOn ? `avec ${set.remisePct} % de remise` : "sans remise"} ={" "}
        {euro(set.remiseOn && 3 >= set.remiseMin ? set.prix * 3 * (1 - set.remisePct / 100) : set.prix * 3)}.
      </p>
    </div>
  );
}
