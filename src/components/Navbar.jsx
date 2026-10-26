"use client";

import { useEffect, useRef, useState } from "react";
import NavLink from "./NavLink";
import AccountPanel from "./AccountPanel";
import CartPanel from "./CartPanel";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useSupabaseUser } from "../lib/useSupabaseUser";
import { createClient } from "../lib/supabase/browserClient";

function accountInitial(user) {
  const source = user?.user_metadata?.full_name?.trim() || user?.email || "?";
  return source.charAt(0).toUpperCase();
}

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
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user } = useSupabaseUser();

  const isAdmin = pathname?.startsWith("/admin");
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

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  if (isAdmin) return null;

  return (
    <>
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
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Mon compte"
                aria-expanded={menuOpen}
                className="flex h-9 w-9 min-h-9 cursor-pointer items-center justify-center rounded-full border text-[13px] font-medium transition-opacity duration-150 hover:opacity-90"
                style={{ borderColor: "currentColor" }}
              >
                {accountInitial(user)}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] w-56 bg-paper text-[#111111] shadow-lg"
                  style={{ border: "1px solid rgba(17,17,17,0.12)" }}
                >
                  <div
                    className="truncate px-4 py-3 text-xs text-[#666666]"
                    style={{ borderBottom: "1px solid rgba(17,17,17,0.08)" }}
                  >
                    {user.email}
                  </div>
                  <NavLink
                    href="/mon-espace?tab=info"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm transition-colors duration-150 hover:bg-black/5"
                  >
                    Mon profil
                  </NavLink>
                  <NavLink
                    href="/mon-espace?tab=dl"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm transition-colors duration-150 hover:bg-black/5"
                  >
                    Mes téléchargements
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left text-sm transition-colors duration-150 hover:bg-black/5"
                    style={{ borderTop: "1px solid rgba(17,17,17,0.08)" }}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label="Mon compte"
              className="flex min-h-11 cursor-pointer items-center justify-center border-0 bg-transparent text-base opacity-80 transition-opacity duration-150 hover:opacity-100"
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Panier"
            className="flex min-h-11 cursor-pointer items-center justify-center border-0 bg-transparent text-base opacity-80 transition-opacity duration-150 hover:opacity-100"
          >
            <FontAwesomeIcon icon={faBagShopping} />
          </button>
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
    <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
    <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} onNeedAccount={() => setAccountOpen(true)} />
    </>
  );
}
