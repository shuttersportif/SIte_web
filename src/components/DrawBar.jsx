"use client";

import { useEffect, useRef } from "react";

// la barre orange se dessine (scaleX 0 -> 1) une fois visible à l'écran,
// comme dans la maquette de référence
export default function DrawBar({ className = "block h-[3px] w-16 bg-accent" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.transform = "scaleX(1)";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(el);
          el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
            duration: 420,
            easing: "cubic-bezier(.23,1,.32,1)",
            fill: "forwards",
          });
        });
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`${className} origin-left`}
      style={{ transform: "scaleX(0)" }}
    />
  );
}
