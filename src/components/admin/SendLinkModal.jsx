"use client";

import { useState } from "react";
import ModalShell from "./ModalShell";

export default function SendLinkModal({ db, galId, onClose, onSend }) {
  const gal = db.gals.find((g) => g.id === galId);
  const [client, setClient] = useState("");
  const [msg, setMsg] = useState(
    `Bonjour,\n\nVoici le lien privé de vos photos${gal ? ` de « ${gal.nom} »` : ""}. Vous pouvez les consulter et les commander directement en ligne.\n\nÀ bientôt,\nThéo`
  );
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!client) {
      setErr("Choisissez un client.");
      return;
    }
    onSend({ galId, clientIdx: Number(client), msg });
  };

  return (
    <ModalShell title="Envoyer le lien" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5.5">
        <p className="m-0 text-[13px] leading-relaxed text-[#444444]">
          Galerie : <span className="font-medium text-[#111111]">{gal?.nom}</span>
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#444444]">Client</span>
          <select
            value={client}
            onChange={(e) => {
              setClient(e.target.value);
              setErr("");
            }}
            className="min-h-[42px] px-2.5 text-sm text-[#111111]"
            style={{ border: "1px solid rgba(17,17,17,0.2)", background: "#fbfbfa" }}
          >
            <option value="">Sélectionner…</option>
            {db.clients.map((c) => (
              <option key={c.i} value={c.i}>
                {c.nom} · {c.email}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#444444]">Message</span>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={7}
            className="px-3 py-2.5 text-sm leading-relaxed text-[#111111] outline-none focus:border-[#111111]"
            style={{ border: "1px solid rgba(17,17,17,0.2)", background: "#fbfbfa", resize: "vertical" }}
          />
        </label>
        {err && (
          <p role="alert" className="m-0 text-[13px] font-medium">
            {err}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4.5 text-sm text-[#111111]"
            style={{ border: "1px solid rgba(17,17,17,0.2)", background: "transparent" }}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="min-h-11 border-0 bg-accent px-5 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.97]"
          >
            Envoyer le lien
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
