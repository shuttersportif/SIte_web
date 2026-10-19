// petits graphiques réutilisables : barres horizontales (listes classées) et
// verticales (séries temporelles), tous en simples <div> comme la maquette
// de référence (aucune librairie de charting)

export function HBar({ label, value, pct, accent = "#FF4F00" }) {
  return (
    <div className="grid grid-cols-[minmax(0,190px)_minmax(0,1fr)_56px] items-center gap-3">
      <span className="truncate text-[13px]" title={label}>
        {label}
      </span>
      <span className="relative block h-2.5 overflow-hidden bg-[#e8e8e5]">
        <span className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: accent }} />
      </span>
      <span className="text-right text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );
}

export function VBarChart({ data, axisTop, axisMid, highlightLast = false }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div role="img" aria-label="Graphique en barres" className="grid grid-cols-[auto_minmax(0,1fr)] gap-2.5">
      <div
        aria-hidden="true"
        className="mb-6 flex h-[200px] flex-col justify-between text-right text-[11px] text-[#555555]"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span>{axisTop}</span>
        <span>{axisMid}</span>
        <span>0</span>
      </div>
      <div aria-hidden="true" className="flex min-w-0 flex-col gap-2">
        <div
          className="relative flex h-[200px] items-end gap-1 border-b"
          style={{ borderColor: "rgba(17,17,17,0.22)" }}
        >
          <span
            className="absolute inset-x-0 top-0 border-t border-dashed"
            style={{ borderColor: "rgba(17,17,17,0.12)" }}
          />
          <span
            className="absolute inset-x-0 top-1/2 border-t border-dashed"
            style={{ borderColor: "rgba(17,17,17,0.12)" }}
          />
          {data.map((d, i) => {
            const h = Math.max(2, Math.round((d.value / max) * 200));
            const last = highlightLast && i === data.length - 1;
            return (
              <div key={i} title={d.tip} className="relative min-w-0 flex-1" style={{ height: `${h}px` }}>
                <span
                  className="block h-full w-full"
                  style={{ background: last ? "#FF4F00" : "rgba(17,17,17,0.72)" }}
                />
                {d.showVal && (
                  <span
                    className="absolute bottom-full mb-1.5 whitespace-nowrap text-[11px] font-medium"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {d.val}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex h-4 gap-1">
          {data.map((d, i) => (
            <span key={i} className="min-w-0 flex-1 truncate text-center text-[11px] text-[#555555]">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
