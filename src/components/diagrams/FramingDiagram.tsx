import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  length: number;
  height: number;
  studSpacing: number;
  unitSystem: "imperial" | "metric";
}

export default function FramingDiagram({ length, height, studSpacing, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const l = Math.max(length, 1);
  const h = Math.max(height, 1);
  const s = Math.max(studSpacing, 1);

  const scale = 80 / Math.max(l, h);
  const sl = l * scale;
  const sh = h * scale;
  const numStuds = Math.min(Math.max(Math.floor(l / s), 2), 20);

  const pad = 50;
  const viewW = sl + pad * 2;
  const viewH = sh + pad * 2 + 30;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="diagram-svg w-full h-auto" role="img" aria-label={`Framing: ${l}×${h} at ${s} stud spacing`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <rect x={pad} y={pad} width={sl} height={4} fill="var(--border-strong)" rx="2" className="diagram-part">
        <title>Top plate</title>
      </rect>
      <rect x={pad} y={pad + sh - 4} width={sl} height={4} fill="var(--border-strong)" rx="2" className="diagram-part">
        <title>Bottom plate</title>
      </rect>

      {Array.from({ length: numStuds }, (_, i) => {
        const x = pad + (i * sl) / (numStuds - 1);
        return (
          <DiagramPart key={i} title="Stud">
            <rect x={x - 2} y={pad + 4} width={4} height={sh - 8} fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="0.75" rx="1" />
          </DiagramPart>
        );
      })}

      <line x1={pad} y1={pad + sh + 8} x2={pad + sl} y2={pad + sh + 8} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={pad + sl / 2} y={pad + sh + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{l.toFixed(0)}</text>
      <text x={pad + sl / 2} y={pad + sh + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Length ({unit})</text>

      <line x1={pad + sl + 8} y1={pad} x2={pad + sl + 8} y2={pad + sh} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={pad + sl + 10} y={pad + sh / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{h.toFixed(0)}</text>
      <text x={pad + sl + 10} y={pad + sh / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Height ({unit})</text>
    </svg>
  );
}
