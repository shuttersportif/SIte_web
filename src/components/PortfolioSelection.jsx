"use client";

import Reveal from "./Reveal";
import DrawBar from "./DrawBar";
import NavLink from "./NavLink";
import { CATEGORIES } from "../lib/portfolioData";

// même motif éditorial que la maquette de référence : un cycle de 5 blocs
// (pleine largeur, puis deux moitiés, etc.) qui se répète sur la sélection
const PATTERN = [
  [{ col: "1/-1", ratio: "16/9" }],
  [
    { col: "1/8", ratio: "3/2" },
    { col: "8/13", ratio: "4/5", mt: "clamp(48px,10vw,160px)" },
  ],
  [{ col: "6/13", ratio: "4/3" }],
  [
    { col: "1/6", ratio: "4/5" },
    { col: "6/13", ratio: "3/2", mt: "clamp(32px,6vw,96px)" },
  ],
  [{ col: "2/9", ratio: "3/2" }],
];

function layoutItems(photos) {
  const out = [];
  for (let i = 0, pi = 0; i < photos.length; pi++) {
    let slots = PATTERN[pi % PATTERN.length];
    if (slots.length > photos.length - i) slots = [{ col: "3/11", ratio: "3/2" }];
    for (const slot of slots) {
      out.push({ ...photos[i], ...slot });
      i++;
    }
  }
  return out;
}

function capOf(x) {
  return [x.evenement, x.lieu, x.annee].filter(Boolean).join(" · ");
}

export default function PortfolioSelection({ category, content = {} }) {
  const sel = CATEGORIES[category];
  const text = content[category] || {};
  const otherKey = Object.keys(CATEGORIES).find((k) => k !== category);
  const other = CATEGORIES[otherKey];
  const otherText = content[otherKey] || {};
  const items = layoutItems(sel.photos);

  return (
    <div className="animate-fade-in bg-paper text-[#111111]">
      <div className="relative min-h-[420px] overflow-hidden bg-[#151515] text-paper md:h-[min(78dvh,860px)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sel.cover})` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[64%]"
          style={{ background: "linear-gradient(0deg, rgba(10,10,10,0.82), rgba(10,10,10,0))" }}
        />
        <span
          className="pointer-events-none absolute right-3.5 top-3 select-none text-[11px] tracking-wide text-white/80"
          style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
        >
          © Théo
        </span>
        <Reveal className="absolute inset-x-5 bottom-7 flex flex-col items-start gap-3.5 sm:inset-x-10 md:inset-x-14 md:bottom-[clamp(32px,7vh,72px)]">
          <NavLink
            href="/portfolio"
            className="inline-flex min-h-11 items-center text-[13px] text-paper underline decoration-white/45 underline-offset-4 hover:decoration-white"
          >
            ← Portfolio
          </NavLink>
          <div>
            <h1 className="m-0 text-[clamp(44px,6.4vw,104px)] font-medium leading-[0.95] tracking-[-0.04em] text-balance">
              {text.nom}
            </h1>
            <DrawBar className="mt-5 block h-[3px] w-16 bg-accent" />
          </div>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-x-6 px-5 pb-0 pt-12 sm:px-10 md:grid-cols-12 md:pt-16 md:px-14">
        <Reveal index={0} className="flex flex-col gap-4 md:col-start-6 md:col-end-13">
          <p className="m-0 max-w-[40ch] text-[clamp(19px,1.6vw,23px)] leading-[1.5] tracking-[-0.01em]">
            {text.intro1}
          </p>
          <p className="m-0 max-w-[52ch] text-base leading-[1.7] text-[#444]">{text.intro2}</p>
        </Reveal>
      </div>

      <div className="grid grid-cols-12 gap-[clamp(12px,1.6vw,24px)] px-5 pb-[clamp(96px,14vh,160px)] pt-12 sm:px-10 md:px-14 md:pt-[clamp(64px,11vh,136px)]">
        {items.map((it, i) => (
          <figure
            key={i}
            className="relative m-0 col-span-12 flex min-w-0 flex-col gap-3 md:[grid-column:var(--col)] md:[margin-top:var(--mt,0px)]"
            style={{ "--col": it.col, "--mt": it.mt || "0px" }}
          >
            <div
              className="relative aspect-[3/2] overflow-hidden bg-[#e7e7e4] md:[aspect-ratio:var(--ratio)]"
              style={{ "--ratio": it.ratio }}
            >
              <div
                className="h-full w-full bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${sel.cover})` }}
              />
              <span
                className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
                style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
              >
                © Théo
              </span>
            </div>
            <figcaption className="text-xs leading-snug text-[#555]" style={{ overflowWrap: "anywhere" }}>
              {capOf(it)}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="bg-ink px-5 py-[clamp(72px,12vh,140px)] text-paper sm:px-10 md:px-14">
        <Reveal className="flex max-w-[18ch] flex-col items-start gap-6">
          <h2 className="m-0 text-[clamp(30px,4vw,56px)] font-medium leading-[1.05] tracking-[-0.03em] text-balance">
            {text.cta}
          </h2>
          <p className="m-0 max-w-[46ch] text-base leading-[1.65]" style={{ color: "rgba(244,244,242,0.82)" }}>
            Indiquez la date, le lieu et le format de votre événement : je vous réponds sous 48 h avec une
            proposition.
          </p>
          <NavLink
            href="/contact"
            className="mt-0.5 inline-flex items-center gap-3.5 bg-accent px-6 py-4 text-sm font-medium whitespace-nowrap text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
          >
            Demander une prestation <span aria-hidden="true">→</span>
          </NavLink>
        </Reveal>
      </div>

      <NavLink
        href={`/portfolio/${otherKey}`}
        className="group relative block h-[clamp(220px,34vh,340px)] overflow-hidden text-paper"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[900ms] ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.04]"
          style={{ backgroundImage: `url(${other.cover})` }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-ink opacity-[0.52] transition-opacity duration-[400ms] ease-linear group-hover:opacity-[0.36]"
        />
        <span className="absolute inset-x-5 bottom-7 flex flex-col gap-2.5 sm:inset-x-10 md:inset-x-14">
          <span className="text-[13px]" style={{ color: "rgba(244,244,242,0.85)" }}>
            Autre sélection
          </span>
          <span className="flex items-baseline gap-4 text-[clamp(32px,4.4vw,64px)] font-medium leading-none tracking-[-0.035em]">
            <span className="text-balance">{otherText.nom}</span>
            <span
              aria-hidden="true"
              className="inline-block text-[0.6em] transition-transform duration-[260ms] ease-[cubic-bezier(.23,1,.32,1)] group-hover:translate-x-1.5"
            >
              →
            </span>
          </span>
        </span>
        <span
          className="pointer-events-none absolute right-3.5 top-3 select-none text-[11px] tracking-wide text-white/80"
          style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
        >
          © Théo
        </span>
      </NavLink>
    </div>
  );
}
