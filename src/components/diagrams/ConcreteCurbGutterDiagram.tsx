import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  curbWidth: number;
  gutterWidth: number;
  height: number;
  length: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteCurbGutterDiagram({ curbWidth, gutterWidth, height, length, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const cw = Math.max(curbWidth, 0.1);
  const gw = Math.max(gutterWidth, 0.1);
  const h = Math.max(height, 0.1);
  const l = Math.max(length, 0.1);

  const scale = 100 / Math.max(cw + gw, h);
  const scw = cw * scale;
  const sgw = gw * scale;
  const sh = h * scale;

  const pad = 40;
  const viewW = scw + sgw + pad * 2;
  const viewH = sh + pad * 2 + 30;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="diagram-svg w-full h-auto" role="img" aria-label={`Curb and gutter section`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Curb and gutter cross-section">
        <path d={`M ${pad} ${pad + sh} L ${pad + scw} ${pad} L ${pad + scw + sgw} ${pad} L ${pad + scw + sgw} ${pad + sh} Z`}
          fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      </DiagramPart>

      <text x={pad + 4} y={pad + sh - 4} fill="var(--fg-muted)" fontSize="9" className="diagram-annotate">Curb</text>
      <text x={pad + scw + 4} y={pad + 10} fill="var(--fg-muted)" fontSize="9" className="diagram-annotate">Gutter</text>

      <line x1={pad} y1={pad + sh + 8} x2={pad + scw + sgw} y2={pad + sh + 8} stroke="var(--fg-muted)" strokeWidth="1" className="diagram-dim" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + (scw + sgw) / 2} y={pad + sh + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{(cw + gw).toFixed(0)}</text>
      <text x={pad + (scw + sgw) / 2} y={pad + sh + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Total Width ({unit})</text>

      <line x1={pad + scw + sgw + 8} y1={pad} x2={pad + scw + sgw + 8} y2={pad + sh} stroke="var(--fg-muted)" strokeWidth="1" className="diagram-dim" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + scw + sgw + 10} y={pad + sh / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{h.toFixed(0)}</text>
      <text x={pad + scw + sgw + 10} y={pad + sh / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Height ({unit})</text>
    </svg>
  );
}
