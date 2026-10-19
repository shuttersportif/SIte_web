"use client";

import { useEffect, useRef } from "react";

// compte de 0 à la valeur cible (easing cubic-out) une fois le chiffre visible
export default function CountUp({ to, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.textContent = String(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(el);
          const duration = 1000;
          const start = performance.now();
          el.textContent = "0";
          const step = (now) => {
            const x = Math.max(0, Math.min(1, (now - start) / duration));
            el.textContent = String(Math.round(to * (1 - Math.pow(1 - x, 3))));
            if (x < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className={className} style={style}>
      {to}
    </span>
  );
}
