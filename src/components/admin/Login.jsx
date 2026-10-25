"use client";

import { useState, useTransition } from "react";
import { login } from "../../app/admin/authActions";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("theo@theo-photographe.fr");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !pw.trim()) {
      setErr("Indiquez un e-mail et un mot de passe.");
      return;
    }
    setErr("");
    startTransition(async () => {
      const res = await login({ email: email.trim(), password: pw });
      if (res.ok) {
        onLogin(email.trim());
      } else {
        setErr(res.message);
      }
    });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-5 py-10 text-[#111111]">
      <form onSubmit={submit} noValidate className="flex w-full max-w-[360px] flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[15px] font-medium">Théo</span>
          <h1 className="m-0 text-[28px] font-medium tracking-[-0.02em]">Administration</h1>
          <span aria-hidden="true" className="mt-2.5 block h-[3px] w-12 bg-accent" />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#444444]">E-mail</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErr("");
            }}
            className="border-0 border-b bg-transparent py-2.5 text-base text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
            style={{ borderColor: "rgba(17,17,17,0.32)" }}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#444444]">Mot de passe</span>
          <input
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr("");
            }}
            className="border-0 border-b bg-transparent py-2.5 text-base text-[#111111] outline-none focus:border-accent focus:shadow-[0_1px_0_#FF4F00]"
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
          disabled={isPending}
          className="min-h-[50px] border-0 bg-accent text-[15px] font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
