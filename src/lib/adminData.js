import { COURSES, CATEGORY_NAMES } from "./galleryData";

// données de démo générées de façon déterministe (même principe que la
// maquette de référence) : un jeu de commandes/visites/clients réaliste à
// partir des courses réelles du site, sans aucun vrai backend
const TODAY = "2026-10-18";

function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(2, "0");
export const euro = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Math.round((n || 0) * 100) % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n || 0);
export const euro0 = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
export const num = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n || 0));

const MOIS_C = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export function fmt(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MOIS_C[m - 1]} ${y}`;
}

function dayN(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}
function isoOf(n) {
  return new Date(n * 86400000).toISOString().slice(0, 10);
}

const CLIENTS = [
  ["Camille Martin", "camille.martin@gmail.com", "06 12 48 73 20"],
  ["Lucas Bernard", "lucas.bernard@orange.fr", "06 33 81 02 57"],
  ["Emma Petit", "emma.petit@free.fr", "07 61 25 94 18"],
  ["Hugo Moreau", "hugo.moreau@gmail.com", "06 74 19 36 05"],
  ["Léa Laurent", "lea.laurent@laposte.net", "06 05 62 47 91"],
  ["Nathan Girard", "nathan.girard@gmail.com", "07 82 14 59 36"],
  ["Chloé Roux", "chloe.roux@outlook.fr", "06 48 27 13 64"],
  ["Maxime Faure", "maxime.faure@gmail.com", "06 91 30 75 42"],
  ["Manon Lambert", "manon.lambert@sfr.fr", "06 27 58 04 83"],
  ["Antoine Bonnet", "antoine.bonnet@gmail.com", "07 13 66 29 50"],
  ["Julie Mercier", "julie.mercier@yahoo.fr", "06 56 03 81 27"],
  ["Romain Garnier", "romain.garnier@gmail.com", "06 39 74 52 16"],
  ["Écurie Morel", "contact@ecurie-morel.fr", "02 41 55 18 72"],
  ["Anjou Vélo Club", "bureau@anjou-velo.fr", "02 41 87 30 64"],
];

const PAIEMENTS = ["Carte bancaire", "Carte bancaire", "Apple Pay", "Google Pay"];

const EXTRA_PAST = [
  { id: "ronde-automne-2025", nom: "Ronde d'automne", categorie: "cyclisme", lieu: "Avrillé", date: "2025-10-19" },
  { id: "rallye-mauges-2025", nom: "Rallye des Mauges", categorie: "motorsport", lieu: "Beaupréau-en-Mauges", date: "2025-11-16" },
  { id: "cyclocross-noel-2025", nom: "Cyclo-cross de Noël", categorie: "cyclisme", lieu: "Angers, lac de Maine", date: "2025-12-14" },
];

function tok(R) {
  const alpha = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () => alpha[Math.floor(R() * alpha.length)]).join("");
}

// construit l'intégralité des données de démo (galeries, commandes, clients,
// visites) une seule fois, de façon déterministe
export function buildAdminData() {
  const R = mulberry32(20261018);
  const T = dayN(TODAY);
  const placeholderSrc = (catId) => (catId === "cyclisme" ? "/Photo/voiture.png" : "/Photo/voiture2.png");

  const sourceRaces = [
    ...COURSES.map((c) => ({ ...c, photoCount: c.photos.length })),
    ...EXTRA_PAST.map((c) => ({ ...c, photoCount: 4 })),
  ];

  const gals = sourceRaces.map((r, idx) => {
    const photos = Array.from({ length: r.photoCount }, (_, i) => ({ n: i + 1, src: placeholderSrc(r.categorie) }));
    const vis = idx === 2 ? "privee" : "publique"; // une galerie privée de démo
    return {
      id: r.id,
      nom: r.nom,
      categorie: r.categorie,
      lieu: r.lieu,
      date: r.date,
      photos,
      vis,
      token: tok(R),
      client: vis === "privee" ? 0 : null,
      peak: Math.round((45 + R() * 110) * (vis === "privee" ? 0.12 : 1)),
    };
  });

  // visites quotidiennes : bruit de fond + pic décroissant après chaque mise en ligne
  const visits = {};
  for (let x = T - 420; x <= T; x++) {
    const wd = new Date(x * 86400000).getUTCDay();
    visits[x] = Math.round(18 + R() * 14 + (wd === 0 || wd === 6 ? 8 : 0));
  }
  gals.forEach((g) => {
    const gd = dayN(g.date);
    let tot = 0;
    for (let x = gd; x <= T; x++) {
      const v = Math.round(g.peak * Math.exp(-(x - gd) / 3.5));
      if (v < 1 && x - gd > 20) break;
      visits[x] = (visits[x] || 0) + v;
      tot += v;
    }
    g.visits = tot;
  });

  // commandes générées à partir des photos de chaque galerie
  const orders = [];
  gals.forEach((g) => {
    const gd = dayN(g.date);
    const n = g.vis === "privee" ? 3 + Math.floor(R() * 3) : Math.round(7 + R() * 10 + g.peak / 9);
    for (let k = 0; k < n; k++) {
      const od = gd + 1 + Math.floor(-Math.log(1 - R() * 0.97) * 5);
      if (od > T) continue;
      const ci = g.vis === "privee" ? g.client : Math.floor(Math.pow(R(), 1.5) * CLIENTS.length);
      const nItems = Math.min(g.photos.length, [1, 1, 1, 2, 2, 3, 3, 4][Math.floor(R() * 8)]);
      const picks = new Set();
      while (picks.size < nItems) picks.add(1 + Math.floor(R() * g.photos.length));
      const items = [...picks].map((n2) => ({ gal: g.id, n: n2, prix: 15, dl: 1 + Math.floor(R() * 2.6) }));
      const sub = items.reduce((a, x) => a + x.prix, 0);
      const remise = items.length >= 3 ? sub * 0.2 : 0;
      const date = isoOf(od);
      const statut = T - od > 3 && R() < 0.035 ? "rembourse" : "payee";
      orders.push({
        id: `TH-${date.replace(/-/g, "")}-${1000 + Math.floor(R() * 9000)}`,
        client: ci,
        date,
        heure: `${pad(8 + Math.floor(R() * 14))}:${pad(Math.floor(R() * 60))}`,
        items,
        sub,
        remise,
        total: sub - remise,
        statut,
        paiement: PAIEMENTS[Math.floor(R() * PAIEMENTS.length)],
      });
    }
  });
  orders.sort((a, b) => (b.date + b.heure).localeCompare(a.date + a.heure));

  const clients = CLIENTS.map(([nom, email, tel], i) => {
    const mine = orders.filter((o) => o.client === i);
    const first = mine.length ? dayN(mine[mine.length - 1].date) : T - 30 - Math.floor(R() * 200);
    return { i, nom, email, tel, inscrit: isoOf(first - 1 - Math.floor(R() * 25)) };
  });

  return { gals, orders, clients, visits, T };
}

export function galName(db, id) {
  return (db.gals.find((g) => g.id === id) || {}).nom || "";
}
export function catName(id) {
  return CATEGORY_NAMES[id] || id;
}

const MOIS_F = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// agrégations partagées par le tableau de bord et les statistiques : ventes
// par galerie/photo, et séries mensuelles/quotidiennes
export function aggregate(db) {
  const byGal = {};
  const byPhoto = {};
  db.gals.forEach((g) => {
    byGal[g.id] = { sold: 0, rev: 0 };
  });
  db.orders.forEach((o) => {
    if (o.statut === "rembourse") return;
    const share = o.total / o.items.length;
    o.items.forEach((it) => {
      if (byGal[it.gal]) {
        byGal[it.gal].sold++;
        byGal[it.gal].rev += share;
      }
      const key = `${it.gal}|${it.n}`;
      const e = (byPhoto[key] = byPhoto[key] || { gal: it.gal, n: it.n, achats: 0, dl: 0 });
      e.achats++;
      e.dl += it.dl || 0;
    });
  });
  return { byGal, byPhoto };
}

// somme du total d'un mois (YYYY-MM) de commandes non remboursées
export function monthRevenue(db, ym) {
  return db.orders
    .filter((o) => o.date.startsWith(ym) && o.statut !== "rembourse")
    .reduce((a, o) => a + o.total, 0);
}
export function monthOrderCount(db, ym) {
  return db.orders.filter((o) => o.date.startsWith(ym) && o.statut !== "rembourse").length;
}
export function monthVisits(db, ym) {
  let total = 0;
  Object.entries(db.visits).forEach(([day, v]) => {
    if (isoOf(Number(day)).startsWith(ym)) total += v;
  });
  return total;
}
export function shiftMonth(ym, delta) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
export function monthShortLabel(ym) {
  const [, m] = ym.split("-").map(Number);
  return ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1];
}
export function monthFullLabel(ym) {
  const [y, m] = ym.split("-").map(Number);
  return `${MOIS_F[m - 1]} ${y}`;
}
export function delta(a, b) {
  if (!b) return a ? "Nouveau" : "—";
  const d = Math.round(((a - b) / b) * 100);
  return (d > 0 ? "▲ +" : d < 0 ? "▼ −" : "") + Math.abs(d) + " %";
}

// recalcule les visites d'une galerie sur une plage de jours, avec la même
// courbe de décroissance que celle utilisée pour générer les données
export function galVisitsInRange(g, start, end) {
  const gd = dayN(g.date);
  let total = 0;
  for (let x = Math.max(gd, start); x <= end; x++) {
    const v = Math.round(g.peak * Math.exp(-(x - gd) / 3.5));
    if (v < 1 && x - gd > 20) break;
    total += v;
  }
  return total;
}

export { dayN, isoOf };
