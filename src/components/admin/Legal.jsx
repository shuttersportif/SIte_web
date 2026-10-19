"use client";

import { useState, useTransition } from "react";
import { DEFAULT_CONTENT, mergeDefaults } from "../../lib/content";
import { saveContent } from "../../app/admin/actions";

const DOCS = [
  { key: "mentionsLegales", label: "Mentions légales" },
  { key: "cgv", label: "Conditions générales de vente" },
  { key: "confidentialite", label: "Politique de confidentialité" },
];

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MOIS[m - 1]} ${y}`;
}

function paragraphsToText(paragraphs) {
  return (paragraphs || []).join("\n\n");
}
function textToParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// true si le contenu du document a changé (date de mise à jour exclue : elle
// n'est jamais choisie, elle se déduit de ce comparatif)
function contentChanged(a, b) {
  const strip = (doc) => JSON.stringify({ ...doc, lastUpdated: undefined });
  return strip(a) !== strip(b);
}

function DocEditor({ label, doc, onChange }) {
  const setField = (field) => (value) => onChange({ ...doc, [field]: value });
  const setSection = (i, field) => (value) =>
    onChange({ ...doc, sections: doc.sections.map((s, j) => (j === i ? { ...s, [field]: value } : s)) });
  const removeSection = (i) => onChange({ ...doc, sections: doc.sections.filter((_, j) => j !== i) });
  const addSection = () => onChange({ ...doc, sections: [...doc.sections, { heading: "Nouvelle section", paragraphs: [""] }] });

  return (
    <section className="flex flex-col gap-5 bg-[#fbfbfa] p-5.5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-[15px] font-medium">{label}</h2>
        <span className="text-xs text-[#555555]">Dernière mise à jour : {formatDate(doc.lastUpdated) || "jamais modifié"}</span>
      </div>

      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[13px] text-[#444444]">Texte d'introduction</span>
        <input
          value={doc.intro}
          onChange={(e) => setField("intro")(e.target.value)}
          className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
          style={{ borderColor: "rgba(17,17,17,0.3)" }}
        />
      </label>

      <div className="flex flex-col gap-5">
        {doc.sections.map((s, i) => (
          <div key={i} className="flex flex-col gap-2.5 pt-4" style={{ borderTop: "1px solid rgba(17,17,17,0.08)" }}>
            <div className="flex items-center gap-2">
              <input
                value={s.heading}
                onChange={(e) => setSection(i, "heading")(e.target.value)}
                className="min-w-0 flex-1 border-0 border-b bg-transparent py-1.5 text-sm font-medium text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
                style={{ borderColor: "rgba(17,17,17,0.3)" }}
              />
              <button
                type="button"
                onClick={() => removeSection(i)}
                aria-label={`Supprimer la section « ${s.heading} »`}
                className="flex h-9 w-9 flex-none items-center justify-center border-0 bg-transparent text-lg text-[#555555] hover:text-[#111111]"
              >
                ×
              </button>
            </div>
            <textarea
              value={paragraphsToText(s.paragraphs)}
              onChange={(e) => setSection(i, "paragraphs")(textToParagraphs(e.target.value))}
              rows={4}
              placeholder="Un paragraphe par bloc, séparez-les par une ligne vide"
              className="border-0 border-b bg-transparent py-2 text-sm leading-relaxed text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)", resize: "vertical" }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="self-start px-3 py-2 text-[13px] text-[#111111]"
        style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
      >
        + Ajouter une section
      </button>
    </section>
  );
}

export default function Legal({ initialContent, toast }) {
  const base = mergeDefaults(DEFAULT_CONTENT, initialContent);
  const [draft, setDraft] = useState(base.legal);
  const [saved, setSaved] = useState(base.legal);
  const [isPending, startTransition] = useTransition();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const setDoc = (key) => (doc) => setDraft((d) => ({ ...d, [key]: doc }));

  const save = () => {
    // la date de mise à jour n'est jamais choisie à la main : elle passe à
    // aujourd'hui automatiquement, uniquement pour les documents réellement
    // modifiés depuis le dernier enregistrement
    const stamped = { ...draft };
    DOCS.forEach(({ key }) => {
      if (contentChanged(draft[key], saved[key])) {
        stamped[key] = { ...draft[key], lastUpdated: todayIso() };
      }
    });

    startTransition(async () => {
      const res = await saveContent({ ...base, legal: stamped });
      if (res.ok) {
        setDraft(stamped);
        setSaved(stamped);
        toast("Pages légales enregistrées.");
      } else {
        toast(`Erreur : ${res.message}`);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Mentions légales</h1>
          <span className="text-[13px] text-[#555555]">
            Mentions légales, CGV et politique de confidentialité. La date de dernière mise à jour est automatique : elle passe à aujourd&rsquo;hui dès qu&rsquo;un document modifié est enregistré.
          </span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || isPending}
          className="min-h-11 px-5 text-sm font-medium transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
          style={{
            border: 0,
            background: dirty && !isPending ? "#FF4F00" : "rgba(17,17,17,0.12)",
            color: dirty && !isPending ? "#0a0a0a" : "rgba(17,17,17,0.4)",
            cursor: dirty && !isPending ? "pointer" : "default",
          }}
        >
          {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </header>

      {DOCS.map(({ key, label }) => (
        <DocEditor key={key} label={label} doc={draft[key]} onChange={setDoc(key)} />
      ))}
    </div>
  );
}
