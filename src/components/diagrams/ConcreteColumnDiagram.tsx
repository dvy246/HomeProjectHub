import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  diameter: number;
  height: number;
  isRound: boolean;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteColumnDiagram({ diameter, height, isRound, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const d = Math.max(diameter, 0.1);
  const h = Math.max(height, 0.1);

  const scale = 120 / Math.max(d, h * 0.5);
  const sd = d * scale;
  const sh = h * scale * 0.5;

  const cx = 180;
  const cy = 60;
  const colW = isRound ? sd : sd;

  return (
    <svg viewBox="0 0 360 240" className="w-full h-auto diagram-svg" role="img" aria-label={`${isRound ? 'Round' : 'Square'} column: ${d} diameter × ${h}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      {isRound ? (
        <>
          <DiagramPart title="Column top">
            <ellipse cx={cx} cy={cy} rx={colW / 2} ry={colW / 4} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" />
          </DiagramPart>
          <DiagramPart title="Column body">
            <rect x={cx - colW / 2} y={cy} width={colW} height={sh} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1.5" />
          </DiagramPart>
          <DiagramPart title="Column base">
            <ellipse cx={cx} cy={cy + sh} rx={colW / 2} ry={colW / 4} fill="var(--accent)" fillOpacity="0.12" stroke="var(--border-strong)" strokeWidth="1.5" />
          </DiagramPart>
          <line x1={cx} y1={cy + colW / 4} x2={cx} y2={cy + sh - colW / 4} stroke="var(--border-strong)" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />
        </>
      ) : (
        <>
          <DiagramPart title="Column front">
            <rect x={cx - colW / 2} y={cy} width={colW} height={sh * 0.6} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" />
          </DiagramPart>
          <DiagramPart title="Column side">
            <polygon points={`${cx - colW / 2},${cy + sh * 0.6} ${cx + colW / 2},${cy + sh * 0.6} ${cx + colW / 2 + colW * 0.15},${cy + sh} ${cx - colW / 2 - colW * 0.15},${cy + sh}`}
              fill="var(--accent)" fillOpacity="0.12" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
          </DiagramPart>
        </>
      )}

      <line x1={cx - colW / 2 - 10} y1={cy} x2={cx - colW / 2 - 10} y2={cy + sh} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={cx - colW / 2 - 12} y={cy + sh / 2 + 4} textAnchor="end" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{h.toFixed(0)}</text>
      <text x={cx - colW / 2 - 12} y={cy + sh / 2 + 18} textAnchor="end" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Height ({unit})</text>

      <line x1={cx - colW / 2} y1={cy + sh + 12} x2={cx + colW / 2} y2={cy + sh + 12} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={cx} y={cy + sh + 26} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{d.toFixed(0)}</text>
      <text x={cx} y={cy + sh + 40} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">{isRound ? 'Diameter' : 'Width'} ({unit})</text>
    </svg>
  );
}
