import { buildAdminData, galName, catName, euro, fmt } from "./adminData";

// espace client de démo : on se place du point de vue du premier client
// mock (index 0) et on dérive ses commandes/galeries à partir des mêmes
// données que le panel admin — pas de vrai compte/backend pour l'instant
const CLIENT_INDEX = 0;

export function buildAccountData() {
  const db = buildAdminData();
  const client = db.clients[CLIENT_INDEX];
  const orders = db.orders.filter((o) => o.client === CLIENT_INDEX).sort((a, b) => (b.date + b.heure).localeCompare(a.date + a.heure));
  const privateGals = db.gals.filter((g) => g.vis === "privee" && g.client === CLIENT_INDEX);

  const downloads = orders
    .filter((o) => o.statut !== "rembourse")
    .flatMap((o) =>
      o.items.map((it) => {
        const gal = db.gals.find((g) => g.id === it.gal);
        return {
          key: `${o.id}-${it.gal}-${it.n}`,
          gal: it.gal,
          galNom: galName(db, it.gal),
          n: it.n,
          src: gal?.photos.find((p) => p.n === it.n)?.src,
          date: o.date,
          restants: it.dl,
        };
      })
    );

  return { client, orders, privateGals, downloads, catName, euro, fmt };
}
