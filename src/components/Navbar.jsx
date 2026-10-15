"use client";

import { useEffect, useState } from "react";
import NavLink from "./NavLink";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/galerie", label: "Galerie" },
  { href: "/prestations", label: "Prestations" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const ENTRANCE_MS = 260;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasHero = pathname === "/";
  const solid = scrolled || !hasHero;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-5 sm:px-10 md:px-14"
      style={{
        background: solid ? "rgba(244,244,242,0.92)" : "transparent",
        backdropFilter: solid ? "blur(10px)" : "none",
        color: solid ? "#111111" : "#f4f4f2",
        // boxShadow: solid ? "0 1px 0 rgba(17,17,17,0.08)" : "none",
        // le slide d'entrée au chargement n'a de sens que sur l'accueil
        // (synchronisé avec celui du hero) ; sur les autres pages la navbar
        // reste simplement fixe, sans animation d'arrivée
        transform: !hasHero || mounted ? "translateX(0)" : "translateX(70px)",
        transition: `background-color 300ms ease, color 300ms ease, box-shadow 300ms ease, transform ${ENTRANCE_MS}ms cubic-bezier(.16,1,.3,1)`,
      }}
    >
      <NavLink href="/" className="text-[15px] font-medium tracking-tight">
        Théo
      </NavLink>

      <div className="flex items-center gap-10">
        <nav aria-label="Menu principal" className="hidden gap-8 md:flex">
          {LINKS.map((link) => {
            const current = link.href === pathname;
            return (
              <NavLink
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className="text-[13px] transition-opacity duration-150 hover:opacity-100"
                style={{
                  opacity: current ? 1 : 0.7,
                  textDecorationLine: current ? "underline" : "none",
                  textDecorationColor: "var(--accent)",
                  textUnderlineOffset: "8px",
                  textDecorationThickness: "2px",
                }}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <NavLink
            href="/connexion"
            aria-label="Mon compte"
            className="flex min-h-11 items-center justify-center text-base opacity-80 transition-opacity duration-150 hover:opacity-100"
          >
            <FontAwesomeIcon icon={faUser} />
          </NavLink>

          <NavLink
            href="/boutique"
            aria-label="Boutique"
            className="flex min-h-11 items-center justify-center text-base opacity-80 transition-opacity duration-150 hover:opacity-100"
          >
            <FontAwesomeIcon icon={faBagShopping} />
          </NavLink>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="flex min-h-11 min-w-11 items-center justify-center border-0 bg-transparent text-base md:hidden"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
    </header>
  );
}
