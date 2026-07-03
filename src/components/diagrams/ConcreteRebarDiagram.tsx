import { useId } from "react";

interface Props {
  length: number;
  width: number;
  spacing: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteRebarDiagram({ length, width, spacing, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const l = Math.max(length, 1);
  const w = Math.max(width, 1);
  const s = Math.max(spacing, 1);

  const scale = 100 / Math.max(l, w);
  const sl = l * scale;
  const sw = w * scale;

  const pad = 40;
  const viewW = sl + pad * 2;
  const viewH = sw + pad * 2 + 20;

  const cols = Math.max(Math.floor(sl / (s * scale)), 2);
  const rows = Math.max(Math.floor(sw / (s * scale)), 2);

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto" role="img" aria-label={`Rebar grid: ${l}×${w} at ${s} spacing`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <rect x={pad} y={pad} width={sl} height={sw} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1.5" rx="2" />

      {Array.from({ length: cols }, (_, i) => {
        const x = pad + (i * sl) / (cols - 1);
        return <line key={`v-${i}`} x1={x} y1={pad} x2={x} y2={pad + sw} stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />;
      })}
      {Array.from({ length: rows }, (_, i) => {
        const y = pad + (i * sw) / (rows - 1);
        return <line key={`h-${i}`} x1={pad} y1={y} x2={pad + sl} y2={y} stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />;
      })}

      <line x1={pad} y1={pad + sw + 8} x2={pad + sl} y2={pad + sw + 8} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + sl / 2} y={pad + sw + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{l.toFixed(0)}</text>
      <text x={pad + sl / 2} y={pad + sw + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Length ({unit})</text>

      <line x1={pad + sl + 8} y1={pad} x2={pad + sl + 8} y2={pad + sw} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + sl + 10} y={pad + sw / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600">{w.toFixed(0)}</text>
      <text x={pad + sl + 10} y={pad + sw / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10">Width ({unit})</text>
    </svg>
  );
}
