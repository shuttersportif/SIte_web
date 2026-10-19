"use client";

import { useState } from "react";
import NavLink from "./NavLink";
import Reveal from "./Reveal";

const HALVES = [
  {
    key: "motorsport",
    nomDefault: "Motorsport",
    accrocheDefault: "Rallye, circuit et paddock : la vitesse, les trajectoires et l'ambiance des courses.",
    src: "/Photo/voiture2.png",
  },
  {
    key: "cyclisme",
    nomDefault: "Cyclisme / VTT",
    accrocheDefault: "Sur route et en forêt, l'effort et le geste au plus près des coureurs.",
    src: "/Photo/voiture.png",
  },
];

// deux moitiés plein écran qui s'élargissent légèrement au survol, comme
// dans la maquette de référence
export default function Portfolio({ content = {} }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="relative flex flex-col overflow-hidden bg-ink md:h-[calc(100dvh-56px)] md:flex-row">
      <h1 className="sr-only">Portfolio</h1>
      {HALVES.map((h, i) => {
        const half = {
          ...h,
          nom: content[h.key]?.nom || h.nomDefault,
          accroche: content[h.key]?.accroche || h.accrocheDefault,
        };
        const on = hovered === half.key;
        const off = hovered !== null && !on;
        return (
          <NavLink
            key={half.key}
            href={`/portfolio/${half.key}`}
            onMouseEnter={() => setHovered(half.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(half.key)}
            onBlur={() => setHovered(null)}
            aria-label={`${half.nom} : voir la sélection`}
            className="relative block min-h-[max(300px,calc((100svh-56px)/2))] flex-1 overflow-hidden bg-[#151515] text-paper md:min-h-0"
            style={{ flexGrow: on ? 1.5 : 1, transition: "flex-grow 640ms cubic-bezier(.23,1,.32,1)" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${half.src})`,
                transform: on ? "scale(1.05)" : "none",
                transition: "transform 900ms cubic-bezier(.23,1,.32,1)",
              }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-ink"
              style={{ opacity: off ? 0.62 : on ? 0.18 : 0.34, transition: "opacity 500ms ease" }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[62%]"
              style={{ background: "linear-gradient(0deg, rgba(10,10,10,0.78), rgba(10,10,10,0))" }}
            />
            <span
              className="pointer-events-none absolute right-3.5 top-3 select-none text-[11px] tracking-wide text-white/80"
              style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
            >
              © Théo
            </span>
            <Reveal
              index={i}
              className="absolute inset-x-5 bottom-7 flex flex-col items-start gap-4 sm:inset-x-10 md:inset-x-14"
            >
              <span className="text-[clamp(40px,11vw,56px)] font-medium leading-[0.98] tracking-[-0.035em] text-balance md:text-[clamp(44px,5.2vw,88px)]">
                {half.nom}
              </span>
              <span className="max-w-[36ch] text-base leading-[1.55]" style={{ color: "rgba(244,244,242,0.9)" }}>
                {half.accroche}
              </span>
              <span className="mt-1.5 inline-flex items-center gap-3.5 bg-accent px-6 py-4 text-sm font-medium whitespace-nowrap text-black">
                Voir la sélection
                <span
                  aria-hidden="true"
                  className="inline-block"
                  style={{
                    transform: on ? "translateX(4px)" : "none",
                    transition: "transform 220ms cubic-bezier(.23,1,.32,1)",
                  }}
                >
                  →
                </span>
              </span>
            </Reveal>
          </NavLink>
        );
      })}
    </section>
  );
}
