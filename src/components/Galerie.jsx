"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DrawBar from "./DrawBar";
import GalleryEngine from "./GalleryEngine";
import { COURSES, CATEGORY_NAMES, fmt, monthTitle, WEEKDAYS } from "../lib/galleryData";

const ALL_SORTED = [...COURSES].sort((a, b) => b.date.localeCompare(a.date));
const MOST_RECENT = ALL_SORTED[0];

function sumPhotos(list) {
  return list.reduce((n, r) => n + r.photos.length, 0);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// une vignette qui s'anime en fondu/glissement dès qu'elle entre dans le
// viewport (même technique que les autres grilles du site) — vue utilisée
// en dessous de lg, là où le carrousel en pile cède la place à une grille
function GridPhoto({ photo, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setVisible(false);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(el);
          setVisible(true);
        });
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  const delay = (index % 3) * 60;

  return (
    <figure
      ref={ref}
      className="group relative m-0 cursor-zoom-in overflow-hidden bg-[#e7e7e4]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateX(-28px)",
        transition: `opacity 420ms cubic-bezier(.23,1,.32,1) ${delay}ms, transform 520ms cubic-bezier(.23,1,.32,1) ${delay}ms`,
      }}
    >
      <div
        className="aspect-[4/3] w-full bg-cover bg-center grayscale transition-transform duration-[360ms] ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.02]"
        style={{ backgroundImage: `url(${photo.src})` }}
      />
      <span
        className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
        style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
      >
        © Théo
      </span>
    </figure>
  );
}

export default function Galerie({ initialCourse }) {
  const [cat, setCat] = useState(null);
  const [date, setDate] = useState(null);
  const [gRaceId, setGRaceId] = useState(initialCourse || null);
  const [enginePhotoIdx, setEnginePhotoIdx] = useState(0);
  const [calOpen, setCalOpen] = useState(false);
  const [calKey, setCalKey] = useState(null);
  const calWrapRef = useRef(null);
  const engineRef = useRef(null);

  const initialGlobalIdx = useMemo(() => {
    if (!initialCourse) return 0;
    let acc = 0;
    for (const r of ALL_SORTED) {
      if (r.id === initialCourse) return acc;
      acc += r.photos.length;
    }
    return 0;
  }, [initialCourse]);

  useEffect(() => {
    if (!calOpen) return;
    const onDown = (e) => {
      if (calWrapRef.current && !calWrapRef.current.contains(e.target)) setCalOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setCalOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [calOpen]);

  const catF = useMemo(
    () => ALL_SORTED.filter((r) => !cat || r.categorie === cat),
    [cat]
  );
  const filtered = useMemo(
    () => (date ? catF.filter((r) => r.date === date) : catF),
    [catF, date]
  );
  const race = (gRaceId && filtered.find((r) => r.id === gRaceId)) || filtered[0] || null;
  const galEmpty = filtered.length === 0;

  const n = race ? race.photos.length : 0;

  const label = !race
    ? ""
    : date
      ? `Course du ${fmt(date)}`
      : race.id === MOST_RECENT.id
        ? `Dernière course, ${CATEGORY_NAMES[race.categorie]}`
        : CATEGORY_NAMES[race.categorie];

  const catOpts = useMemo(
    () => [
      { id: null, label: "Toutes", count: sumPhotos(COURSES) },
      ...Object.entries(CATEGORY_NAMES).map(([id, lbl]) => ({
        id,
        label: lbl,
        count: sumPhotos(COURSES.filter((r) => r.categorie === id)),
      })),
    ],
    []
  );

  const pickCat = (id) => {
    setCat(id);
    setDate(null);
    setGRaceId(null);
    setCalOpen(false);
  };

  const pickRace = (id) => {
    setGRaceId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // calendrier — new Date() ne doit jamais s'évaluer pendant le rendu (prérendu
  // figé avec Cache Components) : valeur de repli statique, corrigée après le
  // montage côté client
  const [todayIso, setTodayIso] = useState(MOST_RECENT.date);
  useEffect(() => {
    const now = new Date();
    setTodayIso(`${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`);
  }, []);
  const todayKey = todayIso.slice(0, 7);
  const curKey = calKey || (race ? race.date.slice(0, 7) : todayKey);
  const [cy, cm] = curKey.split("-").map(Number);
  const monthsWith = [...new Set(catF.map((r) => r.date.slice(0, 7)))].sort();
  const minKey = monthsWith[0] || curKey;
  const maxKey = [monthsWith[monthsWith.length - 1] || curKey, todayKey].sort().pop();
  const shiftKey = (key, delta) => {
    const [y, m] = key.split("-").map(Number);
    const dt = new Date(y, m - 1 + delta, 1);
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}`;
  };
  const prevK = curKey > minKey ? shiftKey(curKey, -1) : null;
  const nextK = curKey < maxKey ? shiftKey(curKey, 1) : null;
  const firstDow = (new Date(cy, cm - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cy, cm, 0).getDate();
  const daysInPrevMonth = new Date(cy, cm - 1, 0).getDate();
  const byDate = {};
  catF.forEach((r) => {
    byDate[r.date] = r;
  });
  const cells = [];
  for (let i = firstDow; i > 0; i--) cells.push({ key: `p${i}`, muted: true, label: daysInPrevMonth - i + 1 });
  for (let dd = 1; dd <= daysInMonth; dd++) {
    const iso = `${cy}-${pad2(cm)}-${pad2(dd)}`;
    const r = byDate[iso];
    const sel = !!r && !!race && race.date === iso;
    const isToday = iso === todayIso;
    cells.push({
      key: iso,
      label: dd,
      iso,
      race: !!r && !sel,
      sel,
      isToday,
      aria: r ? `${r.nom}, ${fmt(iso)}` : isToday ? `Aujourd'hui, ${fmt(iso)}` : fmt(iso),
      pick: r ? () => { setDate(iso); setGRaceId(null); setCalOpen(false); setCalKey(null); } : null,
    });
  }
  for (let n2 = 1; cells.length % 7 !== 0; n2++) cells.push({ key: `n${n2}`, muted: true, label: n2 });
  const calEmpty = !cells.some((c) => c.race || c.sel);

  const raceIndex = filtered;

  return (
    <div className="bg-paper text-[#111111] lg:relative lg:h-[calc(100dvh-56px)] lg:overflow-hidden">
      <div className="relative z-[6] flex flex-wrap items-start justify-between gap-6 px-5 pt-[clamp(24px,5vh,48px)] sm:px-10 md:px-14 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:pt-[clamp(88px,9vh,112px)]">
        <div className="flex min-w-0 max-w-[420px] flex-col gap-2 lg:pointer-events-auto">
          <p className="m-0 text-[13px] text-[#666]">{label}</p>
          <h1 className="m-0 text-[clamp(26px,2.8vw,40px)] font-medium leading-[1.08] tracking-[-0.03em] text-balance">
            {race ? race.nom : "Galerie"}
          </h1>
          <DrawBar className="my-0.5 block h-[3px] w-16 bg-accent" />
          {race && (
            <p className="m-0 text-sm text-[#666]">
              {race.lieu}, {fmt(race.date)}
            </p>
          )}
          {race && n > 0 && (
            <div className="hidden items-center gap-1.5 pt-2.5 text-[15px] lg:flex">
              <button
                type="button"
                onClick={() => engineRef.current?.prev()}
                aria-label="Photo précédente"
                className="-ml-2.5 flex h-9 w-9 items-center justify-center border-0 bg-transparent text-[#111111] transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.92]"
              >
                ←
              </button>
              <span className="min-w-[56px] text-center text-[#111111]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {pad2(enginePhotoIdx + 1)} / {pad2(n)}
              </span>
              <button
                type="button"
                onClick={() => engineRef.current?.next()}
                aria-label="Photo suivante"
                className="flex h-9 w-9 items-center justify-center border-0 bg-transparent text-[#111111] transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.92]"
              >
                →
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:pointer-events-auto lg:flex-col lg:items-end lg:gap-1">
          {catOpts.map((o) => {
            const active = (cat || null) === o.id;
            return (
              <button
                key={o.label}
                type="button"
                onClick={() => pickCat(o.id)}
                aria-pressed={active}
                className="-mx-2 min-h-11 border-0 px-2 py-1 text-[13px] tracking-[-0.01em] text-[#111111] transition-colors duration-150 ease-in-out hover:opacity-100 lg:min-h-0 lg:text-[15px]"
                style={{
                  background: active ? "#FF4F00" : "transparent",
                  opacity: active ? 1 : 0.62,
                  fontWeight: active ? 500 : 400,
                }}
              >
                {o.label}
                <sup className="ml-[3px] text-[10px] font-normal" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {o.count}
                </sup>
              </button>
            );
          })}

          <div ref={calWrapRef} className="relative">
            <button
              type="button"
              onClick={() => setCalOpen((v) => !v)}
              aria-expanded={calOpen}
              className="-mx-2 flex min-h-11 items-center gap-2 border-0 px-2 py-1 text-[13px] tracking-[-0.01em] text-[#111111] lg:min-h-0 lg:text-[15px]"
              style={{ background: date ? "#FF4F00" : "transparent", opacity: date ? 1 : 0.62, fontWeight: date ? 500 : 400 }}
            >
              <span>{date ? `Date : ${fmt(date)}` : "Date"}</span>
              <span aria-hidden="true" className="text-[10px]">▾</span>
            </button>

            {calOpen && (
              <div
                role="dialog"
                aria-label="Choisir une date"
                className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[296px] origin-top-right bg-[#fafaf9] p-5"
                style={{ border: "1px solid rgba(17,17,17,0.1)", boxShadow: "0 18px 44px rgba(17,17,17,0.1)" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => prevK && setCalKey(prevK)}
                    disabled={!prevK}
                    aria-label="Mois précédent"
                    className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-base text-[#111111]"
                    style={{ opacity: prevK ? 1 : 0.25 }}
                  >
                    ‹
                  </button>
                  <span className="text-sm font-medium">{monthTitle(curKey)}</span>
                  <button
                    type="button"
                    onClick={() => nextK && setCalKey(nextK)}
                    disabled={!nextK}
                    aria-label="Mois suivant"
                    className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-base text-[#111111]"
                    style={{ opacity: nextK ? 1 : 0.25 }}
                  >
                    ›
                  </button>
                </div>
                <div className="mb-1.5 grid grid-cols-7 gap-0.5">
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} className="text-center text-[11px] text-[#666]">
                      {w}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {cells.map((c) =>
                    c.muted ? (
                      <span key={c.key} aria-hidden="true" className="flex h-[38px] items-center justify-center text-[13px] text-[#767672]">
                        {c.label}
                      </span>
                    ) : c.sel ? (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.pick ?? undefined}
                        aria-label={c.aria}
                        aria-pressed="true"
                        className="relative flex h-[38px] items-center justify-center border-0 bg-[#111111] text-[13px] font-medium text-paper transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.94]"
                      >
                        {c.label}
                        <span aria-hidden="true" className="absolute bottom-[5px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-paper" />
                      </button>
                    ) : c.race ? (
                      <button
                        key={c.key}
                        type="button"
                        onClick={c.pick}
                        aria-label={c.aria}
                        className="relative flex h-[38px] items-center justify-center border-0 bg-transparent text-[13px] font-medium text-[#111111] transition-[background-color,transform] duration-150 ease-[cubic-bezier(.23,1,.32,1)] hover:bg-[#e9e9e5] active:scale-[0.94]"
                        style={{ boxShadow: c.isToday ? "inset 0 0 0 1px rgba(17,17,17,0.35)" : "none" }}
                      >
                        {c.label}
                        <span aria-hidden="true" className="absolute bottom-[5px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#111111]" />
                      </button>
                    ) : (
                      <span
                        key={c.key}
                        aria-label={c.aria}
                        className="flex h-[38px] items-center justify-center text-[13px] text-[#444444]"
                        style={{ boxShadow: c.isToday ? "inset 0 0 0 1px rgba(17,17,17,0.35)" : "none" }}
                      >
                        {c.label}
                      </span>
                    )
                  )}
                </div>
                {calEmpty && <p className="m-0 mt-3 text-center text-[13px] text-[#555555]">Aucune course ce mois-ci.</p>}
                <div className="mt-4 flex items-center justify-between border-t pt-3.5 text-xs text-[#666666]" style={{ borderColor: "rgba(17,17,17,0.1)" }}>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#111111]" />
                    Jour de course
                  </span>
                  <button
                    type="button"
                    onClick={() => { setDate(null); setCalOpen(false); }}
                    className="border-0 bg-transparent p-0 py-1 text-xs text-[#111111] underline underline-offset-4"
                  >
                    Effacer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {galEmpty ? (
        <div className="flex items-center justify-center px-6 py-[clamp(48px,10vh,120px)] text-center lg:absolute lg:inset-0">
          <div className="flex max-w-[38ch] flex-col items-center gap-3">
            <p className="m-0 text-xl font-medium tracking-[-0.01em]">
              {date ? "Aucune course à cette date." : "Aucune course dans cette catégorie pour le moment."}
            </p>
            <p className="m-0 text-sm leading-relaxed text-[#555555]">
              Les photos seront publiées après la prochaine course.
            </p>
            <button
              type="button"
              onClick={() => { setCat(null); setDate(null); setGRaceId(null); }}
              className="min-h-11 border-0 bg-transparent px-1 text-sm text-[#111111] underline underline-offset-[5px]"
            >
              Voir toutes les courses
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden lg:block lg:absolute lg:inset-0">
            <GalleryEngine
              ref={engineRef}
              races={filtered}
              initialGlobalIdx={initialGlobalIdx}
              onPosition={({ raceId, photoIndex }) => {
                setGRaceId(raceId);
                setEnginePhotoIdx(photoIndex);
              }}
            />
          </div>

          <div className="px-5 pb-12 pt-[clamp(40px,7vh,72px)] sm:px-10 md:px-14 lg:hidden">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
              {race?.photos.map((p, i) => <GridPhoto key={p.id} photo={p} index={i} />)}
            </div>

            <div className="ml-auto flex max-w-[760px] flex-col pt-[clamp(72px,12vh,140px)]">
              <p className="m-0 mb-[18px] text-[13px] text-[#666666]">Courses</p>
              {raceIndex.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => pickRace(r.id)}
                  aria-current={race && r.id === race.id ? "true" : undefined}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-0 border-t bg-transparent py-4 text-left text-[15px] text-[#111111]"
                  style={{ borderColor: "rgba(17,17,17,0.12)", fontWeight: race && r.id === race.id ? 500 : 400 }}
                >
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>{r.nom}</span>
                    <span className="text-[13px] font-normal text-[#666666]">
                      {CATEGORY_NAMES[r.categorie]}, {r.lieu}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-[13px] font-normal text-[#666666]" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {fmt(r.date)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
