"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // pas d'AnimatePresence / exit : l'ancienne page ne se démonte jamais en
  // attendant que la nouvelle arrive, ce qui laissait entrevoir le fond
  // sombre du <body> derrière pendant le court instant du démontage. Le
  // flash (PageFlash) masque déjà le changement de contenu ; ici on se
  // contente de faire entrer la nouvelle page une fois montée.
  //
  // le glissé horizontal (toute la page qui vient de la droite) ne se joue
  // que sur l'accueil ; les autres pages gardent juste le fondu du texte
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: isHome ? 56 : 0, y: isHome ? 0 : 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
