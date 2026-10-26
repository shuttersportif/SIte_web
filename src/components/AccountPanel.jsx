"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faApple } from "@fortawesome/free-brands-svg-icons";
import { createClient } from "../lib/supabase/browserClient";

const MODAL_EASING = "cubic-bezier(.23,1,.32,1)";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TABS = [
  ["login", "Se connecter"],
  ["signup", "Créer un compte"],
];

function Field({ name, label, type = "text", value, onChange, error, focus, setFocus, autoComplete }) {
  const focused = focus === name;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[13px] font-medium text-[#111111]">
        {label}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(name)}
        onBlur={() => setFocus(null)}
        autoComplete={autoComplete}
        className="block w-full bg-transparent px-3 py-3 text-[15px] text-[#111111] outline-none"
        style={{
          borderBottom: focused ? "2px solid #FF4F00" : "1px solid rgba(17,17,17,0.25)",
          boxShadow: focused ? "inset 0 0 0 1.5px #111111" : "none",
        }}
      />
      {error && <span className="text-xs font-medium text-[#c0392b]">{error}</span>}
    </div>
  );
}

function LoginForm({ onSubmitted }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [focus, setFocus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onField = (name) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = "Indiquez une adresse e-mail valide.";
    if (!form.password) nextErrors.password = "Indiquez votre mot de passe.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setSubmitting(false);
    if (error) {
      setErrors({ password: "E-mail ou mot de passe incorrect." });
      return;
    }
    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={onField("email")}
        error={errors.email}
        focus={focus}
        setFocus={setFocus}
      />
      <div className="flex flex-col gap-2">
        <Field
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={onField("password")}
          error={errors.password}
          focus={focus}
          setFocus={setFocus}
        />
        <button
          type="button"
          className="self-end border-0 bg-transparent p-0 text-xs text-[#111111] underline decoration-black/40 underline-offset-4"
        >
          Mot de passe oublié ?
        </button>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex w-full items-center justify-center bg-accent px-6 py-3.5 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.985] disabled:opacity-60"
      >
        {submitting ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

function PasswordStrength({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1 flex-1"
            style={{ background: i < score ? "var(--accent)" : "rgba(17,17,17,0.12)" }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: "rgba(17,17,17,0.5)" }}>
        Solidité : 8 caractères minimum
      </span>
    </div>
  );
}

function SignupForm({ onSubmitted }) {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [focus, setFocus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onField = (name) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.prenom.trim()) nextErrors.prenom = "Indiquez votre prénom.";
    if (!form.nom.trim()) nextErrors.nom = "Indiquez votre nom.";
    if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = "Indiquez une adresse e-mail valide.";
    if (form.password.length < 8) nextErrors.password = "Au moins 8 caractères.";
    if (!consent) nextErrors.consent = "Vous devez accepter pour créer un compte.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const supabase = createClient();
    const fullName = `${form.prenom.trim()} ${form.nom.trim()}`.trim();
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: fullName, first_name: form.prenom.trim(), last_name: form.nom.trim() } },
    });
    setSubmitting(false);
    if (error) {
      setErrors({ email: error.message === "User already registered" ? "Cet e-mail est déjà utilisé." : error.message });
      return;
    }
    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field
          name="prenom"
          label="Prénom"
          autoComplete="given-name"
          value={form.prenom}
          onChange={onField("prenom")}
          error={errors.prenom}
          focus={focus}
          setFocus={setFocus}
        />
        <Field
          name="nom"
          label="Nom"
          autoComplete="family-name"
          value={form.nom}
          onChange={onField("nom")}
          error={errors.nom}
          focus={focus}
          setFocus={setFocus}
        />
      </div>
      <Field
        name="email"
        label="E-mail"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={onField("email")}
        error={errors.email}
        focus={focus}
        setFocus={setFocus}
      />
      <div className="flex flex-col gap-2">
        <Field
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={onField("password")}
          error={errors.password}
          focus={focus}
          setFocus={setFocus}
        />
        <PasswordStrength password={form.password} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-[#444444]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setErrors((er) => ({ ...er, consent: null }));
            }}
            className="mt-0.5 h-4 w-4 flex-none accent-[color:var(--accent)]"
          />
          J&rsquo;accepte que mes données soient utilisées pour gérer mon compte et mes achats, conformément à la{" "}
          <a
            href="/confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-black/40 underline-offset-2"
          >
            politique de confidentialité
          </a>
          .
        </label>
        {errors.consent && <span className="text-xs font-medium text-[#c0392b]">{errors.consent}</span>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex w-full items-center justify-center bg-accent px-6 py-3.5 text-sm font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.985] disabled:opacity-60"
      >
        {submitting ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs" style={{ color: "rgba(17,17,17,0.45)" }}>
      <span className="h-px flex-1" style={{ background: "rgba(17,17,17,0.15)" }} />
      ou
      <span className="h-px flex-1" style={{ background: "rgba(17,17,17,0.15)" }} />
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 border bg-transparent px-6 py-3.5 text-sm font-medium text-[#111111] transition-colors duration-150 hover:bg-black/5"
        style={{ borderColor: "rgba(17,17,17,0.2)" }}
      >
        <FontAwesomeIcon icon={faGoogle} />
        Continuer avec Google
      </button>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 border-0 bg-black px-6 py-3.5 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
      >
        <FontAwesomeIcon icon={faApple} />
        Continuer avec Apple
      </button>
    </div>
  );
}

// pop-up centrée au milieu de l'écran (fondu + léger zoom à l'ouverture),
// comme les autres dialogs de la maquette de référence
export default function AccountPanel({ open, onClose }) {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const bgRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (bgRef.current) {
      if (reduce) bgRef.current.style.opacity = "1";
      else bgRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });
    }
    if (panelRef.current) {
      if (reduce) {
        panelRef.current.style.opacity = "1";
        panelRef.current.style.transform = "none";
      } else
        panelRef.current.animate(
          [
            { opacity: 0, transform: "scale(0.96) translateY(8px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 260, easing: MODAL_EASING, fill: "forwards" }
        );
    }
    closeBtnRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = (key) => setMode(key);

  const goToAccount = () => {
    onClose();
    router.push("/mon-espace");
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-5">
      <div
        ref={bgRef}
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(10,10,10,0.5)]"
        style={{ opacity: 0 }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Se connecter" : "Créer un compte"}
        className="relative flex max-h-[90svh] w-full max-w-[400px] flex-col bg-paper text-[#111111]"
        style={{ opacity: 0 }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center border-0 bg-transparent text-[22px] text-[#111111] transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-90"
        >
          ✕
        </button>

        <div className="flex flex-none gap-7 px-7 pb-1 pt-7" style={{ borderBottom: "1px solid rgba(17,17,17,0.12)" }}>
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchMode(key)}
              className="pb-3 text-[15px] font-medium transition-colors duration-150"
              style={{
                color: mode === key ? "#111111" : "rgba(17,17,17,0.4)",
                borderBottom: mode === key ? "2px solid #FF4F00" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-7">
          {mode === "login" ? (
            <LoginForm key="login" onSubmitted={goToAccount} />
          ) : (
            <SignupForm key="signup" onSubmitted={goToAccount} />
          )}
          <Divider />
          <SocialButtons />
        </div>
      </div>
    </div>
  );
}
