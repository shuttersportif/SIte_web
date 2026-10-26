"use client";

import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus } from "../../app/admin/ordersActions";

const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const num = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "");

const DOT = {
  en_attente: ["#f4a300", "none"],
  payee: ["#111111", "none"],
  rembourse: ["transparent", "inset 0 0 0 1.5px #111111"],
};
const STATUT_LABEL = { en_attente: "En attente", payee: "Payée", rembourse: "Remboursée" };
const CHIPS = [
  ["all", "Toutes"],
  ["en_attente", "En attente"],
  ["payee", "Payées"],
  ["rembourse", "Remboursées"],
];

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(25);
  const [busyId, setBusyId] = useState(null);

  const reload = () => {
    listOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  };

  useEffect(reload, []);

  const changeStatus = async (id, statut) => {
    setBusyId(id);
    try {
      await updateOrderStatus(id, statut);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, statut } : o)));
    } finally {
      setBusyId(null);
    }
  };

  if (!orders) {
    return <p className="m-0 text-sm text-[#555555]">Chargement…</p>;
  }

  const base = orders.filter((o) => filter === "all" || o.statut === filter);
  const ql = q.trim().toLowerCase();
  const filtered = ql
    ? base.filter((o) => {
        const c = o.client;
        const nom = c ? `${c.first_name || ""} ${c.last_name || ""}`.trim() : "";
        return (
          o.id.toLowerCase().includes(ql) ||
          nom.toLowerCase().includes(ql) ||
          (c?.email || "").toLowerCase().includes(ql)
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
          <span className="text-[13px] text-[#555555]">{num(orders.length)} commandes au total</span>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-1.5">
          {CHIPS.map(([id, label]) => {
            const active = filter === id;
            const count = id === "all" ? orders.length : orders.filter((o) => o.statut === id).length;
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
          <div className="min-w-[860px]">
            <div
              className="grid grid-cols-[110px_minmax(150px,1.4fr)_100px_70px_100px_130px_minmax(180px,auto)] gap-4 border-b py-3 text-xs text-[#555555]"
              style={{ borderColor: "rgba(17,17,17,0.1)" }}
            >
              <span>N° de commande</span>
              <span>Client</span>
              <span>Date</span>
              <span className="text-right">Photos</span>
              <span className="text-right">Total</span>
              <span>Statut</span>
              <span>Actions</span>
            </div>
            {rows.map((o) => {
              const [dot, ring] = DOT[o.statut];
              const nom = o.client ? `${o.client.first_name || ""} ${o.client.last_name || ""}`.trim() : "";
              return (
                <div
                  key={o.id}
                  className="grid w-full grid-cols-[110px_minmax(150px,1.4fr)_100px_70px_100px_130px_minmax(180px,auto)] items-center gap-4 border-b py-3"
                  style={{ borderColor: "rgba(17,17,17,0.07)", minHeight: 50 }}
                >
                  <span className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="truncate">{nom || o.client?.email || "—"}</span>
                  <span className="text-[#333333]">{fmt(o.created_at)}</span>
                  <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {(o.order_items || []).length}
                  </span>
                  <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {euro(o.total)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-[13px]">
                    <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full" style={{ background: dot, boxShadow: ring }} />
                    {STATUT_LABEL[o.statut]}
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {o.statut !== "payee" && (
                      <button
                        type="button"
                        disabled={busyId === o.id}
                        onClick={() => changeStatus(o.id, "payee")}
                        className="min-h-8 border-0 bg-accent px-2.5 text-xs font-medium text-black disabled:opacity-50"
                      >
                        Marquer payée
                      </button>
                    )}
                    {o.statut !== "rembourse" && (
                      <button
                        type="button"
                        disabled={busyId === o.id}
                        onClick={() => changeStatus(o.id, "rembourse")}
                        className="min-h-8 px-2.5 text-xs text-[#111111] disabled:opacity-50"
                        style={{ border: "1px solid rgba(17,17,17,0.25)", background: "transparent" }}
                      >
                        Rembourser
                      </button>
                    )}
                  </span>
                </div>
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
