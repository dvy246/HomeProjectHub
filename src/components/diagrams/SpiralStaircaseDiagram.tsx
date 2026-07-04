import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  diameter: number;
  numSteps: number;
  unitSystem: "imperial" | "metric";
}

export default function SpiralStaircaseDiagram({ diameter, numSteps, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const d = Math.max(diameter, 1);
  const n = Math.min(Math.max(numSteps, 4), 24);

  const scale = 100 / d;
  const sd = d * scale;

  const pad = 30;
  const viewSize = sd + pad * 2;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const r = sd / 2;

  return (
    <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-auto diagram-svg" role="img" aria-label={`Spiral staircase: ${d} diameter, ${n} steps`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Staircase outer diameter">
        <circle cx={cx} cy={cy} r={r} fill="var(--accent)" fillOpacity="0.03" stroke="var(--border-strong)" strokeWidth="1.5" />
      </DiagramPart>
      <g role="button" tabIndex={0} aria-label="Center pole" aria-pressed={false}>
        <circle cx={cx} cy={cy} r={r * 0.15} fill="none" stroke="var(--border-strong)" strokeWidth="0.75" className="diagram-part" />
      </g>

      {Array.from({ length: n }, (_, i) => {
        const angle = (i * 360) / n - 90;
        const rad = (angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        return (
          <DiagramPart key={i} title={`Step ${i + 1}`}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--accent)" strokeWidth="0.75" opacity="0.4" />
          </DiagramPart>
        );
      })}

      <line x1={cx - r} y1={cy + r + 12} x2={cx + r} y2={cy + r + 12} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={cx} y={cy + r + 26} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{d.toFixed(0)}</text>
      <text x={cx} y={cy + r + 40} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Diameter ({unit})</text>

      <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" className="diagram-annotate">{n} steps</text>
    </svg>
  );
}
