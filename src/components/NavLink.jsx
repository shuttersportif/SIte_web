"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { triggerPageFlash, PAGE_ORDER } from "../lib/pageFlash";

export default function NavLink({ href, onClick, ...props }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || href === pathname) return;
    e.preventDefault();
    const fromIdx = PAGE_ORDER.indexOf(pathname);
    const toIdx = PAGE_ORDER.indexOf(href);
    // par défaut (pages hors de l'ordre connu) on garde le sens habituel
    const direction = fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx ? -1 : 1;
    triggerPageFlash(direction);
    router.push(href);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
