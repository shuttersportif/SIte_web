"use client";

export default function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0" style={{ background: "rgba(10,10,10,0.45)" }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[560px] flex-col bg-[#fbfbfa]"
        style={{ boxShadow: "0 30px 80px -30px rgba(0,0,0,0.45)" }}
      >
        <div className="flex flex-none items-center justify-between gap-3 py-2.5 pl-6 pr-2.5" style={{ borderBottom: "1px solid rgba(17,17,17,0.1)" }}>
          <span className="text-base font-medium">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-11 w-11 items-center justify-center border-0 bg-transparent text-2xl font-light leading-none text-[#111111]"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
