"use client";

import { useEffect, useState } from "react";

export const DEFAULT_ITEMS = [
  {
    nom: "Boucles de la Maine",
    cat: "Cyclisme",
    date: "27 sept. 2026",
    src: "/Photo/voiture.png",
  },
  {
    nom: "24h Le Mans Voiture",
    cat: "Sport auto",
    date: "15 juin 2026",
    src: "/Photo/voiture2.png",
  },
];

const SLIDE_DURATION_MS = 4000;
const ENTRANCE_MS = 260;

export default function LatestAddedCard({ items = DEFAULT_ITEMS, onHoverChange, onActiveChange }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  // l'ancienne photo (au-dessus) glisse vers la gauche et se retire,
  // révélant la nouvelle qui est statique, déjà en place en dessous.
  // "outgoing" = l'index qui est en train de sortir ; une fois sorti, on le
  // réinitialise en forçant un remount (resetTick) pour qu'il revienne à sa
  // place sans transition visible (prêt pour son prochain tour)
  const [outgoing, setOutgoing] = useState(null);
  const [resetTick, setResetTick] = useState(() => items.map(() => 0));
  const [renderedActive, setRenderedActive] = useState(active);
  if (active !== renderedActive) {
    setOutgoing(renderedActive);
    setRenderedActive(active);
  }

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setTimeout(
      () => setActive((i) => (i + 1) % items.length),
      SLIDE_DURATION_MS
    );
    return () => clearTimeout(id);
  }, [active, paused, items.length]);

  // le fond principal du hero reste synchronisé sur la photo affichée ici
  useEffect(() => {
    onActiveChange?.(items[active]);
  }, [active, items, onActiveChange]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleEnter = () => {
    setPaused(true);
    onHoverChange?.(true);
  };
  const handleLeave = () => {
    setPaused(false);
    onHoverChange?.(false);
  };

  const current = items[active];

  return (
    // le slide d'entrée (droite -> gauche) est posé sur ce wrapper ; l'<a>
    // garde ses propres transforms (survol/appui) indépendants
    <span
      className="absolute bottom-6 left-5 z-[3] block sm:left-10 md:left-14"
      style={{
        transform: mounted ? "translateX(0)" : "translateX(70px)",
        transition: `transform ${ENTRANCE_MS}ms cubic-bezier(.16,1,.3,1)`,
      }}
    >
      <a
        href={current ? `/galerie` : undefined}
        aria-label={current ? `Voir la galerie ${current.nom}` : undefined}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className="flex w-[280px] flex-col gap-1.5 border p-1.5 text-paper transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.98] sm:w-[340px] md:w-[380px]"
        style={{
          background: "rgba(20,20,20,0.32)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderColor: "rgba(255,255,255,0.6)",
        }}
      >
      <span className="px-0.5 text-[11px]" style={{ color: "rgba(244,244,242,0.88)" }}>
        Derniers ajouts
      </span>

      <span className="relative block aspect-video overflow-hidden bg-[#141414]">
        {items.map((item, i) => (
          <span
            key={`${item.nom}-${resetTick[i]}`}
            className="absolute inset-0 overflow-hidden"
            style={{
              zIndex: i === outgoing ? 3 : i === active ? 2 : 1,
              // l'image ne bouge jamais : seule la zone visible se referme
              // depuis la droite (comme un rideau) jusqu'à rejoindre la
              // gauche, révélant la photo statique en dessous
              clipPath: `inset(0 ${i === outgoing ? 100 : 0}% 0 0)`,
              transition: i === outgoing ? "clip-path 500ms cubic-bezier(.16,1,.3,1)" : "none",
            }}
            onTransitionEnd={() => {
              if (i !== outgoing) return;
              setOutgoing(null);
              setResetTick((prev) => prev.map((c, idx) => (idx === i ? c + 1 : c)));
            }}
          >
            <span
              className="absolute inset-0 bg-cover bg-center grayscale"
              style={{
                backgroundImage: item.src
                  ? `url(${item.src})`
                  : "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 60%, #101010 100%)",
              }}
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[58%]"
              style={{
                background:
                  "linear-gradient(0deg, rgba(8,8,8,0.82), rgba(8,8,8,0))",
              }}
            />
            <span className="absolute inset-x-3 bottom-3 flex items-baseline justify-between gap-3 whitespace-nowrap">
              <span className="min-w-0 truncate text-[11px] font-medium">
                {item.nom}
              </span>
              <span
                className="shrink-0 text-[11px]"
                style={{ color: "rgba(244,244,242,0.82)" }}
              >
                {item.cat}, {item.date}
              </span>
            </span>
          </span>
        ))}

        <span
          className="pointer-events-none absolute right-2 top-4 z-[6] select-none text-[10px] tracking-wide text-white/80"
          style={{ textShadow: "0 0 6px rgba(0,0,0,0.4)" }}
        >
          © Théo
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-[30px]"
          style={{ background: "linear-gradient(180deg, rgba(8,8,8,0.45), rgba(8,8,8,0))" }}
        />

        <span aria-hidden="true" className="absolute inset-x-2 top-2 z-[5] flex gap-1">
          {items.map((item, i) => (
            <span
              key={item.nom}
              className="relative h-0.5 flex-1 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.34)" }}
            >
              <span
                className="absolute inset-0 origin-left bg-accent"
                style={{
                  transform: i < active ? "scaleX(1)" : "scaleX(0)",
                  animationName: i === active ? "storyfill" : "none",
                  animationDuration: `${SLIDE_DURATION_MS}ms`,
                  animationTimingFunction: "linear",
                  animationFillMode: "forwards",
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </span>
          ))}
        </span>
      </span>
      </a>
    </span>
  );
}
