"use client";

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[70] max-w-[calc(100vw-48px)] bg-ink px-[18px] py-3.5 text-[13px] text-paper"
      style={{ boxShadow: "0 18px 40px -18px rgba(0,0,0,0.5)" }}
    >
      {message}
    </div>
  );
}
