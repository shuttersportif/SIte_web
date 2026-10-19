"use client";

import { useState } from "react";
import { euro, fmt, num } from "../../lib/adminData";

export default function Clients({ db, onOpenClient }) {
  const [q, setQ] = useState("");

  const spendOf = (i) =>
    db.orders.filter((o) => o.client === i && o.statut !== "rembourse").reduce((a, o) => a + o.total, 0);
  const ordersOf = (i) => db.orders.filter((o) => o.client === i).length;

  const ql = q.trim().toLowerCase();
  const rows = db.clients
    .filter((c) => !ql || c.nom.toLowerCase().includes(ql) || c.email.toLowerCase().includes(ql))
    .map((c) => ({ ...c, nb: ordersOf(c.i), total: spendOf(c.i) }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Clients</h1>
          <span className="text-[13px] text-[#555555]">{num(db.clients.length)} clients</span>
        </div>
        <label className="relative block w-full max-w-[320px]">
          <span className="sr-only">Rechercher un client</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom ou e-mail…"
            className="min-h-10 w-full bg-[#fbfbfa] px-3 text-sm text-[#111111] outline-none focus:border-[#111111]"
            style={{ border: "1px solid rgba(17,17,17,0.16)" }}
          />
        </label>
      </header>

      <section className="min-w-0 overflow-x-auto bg-[#fbfbfa] px-5 py-1 pb-3" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
        <div className="min-w-[760px]">
          <div
            className="grid grid-cols-[minmax(160px,1.3fr)_minmax(200px,1.6fr)_110px_120px_130px] gap-4 border-b py-3 text-xs text-[#555555]"
            style={{ borderColor: "rgba(17,17,17,0.1)" }}
          >
            <span>Nom</span>
            <span>E-mail</span>
            <span className="text-right">Commandes</span>
            <span className="text-right">Total dépensé</span>
            <span className="text-right">Inscription</span>
          </div>
          {rows.map((c) => (
            <button
              key={c.i}
              type="button"
              onClick={() => onOpenClient(c.i)}
              className="grid w-full grid-cols-[minmax(160px,1.3fr)_minmax(200px,1.6fr)_110px_120px_130px] items-center gap-4 border-0 border-b bg-transparent py-3 text-left transition-colors duration-150 hover:bg-[#efefec]"
              style={{ borderColor: "rgba(17,17,17,0.07)", minHeight: 52 }}
            >
              <span className="truncate font-medium">{c.nom}</span>
              <span className="truncate text-[#333333]">{c.email}</span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {c.nb}
              </span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {euro(c.total)}
              </span>
              <span className="text-right text-[#333333]">{fmt(c.inscrit)}</span>
            </button>
          ))}
          {rows.length === 0 && <p className="m-0 py-8 text-sm text-[#444444]">Aucun client ne correspond à cette recherche.</p>}
        </div>
      </section>
    </div>
  );
}
