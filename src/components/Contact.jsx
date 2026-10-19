"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import DrawBar from "./DrawBar";

const LIENS = {
  email: "contact@theo-photographe.fr",
  telephone: "06 00 00 00 00",
  telHref: "0600000000",
  instagram: "https://www.instagram.com/",
};

const FIELDS = [
  { name: "nom", label: "Nom", type: "text", autoComplete: "name" },
  { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
  { name: "tel", label: "Téléphone", type: "tel", autoComplete: "tel" },
];

const EMPTY_FORM = { nom: "", email: "", tel: "", message: "", interests: [] };

const CONTACT_DEFAULTS = {
  hookLine1: "Parlons de votre",
  hookLine2: "prochaine course.",
  responseNote: "Réponse sous 48 h",
  formTitle: "Votre projet",
  interestsLabel: "Je suis intéressé par",
  interests: ["Couverture de course", "Équipe / pilote", "Organisateur", "Tirage", "Autre"],
  sentTitle: "Merci, votre message est bien parti.",
  sentNote: "Je vous réponds sous 48 h à l'adresse indiquée.",
};

export default function Contact({ content }) {
  const c = { ...CONTACT_DEFAULTS, ...content };
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [focus, setFocus] = useState(null);
  const [emailHover, setEmailHover] = useState(false);
  const [sent, setSent] = useState(false);

  const onField = (name) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: null }));
  };

  const toggleInterest = (label) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(label)
        ? f.interests.filter((x) => x !== label)
        : [...f.interests, label],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.nom.trim()) nextErrors.nom = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "Indiquez une adresse e-mail valide.";
    if (!form.message.trim()) nextErrors.message = "Écrivez quelques mots.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSent(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSent(false);
  };

  const floatLabel = (name) =>
    focus === name || form[name].length > 0 ? "translateY(-26px) scale(0.72)" : "none";

  return (
    <section className="relative grid min-h-[calc(100dvh-56px)] grid-rows-[40svh_auto] bg-ink text-paper md:grid-cols-2 md:grid-rows-none">
      <div className="relative min-h-[300px] overflow-hidden bg-[#151515] md:min-h-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: "url(/Photo/voiture.png)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[68%]"
          style={{
            background:
              "linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0) 100%)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-3 select-none text-[11px] tracking-wide text-white/80"
          style={{ textShadow: "0 0 8px rgba(0,0,0,0.35)" }}
        >
          © Théo
        </span>

        <Reveal className="absolute inset-x-5 bottom-7 flex flex-col items-start gap-5 sm:inset-x-10 sm:bottom-14 md:inset-x-14">
          <DrawBar />
          <p className="m-0 text-[clamp(30px,8vw,60px)] font-medium leading-[1.04] tracking-[-0.04em] text-balance">
            <span className="block">{c.hookLine1}</span>
            <span className="block">{c.hookLine2}</span>
          </p>

          <div className="hidden flex-col gap-3 md:flex">
            <a
              href={`mailto:${LIENS.email}`}
              onMouseEnter={() => setEmailHover(true)}
              onMouseLeave={() => setEmailHover(false)}
              onFocus={() => setEmailHover(true)}
              onBlur={() => setEmailHover(false)}
              className="relative self-start pb-1.5 text-[clamp(20px,1.7vw,24px)] font-medium tracking-[-0.015em] text-paper"
            >
              {LIENS.email}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transition-transform duration-[260ms] ease-[cubic-bezier(.23,1,.32,1)]"
                style={{
                  transformOrigin: emailHover ? "left center" : "right center",
                  transform: emailHover ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </a>
            <div
              className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[13px]"
              style={{ color: "rgba(244,244,242,0.78)" }}
            >
              <a
                href={LIENS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper transition-opacity duration-150 hover:opacity-70"
              >
                Instagram
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={`tel:${LIENS.telHref}`}
                className="text-paper transition-opacity duration-150 hover:opacity-70"
              >
                {LIENS.telephone}
              </a>
              <span aria-hidden="true">·</span>
              <span>{c.responseNote}</span>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="flex items-center justify-center px-5 pb-12 pt-28 sm:px-10 md:px-14 md:pb-14 md:pt-32">
        <Reveal index={1} className="flex w-full max-w-[520px] flex-col gap-9">
          <h1 className="m-0 text-[clamp(32px,2.8vw,40px)] font-medium leading-[1.05] tracking-[-0.035em]">
            {c.formTitle}
          </h1>

          {!sent ? (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
              <div className="flex flex-col gap-3.5">
                <p className="m-0 text-sm" style={{ color: "#a6a6a3" }}>
                  {c.interestsLabel}
                </p>
                <div role="group" aria-label={c.interestsLabel} className="flex flex-wrap gap-2.5">
                  {c.interests.map((label) => {
                    const active = form.interests.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleInterest(label)}
                        aria-pressed={active}
                        className="border px-[18px] py-3 text-[15px] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.96]"
                        style={{
                          background: active ? "#FF4F00" : "transparent",
                          color: active ? "#0a0a0a" : "#f4f4f2",
                          borderColor: active ? "#FF4F00" : "rgba(244,244,242,0.28)",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-[22px]">
                {FIELDS.map(({ name, label, type, autoComplete }) => (
                  <label key={name} className="relative block pt-[22px]">
                    <span
                      className="pointer-events-none absolute left-0 top-8 origin-top-left text-lg transition-transform duration-[220ms] ease-[cubic-bezier(.23,1,.32,1)]"
                      style={{ color: "#9a9a97", transform: floatLabel(name) }}
                    >
                      {label}
                    </span>
                    <input
                      type={type}
                      value={form[name]}
                      onChange={onField(name)}
                      onFocus={() => setFocus(name)}
                      onBlur={() => setFocus(null)}
                      autoComplete={autoComplete}
                      className="block w-full border-0 border-b bg-transparent px-0 pb-2.5 pt-2 text-lg text-paper outline-none"
                      style={{ borderColor: "rgba(244,244,242,0.3)" }}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent transition-transform duration-[260ms] ease-[cubic-bezier(.23,1,.32,1)]"
                      style={{ transform: focus === name ? "scaleX(1)" : "scaleX(0)" }}
                    />
                    {errors[name] && (
                      <span className="absolute left-0 top-full mt-1.5 text-xs font-medium text-paper">
                        {errors[name]}
                      </span>
                    )}
                  </label>
                ))}

                <label className="relative block pt-[22px]">
                  <span
                    className="pointer-events-none absolute left-0 top-8 origin-top-left text-lg transition-transform duration-[220ms] ease-[cubic-bezier(.23,1,.32,1)]"
                    style={{ color: "#9a9a97", transform: floatLabel("message") }}
                  >
                    Message
                  </span>
                  <textarea
                    value={form.message}
                    onChange={onField("message")}
                    onFocus={() => setFocus("message")}
                    onBlur={() => setFocus(null)}
                    rows={3}
                    className="block w-full resize-y border-0 border-b bg-transparent px-0 pb-2.5 pt-2 text-lg leading-normal text-paper outline-none"
                    style={{ borderColor: "rgba(244,244,242,0.3)" }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent transition-transform duration-[260ms] ease-[cubic-bezier(.23,1,.32,1)]"
                    style={{ transform: focus === "message" ? "scaleX(1)" : "scaleX(0)" }}
                  />
                  {errors.message && (
                    <span className="absolute left-0 top-full mt-1.5 text-xs font-medium text-paper">
                      {errors.message}
                    </span>
                  )}
                </label>
              </div>

              <button
                type="submit"
                className="mt-1.5 flex w-full items-center justify-center gap-3.5 border-0 bg-accent px-6 py-[19px] text-base font-medium text-black transition-transform duration-150 ease-[cubic-bezier(.23,1,.32,1)] active:scale-[0.985]"
              >
                Envoyer <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : (
            <div
              role="status"
              className="flex flex-col gap-3.5 border-t pt-2 pb-6"
              style={{ borderColor: "rgba(244,244,242,0.18)" }}
            >
              <p className="m-0 mt-5 text-[22px] font-medium leading-snug tracking-[-0.015em]">
                {c.sentTitle}
              </p>
              <p className="m-0 text-[15px] leading-relaxed" style={{ color: "#b4b4b1" }}>
                {c.sentNote}
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-2.5 self-start border-0 bg-transparent py-1.5 text-sm text-paper underline decoration-white/40 underline-offset-[5px]"
              >
                Écrire un autre message
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
