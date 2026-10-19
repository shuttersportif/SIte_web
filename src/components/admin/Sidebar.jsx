"use client";

const VIEWS = [
  ["dash", "Tableau de bord"],
  ["orders", "Commandes"],
  ["clients", "Clients"],
  ["gals", "Galeries"],
  ["content", "Contenu"],
  ["legal", "Mentions légales"],
  ["stats", "Statistiques"],
  ["settings", "Paramètres"],
];

export default function Sidebar({ view, onNavigate, adminEmail, onLogout }) {
  return (
    <aside className="sticky top-0 z-20 flex h-dvh flex-none flex-col gap-6 overflow-y-auto bg-ink px-0 py-6 text-paper md:w-[232px]">
      <div className="flex flex-col gap-0.5 px-3">
        <span className="text-[15px] font-medium">Théo</span>
        <span className="text-xs" style={{ color: "rgba(244,244,242,0.6)" }}>
          Administration
        </span>
      </div>

      <nav aria-label="Administration" className="flex flex-col gap-0.5">
        {VIEWS.map(([id, label]) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-10 items-center gap-2.5 px-3 text-left text-sm transition-colors duration-150 hover:bg-white/[0.06]"
              style={{ color: active ? "#f4f4f2" : "rgba(244,244,242,0.72)", background: active ? "rgba(244,244,242,0.06)" : "transparent" }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] bg-accent transition-transform duration-200 ease-[cubic-bezier(.23,1,.32,1)]"
                style={{ transform: active ? "scaleY(1)" : "scaleY(0)" }}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 px-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-9 items-center text-[13px] hover:text-paper"
          style={{ color: "rgba(244,244,242,0.78)" }}
        >
          Voir le site ↗
        </a>
        <span className="truncate text-xs" style={{ color: "rgba(244,244,242,0.6)" }}>
          {adminEmail}
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="min-h-9 self-start border-0 bg-transparent p-0 text-left text-[13px] underline underline-offset-4"
          style={{ color: "rgba(244,244,242,0.78)" }}
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
