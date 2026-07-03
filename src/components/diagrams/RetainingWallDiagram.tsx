import { useId } from "react";

interface Props {
  length: number;
  height: number;
  baseWidth: number;
  unitSystem: "imperial" | "metric";
}

export default function RetainingWallDiagram({ length, height, baseWidth, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "ft" : "m";

  const l = Math.max(length, 0.1);
  const h = Math.max(height, 0.1);
  const bw = Math.max(baseWidth, 0.1);

  const scale = 80 / Math.max(l, h + bw);
  const sl = l * scale;
  const sh = h * scale;
  const sbw = bw * scale;

  const pad = 50;
  const viewW = sl + pad * 2;
  const viewH = sh + sbw + pad * 2 + 30;

  const groundY = pad + sh;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto" role="img" aria-label={`Retaining wall: ${l}×${h}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <rect x={pad} y={pad} width={sl} height={sh} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" rx="1" />

      <path d={`M ${pad - sbw * 0.3} ${groundY} L ${pad + sl + sbw * 0.3} ${groundY} L ${pad + sl + sbw * 0.5} ${groundY + sbw} L ${pad - sbw * 0.5} ${groundY + sbw} Z`}
        fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" />

      <line x1={pad - sbw * 0.3} y1={groundY} x2={pad + sl + sbw * 0.3} y2={groundY} stroke="var(--border-strong)" strokeWidth="0.75" strokeDasharray="4 3" />

      <line x1={pad} y1={pad + sh + sbw + 8} x2={pad + sl} y2={pad + sh + sbw + 8} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + sl / 2} y={pad + sh + sbw + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{l.toFixed(1)}</text>
      <text x={pad + sl / 2} y={pad + sh + sbw + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Length ({unit})</text>

      <line x1={pad + sl + 8} y1={pad} x2={pad + sl + 8} y2={groundY} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + sl + 10} y={pad + sh / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600">{h.toFixed(1)}</text>
      <text x={pad + sl + 10} y={pad + sh / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10">Height ({unit})</text>
    </svg>
  );
}
