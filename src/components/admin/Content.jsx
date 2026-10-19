"use client";

import { useState, useTransition } from "react";
import { DEFAULT_CONTENT, mergeDefaults } from "../../lib/content";
import { saveContent } from "../../app/admin/actions";

function Field({ label, value, onChange, big }) {
  const Comp = big ? "textarea" : "input";
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] text-[#444444]">{label}</span>
      <Comp
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={big ? 3 : undefined}
        className="border-0 border-b bg-transparent py-2 text-[15px] leading-[1.5] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
        style={{ borderColor: "rgba(17,17,17,0.3)", resize: big ? "vertical" : undefined }}
      />
    </label>
  );
}

// liste de textes modifiable : ajout, suppression, renommage de chaque
// entrée (utilisé pour les catégories "Je suis intéressé par" de Contact)
function ListField({ label, items = [], onChange }) {
  const update = (i, value) => onChange(items.map((it, j) => (j === i ? value : it)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[13px] text-[#444444]">{label}</span>
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={it}
              onChange={(e) => update(i, e.target.value)}
              className="min-w-0 flex-1 border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
              style={{ borderColor: "rgba(17,17,17,0.3)" }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Supprimer « ${it || "cette catégorie"} »`}
              className="flex h-9 w-9 flex-none items-center justify-center border-0 bg-transparent text-lg text-[#555555] hover:text-[#111111]"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="self-start px-3 py-2 text-[13px] text-[#111111]"
        style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
      >
        + Ajouter une catégorie
      </button>
    </div>
  );
}

function Section({ title, note, children }) {
  return (
    <section className="grid grid-cols-1 gap-4 bg-[#fbfbfa] p-5.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 text-[15px] font-medium">{title}</h2>
        {note && <span className="text-xs leading-relaxed text-[#555555]">{note}</span>}
      </div>
      <div className="flex max-w-[680px] flex-col gap-5">{children}</div>
    </section>
  );
}

export default function Content({ initialContent, toast }) {
  // fusionne ce qui vient de la base par-dessus les valeurs par défaut :
  // un champ ajouté après coup (comme "interests") ne peut jamais manquer
  const base = mergeDefaults(DEFAULT_CONTENT, initialContent);
  const [draft, setDraft] = useState(base);
  const [saved, setSaved] = useState(base);
  const [isPending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const set = (page, field) => (value) => setDraft((d) => ({ ...d, [page]: { ...d[page], [field]: value } }));
  const setService = (i, field) => (value) =>
    setDraft((d) => ({
      ...d,
      prestations: {
        ...d.prestations,
        services: d.prestations.services.map((s, j) => (j === i ? { ...s, [field]: value } : s)),
      },
    }));
  const setCat = (cat, field) => (value) =>
    setDraft((d) => ({ ...d, portfolio: { ...d.portfolio, [cat]: { ...d.portfolio[cat], [field]: value } } }));

  const save = () => {
    startTransition(async () => {
      const res = await saveContent(draft);
      if (res.ok) {
        setSaved(draft);
        toast("Contenu du site enregistré.");
      } else {
        toast(`Erreur : ${res.message}`);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Contenu</h1>
          <span className="text-[13px] text-[#555555]">Tous les textes affichés sur le site public</span>
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

      <Section title="Accueil" note="Le texte principal affiché sur la page d'accueil.">
        <Field label="Titre" value={draft.hero.title} onChange={set("hero", "title")} />
        <Field label="Paragraphe d'introduction" value={draft.hero.intro} onChange={set("hero", "intro")} big />
        <div className="max-w-[280px]">
          <Field label="Texte du bouton" value={draft.hero.cta} onChange={set("hero", "cta")} />
        </div>
      </Section>

      <Section title="Contact" note="La page Contact.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Accroche, 1re ligne" value={draft.contact.hookLine1} onChange={set("contact", "hookLine1")} />
          <Field label="Accroche, 2e ligne" value={draft.contact.hookLine2} onChange={set("contact", "hookLine2")} />
        </div>
        <Field label="Note sous l'e-mail" value={draft.contact.responseNote} onChange={set("contact", "responseNote")} />
        <Field label="Titre du formulaire" value={draft.contact.formTitle} onChange={set("contact", "formTitle")} />
        <Field label="Libellé au-dessus des catégories" value={draft.contact.interestsLabel} onChange={set("contact", "interestsLabel")} />
        <ListField
          label="Catégories proposées dans le formulaire"
          items={draft.contact.interests}
          onChange={(interests) => setDraft((d) => ({ ...d, contact: { ...d.contact, interests } }))}
        />
        <Field label="Titre après envoi" value={draft.contact.sentTitle} onChange={set("contact", "sentTitle")} />
        <Field label="Note après envoi" value={draft.contact.sentNote} onChange={set("contact", "sentNote")} />
      </Section>

      <Section title="À propos" note="La page À propos.">
        <Field label="Texte au-dessus du titre" value={draft.about.heroKicker} onChange={set("about", "heroKicker")} />
        <Field label="Titre" value={draft.about.heroTitle} onChange={set("about", "heroTitle")} />
        <Field label="Accroche" value={draft.about.introTitle} onChange={set("about", "introTitle")} big />
        <Field label="Paragraphe 1" value={draft.about.introP1} onChange={set("about", "introP1")} big />
        <Field label="Paragraphe 2" value={draft.about.introP2} onChange={set("about", "introP2")} big />
        <Field label="Note (lieu, déplacements)" value={draft.about.introNote} onChange={set("about", "introNote")} />
        <Field label="Titre « Ma saison »" value={draft.about.seasonTitle} onChange={set("about", "seasonTitle")} />
        <div className="max-w-[280px]">
          <Field label="Texte du bouton" value={draft.about.cta} onChange={set("about", "cta")} />
        </div>
      </Section>

      <Section title="Prestations" note="Introduction, bouton et les 4 services proposés.">
        <Field label="Introduction" value={draft.prestations.intro} onChange={set("prestations", "intro")} big />
        <div className="max-w-[280px]">
          <Field label="Texte du bouton" value={draft.prestations.cta} onChange={set("prestations", "cta")} />
        </div>
        <div className="flex flex-col gap-5 pt-2" style={{ borderTop: "1px solid rgba(17,17,17,0.08)" }}>
          {draft.prestations.services.map((s, i) => (
            <div key={i} className="flex flex-col gap-3">
              <span className="text-xs font-medium text-[#555555]">Service {i + 1}</span>
              <Field label="Titre" value={s.titre} onChange={setService(i, "titre")} />
              <Field label="Description" value={s.description} onChange={setService(i, "description")} big />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Portfolio" note="Les deux sélections (nom, accroche, intro, appel à l'action).">
        {["motorsport", "cyclisme"].map((cat) => (
          <div key={cat} className="flex flex-col gap-3.5 pb-5" style={{ borderBottom: "1px solid rgba(17,17,17,0.08)" }}>
            <span className="text-xs font-medium text-[#555555]">{cat === "motorsport" ? "Motorsport" : "Cyclisme / VTT"}</span>
            <Field label="Nom affiché" value={draft.portfolio[cat].nom} onChange={setCat(cat, "nom")} />
            <Field label="Accroche (écran d'entrée)" value={draft.portfolio[cat].accroche} onChange={setCat(cat, "accroche")} big />
            <Field label="Introduction, paragraphe 1" value={draft.portfolio[cat].intro1} onChange={setCat(cat, "intro1")} big />
            <Field label="Introduction, paragraphe 2" value={draft.portfolio[cat].intro2} onChange={setCat(cat, "intro2")} big />
            <Field label="Titre de l'appel à l'action" value={draft.portfolio[cat].cta} onChange={setCat(cat, "cta")} />
          </div>
        ))}
      </Section>
    </div>
  );
}
