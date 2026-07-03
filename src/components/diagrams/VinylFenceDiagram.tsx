import { useId } from "react";

interface Props {
  length: number;
  height: number;
  numSections: number;
  unitSystem: "imperial" | "metric";
}

export default function VinylFenceDiagram({ length, height, numSections, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const l = Math.max(length, 1);
  const h = Math.max(height, 1);
  const n = Math.min(Math.max(numSections, 1), 20);

  const scale = 100 / Math.max(l, h);
  const sl = l * scale;
  const sh = h * scale;
  const sectionW = sl / n;

  const pad = 40;
  const viewW = sl + pad * 2;
  const viewH = sh + pad * 2 + 30;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto" role="img" aria-label={`Fence: ${l}×${h}, ${n} sections`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      {Array.from({ length: n }, (_, i) => {
        const x = pad + i * sectionW;
        return (
          <g key={i}>
            <rect x={x + 1} y={pad} width={sectionW - 2} height={sh} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="0.75" rx="1" />
            <line x1={x + sectionW * 0.25} y1={pad} x2={x + sectionW * 0.25} y2={pad + sh} stroke="var(--border-strong)" strokeWidth="0.5" opacity="0.3" />
            <line x1={x + sectionW * 0.75} y1={pad} x2={x + sectionW * 0.75} y2={pad + sh} stroke="var(--border-strong)" strokeWidth="0.5" opacity="0.3" />
          </g>
        );
      })}

      <line x1={pad} y1={pad + sh + 8} x2={pad + sl} y2={pad + sh + 8} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + sl / 2} y={pad + sh + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{l.toFixed(0)}</text>
      <text x={pad + sl / 2} y={pad + sh + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Length ({unit})</text>

      <line x1={pad + sl + 8} y1={pad} x2={pad + sl + 8} y2={pad + sh} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + sl + 10} y={pad + sh / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600">{h.toFixed(0)}</text>
      <text x={pad + sl + 10} y={pad + sh / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10">Height ({unit})</text>
    </svg>
  );
}
