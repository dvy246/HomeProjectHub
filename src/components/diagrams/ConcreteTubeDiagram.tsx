import { useId } from "react";

interface Props {
  diameter: number;
  height: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteTubeDiagram({ diameter, height, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const d = Math.max(diameter, 0.1);
  const h = Math.max(height, 0.1);

  const scale = 80 / Math.max(d, h * 0.4);
  const sd = d * scale;
  const sh = h * scale * 0.4;

  const cx = 180;
  const cy = 60;

  return (
    <svg viewBox="0 0 360 260" className="w-full h-auto" role="img" aria-label={`Sonotube: ${d} diameter × ${h}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <ellipse cx={cx} cy={cy} rx={sd / 2} ry={sd / 5} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" />
      <rect x={cx - sd / 2} y={cy} width={sd} height={sh} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1.5" />
      <ellipse cx={cx} cy={cy + sh} rx={sd / 2} ry={sd / 5} fill="var(--accent)" fillOpacity="0.12" stroke="var(--border-strong)" strokeWidth="1.5" />

      <line x1={cx} y1={cy} x2={cx} y2={cy + sh} stroke="var(--border-strong)" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />

      <line x1={cx - sd / 2 - 10} y1={cy} x2={cx - sd / 2 - 10} y2={cy + sh} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={cx - sd / 2 - 12} y={cy + sh / 2 + 4} textAnchor="end" fill="var(--fg)" fontSize="13" fontWeight="600">{h.toFixed(0)}</text>
      <text x={cx - sd / 2 - 12} y={cy + sh / 2 + 18} textAnchor="end" fill="var(--fg-muted)" fontSize="10">Height ({unit})</text>

      <line x1={cx - sd / 2} y1={cy + sh + 12} x2={cx + sd / 2} y2={cy + sh + 12} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={cx} y={cy + sh + 26} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{d.toFixed(0)}</text>
      <text x={cx} y={cy + sh + 40} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Diameter ({unit})</text>
    </svg>
  );
}
