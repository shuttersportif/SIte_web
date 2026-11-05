"use client";

import { useEffect, useState } from "react";
import { unlockPrivateGallery } from "../app/admin/galleriesActions";
import { addToCart } from "../lib/cartStore";
import { CATEGORY_NAMES, fmt } from "../lib/galleryData";

const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

function sessionKey(token) {
  return `theo-private-gallery-${token}`;
}

function PinForm({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setErr("Le code PIN comporte 4 chiffres.");
      return;
    }
    setErr("");
    setSubmitting(true);
    const result = await onUnlock(pin);
    setSubmitting(false);
    if (!result.ok) setErr(result.message);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-5 text-[#111111]">
      <form onSubmit={submit} noValidate className="flex w-full max-w-[340px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[15px] font-medium">Théo</span>
          <h1 className="m-0 text-[26px] font-medium tracking-[-0.02em]">Galerie privée</h1>
          <span aria-hidden="true" className="mt-2.5 block h-[3px] w-12 bg-accent" />
          <p className="m-0 mt-2 text-sm text-[#555555]">Entrez le code PIN à 4 chiffres transmis par Théo.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#444444]">Code PIN</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
              setErr("");
            }}
            className="border-0 border-b bg-transparent py-2.5 text-center text-2xl tracking-[0.4em] text-[#111111] outline-none focus:border-accent"
            style={{ borderColor: "rgba(17,17,17,0.32)" }}
          />
        </label>

        {err && (
          <p role="alert" className="m-0 -mt-2 text-[13px] font-medium">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="min-h-[50px] cursor-pointer border-0 bg-accent text-[15px] font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? "Vérification…" : "Accéder à la galerie"}
        </button>
      </form>
    </div>
  );
}

function PhotoCard({ photo, index, galleryId, titre }) {
  return (
    <figure className="group relative m-0 overflow-hidden bg-[#e7e7e4]">
      <div className="aspect-[4/3] w-full bg-cover bg-center" style={{ backgroundImage: `url(${photo.src})` }} />
      <span
        className="pointer-events-none absolute bottom-3 right-3.5 select-none text-[11px] tracking-wide text-white/80"
        style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
      >
        © Théo
      </span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2.5">
        <span className="text-[13px] font-medium text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
          {euro(photo.prix)}
        </span>
        <button
          type="button"
          onClick={() => addToCart({ photoId: photo.id, galleryId, src: photo.src, titre, prix: photo.prix })}
          className="pointer-events-auto inline-flex min-h-9 cursor-pointer items-center bg-accent px-3 text-[12px] font-medium text-black"
        >
          Ajouter au panier
        </button>
      </div>
    </figure>
  );
}

export default function PrivateGallery({ token }) {
  // undefined tant qu'on n'a pas vérifié le sessionStorage côté client (le
  // rendu serveur n'y a pas accès) : évite un flash du formulaire PIN pour
  // un visiteur déjà déverrouillé plus tôt dans la session
  const [gallery, setGallery] = useState(undefined);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(sessionKey(token));
      if (cached) {
        setGallery(JSON.parse(cached));
        return;
      }
    } catch {
      /* ignore */
    }
    setGallery(null);
  }, [token]);

  const handleUnlock = async (pin) => {
    const result = await unlockPrivateGallery(token, pin);
    if (result.ok) {
      setGallery(result.gallery);
      try {
        sessionStorage.setItem(sessionKey(token), JSON.stringify(result.gallery));
      } catch {
        /* ignore */
      }
    }
    return result;
  };

  if (gallery === undefined) return <div className="min-h-dvh bg-paper" />;
  if (gallery === null) return <PinForm onUnlock={handleUnlock} />;

  return (
    <div className="min-h-dvh bg-paper px-5 pb-20 pt-28 text-[#111111] sm:px-10 md:px-14">
      <div className="mx-auto max-w-[1200px]">
        <p className="m-0 text-[13px] text-[#666]">{CATEGORY_NAMES[gallery.categorie] || gallery.categorie}</p>
        <h1 className="m-0 text-[clamp(26px,2.8vw,40px)] font-medium leading-[1.08] tracking-[-0.03em]">{gallery.nom}</h1>
        <span aria-hidden="true" className="my-3 block h-[3px] w-16 bg-accent" />
        <p className="m-0 text-sm text-[#666]">
          {gallery.lieu}, {fmt(gallery.date)}
        </p>

        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
          {gallery.photos.map((p, i) => (
            <PhotoCard key={p.id} photo={p} index={i} galleryId={gallery.id} titre={`${gallery.nom} — photo ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
