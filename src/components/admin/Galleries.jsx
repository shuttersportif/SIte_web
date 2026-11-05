"use client";

import { useState } from "react";
import { fmt, num, catName } from "../../lib/adminData";

const SITE_BASE = "https://theo-photographe.fr/galerie-privee/";

const CHIPS = [
  ["all", "Toutes"],
  ["publique", "Publiques"],
  ["privee", "Privées"],
];

export default function Galleries({ galleries, onTogglePrivacy, onOpenNew, onOpenSend, onRegenToken, onEdit, toast }) {
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const copy = (id, url) => {
    try {
      navigator.clipboard?.writeText(url);
    } catch {
      /* ignore */
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
  };

  const regen = async (id) => {
    const result = await onRegenToken(id);
    toast?.(result?.ok ? "Nouveau lien généré." : result?.message || "Échec.");
  };

  const rows = galleries
    .filter((g) => filter === "all" || g.visibilite === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Galeries</h1>
          <span className="text-[13px] text-[#555555]">{num(galleries.length)} galeries</span>
        </div>
        <button
          type="button"
          onClick={onOpenNew}
          className="cursor-pointer inline-flex min-h-11 items-center gap-2.5 bg-accent px-5 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          Nouvelle galerie
        </button>
      </header>

      <div role="group" aria-label="Filtrer les galeries" className="flex flex-wrap gap-1.5">
        {CHIPS.map(([id, label]) => {
          const active = filter === id;
          const count = id === "all" ? galleries.length : galleries.filter((g) => g.visibilite === id).length;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(id)}
              className="cursor-pointer inline-flex min-h-9 items-center gap-2 px-3 text-[13px] text-[#111111]"
              style={{
                border: `1px solid ${active ? "#111111" : "rgba(17,17,17,0.2)"}`,
                background: active ? "#efefec" : "transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              {label}
              <span className="text-[11px] text-[#333333]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
        {rows.map((g) => {
          const url = `${SITE_BASE}${g.token || ""}`;
          const isPriv = g.visibilite === "privee";
          return (
            <article key={g.id} className="flex flex-col bg-[#fbfbfa]" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
              <div className="relative aspect-[3/2] overflow-hidden bg-[#e4e4e1]">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: g.cover ? `url(${g.cover})` : undefined }}
                />
                <span
                  className="absolute left-2.5 top-2.5 px-2 py-1 text-[11px] font-medium"
                  style={{ background: isPriv ? "#FF4F00" : "rgba(10,10,10,0.72)", color: isPriv ? "#0a0a0a" : "#f4f4f2" }}
                >
                  {num(g.photoCount)} photo{g.photoCount > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col gap-3.5 p-4.5">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h2 className="m-0 text-[15px] font-medium leading-tight" style={{ overflowWrap: "anywhere" }}>{g.nom}</h2>
                    <span className="text-xs text-[#555555]">
                      {fmt(g.date)} · {catName(g.categorie)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(g.id)}
                    className="cursor-pointer flex-none px-2.5 py-1.5 text-xs text-[#111111]"
                    style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
                  >
                    Modifier
                  </button>
                </div>

                <button
                  role="switch"
                  aria-checked={isPriv}
                  onClick={() => onTogglePrivacy(g.id)}
                  className="cursor-pointer flex min-h-9 items-center gap-2.5 border-0 bg-transparent p-0 text-[13px] text-[#111111]"
                >
                  <span style={{ fontWeight: !isPriv ? 500 : 400, opacity: !isPriv ? 1 : 0.5 }}>Publique</span>
                  <span
                    aria-hidden="true"
                    className="relative h-[22px] w-10 rounded-full transition-colors duration-200"
                    style={{ background: isPriv ? "#FF4F00" : "rgba(17,17,17,0.25)" }}
                  >
                    <span
                      className="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-[#fbfbfa] transition-transform duration-200 ease-[cubic-bezier(.23,1,.32,1)]"
                      style={{ transform: isPriv ? "translateX(18px)" : "none", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                    />
                  </span>
                  <span style={{ fontWeight: isPriv ? 500 : 400, opacity: isPriv ? 1 : 0.5 }}>Privée</span>
                </button>

                {isPriv && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex min-w-0 items-center gap-2 px-2.5" style={{ background: "#efefec", border: "1px solid rgba(17,17,17,0.08)", minHeight: 40 }}>
                      <span className="min-w-0 flex-1 truncate text-xs text-[#222222]" title={url} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(g.id, url)}
                        className="cursor-pointer flex-none px-2.5 text-xs text-[#111111]"
                        style={{ border: "1px solid rgba(17,17,17,0.24)", background: "#fbfbfa", minHeight: 30 }}
                      >
                        {copiedId === g.id ? "Copié !" : "Copier"}
                      </button>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 px-2.5" style={{ background: "#efefec", border: "1px solid rgba(17,17,17,0.08)", minHeight: 40 }}>
                      <span className="text-xs text-[#555555]">Code PIN</span>
                      <span className="flex-1 text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.2em" }}>
                        {g.pin || "—"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => regen(g.id)}
                        className="cursor-pointer min-h-9 px-3 text-xs text-[#111111]"
                        style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
                      >
                        Générer un nouveau lien
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenSend(g.id)}
                        className="cursor-pointer min-h-9 border-0 bg-ink px-3 text-xs text-paper"
                      >
                        Envoyer au client
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
