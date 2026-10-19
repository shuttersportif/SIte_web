"use client";

import { useEffect, useState } from "react";
import LatestAddedCard, { DEFAULT_ITEMS } from "./LatestAddedCard";
import NavLink from "./NavLink";

const SWEEP_DURATION_MS = 300;
const ENTRANCE_MS = 260;
const TEXT_START_MS = 70; // démarre bien avant la fin de l'entrée

function GalleryCta({ style, label }) {
  // 'idle' = planqué à gauche (prêt) | 'in' = entrée en cours | 'out' = sortie en cours
  const [phase, setPhase] = useState("idle");
  const [runId, setRunId] = useState(0);

  const enter = () => {
    setPhase("in");
    setRunId((n) => n + 1);
  };
  const leave = () => {
    setPhase("out");
    setRunId((n) => n + 1);
  };

  const sweepStyle =
    phase === "in"
      ? { animation: `sweep-in ${SWEEP_DURATION_MS}ms cubic-bezier(.23,1,.32,1) forwards` }
      : phase === "out"
        ? { animation: `sweep-out ${SWEEP_DURATION_MS}ms cubic-bezier(.23,1,.32,1) forwards` }
        : { transform: "translateX(-100%)" };

  return (
    // le style de révélation (translateY/opacity) est posé sur ce wrapper,
    // jamais directement sur le bouton : le combiner avec overflow-hidden +
    // le panneau blanc transformé à l'intérieur provoquait un artefact de
    // rendu (liseré blanc visible) pendant l'animation d'apparition
    <span className="mt-2 inline-block" style={style}>
      <NavLink
        href="/galerie"
        className="group relative inline-flex items-center gap-3.5 overflow-hidden bg-accent px-6 py-4 text-sm font-medium whitespace-nowrap text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
      >
        {/* au repos, le panneau n'existe pas du tout dans le DOM : aucun
            risque de résidu visuel. key force un remount à chaque survol
            pour que l'animation reparte toujours proprement de son point de
            départ (jamais d'interpolation inversée en cas de passage rapide) */}
        {phase !== "idle" && (
          <span
            key={runId}
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-white"
            style={sweepStyle}
            onAnimationEnd={() => {
              if (phase === "out") setPhase("idle");
            }}
          />
        )}
        <span className="relative z-10 text-black">{label}</span>
        <span
          aria-hidden="true"
          className="relative z-10 inline-block text-black transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-1.5"
        >
          →
        </span>
      </NavLink>
    </span>
  );
}

const HERO_DEFAULTS = {
  title: "Théo — Photographe de course",
  intro:
    "Salut, je m'appelle Théo, photographe venant d'Angers. La photographie est pour moi une passion, une façon de capturer un souvenir, une émotion. Chaque photo que je prends a son histoire et raconte quelque chose.",
  cta: "Voir la galerie",
};

export default function Hero({ content }) {
  const c = { ...HERO_DEFAULTS, ...content };
  const [mounted, setMounted] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [bgItem, setBgItem] = useState(DEFAULT_ITEMS[0]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // le fond + la navbar + la carte glissent d'abord de droite à gauche ;
  // une fois cette entrée terminée (ENTRANCE_MS), les textes glissent à leur
  // tour de gauche à droite, en cascade (titre, puis texte, puis bouton)
  const bgEntrance = {
    transform: mounted ? "translateX(0)" : "translateX(70px)",
    transition: `transform ${ENTRANCE_MS}ms cubic-bezier(.16,1,.3,1)`,
  };

  const textReveal = (delayMs) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateX(0px)" : "translateX(-60px)",
    transition: "opacity 260ms ease-out, transform 260ms cubic-bezier(.16,1,.3,1)",
    transitionDelay: `${TEXT_START_MS + delayMs}ms`,
  });

  const blockSlide = { transform: "translateY(20px)" };

  return (
    <section
      className="relative min-h-[calc(100dvh-56px)] overflow-hidden bg-ink text-paper"
      aria-label="Accueil"
    >
      {/* le slide d'entrée (droite -> gauche) est posé sur ce wrapper, pas
          sur l'image : elle porte déjà sa propre animation (Ken Burns) et
          les deux transforms se composeraient mal sur le même élément */}
      <div className="absolute inset-0" style={bgEntrance}>
        {/* toutes les photos sont empilées ; seule l'opacité change (fondu)
            pour passer de l'une à l'autre, chacune garde son propre zoom
            Ken Burns qui tourne en continu indépendamment */}
        {DEFAULT_ITEMS.map((item) => (
          <div
            key={item.src}
            className="absolute inset-0 animate-kenburns bg-cover bg-center grayscale"
            style={{
              backgroundImage: `url(${item.src})`,
              opacity: item.src === bgItem.src ? 1 : 0,
              transition: "opacity 900ms ease-in-out",
              animationPlayState: cardHovered ? "paused" : "running",
            }}
            aria-hidden="true"
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.62) 0%, rgba(8,8,8,0.46) 42%, rgba(8,8,8,0.74) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      <span
        className="pointer-events-none absolute right-5 z-[2] select-none text-[11px] tracking-wide text-white/80 sm:right-10 md:right-14"
        style={{ top: "calc(64px + 12px)", textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
      >
        © Théo
      </span>

      <div
        className="relative z-[2] flex min-h-[calc(100dvh-56px)] flex-col items-center justify-center gap-6 px-5 py-20 text-center sm:px-10 md:px-14"
        style={blockSlide}
      >
        <h1
          className="m-0 max-w-[16ch] text-[clamp(34px,5.4vw,78px)] font-medium leading-[1.02] tracking-[-0.035em] text-balance"
          style={textReveal(0)}
        >
          {c.title}
        </h1>
        <p
          className="m-0 max-w-[54ch] text-[clamp(15px,1.15vw,17px)] leading-[1.65] text-pretty"
          style={{ color: "rgba(244,244,242,0.86)", ...textReveal(90) }}
        >
          {c.intro}
        </p>

        <GalleryCta style={textReveal(180)} label={c.cta} />
      </div>

      <LatestAddedCard onHoverChange={setCardHovered} onActiveChange={setBgItem} />
    </section>
  );
}
