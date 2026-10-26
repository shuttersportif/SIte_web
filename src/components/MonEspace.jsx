"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSupabaseUser } from "../lib/useSupabaseUser";
import { createClient } from "../lib/supabase/browserClient";

const TABS = [
  ["dl", "Mes téléchargements"],
  ["cmd", "Mes commandes"],
  ["gal", "Mes galeries privées"],
  ["info", "Mes informations"],
];

const STATUT_LABEL = { en_attente: "En attente", payee: "Payée", rembourse: "Remboursée" };

const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : "");

function flattenDownloads(orders) {
  const out = [];
  orders
    .filter((o) => o.statut === "payee")
    .forEach((o) => {
      (o.order_items || []).forEach((it) => {
        out.push({
          key: it.id,
          galNom: it.photos?.galleries?.nom || "",
          n: it.photos?.numero,
          src: it.photos?.src,
          date: o.created_at,
          restants: it.telechargements_restants,
        });
      });
    });
  return out;
}

function Downloads({ orders, onDownload, downloading }) {
  const downloads = flattenDownloads(orders);
  if (!downloads.length) {
    return <p className="m-0 text-sm text-[#555555]">Aucune photo achetée pour l&rsquo;instant.</p>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4">
      {downloads.map((d) => (
        <article key={d.key} className="flex flex-col bg-[#fbfbfa]" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e4e4e1]">
            <div className="absolute inset-0 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${d.src})` }} />
          </div>
          <div className="flex flex-col gap-2 p-3.5">
            <span className="truncate text-[13px] font-medium">{d.galNom}</span>
            <span className="text-xs text-[#555555]">
              Photo {d.n} · {fmtDate(d.date)}
            </span>
            <button
              type="button"
              disabled={d.restants <= 0 || downloading === d.key}
              onClick={() => onDownload(d.key)}
              className="mt-1 min-h-9 border-0 bg-accent px-3 text-xs font-medium text-black disabled:cursor-default disabled:bg-[rgba(17,17,17,0.12)] disabled:text-[rgba(17,17,17,0.4)]"
            >
              {d.restants > 0
                ? downloading === d.key
                  ? "Téléchargement…"
                  : `Télécharger (${d.restants} restant${d.restants > 1 ? "s" : ""})`
                : "Téléchargements épuisés"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Orders({ orders }) {
  if (!orders.length) {
    return <p className="m-0 text-sm text-[#555555]">Vous n&rsquo;avez pas encore passé de commande.</p>;
  }
  return (
    <section className="min-w-0 bg-[#fbfbfa] px-5 py-1 pb-3" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div
            className="grid grid-cols-[minmax(130px,1.1fr)_100px_70px_100px_120px] gap-4 border-b py-3 text-xs text-[#555555]"
            style={{ borderColor: "rgba(17,17,17,0.1)" }}
          >
            <span>N° de commande</span>
            <span>Date</span>
            <span className="text-right">Photos</span>
            <span className="text-right">Total</span>
            <span>Statut</span>
          </div>
          {orders.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[minmax(130px,1.1fr)_100px_70px_100px_120px] items-center gap-4 border-b py-3"
              style={{ borderColor: "rgba(17,17,17,0.07)", minHeight: 50 }}
            >
              <span className="font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                {o.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[#333333]">{fmtDate(o.created_at)}</span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {(o.order_items || []).length}
              </span>
              <span className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                {euro(o.total)}
              </span>
              <span className="text-[13px]">{STATUT_LABEL[o.statut] || o.statut}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrivateGalleries({ galleries }) {
  if (!galleries.length) {
    return <p className="m-0 text-sm text-[#555555]">Aucune galerie privée ne vous a été partagée.</p>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
      {galleries.map((g) => (
        <article key={g.id} className="flex flex-col bg-[#fbfbfa]" style={{ border: "1px solid rgba(17,17,17,0.08)" }}>
          <div className="relative aspect-[3/2] overflow-hidden bg-[#e4e4e1]">
            <div className="absolute inset-0 bg-cover bg-center grayscale" style={{ backgroundImage: `url(${g.photos?.[0]?.src})` }} />
          </div>
          <div className="flex flex-col gap-1.5 p-4">
            <h2 className="m-0 text-[15px] font-medium leading-tight">{g.nom}</h2>
            <span className="text-xs text-[#555555]">
              {fmtDate(g.date)} · {g.categorie}
            </span>
            <a
              href={`/galerie-privee/${g.token}`}
              className="mt-2 inline-flex min-h-9 items-center justify-center bg-ink px-3 text-xs text-paper"
            >
              Ouvrir la galerie
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] text-[#444444]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 border-b bg-transparent py-2 text-[15px] text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
        style={{ borderColor: "rgba(17,17,17,0.3)" }}
      />
    </label>
  );
}

function Infos({ profile, toast, onSaved }) {
  const [draft, setDraft] = useState({
    prenom: profile.first_name || "",
    nom: profile.last_name || "",
    email: profile.email || "",
    tel: profile.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ first_name: draft.prenom, last_name: draft.nom, phone: draft.tel })
      .eq("id", profile.id);

    let emailChanged = false;
    let emailError = null;
    if (draft.email.trim() !== profile.email) {
      emailChanged = true;
      const { error } = await supabase.auth.updateUser({ email: draft.email.trim() });
      emailError = error;
      if (!error) await supabase.from("profiles").update({ email: draft.email.trim() }).eq("id", profile.id);
    }

    setSaving(false);
    if (profileError || emailError) {
      toast("Une erreur est survenue, réessayez.");
      return;
    }
    onSaved({ ...profile, first_name: draft.prenom, last_name: draft.nom, phone: draft.tel, email: draft.email.trim() });
    toast(
      emailChanged
        ? "Informations enregistrées. Vérifiez votre boîte mail pour confirmer le nouvel e-mail."
        : "Informations enregistrées."
    );
  };

  return (
    <form onSubmit={save} className="flex max-w-[420px] flex-col gap-5">
      <Field label="Prénom" value={draft.prenom} onChange={(v) => setDraft((d) => ({ ...d, prenom: v }))} />
      <Field label="Nom" value={draft.nom} onChange={(v) => setDraft((d) => ({ ...d, nom: v }))} />
      <Field label="E-mail" type="email" value={draft.email} onChange={(v) => setDraft((d) => ({ ...d, email: v }))} />
      <Field label="Téléphone" value={draft.tel} onChange={(v) => setDraft((d) => ({ ...d, tel: v }))} />
      <button
        type="submit"
        disabled={saving}
        className="min-h-11 self-start border-0 bg-accent px-5 text-sm font-medium text-black disabled:opacity-60"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

const TAB_KEYS = TABS.map(([key]) => key);
const ORDER_ITEMS_SELECT =
  "id, statut, sous_total, remise, total, created_at, order_items(id, qty, prix, telechargements_max, telechargements_restants, photos(id, src, numero, galleries(nom)))";

export default function MonEspace() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const { user, ready } = useSupabaseUser();
  const [tab, setTab] = useState(TAB_KEYS.includes(requestedTab) ? requestedTab : "dl");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => setToastMsg(null), 2600);
  };

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const [{ data: profileRow }, { data: orderRows }, { data: galleryRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("orders").select(ORDER_ITEMS_SELECT).order("created_at", { ascending: false }),
        supabase.from("galleries").select("id, nom, categorie, date, token, photos(src)").eq("visibilite", "privee"),
      ]);
      if (cancelled) return;
      setProfile(profileRow || { id: user.id, email: user.email, first_name: "", last_name: "", phone: "" });
      setOrders(orderRows || []);
      setGalleries(galleryRows || []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  const handleDownload = async (orderItemId) => {
    setDownloading(orderItemId);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("consume_download", { p_order_item_id: orderItemId });
    setDownloading(null);
    if (error) {
      toast("Ce téléchargement n'est pas disponible.");
      return;
    }
    const result = Array.isArray(data) ? data[0] : data;
    if (result?.src) {
      const a = document.createElement("a");
      a.href = result.src;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setOrders((prev) =>
      prev.map((o) => ({
        ...o,
        order_items: (o.order_items || []).map((it) =>
          it.id === orderItemId ? { ...it, telechargements_restants: result?.restants ?? it.telechargements_restants } : it
        ),
      }))
    );
  };

  if (!ready || loading || !profile) {
    return <div className="min-h-dvh bg-paper px-5 pb-20 pt-28 text-[#111111] sm:px-10 md:px-14" />;
  }

  return (
    <div className="min-h-dvh bg-paper px-5 pb-20 pt-28 text-[#111111] sm:px-10 md:px-14">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="m-0 text-[clamp(28px,3.4vw,44px)] font-medium leading-[1.05] tracking-[-0.03em]">Mon espace</h1>
        <span aria-hidden="true" className="mt-4 block h-[3px] w-16 bg-accent" />

        <div className="mt-8 grid items-start gap-7 sm:mt-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-14">
          <nav
            aria-label="Mon espace"
            className="flex gap-6 overflow-x-auto border-b md:sticky md:top-[88px] md:flex-col md:gap-0.5 md:overflow-visible md:border-0"
            style={{ borderColor: "rgba(17,17,17,0.12)", scrollbarWidth: "none" }}
          >
            {TABS.map(([key, label]) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={active ? "page" : undefined}
                  className="flex-none whitespace-nowrap py-3 text-left text-[14px] md:min-h-10 md:py-2"
                  style={{
                    color: active ? "#111111" : "rgba(17,17,17,0.55)",
                    fontWeight: active ? 500 : 400,
                    borderBottom: active ? "2px solid #FF4F00" : "2px solid transparent",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">
            {tab === "dl" && <Downloads orders={orders} onDownload={handleDownload} downloading={downloading} />}
            {tab === "cmd" && <Orders orders={orders} />}
            {tab === "gal" && <PrivateGalleries galleries={galleries} />}
            {tab === "info" && <Infos profile={profile} toast={toast} onSaved={setProfile} />}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] bg-ink px-4 py-3 text-sm text-paper"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
