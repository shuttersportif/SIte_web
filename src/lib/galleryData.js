// photos placeholder : les identifiants commençant par "c" (cyclisme) et "m"
// (motorsport) pointent vers les deux seules photos disponibles dans le
// projet, en attendant la vraie bibliothèque
const PLACEHOLDER = { c: "/Photo/voiture.png", m: "/Photo/voiture2.png" };
const mkPhoto = (id) => ({ id, src: PLACEHOLDER[id[0]] });

export const CATEGORY_NAMES = { cyclisme: "Cyclisme / VTT", motorsport: "Motorsport" };

export const COURSES = [
  {
    id: "trophee-anjou-2026",
    nom: "Trophée de l'Anjou",
    categorie: "motorsport",
    lieu: "Circuit de l'Anjou",
    date: "2026-10-04",
    photos: ["m06", "m01", "m09", "m03", "m08", "m11"].map(mkPhoto),
  },
  {
    id: "boucles-maine-2026",
    nom: "Boucles de la Maine",
    categorie: "cyclisme",
    lieu: "Angers",
    date: "2026-09-27",
    photos: ["c06", "c02", "c04", "c01", "c10", "c13"].map(mkPhoto),
  },
  {
    id: "cote-coteaux-2026",
    nom: "Course de côte des Coteaux",
    categorie: "motorsport",
    lieu: "Saumur",
    date: "2026-07-19",
    photos: ["m02", "m05", "m10", "m01", "m09"].map(mkPhoto),
  },
  {
    id: "gp-doutre-2026",
    nom: "Grand Prix de la Doutre",
    categorie: "cyclisme",
    lieu: "Angers",
    date: "2026-06-14",
    photos: ["c03", "c09", "c12", "c05", "c11"].map(mkPhoto),
  },
  {
    id: "coupes-printemps-2026",
    nom: "Coupes de printemps",
    categorie: "motorsport",
    lieu: "Circuit du Val",
    date: "2026-05-03",
    photos: ["m04", "m07", "m08", "m02", "m10"].map(mkPhoto),
  },
  {
    id: "criterium-ponts-de-ce-2026",
    nom: "Critérium des Ponts-de-Cé",
    categorie: "cyclisme",
    lieu: "Les Ponts-de-Cé",
    date: "2026-04-19",
    photos: ["c07", "c08", "c02", "c14", "c10"].map(mkPhoto),
  },
  {
    id: "prix-trelaze-2026",
    nom: "Prix de Trélazé",
    categorie: "cyclisme",
    lieu: "Trélazé",
    date: "2026-03-08",
    photos: ["c13", "c01", "c12", "c06"].map(mkPhoto),
  },
  {
    id: "endurance-hiver-2026",
    nom: "Endurance d'hiver",
    categorie: "motorsport",
    lieu: "Circuit du Val",
    date: "2026-02-15",
    photos: ["m11", "m07", "m05", "m03"].map(mkPhoto),
  },
];

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function fmt(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d === 1 ? "1er" : d} ${MOIS[m - 1]} ${y}`;
}

export function monthTitle(key) {
  const [y, m] = key.split("-").map(Number);
  const name = MOIS[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${y}`;
}

export const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
