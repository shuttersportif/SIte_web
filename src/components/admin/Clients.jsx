"use client";

import { useEffect, useState } from "react";
import { listClients } from "../../app/admin/clientsActions";

const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const num = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "");

export default function Clients() {
  const [clients, setClients] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    listClients()
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  if (!clients) {
    return <p className="m-0 text-sm text-[#555555]">Chargement…</p>;
  }

  const ql = q.trim().toLowerCase();
  const rows = clients
    .filter((c) => !ql || c.nom.toLowerCase().includes(ql) || (c.email || "").toLowerCase().includes(ql))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Clients</h1>
          <span className="text-[13px] text-[#555555]">{num(clients.length)} clients</span>
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
        <div className="min-w-[860px]">
          <div
            className="grid grid-cols-[minmax(160px,1.2fr)_minmax(200px,1.5fr)_120px_100px_120px_130px] gap-4 border-b py-3 text-xs text-[#555555]"
            style={{ borderColor: "rgba(17,17,17,0.1)" }}
          >
            <span>Nom</span>
            <span>E-mail</span>
            <span>E-mail confirmé</span>
            <span className="text-right">Commandes</span>
            <span className="text-right">Total dépensé</span>
            <span className="text-right">Inscription</span>
          </div>
          {rows.map((c) => (
            <div
              key={c.id}
              className="grid w-full grid-cols-[minmax(160px,1.2fr)_minmax(200px,1.5fr)_120px_100px_120px_130px] items-center gap-4 border-b py-3"
              style={{ borderColor: "rgba(17,17,17,0.07)", minHeight: 52 }}
            >
              <span className="truncate font-medium">{c.nom}</span>
              <span className="truncate text-[#333333]">{c.email}</span>
              <span className="inline-flex items-center gap-2 text-[13px]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 flex-none rounded-full"
                  style={{ background: c.confirmed ? "#2f9e44" : "#c0392b" }}
                />
                {c.confirmed ? "Confirmé" : "En attente"}
              </span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {c.orderCount}
              </span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {euro(c.total)}
              </span>
              <span className="text-right text-[#333333]">{fmt(c.createdAt)}</span>
            </div>
          ))}
          {rows.length === 0 && <p className="m-0 py-8 text-sm text-[#444444]">Aucun client ne correspond à cette recherche.</p>}
        </div>
      </section>
    </div>
  );
}
