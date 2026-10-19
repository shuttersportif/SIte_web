"use client";

import { usePathname } from "next/navigation";
import NavLink from "./NavLink";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="sticky bottom-0 z-[4] relative flex h-14 flex-none items-center justify-end gap-6 whitespace-nowrap bg-ink px-5 text-xs text-paper sm:px-10 md:px-14">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-accent" />

      <NavLink
        href="/mentions-legales"
        className="inline-block py-3.5 text-paper underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:decoration-current"
      >
        Mentions légales
      </NavLink>

      <NavLink
        href="/cgv"
        className="inline-block py-3.5 text-paper underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:decoration-current"
      >
        CGV
      </NavLink>

      <NavLink
        href="/confidentialite"
        className="inline-block py-3.5 text-paper underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:decoration-current"
      >
        Confidentialité
      </NavLink>

      <span>
        Réalisé par{" "}
        <a
          href="https://plc-studio.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-3.5 text-paper underline decoration-transparent underline-offset-[3px] transition-colors duration-150 hover:decoration-current"
        >
          plc-studio.fr
        </a>
      </span>
    </footer>
  );
}
