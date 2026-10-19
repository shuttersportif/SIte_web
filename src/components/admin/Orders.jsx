"use client";

import { useState } from "react";
import { euro, fmt, num } from "../../lib/adminData";

const DOT = { payee: ["#111111", "none"], rembourse: ["transparent", "inset 0 0 0 1.5px #111111"] };
const STATUT_LABEL = { payee: "Payée", rembourse: "Remboursée" };
const CHIPS = [
  ["all", "Toutes"],
  ["payee", "Payées"],
  ["rembourse", "Remboursées"],
];

export default function Orders({ db, onOpenOrder }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(25);

  const base = db.orders.filter((o) => filter === "all" || o.statut === filter);
  const ql = q.trim().toLowerCase();
  const filtered = ql
    ? base.filter((o) => {
        const client = db.clients[o.client];
        return (
          o.id.toLowerCase().includes(ql) ||
          (client && (client.nom.toLowerCase().includes(ql) || client.email.toLowerCase().includes(ql)))
        );
      })
    : base;

  const rows = filtered.slice(0, limit);
  const left = filtered.length - rows.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Commandes</h1>
          <span className="text-[13px] text-[#555555]">{num(db.orders.length)} commandes au total</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-1.5">
          {CHIPS.map(([id, label]) => {
            const active = filter === id;
            const count = id === "all" ? db.orders.length : db.orders.filter((o) => o.statut === id).length;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setFilter(id);
                  setLimit(25);
                }}
                className="inline-flex min-h-9 items-center gap-2 px-3 text-[13px] text-[#111111]"
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
        <label className="relative block w-full max-w-[320px]">
          <span className="sr-only">Rechercher une commande</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(25);
            }}
            placeholder="N° de commande, client, e-mail…"
            className="min-h-10 w-full bg-[#fbfbfa] px-3 text-sm text-[#111111] outline-none focus:border-[#111111]"
            style={{ border: "1px solid rgba(17,17,17,0.16)" }}
          />
        </label>
      </div>

      <section className="min-w-0 bg-[#fbfbfa] px-5 py-1 pb-3" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div
              className="grid grid-cols-[minmax(150px,1.1fr)_minmax(150px,1.4fr)_120px_70px_100px_130px] gap-4 border-b py-3 text-xs text-[#555555]"
              style={{ borderColor: "rgba(17,17,17,0.1)" }}
            >
              <span>N° de commande</span>
              <span>Client</span>
              <span>Date</span>
              <span className="text-right">Photos</span>
              <span className="text-right">Total</span>
              <span>Statut</span>
            </div>
            {rows.map((o) => {
              const client = db.clients[o.client];
              const [dot, ring] = DOT[o.statut];
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onOpenOrder(o.id)}
                  className="grid w-full grid-cols-[minmax(150px,1.1fr)_minmax(150px,1.4fr)_120px_70px_100px_130px] items-center gap-4 border-0 border-b bg-transparent py-3 text-left transition-colors duration-150 hover:bg-[#efefec]"
                  style={{ borderColor: "rgba(17,17,17,0.07)", minHeight: 50 }}
                >
                  <span className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {o.id}
                  </span>
                  <span className="truncate">{client ? client.nom : "—"}</span>
                  <span className="text-[#333333]">{fmt(o.date)}</span>
                  <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {o.items.length}
                  </span>
                  <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {euro(o.total)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-[13px]">
                    <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full" style={{ background: dot, boxShadow: ring }} />
                    {STATUT_LABEL[o.statut]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {filtered.length === 0 && <p className="m-0 py-8 text-sm text-[#444444]">Aucune commande ne correspond à cette recherche.</p>}
        {left > 0 && (
          <div className="pb-1 pt-3.5">
            <button
              type="button"
              onClick={() => setLimit((l) => l + 25)}
              className="min-h-10 px-4 text-[13px] text-[#111111]"
              style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
            >
              Afficher 25 de plus ({left} restantes)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
