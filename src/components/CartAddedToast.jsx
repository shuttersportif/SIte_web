"use client";

import { useEffect, useRef, useState } from "react";
import { onCartAdd } from "../lib/cartStore";

export default function CartAddedToast() {
  const [entry, setEntry] = useState(null);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const unsubscribe = onCartAdd((titre) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setEntry(titre);
      setVisible(true);
      timers.current.push(setTimeout(() => setVisible(false), 2200));
      timers.current.push(setTimeout(() => setEntry(null), 2500));
    });
    return () => {
      unsubscribe();
      timers.current.forEach(clearTimeout);
    };
  }, []);

  if (!entry) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-5"
    >
      <div
        className="pointer-events-auto flex max-w-[92vw] items-center gap-2.5 bg-ink px-4 py-3 text-paper shadow-lg"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 220ms cubic-bezier(.23,1,.32,1), transform 220ms cubic-bezier(.23,1,.32,1)",
        }}
      >
        <span aria-hidden="true" className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent text-[12px] font-bold text-black">
          ✓
        </span>
        <span className="truncate text-sm">
          <span className="font-medium">{entry}</span> ajouté à votre panier
        </span>
      </div>
    </div>
  );
}
