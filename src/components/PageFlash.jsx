"use client";

import { useEffect, useRef } from "react";
import { subscribePageFlash, FLASH_DURATION_MS } from "../lib/pageFlash";

// même technique que le html de référence : un seul élément permanent,
// animé via la Web Animations API (el.animate), jamais remonté/recréé —
// une animation en cours est annulée avant d'en relancer une nouvelle.
// L'élément part déjà hors-écran via le style inline (pas une classe CSS
// appliquée après coup), donc aucun frame transitoire visible au centre
// avant que l'animation ne démarre.
//
// easing "une seule respiration" (accélère puis décélère en douceur, sans
// le ralenti-brusque-ralenti de la courbe d'origine qui pouvait se lire
// comme un double mouvement). La MÊME courbe est utilisée dans les deux
// sens : vue en progression normalisée (0->1 du départ à l'arrivée), la
// courbe est identique quelle que soit la position spatiale des points de
// départ/arrivée — seule la bande orange doit changer de côté (voir plus bas)
const EASE_FLASH = "cubic-bezier(.22,1,.36,1)";

// pour le retour, mêmes positions mais départ/arrivée inversés — PAS un
// .reverse()/direction:"reverse", qui inverse le temps et donc la FORME de
// la courbe (un ralenti en fin de course deviendrait un ralenti en début de
// course). Vérifié : avec cette version, les deux sens sont rigoureusement
// identiques image par image.
const FORWARD = [{ transform: "translateX(-30vw)" }, { transform: "translateX(110vw)" }];
const BACKWARD = [{ transform: "translateX(110vw)" }, { transform: "translateX(-30vw)" }];

const BORDER_LEFT = "8px solid var(--accent)";
const BORDER_NONE = "";

export default function PageFlash() {
  const elRef = useRef(null);
  const animRef = useRef(null);

  useEffect(
    () =>
      subscribePageFlash((direction) => {
        const el = elRef.current;
        if (!el) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return;
        if (!el.animate) return;
        if (animRef.current) animRef.current.cancel();

        const backward = direction < 0;
        // la bande orange doit rester du même côté PAR RAPPORT AU MOUVEMENT
        // (le bord arrière) : en avant le panneau va vers la droite donc le
        // bord arrière est à gauche ; en arrière il va vers la gauche donc
        // le bord arrière passe à droite — sinon l'accent est tantôt
        // derrière, tantôt devant, et les deux sens ne se ressemblent pas
        el.style.borderLeft = backward ? BORDER_NONE : BORDER_LEFT;
        el.style.borderRight = backward ? BORDER_LEFT : BORDER_NONE;

        animRef.current = el.animate(backward ? BACKWARD : FORWARD, {
          duration: FLASH_DURATION_MS,
          easing: EASE_FLASH,
        });
      }),
    []
  );

  return (
    // on déborde de quelques px sur la gauche (position + largeur
    // compensée) pour avaler un arrondi subpixel qui laissait sinon passer
    // un très fin liseré clair entre le panneau et la bande orange
    <div
      ref={elRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 z-[90] h-full bg-ink"
      style={{
        left: "-3px",
        width: "calc(30vw + 3px)",
        transform: "translateX(-30vw)",
        boxSizing: "border-box",
        borderLeft: BORDER_LEFT,
      }}
    />
  );
}
