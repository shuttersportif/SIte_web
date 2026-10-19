"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { fmt } from "../lib/galleryData";

// même ressort critique que la maquette de référence : f (position actuelle)
// rattrape tgt (position visée) avec une accélération -k*(f-tgt) - c*v
const SPRING_K = 220;
const SPRING_C = 30;

function viewportWH() {
  // la navbar de ce site est en position fixe (hors flux), seul le footer
  // (56px) réduit vraiment l'espace disponible — contrairement à la
  // maquette de référence dont l'en-tête est "sticky" (64px en plus)
  return [window.innerWidth, window.innerHeight - 56];
}

function hashOf(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// translate3d + rotateX (incline la pile comme posée sur une table) +
// rotateZ (éventail) + translateZ (profondeur d'empilement) + un jitter
// aléatoire + l'échelle : la même combinaison que l'original
const T = (x, y, z, rx, rz, tz, jz, s) =>
  `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z}px) rotateX(${rx}deg) rotateZ(${rz}deg) translateZ(${tz}px) rotateZ(${jz.toFixed(2)}deg) scale(${s})`;

// W/H = largeur/hauteur de la fenêtre (pas du conteneur) moins l'espace
// réservé à la navbar + au footer : exactement comme la maquette de
// référence (s.vw, s.vh - 120), pour que la géométrie des piles ne dépende
// jamais de la hauteur de l'en-tête superposé
function buildEngine(races, W, H) {
  const maxW = Math.min(W * 0.5, 980);
  const maxH = H * 0.56;
  const G = {
    cy: -H * 0.08,
    pileY: H * 0.31,
    sp: Math.max(210, Math.min(380, W * 0.22)),
    ps: 0.28,
    labelY: Math.round(Math.min(H * 0.31 + 46, H / 2 - 52)),
  };
  const start = [];
  const seqRace = [];
  let acc = 0;
  races.forEach((r, p) => {
    start[p] = acc;
    for (let i = 0; i < r.photos.length; i++) seqRace.push(p);
    acc += r.photos.length;
  });
  const meta = [];
  races.forEach((r, p) => {
    r.photos.forEach((photo, i) => {
      // ratio générique 3/2 : on n'a pas les dimensions réelles des photos
      // placeholder, donc on recrée le même calcul d'ajustement que
      // l'original (contenu dans maxW x maxH) avec ce ratio par défaut
      let w = maxW;
      let h = (w * 2) / 3;
      if (h > maxH) {
        h = maxH;
        w = (h * 3) / 2;
      }
      meta.push({
        p,
        i,
        n: r.photos.length,
        g: start[p] + i,
        jit: ((hashOf(r.id + photo.id) % 7) - 3) * 1.1,
        w,
        h,
        photo,
        raceId: r.id,
      });
    });
  });
  const labels = races.map((r, p) => ({ p, nom: r.nom, date: r.date }));
  return { G, start, seqRace, meta, labels, len: acc };
}

// le carrousel « livre » : molette/glisser pour feuilleter les photos une
// par une, avec les autres courses repliées en piles sur les côtés
const GalleryEngine = forwardRef(function GalleryEngine({ races, initialGlobalIdx = 0, onPosition }, ref) {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const labelRefs = useRef([]);
  const engRef = useRef(null);
  const animRef = useRef({ f: 0, v: 0, tgt: 0, raf: null, lastT: 0, dragging: false });
  const dragRef = useRef(null);
  const wheelSnapRef = useRef(null);
  const wDirRef = useRef(1);
  const lastIdxRef = useRef(-1);
  const firstRef = useRef(true);
  const [built, setBuilt] = useState(null);

  function notify(idx) {
    const eng = engRef.current;
    if (!eng) return;
    const m = eng.meta[idx];
    if (!m || lastIdxRef.current === idx) return;
    lastIdxRef.current = idx;
    onPosition?.({ raceId: m.raceId, photoIndex: m.i, photoCount: m.n });
  }

  function paint() {
    const eng = engRef.current;
    const A = animRef.current;
    if (!eng || !eng.len) return;
    const { G, meta, labels, start, seqRace } = eng;
    const f = A.f;
    const k0 = Math.max(0, Math.min(eng.len - 1, Math.floor(f)));
    const r0 = seqRace[k0] ?? 0;
    const r1 = seqRace[Math.min(eng.len - 1, k0 + 1)] ?? r0;
    const fr = r0 + (r1 - r0) * Math.max(0, Math.min(1, f - Math.floor(f)));

    meta.forEach((m, k) => {
      const el = cardRefs.current[k];
      if (!el) return;
      const dr = m.p - fr;
      const adr = Math.abs(dr);
      const t = m.g - f;
      const L0 = Math.max(0, 1 - Math.abs(t));
      const L = L0 * L0 * (3 - 2 * L0);
      const fL = Math.max(-1, Math.min(m.n, f - start[m.p]));
      const rank =
        m.i > fL
          ? Math.max(0, Math.min(m.n - 1, m.i - fL - 1))
          : Math.max(0, Math.min(m.n - 1, m.n - 1 - (fL - m.i - 1)));
      const pileOp = adr >= 3.5 ? 0 : adr > 3 ? (3.5 - adr) * 1.2 : 1 - 0.4 * Math.min(1, adr);
      const deep = rank > 13 ? 0 : 1;
      const pl = [dr * G.sp, G.pileY, 0, 58, -24, Math.max(0, Math.min(m.n, 14) - 1 - rank) * 3, m.jit, G.ps];
      const ce = [0, G.cy, 80, 0, 0, 0, 0, 1];
      const P = pl.map((v, j) => v + (ce[j] - v) * L);
      const op = pileOp * deep + (1 - pileOp * deep) * L;
      if (op < 0.004) {
        el.style.display = "none";
        return;
      }
      el.style.display = "block";
      el.style.transform = T(P[0], P[1], P[2], P[3], P[4], P[5], P[6], P[7]);
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = String(1000 - Math.round(Math.abs(t) * 10));
      el.style.cursor = Math.abs(m.g - f) < 0.5 ? "default" : "pointer";
    });

    labels.forEach((lb, j) => {
      const el = labelRefs.current[j];
      if (!el) return;
      const dr = lb.p - fr;
      const adr = Math.abs(dr);
      const op = adr >= 3.5 ? 0 : adr > 3 ? (3.5 - adr) * 2 : 1;
      el.style.transform = `translate(-50%,0) translate(${(dr * G.sp).toFixed(1)}px,${G.labelY}px)`;
      el.style.opacity = op.toFixed(3);
      el.style.pointerEvents = op > 0.1 ? "auto" : "none";
    });
  }

  function tick(now) {
    const A = animRef.current;
    const dt = A.lastT ? Math.min(0.05, (now - A.lastT) / 1000) : 1 / 60;
    A.lastT = now;
    const a = -SPRING_K * (A.f - A.tgt) - SPRING_C * A.v;
    A.v += a * dt;
    A.f += A.v * dt;
    const settled = Math.abs(A.f - A.tgt) < 0.0005 && Math.abs(A.v) < 0.0008;
    if (settled && !A.dragging) {
      A.f = A.tgt;
      A.v = 0;
    }
    paint();
    if (!settled || A.dragging) A.raf = requestAnimationFrame(tick);
    else {
      A.raf = null;
      A.lastT = 0;
    }
  }

  function kick() {
    const A = animRef.current;
    if (!A.raf) {
      A.lastT = 0;
      A.raf = requestAnimationFrame(tick);
    }
  }

  function setTarget(t, frac) {
    const eng = engRef.current;
    if (!eng || !eng.len) return;
    t = Math.max(0, Math.min(eng.len - 1, t));
    if (!frac) t = Math.round(t);
    animRef.current.tgt = t;
    notify(Math.round(t));
    kick();
  }

  useImperativeHandle(ref, () => ({
    prev: () => setTarget(Math.round(animRef.current.tgt) - 1),
    next: () => setTarget(Math.round(animRef.current.tgt) + 1),
  }));

  // (re)construit le moteur quand la liste de courses change (filtre)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const [W, H] = viewportWH();
    const eng = buildEngine(races, W, H);
    engRef.current = eng;
    cardRefs.current = new Array(eng.meta.length).fill(null);
    labelRefs.current = new Array(eng.labels.length).fill(null);
    const startPos = firstRef.current ? Math.max(0, Math.min(eng.len - 1, initialGlobalIdx)) : 0;
    firstRef.current = false;
    animRef.current.f = startPos;
    animRef.current.tgt = startPos;
    animRef.current.v = 0;
    lastIdxRef.current = -1;
    setBuilt(eng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [races]);

  // première peinture une fois les éléments montés, + notifie la position
  useEffect(() => {
    if (!built) return;
    paint();
    notify(Math.round(animRef.current.tgt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built]);

  // molette, glisser, clavier
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const px = e.deltaMode === 1 ? raw * 32 : raw;
      const step = Math.max(-0.9, Math.min(0.9, px / 220));
      if (step) wDirRef.current = step > 0 ? 1 : -1;
      setTarget(animRef.current.tgt + step, true);
      clearTimeout(wheelSnapRef.current);
      wheelSnapRef.current = setTimeout(() => {
        const t = animRef.current.tgt;
        setTarget(wDirRef.current > 0 ? Math.ceil(t - 0.15) : Math.floor(t + 0.15));
      }, 140);
    };

    const onDown = (e) => {
      if (e.button !== 0) return;
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        startT: animRef.current.tgt,
        moved: false,
        lx: e.clientX,
        ly: e.clientY,
        lt: performance.now(),
        vel: 0,
        pid: e.pointerId,
        unit: 1,
      };
    };
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved) {
        if (Math.hypot(dx, dy) < 6) return;
        d.moved = true;
        d.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        try {
          el.setPointerCapture(d.pid);
        } catch {
          /* ignore */
        }
        animRef.current.dragging = true;
      }
      const now = performance.now();
      const inst = (d.axis === "x" ? e.clientX - d.lx : e.clientY - d.ly) / Math.max(1, now - d.lt);
      d.vel = d.vel * 0.7 + inst * 0.3;
      d.lx = e.clientX;
      d.ly = e.clientY;
      d.lt = now;
      d.unit = d.axis === "x" ? Math.max(160, (engRef.current ? engRef.current.G.sp : 300) * 0.9) : 150;
      setTarget(d.startT - (d.axis === "x" ? dx : dy) / d.unit, true);
    };
    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      animRef.current.dragging = false;
      if (!d || !d.moved) return;
      setTarget(Math.round(animRef.current.tgt - (d.vel * 180) / d.unit));
    };

    const onKey = (e) => {
      if (document.activeElement && document.activeElement.closest('[role="dialog"]')) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setTarget(Math.round(animRef.current.tgt) + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setTarget(Math.round(animRef.current.tgt) - 1);
      }
    };

    const onResize = () => {
      if (!engRef.current) return;
      const [W, H] = viewportWH();
      engRef.current = buildEngine(races, W, H);
      kick();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
      clearTimeout(wheelSnapRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [races]);

  return (
    <div
      ref={stageRef}
      className="relative h-full w-full touch-none select-none overflow-hidden"
      style={{ perspective: "1500px", perspectiveOrigin: "50% 32%" }}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {built?.meta.map((m, k) => (
          <div
            key={`${m.raceId}-${m.i}`}
            ref={(el) => {
              cardRefs.current[k] = el;
            }}
            onClick={() => setTarget(m.g)}
            className="absolute left-1/2 top-1/2 overflow-hidden bg-[#dcdcd8]"
            style={{
              width: `${Math.round(m.w)}px`,
              height: `${Math.round(m.h)}px`,
              marginLeft: `${-Math.round(m.w / 2)}px`,
              marginTop: `${-Math.round(m.h / 2)}px`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
              backfaceVisibility: "hidden",
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${m.photo.src})` }}
            />
            <span
              className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
              style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
            >
              © Théo
            </span>
          </div>
        ))}
      </div>

      {built?.labels.map((lb, j) => (
        <button
          key={lb.p}
          type="button"
          ref={(el) => {
            labelRefs.current[j] = el;
          }}
          onClick={() => setTarget(built.start[lb.p])}
          className="absolute left-1/2 top-1/2 flex w-[200px] flex-col items-center gap-0.5 border-0 bg-transparent px-2.5 py-1.5 text-center"
          style={{ opacity: 0 }}
        >
          <span className="max-w-full truncate text-xs font-medium text-[#111111]">{lb.nom}</span>
          <span className="text-[11px] text-[#666666]" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(lb.date)}
          </span>
        </button>
      ))}
    </div>
  );
});

export default GalleryEngine;
