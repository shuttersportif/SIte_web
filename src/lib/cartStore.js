"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theo-cart-v1";
const listeners = new Set();

function readStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let items = readStorage();

function writeStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((cb) => cb(items));
}

export function addToCart({ photoId, galleryId, src, titre, prix }) {
  const existing = items.find((l) => l.photoId === photoId);
  if (existing) {
    existing.qty = Math.min(20, existing.qty + 1);
  } else {
    items = [...items, { key: photoId, photoId, galleryId, src, titre, prix, qty: 1 }];
  }
  items = [...items];
  writeStorage();
}

export function setQty(photoId, qty) {
  items = items.map((l) => (l.photoId === photoId ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l));
  writeStorage();
}

export function removeFromCart(photoId) {
  items = items.filter((l) => l.photoId !== photoId);
  writeStorage();
}

export function clearCart() {
  items = [];
  writeStorage();
}

export function getCartItems() {
  return items;
}

export function useCart() {
  const [lines, setLines] = useState(items);

  useEffect(() => {
    const onChange = (next) => setLines(next);
    listeners.add(onChange);
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        items = readStorage();
        setLines(items);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    total: lines.reduce((n, l) => n + l.qty * l.prix, 0),
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
  };
}
