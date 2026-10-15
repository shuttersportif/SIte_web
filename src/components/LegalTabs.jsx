"use client";

import NavLink from "./NavLink";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export default function LegalTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Pages légales" className="flex gap-6 border-black/10 px-5 pt-36 sm:px-10 md:px-14">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <NavLink
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="pb-3 text-[13px] transition-opacity duration-150 hover:opacity-100"
            style={{
              opacity: active ? 1 : 0.6,
              textDecorationLine: active ? "underline" : "none",
              textDecorationColor: "var(--accent)",
              textUnderlineOffset: "10px",
              textDecorationThickness: "2px",
            }}
          >
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
