import { useId } from "react";

interface Props {
  treadDepth: number;
  riserHeight: number;
  numSteps: number;
  width: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteStepsDiagram({ treadDepth, riserHeight, numSteps, width, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const t = Math.max(treadDepth, 1);
  const r = Math.max(riserHeight, 1);
  const n = Math.min(Math.max(numSteps, 1), 20);
  const w = Math.max(width, 1);

  const scale = 20;
  const st = t * scale;
  const sr = r * scale;

  const pad = 30;
  const viewW = st * n + pad * 2 + 40;
  const viewH = sr * n + pad * 2 + 60;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto" role="img" aria-label={`Steps: ${n} steps, ${t} tread, ${r} rise`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <g fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1" strokeLinejoin="round">
        {Array.from({ length: n }, (_, i) => {
          const x = pad + i * st;
          const y = pad + (n - 1 - i) * sr;
          return (
            <rect key={i} x={x} y={y} width={st} height={sr} />
          );
        })}
      </g>

      <polyline points={`${pad},${pad + n * sr} ${pad + n * st},${pad + n * sr} ${pad + n * st},${pad}`}
        fill="none" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" />

      <line x1={pad} y1={pad + n * sr + 10} x2={pad + n * st} y2={pad + n * sr + 10} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + n * st / 2} y={pad + n * sr + 24} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{(t * n).toFixed(0)}</text>
      <text x={pad + n * st / 2} y={pad + n * sr + 38} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Total Run ({unit})</text>

      <line x1={pad + n * st + 10} y1={pad + n * sr} x2={pad + n * st + 10} y2={pad} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-rev-${id})`} />
      <text x={pad + n * st + 12} y={pad + n * sr / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600">{(r * n).toFixed(0)}</text>
      <text x={pad + n * st + 12} y={pad + n * sr / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10">Total Rise ({unit})</text>
    </svg>
  );
}
