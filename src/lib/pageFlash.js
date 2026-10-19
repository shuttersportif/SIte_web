// le flash démarre au clic, et la navigation est lancée immédiatement en
// parallèle (pas retardée) : la page a le temps de charger pendant que le
// flash joue, plutôt que d'attendre la fin de l'animation pour charger
export const FLASH_DURATION_MS = 950;

// ordre des pages pour déterminer le sens du flash : vers une page plus à
// droite dans cette liste -> balayage gauche->droite ; vers une page plus
// à gauche -> balayage droite->gauche (comme navDir dans le html de référence)
export const PAGE_ORDER = [
  "/",
  "/portfolio",
  "/galerie",
  "/prestations",
  "/boutique",
  "/a-propos",
  "/contact",
  "/mentions-legales",
  "/cgv",
  "/confidentialite",
];

const listeners = new Set();

export function triggerPageFlash(direction = 1) {
  listeners.forEach((cb) => cb(direction));
}

export function subscribePageFlash(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
