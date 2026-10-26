"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import NavLink from "./NavLink";
import { useCart } from "../lib/cartStore";
import { useSupabaseUser } from "../lib/useSupabaseUser";
import { createClient } from "../lib/supabase/browserClient";

const DRAWER_EASING = "cubic-bezier(.32,.72,0,1)";

const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

function QtyStepper({ qty, onDec, onInc }) {
  return (
    <div className="flex items-center border" style={{ borderColor: "rgba(17,17,17,0.2)" }}>
      <button
        type="button"
        onClick={onDec}
        disabled={qty <= 1}
        aria-label="Un exemplaire de moins"
        className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-lg text-[#111111] disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-7 text-center text-[15px] text-[#111111]" style={{ fontVariantNumeric: "tabular-nums" }}>
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={qty >= 20}
        aria-label="Un exemplaire de plus"
        className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-lg text-[#111111] disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

// même tiroir que la boutique dans la maquette de référence : glisse depuis
// la droite en desktop, depuis le bas en mobile
export default function CartPanel({ open, onClose, onNeedAccount }) {
  const { lines, setQty, removeFromCart, clearCart } = useCart();
  const { user } = useSupabaseUser();
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [ordered, setOrdered] = useState(false);
  const bgRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  // réinitialise l'état de confirmation/erreur à la fermeture, quel que
  // soit le déclencheur (fond, croix, Échap, bouton "Fermer")
  const handleClose = () => {
    setOrdered(false);
    setOrderError(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.innerWidth < 860;

    if (bgRef.current) {
      if (reduce) bgRef.current.style.opacity = "1";
      else bgRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });
    }
    if (panelRef.current) {
      if (reduce) panelRef.current.style.transform = "none";
      else
        panelRef.current.animate(
          [{ transform: narrow ? "translateY(100%)" : "translateX(100%)" }, { transform: "none" }],
          { duration: 340, easing: DRAWER_EASING, fill: "forwards" }
        );
    }
    closeBtnRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const dec = (key, qty) => setQty(key, qty - 1);
  const inc = (key, qty) => setQty(key, qty + 1);
  const remove = (key) => removeFromCart(key);

  const handleOrder = async () => {
    if (!user) {
      handleClose();
      onNeedAccount?.();
      return;
    }
    setOrderError(null);
    setOrdering(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("create_order", {
      p_items: lines.map((l) => ({ photo_id: l.photoId, qty: l.qty })),
    });
    setOrdering(false);
    if (error) {
      setOrderError("La commande n'a pas pu être envoyée. Réessayez dans un instant.");
      return;
    }
    clearCart();
    setOrdered(true);
  };

  const cartCount = lines.reduce((n, l) => n + l.qty, 0);
  const cartTotal = lines.reduce((n, l) => n + l.qty * l.prix, 0);

  return (
    <div className="fixed inset-0 z-[55]">
      <div
        ref={bgRef}
        onClick={handleClose}
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(10,10,10,0.5)]"
        style={{ opacity: 0 }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Panier (${cartCount})`}
        className="absolute inset-x-0 bottom-0 flex max-h-[90svh] flex-col bg-paper text-[#111111] md:inset-x-auto md:right-0 md:top-0 md:max-h-none md:w-[min(400px,100vw)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className="flex flex-none items-center justify-between gap-3 border-b py-1.5 pl-5 pr-1.5"
          style={{ borderColor: "rgba(17,17,17,0.12)" }}
        >
          <span className="text-base font-medium">Panier ({cartCount})</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Fermer"
            className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-lg text-[#111111] transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-90"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {ordered ? (
            <div className="flex flex-col items-start gap-4 py-4">
              <p className="m-0 text-lg font-medium">Commande envoyée !</p>
              <p className="m-0 text-sm leading-relaxed" style={{ color: "#555" }}>
                Théo vous confirme par e-mail la disponibilité, le délai et le paiement.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-1 inline-flex items-center gap-3 bg-accent px-6 py-4 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
              >
                Fermer
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-4">
              <p className="m-0 text-lg font-medium">Votre panier est vide.</p>
              <p className="m-0 text-sm leading-relaxed" style={{ color: "#555" }}>
                Ouvrez une photo dans la galerie et ajoutez-la au panier.
              </p>
              <NavLink
                href="/galerie"
                onClick={handleClose}
                className="mt-1 inline-flex items-center gap-3 bg-accent px-6 py-4 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
              >
                Voir la galerie <span aria-hidden="true">→</span>
              </NavLink>
            </div>
          ) : (
            lines.map((l) => (
              <div
                key={l.key}
                className="grid grid-cols-[64px_minmax(0,1fr)] gap-3.5 border-b py-3.5"
                style={{ borderColor: "rgba(17,17,17,0.1)" }}
              >
                <div
                  className="h-16 w-16 bg-cover bg-center grayscale"
                  style={{ background: "#e7e7e4", backgroundImage: l.src ? `url(${l.src})` : undefined }}
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 text-[15px] font-medium" style={{ overflowWrap: "anywhere" }}>
                      {l.titre}
                    </span>
                    <span className="flex-none text-[15px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {euro(l.qty * l.prix)}
                    </span>
                  </div>
                  <span className="text-[13px]" style={{ color: "#555" }}>
                    Photo numérique, {euro(l.prix)} l&rsquo;unité
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <QtyStepper qty={l.qty} onDec={() => dec(l.key, l.qty)} onInc={() => inc(l.key, l.qty)} />
                    <button
                      type="button"
                      onClick={() => remove(l.key)}
                      className="min-h-11 border-0 bg-transparent px-1 text-[13px] text-[#444444] underline decoration-black/40 underline-offset-4"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div
            className="flex flex-none flex-col gap-3 border-t px-5 py-4"
            style={{ borderColor: "rgba(17,17,17,0.12)" }}
          >
            <div className="flex justify-between gap-3 text-[15px]">
              <span>Total</span>
              <span className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                {euro(cartTotal)}
              </span>
            </div>
            {orderError && <p className="m-0 text-xs font-medium text-[#c0392b]">{orderError}</p>}
            <button
              type="button"
              onClick={handleOrder}
              disabled={ordering}
              className="flex min-h-[52px] w-full items-center justify-center gap-3 border-0 bg-accent text-[15px] font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.985] disabled:opacity-60"
            >
              {ordering ? "Envoi…" : "Commander"} {!ordering && <span aria-hidden="true">→</span>}
            </button>
            <p className="m-0 text-xs leading-relaxed" style={{ color: "#555" }}>
              La commande est finalisée par e-mail : Théo vous confirme la disponibilité, le délai et le paiement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
