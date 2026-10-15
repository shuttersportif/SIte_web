"use client";

import { useEffect, useState } from "react";

const HOLD_MS = 2; // tenue à pleine intensité avant la sortie
const FADE_MS = 2; // sortie rapide, façon flash d'appareil photo

export default function FlashOverlay() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setLeaving(true), HOLD_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-white"
      style={{
        transform: leaving ? "translateX(-100%)" : "translateX(0)",
        transition: `transform ${FADE_MS}ms cubic-bezier(.5,0,1,1)`,
      }}
    />
  );
}
