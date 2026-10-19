"use client";

import { useState } from "react";
import { euro, fmt } from "../../lib/adminData";

const DOT = { payee: ["#111111", "none"], rembourse: ["transparent", "inset 0 0 0 1.5px #111111"] };
const STATUT_LABEL = { payee: "Payée", rembourse: "Remboursée" };

function OrderBody({ db, order, onOpenClient, onOpenOrder, onRefund, onResend, toast }) {
  const [confirming, setConfirming] = useState(false);
  const client = db.clients[order.client];
  const [dot, ring] = DOT[order.statut];

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[#555555]">Client</span>
        <button
          type="button"
          onClick={() => onOpenClient(order.client)}
          className="self-start border-0 bg-transparent p-0 text-left text-[15px] font-medium text-[#111111] underline underline-offset-4"
        >
          {client ? client.nom : "—"}
        </button>
        <dl className="m-0 grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13px]">
          <dt className="text-[#555555]">E-mail</dt>
          <dd className="m-0" style={{ overflowWrap: "anywhere" }}>{client ? client.email : "—"}</dd>
          <dt className="text-[#555555]">Statut</dt>
          <dd className="m-0 flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: dot, boxShadow: ring }} />
            {STATUT_LABEL[order.statut]}
          </dd>
          <dt className="text-[#555555]">Paiement</dt>
          <dd className="m-0">{order.paiement}</dd>
        </dl>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="mb-1.5 text-xs text-[#555555]">{order.items.length} photo{order.items.length > 1 ? "s" : ""}</span>
        {order.items.map((it, i) => (
          <div key={i} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3.5 border-t py-2.5" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
            <span className="block h-[50px] w-[72px] bg-[#e4e4e1]" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[13px] font-medium">{(db.gals.find((g) => g.id === it.gal) || {}).nom}</span>
              <span className="text-xs text-[#555555]">
                Photo {it.n} · {it.dl} téléchargement{it.dl > 1 ? "s" : ""}
              </span>
            </span>
            <span className="text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
              {euro(it.prix)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-3 text-[13px]" style={{ borderTop: "1px solid rgba(17,17,17,0.12)", fontVariantNumeric: "tabular-nums" }}>
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{euro(order.sub)}</span>
        </div>
        {order.remise > 0 && (
          <div className="flex justify-between">
            <span>Remise −20 %</span>
            <span>−{euro(order.remise)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{euro(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => {
            onResend(order.id);
            toast(`Liens de téléchargement renvoyés à ${client ? client.email : "—"}.`);
          }}
          className="min-h-11 border-0 bg-ink px-4 text-sm text-paper transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.98]"
        >
          Renvoyer les liens de téléchargement
        </button>

        {order.statut === "payee" && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-11 px-4 text-sm text-[#111111] transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.98]"
            style={{ border: "1px solid rgba(17,17,17,0.3)", background: "transparent" }}
          >
            Rembourser
          </button>
        )}

        {confirming && (
          <div role="alert" className="flex flex-col gap-2.5 bg-[#efefec] p-3.5">
            <p className="m-0 text-[13px] leading-relaxed">
              Rembourser {euro(order.total)} à {client ? client.nom : "—"} ? Les liens de téléchargement de cette commande seront désactivés.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onRefund(order.id);
                  setConfirming(false);
                  toast("Commande remboursée.");
                }}
                className="min-h-10 border-0 bg-ink px-3.5 text-[13px] font-medium text-paper"
              >
                Confirmer le remboursement
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="min-h-10 px-3.5 text-[13px] text-[#111111]"
                style={{ border: "1px solid rgba(17,17,17,0.24)", background: "transparent" }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {order.statut === "rembourse" && (
          <p className="m-0 text-[13px] text-[#444444]">Commande remboursée. Les liens de téléchargement sont désactivés.</p>
        )}
      </div>
    </>
  );
}

function ClientBody({ db, clientIdx, onOpenOrder }) {
  const client = db.clients[clientIdx];
  const orders = db.orders.filter((o) => o.client === clientIdx);
  const total = orders.filter((o) => o.statut !== "rembourse").reduce((a, o) => a + o.total, 0);
  const photos = orders.reduce((a, o) => a + o.items.length, 0);
  const gals = db.gals.filter((g) => g.vis === "privee" && g.client === clientIdx);

  return (
    <>
      <dl className="m-0 grid grid-cols-[110px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13px]">
        <dt className="text-[#555555]">E-mail</dt>
        <dd className="m-0" style={{ overflowWrap: "anywhere" }}>{client.email}</dd>
        <dt className="text-[#555555]">Téléphone</dt>
        <dd className="m-0">{client.tel}</dd>
        <dt className="text-[#555555]">Inscription</dt>
        <dd className="m-0">{fmt(client.inscrit)}</dd>
      </dl>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1 bg-[#efefec] p-3">
          <span className="text-[11px] text-[#555555]">Commandes</span>
          <span className="text-lg font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
            {orders.length}
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-[#efefec] p-3">
          <span className="text-[11px] text-[#555555]">Total dépensé</span>
          <span className="text-lg font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
            {euro(total)}
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-[#efefec] p-3">
          <span className="text-[11px] text-[#555555]">Photos</span>
          <span className="text-lg font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
            {photos}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="mb-2 text-xs text-[#555555]">Historique des commandes</span>
        {orders.map((o) => {
          const [dot, ring] = DOT[o.statut];
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onOpenOrder(o.id)}
              className="grid min-h-[50px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3.5 border-0 border-t bg-transparent py-2 text-left transition-colors duration-150 hover:bg-[#efefec]"
              style={{ borderColor: "rgba(17,17,17,0.08)" }}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {o.id}
                </span>
                <span className="text-xs text-[#555555]">
                  {fmt(o.date)} · {o.items.length} photo{o.items.length > 1 ? "s" : ""}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-xs">
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: dot, boxShadow: ring }} />
                {STATUT_LABEL[o.statut]}
              </span>
              <span className="min-w-[64px] text-right text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {euro(o.total)}
              </span>
            </button>
          );
        })}
        {orders.length === 0 && <p className="m-0 text-[13px] text-[#444444]">Aucune commande.</p>}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-[#555555]">Galeries privées</span>
        {gals.map((g) => (
          <div key={g.id} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 border-t py-2" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
            <span className="block h-11 w-16 bg-[#e4e4e1]" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[13px] font-medium">{g.nom}</span>
              <span className="truncate text-xs text-[#555555]">theo-photographe.fr/galerie-privee/{g.token}</span>
            </span>
          </div>
        ))}
        {gals.length === 0 && <p className="m-0 text-[13px] text-[#444444]">Aucune galerie privée.</p>}
      </div>
    </>
  );
}

export default function Drawer({ db, drawer, onClose, onOpenOrder, onOpenClient, onRefund, onResend, toast }) {
  if (!drawer) return null;
  const isOrder = drawer.type === "order";
  const order = isOrder ? db.orders.find((o) => o.id === drawer.id) : null;
  const title = isOrder ? order?.id : db.clients[drawer.id]?.nom;
  const sub = isOrder ? (order ? fmt(order.date) : "") : "Client";

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0" style={{ background: "rgba(10,10,10,0.35)" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-[#fbfbfa]"
        style={{ boxShadow: "-24px 0 60px -30px rgba(0,0,0,0.35)" }}
      >
        <div className="flex flex-none items-center justify-between gap-3 py-2.5 pl-6 pr-2.5" style={{ borderBottom: "1px solid rgba(17,17,17,0.1)" }}>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-base font-medium">{title}</span>
            <span className="text-xs text-[#555555]">{sub}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-11 w-11 flex-none items-center justify-center border-0 bg-transparent text-2xl font-light leading-none text-[#111111] transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-90"
          >
            ×
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-6 py-5.5">
          {isOrder && order && (
            <OrderBody db={db} order={order} onOpenClient={onOpenClient} onOpenOrder={onOpenOrder} onRefund={onRefund} onResend={onResend} toast={toast} />
          )}
          {!isOrder && db.clients[drawer.id] && <ClientBody db={db} clientIdx={drawer.id} onOpenOrder={onOpenOrder} />}
        </div>
      </div>
    </div>
  );
}
