import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  length: number;
  width: number;
  depth: number;
  unitSystem: "imperial" | "metric";
}

export default function FrenchDrainDiagram({ length, width, depth, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const l = Math.max(length, 1);
  const w = Math.max(width, 1);
  const d = Math.max(depth, 1);

  const scale = 80 / Math.max(w, d);
  const sw = w * scale;
  const sd = d * scale;

  const pad = 40;
  const viewW = sw + pad * 2;
  const viewH = sd + pad * 2 + 30;

  const cx = pad + sw / 2;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="diagram-svg w-full h-auto" role="img" aria-label={`French drain cross-section`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Trench outline">
        <rect x={pad} y={pad} width={sw} height={sd} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" rx="2" strokeDasharray="6 3" />
      </DiagramPart>

      <DiagramPart title="Perforated pipe">
        <circle cx={cx} cy={pad + sd * 0.65} r={sw * 0.12} fill="var(--accent)" fillOpacity="0.2" stroke="var(--accent)" strokeWidth="1.5" />
      </DiagramPart>
      <circle cx={cx} cy={pad + sd * 0.65} r={sw * 0.06} fill="var(--accent)" fillOpacity="0.35" />

      <text x={cx} y={pad + sd * 0.65 + 4} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" className="diagram-annotate">pipe</text>

      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={pad + sw * (0.2 + i * 0.12)} cy={pad + sd * 0.3} r={2 + (i * 7 % 3) + 1} fill="var(--fg-muted)" fillOpacity="0.2" className="diagram-annotate" />
      ))}

      <text x={cx} y={pad + sd * 0.3 - 6} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" className="diagram-annotate">gravel</text>

      <line x1={pad} y1={pad + sd + 8} x2={pad + sw} y2={pad + sd + 8} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={cx} y={pad + sd + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{w.toFixed(0)}</text>
      <text x={cx} y={pad + sd + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Width ({unit})</text>

      <line x1={pad + sw + 8} y1={pad} x2={pad + sw + 8} y2={pad + sd} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={pad + sw + 10} y={pad + sd / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{d.toFixed(0)}</text>
      <text x={pad + sw + 10} y={pad + sd / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Depth ({unit})</text>
    </svg>
  );
}
