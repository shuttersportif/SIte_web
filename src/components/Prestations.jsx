"use client";

import { useRef, useState } from "react";
import Reveal from "./Reveal";
import DrawBar from "./DrawBar";
import NavLink from "./NavLink";

// les textes (titre/description) viennent du contenu éditable ; seules les
// photos restent fixes ici, dans le même ordre que content.prestations.services
const SERVICE_PHOTOS = ["/Photo/voiture.png", "/Photo/voiture2.png", "/Photo/voiture.png", "/Photo/voiture2.png"];

const PRESTATIONS_DEFAULTS = {
  intro: "Je couvre les courses cyclistes et le sport mécanique pour les organisateurs, les équipes et les pilotes.",
  cta: "Demander un devis",
  services: [
    { titre: "Couverture de courses", description: "Reportage complet de l'épreuve, du départ à l'arrivée : l'action, les coulisses, le podium. Une sélection retouchée est livrée après la course pour vos supports." },
    { titre: "Équipes et pilotes", description: "Suivi sur une course ou sur toute la saison : photos en course, portraits, images de l'équipe et des partenaires, prêtes pour les réseaux et la presse." },
    { titre: "Organisateurs", description: "Images pour l'affiche, le programme, le site et le bilan de l'événement, avec des droits d'utilisation définis à l'avance." },
    { titre: "Fichiers numériques et licences", description: "Les photos de la galerie en fichiers numériques haute définition, et des licences d'utilisation pour les médias et les marques." },
  ],
};

// liste de services : au survol (desktop large), les autres lignes s'estompent
// et une vignette flotte à gauche, à la hauteur de la ligne survolée ; sur
// mobile/tablette, chaque ligne embarque directement sa propre image
function PrestationsList({ services }) {
  const SERVICES = services.map((sv, i) => ({ ...sv, src: SERVICE_PHOTOS[i % SERVICE_PHOTOS.length] }));
  const [hoverIdx, setHoverIdx] = useState(null);
  const [previewTop, setPreviewTop] = useState(0);
  const rowRefs = useRef([]);
  const listRef = useRef(null);

  const handleEnter = (i) => {
    setHoverIdx(i);
    const row = rowRefs.current[i];
    const list = listRef.current;
    if (row && list) {
      const rowRect = row.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      setPreviewTop(rowRect.top - listRect.top + rowRect.height / 2);
    }
  };

  return (
    <div
      ref={listRef}
      onMouseLeave={() => setHoverIdx(null)}
      className="relative flex flex-col border-b"
      style={{ borderColor: "rgba(17,17,17,0.12)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[calc(100%+32px)] top-0 z-[2] hidden w-[280px] lg:block"
        style={{
          transform: `translateY(${previewTop}px) translateY(-50%)`,
          transition: "transform 260ms cubic-bezier(.23,1,.32,1)",
        }}
      >
        <div
          className="relative aspect-[3/2] overflow-hidden bg-[#e7e7e4]"
          style={{
            opacity: hoverIdx !== null ? 1 : 0,
            transform: hoverIdx !== null ? "scale(1)" : "scale(0.98)",
            transition: "opacity 180ms ease, transform 260ms cubic-bezier(.23,1,.32,1)",
          }}
        >
          {SERVICES.map((sv, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-cover bg-center grayscale"
              style={{
                backgroundImage: `url(${sv.src})`,
                opacity: hoverIdx === i ? 1 : 0,
                transition: "opacity 160ms ease",
              }}
            />
          ))}
          <span
            className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
            style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
          >
            © Théo
          </span>
        </div>
      </div>

      {SERVICES.map((sv, i) => (
        <Reveal key={i} index={i} as="div">
          <div
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onMouseEnter={() => handleEnter(i)}
            className="border-t py-7"
            style={{ borderColor: "rgba(17,17,17,0.12)" }}
          >
            <div className="relative mb-[18px] aspect-video overflow-hidden bg-[#e7e7e4] lg:hidden">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale"
                style={{ backgroundImage: `url(${sv.src})` }}
              />
              <span
                className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
                style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
              >
                © Théo
              </span>
            </div>
            <div
              className="flex flex-col gap-2.5"
              style={{
                opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.45,
                transition: "opacity 200ms ease",
              }}
            >
              <h2 className="m-0 text-lg font-medium">{sv.titre}</h2>
              <p className="m-0 max-w-[54ch] text-[15px] leading-[1.65] text-[#444] text-pretty">{sv.description}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function Prestations({ content }) {
  const c = { ...PRESTATIONS_DEFAULTS, ...content };
  return (
    <div className="bg-paper text-[#111111]">
      <div className="px-5 pb-[clamp(72px,12vh,140px)] pt-[clamp(16px,3vh,32px)] sm:px-10 md:px-14">
        <Reveal className="relative h-[clamp(220px,40vh,440px)] overflow-hidden bg-[#e7e7e4]">
          <div
            className="absolute inset-0 bg-cover bg-center grayscale"
            style={{ backgroundImage: "url(/Photo/voiture2.png)" }}
          />
          <span
            className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
            style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
          >
            © Théo
          </span>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 pt-[clamp(56px,10vh,112px)] md:grid-cols-12">
          <div className="flex flex-col items-start gap-[22px] md:col-span-5">
            <Reveal index={0}>
              <h1 className="m-0 text-[clamp(28px,3.4vw,44px)] font-medium leading-[1.05] tracking-[-0.03em]">
                Prestations
              </h1>
              <DrawBar className="mt-4 block h-[3px] w-16 bg-accent" />
            </Reveal>
            <Reveal index={1}>
              <p className="m-0 max-w-[38ch] text-base leading-[1.65] text-[#444] text-pretty">{c.intro}</p>
            </Reveal>
            <Reveal index={2}>
              <NavLink
                href="/contact"
                className="mt-1.5 inline-flex items-center gap-3.5 bg-accent px-6 py-4 text-sm font-medium whitespace-nowrap text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] hover:shadow-[0_10px_36px_rgba(255,79,0,0.35)] active:scale-[0.97]"
              >
                {c.cta} <span aria-hidden="true">→</span>
              </NavLink>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <PrestationsList services={c.services} />
          </div>
        </div>
      </div>
    </div>
  );
}
