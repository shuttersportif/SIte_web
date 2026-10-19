"use client";

import { useState } from "react";
import { VBarChart, HBar } from "./charts";
import { euro, euro0, num, catName, galVisitsInRange, delta, dayN, isoOf } from "../../lib/adminData";

const PERIODS = [
  ["30", "30 jours"],
  ["90", "90 jours"],
  ["365", "12 mois"],
];

const MOIS_C = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function buckets(T, days) {
  const start = T - days + 1;
  const count = 12;
  const size = days / count;
  return Array.from({ length: count }, (_, i) => {
    const from = Math.round(start + i * size);
    const to = Math.min(T, Math.round(start + (i + 1) * size) - 1);
    const d = new Date(to * 86400000);
    const label = days > 120 ? MOIS_C[d.getUTCMonth()] : `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
    return { from, to, label };
  });
}

function sumVisits(db, from, to) {
  let t = 0;
  for (let x = from; x <= to; x++) t += db.visits[x] || 0;
  return t;
}
function ordersInRange(db, from, to) {
  return db.orders.filter((o) => {
    const d = dayN(o.date);
    return d >= from && d <= to && o.statut !== "rembourse";
  });
}

export default function Stats({ db, agg }) {
  const [period, setPeriod] = useState("30");
  const days = Number(period);
  const T = db.T;
  const from = T - days + 1;
  const prevFrom = from - days;
  const prevTo = from - 1;

  const curOrders = ordersInRange(db, from, T);
  const prevOrders = ordersInRange(db, prevFrom, prevTo);
  const curVisits = sumVisits(db, from, T);
  const prevVisits = sumVisits(db, prevFrom, prevTo);
  const curRev = curOrders.reduce((a, o) => a + o.total, 0);
  const prevRev = prevOrders.reduce((a, o) => a + o.total, 0);
  const curDl = curOrders.reduce((a, o) => a + o.items.reduce((s, it) => s + (it.dl || 0), 0), 0);
  const prevDl = prevOrders.reduce((a, o) => a + o.items.reduce((s, it) => s + (it.dl || 0), 0), 0);
  const curConv = curVisits ? (curOrders.length / curVisits) * 100 : 0;
  const prevConv = prevVisits ? (prevOrders.length / prevVisits) * 100 : 0;
  const curBasket = curOrders.length ? curRev / curOrders.length : 0;
  const prevBasket = prevOrders.length ? prevRev / prevOrders.length : 0;

  const statKpis = [
    { label: "Chiffre d'affaires", value: euro(curRev), d: delta(curRev, prevRev) },
    { label: "Commandes", value: num(curOrders.length), d: delta(curOrders.length, prevOrders.length) },
    { label: "Visiteurs", value: num(curVisits), d: delta(curVisits, prevVisits) },
    { label: "Panier moyen", value: euro(curBasket), d: delta(curBasket, prevBasket) },
    { label: "Taux de conversion", value: `${curConv.toFixed(1)} %`, d: delta(curConv, prevConv) },
    { label: "Téléchargements", value: num(curDl), d: delta(curDl, prevDl) },
  ];

  const bk = buckets(T, days);
  const statVisits = bk.map((b, i) => {
    const v = sumVisits(db, b.from, b.to);
    return { label: b.label, value: v, val: num(v), tip: `${b.label} : ${num(v)} visites`, showVal: i === bk.length - 1 };
  });
  const statRev = bk.map((b, i) => {
    const r = ordersInRange(db, b.from, b.to).reduce((a, o) => a + o.total, 0);
    return { label: b.label, value: r, val: euro0(r), tip: `${b.label} : ${euro0(r)}`, showVal: i === bk.length - 1 };
  });

  const statGalVisits = [...db.gals]
    .map((g) => ({ ...g, periodVisits: galVisitsInRange(g, from, T) }))
    .sort((a, b) => b.periodVisits - a.periodVisits)
    .slice(0, 6);
  const maxGalVisits = Math.max(1, ...statGalVisits.map((g) => g.periodVisits));

  const galSales = db.gals
    .map((g) => {
      const items = curOrders.flatMap((o) => o.items.filter((it) => it.gal === g.id));
      const rev = items.length ? (curOrders.find((o) => o.items.some((it) => it.gal === g.id))?.total ?? 0) : 0;
      return { id: g.id, nom: g.nom, categorie: g.categorie, photos: items.length, visits: galVisitsInRange(g, from, T) };
    })
    .filter((g) => g.photos > 0)
    .sort((a, b) => b.photos - a.photos);
  // revenu réel par galerie sur la période (part proportionnelle de chaque commande)
  const galRev = {};
  curOrders.forEach((o) => {
    const share = o.total / o.items.length;
    o.items.forEach((it) => {
      galRev[it.gal] = (galRev[it.gal] || 0) + share;
    });
  });
  const statGalSales = galSales.map((g) => ({ ...g, rev: galRev[g.id] || 0 })).slice(0, 8);

  const catTotals = {};
  curOrders.forEach((o) => {
    const share = o.total / o.items.length;
    o.items.forEach((it) => {
      const g = db.gals.find((x) => x.id === it.gal);
      if (!g) return;
      catTotals[g.categorie] = (catTotals[g.categorie] || 0) + share;
    });
  });
  const catTotal = Object.values(catTotals).reduce((a, v) => a + v, 0) || 1;
  const catSplit = Object.entries(catTotals).map(([id, val], i) => ({
    nom: catName(id),
    val: euro(val),
    pct: (val / catTotal) * 100,
    bg: i === 0 ? "#FF4F00" : "#111111",
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Statistiques</h1>
          <span className="text-[13px] text-[#555555]">Comparé à la période précédente équivalente</span>
        </div>
        <div role="radiogroup" aria-label="Période" className="flex" style={{ border: "1px solid rgba(17,17,17,0.16)", background: "#fbfbfa" }}>
          {PERIODS.map(([id, label]) => {
            const active = period === id;
            return (
              <button
                key={id}
                role="radio"
                aria-checked={active}
                onClick={() => setPeriod(id)}
                className="min-h-[38px] whitespace-nowrap border-0 px-4 text-[13px] text-[#111111] transition-colors duration-150"
                style={{ background: active ? "#efefec" : "transparent", fontWeight: active ? 500 : 400 }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {statKpis.map((k) => (
          <div key={k.label} className="relative flex min-w-0 flex-col gap-2 bg-[#fbfbfa] p-4.5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
            <span aria-hidden="true" className="absolute -inset-x-px -top-px h-0.5 bg-accent" />
            <span className="text-xs text-[#444444]">{k.label}</span>
            <span className="text-[22px] font-medium leading-tight tracking-[-0.01em]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {k.value}
            </span>
            <span className="text-xs text-[#444444]" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="font-medium text-[#111111]">{k.d}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-4.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <h2 className="m-0 text-[15px] font-medium">Visites</h2>
          <VBarChart data={statVisits} axisTop={num(Math.max(...statVisits.map((d) => d.value)))} axisMid={num(Math.max(...statVisits.map((d) => d.value)) / 2)} highlightLast />
        </section>
        <section className="flex min-w-0 flex-col gap-4.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <h2 className="m-0 text-[15px] font-medium">Chiffre d&rsquo;affaires</h2>
          <VBarChart data={statRev} axisTop={euro0(Math.max(...statRev.map((d) => d.value)))} axisMid={euro0(Math.max(...statRev.map((d) => d.value)) / 2)} highlightLast />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-4.5 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <h2 className="m-0 text-[15px] font-medium">Visites par galerie</h2>
          <div className="flex flex-col gap-2.5">
            {statGalVisits.map((g) => (
              <HBar key={g.id} label={g.nom} value={num(g.periodVisits)} pct={(g.periodVisits / maxGalVisits) * 100} />
            ))}
            {statGalVisits.every((g) => g.periodVisits === 0) && <p className="m-0 text-sm text-[#444444]">Aucune visite de galerie sur la période.</p>}
          </div>
        </section>
        <section className="flex min-w-0 flex-col gap-4 bg-[#fbfbfa] p-5" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <h2 className="m-0 text-[15px] font-medium">Ventes par galerie</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-[minmax(0,1fr)_70px_80px_90px] gap-3 border-b pb-2.5 text-xs text-[#555555]" style={{ borderColor: "rgba(17,17,17,0.1)" }}>
                <span>Galerie</span>
                <span className="text-right">Visites</span>
                <span className="text-right">Photos</span>
                <span className="text-right">CA</span>
              </div>
              {statGalSales.map((g) => (
                <div key={g.id} className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_70px_80px_90px] items-center gap-3 border-b text-[13px]" style={{ borderColor: "rgba(17,17,17,0.07)", fontVariantNumeric: "tabular-nums" }}>
                  <span className="truncate">{g.nom}</span>
                  <span className="text-right">{num(g.visits)}</span>
                  <span className="text-right">{g.photos}</span>
                  <span className="text-right font-medium">{euro(g.rev)}</span>
                </div>
              ))}
              {statGalSales.length === 0 && <p className="m-0 py-4 text-[13px] text-[#444444]">Aucune vente sur la période.</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <span className="text-xs text-[#555555]">Répartition du chiffre d&rsquo;affaires par discipline</span>
            <div className="flex h-2.5 overflow-hidden bg-[#e8e8e5]">
              {catSplit.map((c) => (
                <span key={c.nom} className="block" style={{ width: `${c.pct}%`, background: c.bg }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {catSplit.map((c) => (
                <span key={c.nom} className="inline-flex items-center gap-2 text-xs">
                  <span aria-hidden="true" className="h-2.5 w-2.5" style={{ background: c.bg }} />
                  {c.nom} · <span style={{ fontVariantNumeric: "tabular-nums" }}>{c.val}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
