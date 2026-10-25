"use client";

import { useState } from "react";
import { buildAccountData } from "../lib/accountData";

const TABS = [
  ["dl", "Mes téléchargements"],
  ["cmd", "Mes commandes"],
  ["gal", "Mes galeries privées"],
  ["info", "Mes informations"],
];

const STATUT_LABEL = { payee: "Payée", rembourse: "Remboursée" };

function Downloads({ db }) {
  if (!db.downloads.length) {
    return <p className="m-0 text-sm text-[#555555]">Aucune photo achetée pour l&rsquo;instant.</p>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4">
      {db.downloads.map((d) => (
        <article key={d.key} className="flex flex-col bg-[#fbfbfa]" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e4e4e1]">
            <div className="absolute inset-0 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${d.src})` }} />
          </div>
          <div className="flex flex-col gap-2 p-3.5">
            <span className="truncate text-[13px] font-medium">{d.galNom}</span>
            <span className="text-xs text-[#555555]">
              Photo {d.n} · {db.fmt(d.date)}
            </span>
            <button
              type="button"
              disabled={d.restants <= 0}
              className="mt-1 min-h-9 border-0 bg-accent px-3 text-xs font-medium text-black disabled:cursor-default disabled:bg-[rgba(17,17,17,0.12)] disabled:text-[rgba(17,17,17,0.4)]"
            >
              {d.restants > 0 ? `Télécharger (${d.restants} restant${d.restants > 1 ? "s" : ""})` : "Téléchargements épuisés"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Orders({ db }) {
  if (!db.orders.length) {
    return <p className="m-0 text-sm text-[#555555]">Vous n&rsquo;avez pas encore passé de commande.</p>;
  }
  return (
    <section className="min-w-0 bg-[#fbfbfa] px-5 py-1 pb-3" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div
            className="grid grid-cols-[minmax(130px,1.1fr)_100px_70px_100px_120px] gap-4 border-b py-3 text-xs text-[#555555]"
            style={{ borderColor: "rgba(17,17,17,0.1)" }}
          >
            <span>N° de commande</span>
            <span>Date</span>
            <span className="text-right">Photos</span>
            <span className="text-right">Total</span>
            <span>Statut</span>
          </div>
          {db.orders.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[minmax(130px,1.1fr)_100px_70px_100px_120px] items-center gap-4 border-b py-3"
              style={{ borderColor: "rgba(17,17,17,0.07)", minHeight: 50 }}
            >
              <span className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                {o.id}
              </span>
              <span className="text-[#333333]">{db.fmt(o.date)}</span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {o.items.length}
              </span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {db.euro(o.total)}
              </span>
              <span className="text-[13px]">{STATUT_LABEL[o.statut]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivateGalleries({ db }) {
  if (!db.privateGals.length) {
    return <p className="m-0 text-sm text-[#555555]">Aucune galerie privée ne vous a été partagée.</p>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
      {db.privateGals.map((g) => (
        <article key={g.id} className="flex flex-col bg-[#fbfbfa]" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <div className="relative aspect-[3/2] overflow-hidden bg-[#e4e4e1]">
            <div className="absolute inset-0 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${g.photos[0]?.src})` }} />
          </div>
          <div className="flex flex-col gap-1.5 p-4">
            <h2 className="m-0 text-[15px] font-medium leading-tight">{g.nom}</h2>
            <span className="text-xs text-[#555555]">
              {db.fmt(g.date)} · {db.catName(g.categorie)}
            </span>
            <a
              href={`/galerie-privee/${g.token}`}
              className="mt-2 inline-flex min-h-9 items-center justify-center bg-ink px-3 text-xs text-paper"
            >
              Ouvrir la galerie
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] text-[#444444]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
        style={{ borderColor: "rgba(17,17,17,0.3)" }}
      />
    </label>
  );
}

function Infos({ db, toast }) {
  const [draft, setDraft] = useState({ nom: db.client.nom, email: db.client.email, tel: db.client.tel });

  const save = (e) => {
    e.preventDefault();
    toast("Informations enregistrées.");
  };

  return (
    <form onSubmit={save} className="flex max-w-[420px] flex-col gap-5">
      <Field label="Nom" value={draft.nom} onChange={(v) => setDraft((d) => ({ ...d, nom: v }))} />
      <Field label="E-mail" value={draft.email} onChange={(v) => setDraft((d) => ({ ...d, email: v }))} />
      <Field label="Téléphone" value={draft.tel} onChange={(v) => setDraft((d) => ({ ...d, tel: v }))} />
      <button type="submit" className="min-h-11 self-start border-0 bg-accent px-5 text-sm font-medium text-black">
        Enregistrer
      </button>
    </form>
  );
}

export default function MonEspace() {
  const [db] = useState(buildAccountData);
  const [tab, setTab] = useState("dl");
  const [toastMsg, setToastMsg] = useState(null);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => setToastMsg(null), 2600);
  };

  return (
    <div className="min-h-dvh bg-paper px-5 pb-20 pt-28 text-[#111111] sm:px-10 md:px-14">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="m-0 text-[clamp(28px,3.4vw,44px)] font-medium leading-[1.05] tracking-[-0.03em]">Mon espace</h1>
        <span aria-hidden="true" className="mt-4 block h-[3px] w-16 bg-accent" />

        <div className="mt-8 grid items-start gap-7 sm:mt-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-14">
          <nav
            aria-label="Mon espace"
            className="flex gap-6 overflow-x-auto border-b md:sticky md:top-[88px] md:flex-col md:gap-0.5 md:overflow-visible md:border-0"
            style={{ borderColor: "rgba(17,17,17,0.12)", scrollbarWidth: "none" }}
          >
            {TABS.map(([key, label]) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={active ? "page" : undefined}
                  className="flex-none whitespace-nowrap py-3 text-left text-[14px] md:min-h-10 md:py-2"
                  style={{
                    color: active ? "#111111" : "rgba(17,17,17,0.55)",
                    fontWeight: active ? 500 : 400,
                    borderBottom: active ? "2px solid #FF4F00" : "2px solid transparent",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">
            {tab === "dl" && <Downloads db={db} />}
            {tab === "cmd" && <Orders db={db} />}
            {tab === "gal" && <PrivateGalleries db={db} />}
            {tab === "info" && <Infos db={db} toast={toast} />}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] bg-ink px-4 py-3 text-sm text-paper"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
