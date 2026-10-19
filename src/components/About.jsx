"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import DrawBar from "./DrawBar";
import CountUp from "./CountUp";
import NavLink from "./NavLink";

const STATS = [
  { v: 48, label: "courses couvertes" },
  { v: 7, label: "années de pratique" },
  { v: 2, label: "disciplines" },
];

// mêmes courses que la carte "Derniers ajouts" de l'accueil, triées du plus
// ancien au plus récent (comme la saison dans la maquette de référence)
const SEASON = [
  { date: "15 juin 2026", nom: "24h Le Mans Voiture", cat: "Sport auto", lieu: "Le Mans", href: "/galerie" },
  { date: "27 septembre 2026", nom: "Boucles de la Maine", cat: "Cyclisme", lieu: "Angers", href: "/galerie" },
];

const SEASON_META = "2026, 2 courses";

// défilement horizontal continu, pausable au survol/focus ; repasse en
// simple scroll manuel si l'utilisateur préfère moins d'animation
function SeasonMarquee({ items }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || reduce || !el.animate) return;
    const duration = Math.max(6, items.length) * 4200;
    animRef.current = el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], {
      duration,
      iterations: Infinity,
    });
    return () => animRef.current?.cancel();
  }, [items.length, reduce]);

  const loop = reduce ? items : items.concat(items);

  return (
    <div
      onMouseEnter={() => animRef.current?.pause()}
      onMouseLeave={() => animRef.current?.play()}
      onFocus={() => animRef.current?.pause()}
      onBlur={() => animRef.current?.play()}
      className="border-y"
      style={{ borderColor: "rgba(17,17,17,0.14)", overflowX: reduce ? "auto" : "hidden", overflowY: "hidden" }}
    >
      <div ref={trackRef} className="flex w-max">
        {loop.map((race, i) => (
          <a
            key={`${race.nom}-${i}`}
            href={race.href}
            tabIndex={i < items.length ? 0 : -1}
            aria-hidden={i < items.length ? undefined : "true"}
            className="flex w-[300px] flex-none flex-col gap-2.5 border-r px-7 pb-[30px] pt-7 text-[#111111] transition-colors duration-150 hover:bg-[#e9e9e6]"
            style={{ borderColor: "rgba(17,17,17,0.14)" }}
          >
            <span className="text-xs text-[#666]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {race.date}
            </span>
            <span className="text-lg font-medium leading-[1.25] tracking-[-0.01em] text-balance">{race.nom}</span>
            <span className="text-[13px] text-[#666]">
              {race.cat}, {race.lieu}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

const ABOUT_DEFAULTS = {
  heroKicker: "Théo, photographe de course à Angers",
  heroTitle: "À propos",
  introTitle: "Capter l'instant où la vitesse devient visible.",
  introP1:
    "Je suis photographe à Angers. Je suis les courses cyclistes et les épreuves de sport mécanique, au bord des routes de l'Anjou comme sur les circuits.",
  introP2:
    "Ce qui m'intéresse, c'est l'instant où la vitesse devient visible : un passage, une trajectoire, un regard avant le départ. Je travaille en noir et blanc pour garder l'essentiel.",
  introNote: "Basé à Angers, déplacements dans toute la France.",
  seasonTitle: "Ma saison",
  cta: "Écrire à Théo",
};

export default function About({ content }) {
  const c = { ...ABOUT_DEFAULTS, ...content };
  return (
    <>
      <div className="relative min-h-[max(520px,calc(100dvh-56px))] overflow-hidden bg-ink text-paper">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover grayscale"
          style={{ backgroundImage: "url(/Photo/voiture2.png)", backgroundPosition: "50% 40%" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-5 select-none text-[11px] tracking-wide text-white/80 sm:right-10 md:right-14"
          style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
        >
          © Théo
        </span>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[60%]"
          style={{ background: "linear-gradient(0deg, rgba(10,10,10,0.88), rgba(10,10,10,0))" }}
        />
        <Reveal className="absolute inset-x-5 bottom-8 flex flex-col gap-3.5 sm:inset-x-10 sm:bottom-14 md:inset-x-14 md:bottom-16">
          <p className="m-0 text-[13px]" style={{ color: "rgba(244,244,242,0.75)" }}>
            {c.heroKicker}
          </p>
          <h1 className="m-0 text-[clamp(36px,5vw,72px)] font-medium leading-none tracking-[-0.04em]">{c.heroTitle}</h1>
          <DrawBar />
        </Reveal>
      </div>

      <div className="bg-paper text-[#111111]">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 px-5 pt-[clamp(72px,12vh,140px)] sm:px-10 md:grid-cols-12 md:px-14">
          <Reveal index={0} className="md:col-start-1 md:col-end-11">
            <p className="m-0 max-w-[20ch] text-[clamp(28px,3.6vw,52px)] font-medium leading-[1.08] tracking-[-0.035em] text-balance">
              {c.introTitle}
            </p>
          </Reveal>
          <Reveal index={1} className="md:col-start-5 md:col-end-9">
            <p className="m-0 text-base leading-[1.7] text-[#333] text-pretty">
              {c.introP1}
            </p>
          </Reveal>
          <Reveal index={2} className="flex flex-col gap-4 md:col-start-9 md:col-end-13">
            <p className="m-0 text-base leading-[1.7] text-[#333] text-pretty">
              {c.introP2}
            </p>
            <p className="m-0 text-[13px] text-[#666]">{c.introNote}</p>
          </Reveal>
        </div>

        <div className="pt-[clamp(88px,14vh,160px)]">
          <Reveal className="mb-6 flex items-baseline justify-between gap-6 px-5 sm:px-10 md:px-14">
            <h2 className="m-0 text-[clamp(22px,2vw,28px)] font-medium tracking-[-0.02em]">{c.seasonTitle}</h2>
            <span className="text-[13px] text-[#666]">{SEASON_META}</span>
          </Reveal>
          <SeasonMarquee items={SEASON} />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-10 px-5 pb-[clamp(72px,12vh,140px)] pt-[clamp(72px,12vh,140px)] sm:px-10 md:px-14">
          <Reveal className="flex flex-wrap gap-6 pt-1 sm:gap-10 md:gap-12">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <CountUp
                  to={s.v}
                  className="text-[clamp(30px,3vw,42px)] font-medium leading-none tracking-[-0.03em]"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                />
                <span className="text-xs text-[#666]">{s.label}</span>
              </div>
            ))}
          </Reveal>
          <Reveal index={1}>
            <NavLink
              href="/contact"
              className="inline-flex items-center gap-3.5 bg-accent px-6 py-4 text-sm font-medium whitespace-nowrap text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] hover:shadow-[0_10px_36px_rgba(255,79,0,0.35)] active:scale-[0.97]"
            >
              {c.cta} <span aria-hidden="true">→</span>
            </NavLink>
          </Reveal>
        </div>
      </div>
    </>
  );
}
