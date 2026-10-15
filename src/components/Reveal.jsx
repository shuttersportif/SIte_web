"use client";

import { useEffect, useRef } from "react";

// reproduit fidèlement reveal()/decorate() du html de référence : même
// courbe d'accélération (EASE), même durée, même palier, et surtout la
// même technique — une animation Web Animations API avec fill:"backwards"
// plutôt qu'une transition CSS déclenchée par un changement de state (plus
// fluide, pas de à-coup de layout/style avant que l'animation ne démarre)
const EASE = "cubic-bezier(.23,1,.32,1)";
const STAGGER_MS = 70;
const MAX_STAGGER_INDEX = 6;
const DURATION_MS = 560;
const REDUCED_DURATION_MS = 220;

export default function Reveal({ children, index = 0, as: Tag = "div", className }) {
  const ref = useRef(null);
  const revealed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = Math.min(index, MAX_STAGGER_INDEX) * STAGGER_MS;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || revealed.current) return;
          revealed.current = true;
          io.unobserve(el);
          el.style.opacity = "1";
          if (!el.animate) {
            el.style.transform = "none";
            return;
          }
          el.animate(
            reduce
              ? [{ opacity: 0 }, { opacity: 1 }]
              : [{ opacity: 0, transform: "translateX(-28px)" }, { opacity: 1, transform: "none" }],
            { duration: reduce ? REDUCED_DURATION_MS : DURATION_MS, delay, easing: EASE, fill: "backwards" }
          );
        });
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
