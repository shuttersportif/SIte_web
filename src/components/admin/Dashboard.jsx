"use client";

import { HBar, VBarChart } from "./charts";
import {
  euro,
  euro0,
  num,
  fmt,
  catName,
  aggregate,
  monthRevenue,
  monthOrderCount,
  monthVisits,
  shiftMonth,
  monthShortLabel,
  monthFullLabel,
  delta,
} from "../../lib/adminData";

const DOT = { payee: ["#111111", "none"], rembourse: ["transparent", "inset 0 0 0 1.5px #111111"] };
const STATUT_LABEL = { payee: "Payée", rembourse: "Remboursée" };

export default function Dashboard({ db, onOpenOrder, onNavigate }) {
  const agg = aggregate(db);
  const T = db.T;
  const thisYm = new Date(T * 86400000).toISOString().slice(0, 7);
  const prevYm = shiftMonth(thisYm, -1);

  const rev = monthRevenue(db, thisYm);
  const prevRev = monthRevenue(db, prevYm);
  const orders = monthOrderCount(db, thisYm);
  const prevOrders = monthOrderCount(db, prevYm);
  const visits = monthVisits(db, thisYm);
  const prevVisits = monthVisits(db, prevYm);
  const basket = orders ? rev / orders : 0;
  const prevBasket = prevOrders ? prevRev / prevOrders : 0;

  const kpis = [
    { label: "Chiffre d'affaires", value: euro(rev), d: delta(rev, prevRev), note: "vs mois précédent" },
    { label: "Commandes", value: num(orders), d: delta(orders, prevOrders), note: "vs mois précédent" },
    { label: "Visiteurs", value: num(visits), d: delta(visits, prevVisits), note: "vs mois précédent" },
    { label: "Panier moyen", value: euro(basket), d: delta(basket, prevBasket), note: "vs mois précédent" },
  ];

  const topVisits = [...db.gals].sort((a, b) => b.visits - a.visits).slice(0, 6);
  const maxVisits = Math.max(1, ...topVisits.map((g) => g.visits));

  const months = Array.from({ length: 12 }, (_, i) => shiftMonth(thisYm, i - 11));
  const sales12 = months.map((ym) => ({
    label: monthShortLabel(ym),
    value: monthRevenue(db, ym),
    val: euro0(monthRevenue(db, ym)),
    tip: `${monthFullLabel(ym)} : ${euro0(monthRevenue(db, ym))}`,
    showVal: ym === thisYm,
  }));
  const sales12Total = euro0(sales12.reduce((a, c) => a + c.value, 0));
  const sales12Max = Math.max(1, ...sales12.map((c) => c.value));

  const topPhotos = Object.values(agg.byPhoto)
    .sort((a, b) => b.achats - a.achats)
    .slice(0, 5);

  const topGals = Object.entries(agg.byGal)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 5);
  const topGalsMax = Math.max(1, ...topGals.map((g) => g.rev));

  const recentOrders = db.orders.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Tableau de bord</h1>
          <span className="text-[13px] text-[#555555]">{fmt(new Date(T * 86400000).toISOString().slice(0, 10))} · période du mois en cours</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("stats")}
          className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 text-[13px] text-[#111111] underline underline-offset-4"
        >
          Statistiques détaillées
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="relative flex min-w-0 flex-col gap-2.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
            <span aria-hidden="true" className="absolute -inset-x-px -top-px h-0.5 bg-accent" />
            <span className="text-[13px] text-[#444444]">{k.label}</span>
            <span className="text-[30px] font-medium leading-none tracking-[-0.02em]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {k.value}
            </span>
            <span className="text-xs text-[#444444]" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="font-medium text-[#111111]">{k.d}</span> {k.note}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-4.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <div className="flex flex-col gap-0.5">
            <h2 className="m-0 text-[15px] font-medium">Visites par galerie</h2>
            <span className="text-xs text-[#555555]">Depuis la mise en ligne de chaque galerie</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {topVisits.map((g) => (
              <HBar key={g.id} label={g.nom} value={num(g.visits)} pct={(g.visits / maxVisits) * 100} />
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-4.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <h2 className="m-0 text-[15px] font-medium">Ventes sur 12 mois</h2>
              <span className="text-xs text-[#555555]">Chiffre d&rsquo;affaires mensuel, mois en cours en orange</span>
            </div>
            <span className="text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
              Total : <span className="font-medium">{sales12Total}</span>
            </span>
          </div>
          <VBarChart
            data={sales12}
            axisTop={euro0(sales12Max)}
            axisMid={euro0(sales12Max / 2)}
            highlightLast
          />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-3.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <h2 className="m-0 text-[15px] font-medium">Photos les plus achetées</h2>
          <div className="flex flex-col">
            {topPhotos.map((p, i) => (
              <div
                key={`${p.gal}-${p.n}`}
                className="grid grid-cols-[20px_64px_minmax(0,1fr)_auto_auto] items-center gap-3.5 border-t py-2.5"
                style={{ borderColor: "rgba(17,17,17,0.08)" }}
              >
                <span className="text-xs text-[#555555]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {i + 1}
                </span>
                <span className="block h-11 w-16 bg-[#e4e4e1]" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[13px] font-medium">{(db.gals.find((g) => g.id === p.gal) || {}).nom}</span>
                  <span className="text-xs text-[#555555]">Photo {p.n}</span>
                </span>
                <span className="flex flex-col items-end gap-0.5">
                  <span className="text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {p.achats}
                  </span>
                  <span className="text-[11px] text-[#555555]">achats</span>
                </span>
                <span className="flex min-w-[78px] flex-col items-end gap-0.5">
                  <span className="text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {p.dl}
                  </span>
                  <span className="text-[11px] text-[#555555]">téléchargements</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <h2 className="m-0 text-[15px] font-medium">Galeries qui vendent le plus</h2>
          <div className="flex flex-col">
            {topGals.map((g, i) => (
              <div key={g.id} className="flex flex-col gap-2 border-t py-3" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
                <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-baseline gap-3.5">
                  <span className="text-xs text-[#555555]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[13px] font-medium">{(db.gals.find((x) => x.id === g.id) || {}).nom}</span>
                    <span className="text-xs text-[#555555]">
                      {catName((db.gals.find((x) => x.id === g.id) || {}).categorie)}
                    </span>
                  </span>
                  <span className="text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {euro(g.rev)}
                  </span>
                </div>
                <span className="relative ml-[34px] block h-1 bg-[#e8e8e5]">
                  <span
                    className="absolute inset-y-0 left-0 bg-accent"
                    style={{ width: `${(g.rev / topGalsMax) * 100}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="flex min-w-0 flex-col gap-2 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="m-0 text-[15px] font-medium">Dernières commandes</h2>
          <button
            type="button"
            onClick={() => onNavigate("orders")}
            className="border-0 bg-transparent p-0 text-[13px] text-[#111111] underline underline-offset-4"
          >
            Toutes les commandes
          </button>
        </div>
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
            {recentOrders.map((o) => {
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
      </section>
    </div>
  );
}
