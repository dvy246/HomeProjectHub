import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  rise: number;
  run: number;
}

export default function RoofPitchDiagram({ rise, run }: Props) {
  const id = useId();

  const r = Math.max(rise, 0.1);
  const u = Math.max(run, 0.1);
  const angleDeg = Math.atan(r / u) * (180 / Math.PI);

  const scale = 140 / Math.max(r / u, 1);
  const w = u * scale;
  const h = r * scale;

  const pad = 40;
  const viewW = Math.max(w + pad * 2, 320);
  const viewH = h + pad * 2 + 30;

  const x0 = pad;
  const y0 = viewH - pad - 20;
  const x1 = x0 + w;
  const y1 = y0;
  const x2 = x0;
  const y2 = y0 - h;

  const labelOffset = 18;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="diagram-svg w-full h-auto" role="img" aria-label={`Roof pitch diagram: ${r} over ${u}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Roof slope triangle">
        <polygon points={`${x0},${y0} ${x1},${y1} ${x0},${y2}`} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      </DiagramPart>

      <DiagramPart title="Horizontal run">
        <rect x={x0 - 3} y={y1 - 2} width={w + 6} height="4" fill="var(--bg-subtle)" stroke="var(--border-strong)" strokeWidth="1" />
      </DiagramPart>

      <circle cx={x0} cy={y0} r="3" fill="var(--accent)" />

      <line x1={x0 - 6} y1={y0} x2={x0 - 6} y2={y2} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={x0 - 8} y={(y0 + y2) / 2 + 4} textAnchor="end" fill="var(--fg)" fontSize="13" fontWeight="600" fontFamily="system-ui" className="diagram-label">
        {r.toFixed(0)}
      </text>
      <text x={x0 - 8} y={(y0 + y2) / 2 + 18} textAnchor="end" fill="var(--fg-muted)" fontSize="10" fontFamily="system-ui" className="diagram-label">
        Rise (in)
      </text>

      <line x1={x0} y1={y1 + 6} x2={x1} y2={y1 + 6} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={(x0 + x1) / 2} y={y1 + labelOffset + 4} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" fontFamily="system-ui" className="diagram-label">
        {u.toFixed(0)}
      </text>
      <text x={(x0 + x1) / 2} y={y1 + labelOffset + 18} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" fontFamily="system-ui" className="diagram-label">
        Run (in)
      </text>

      <text x={(x0 + x1) / 2 + w * 0.2} y={(y1 + y2) / 2 - 10} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" fontFamily="system-ui" className="diagram-annotate">
        Pitch: {r}:{u}
      </text>
      <text x={(x0 + x1) / 2 + w * 0.2} y={(y1 + y2) / 2 + 6} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" fontFamily="system-ui" className="diagram-annotate">
        {angleDeg.toFixed(1)}° from horizontal
      </text>

      {angleDeg > 15 && (
        <path d={`M ${x0 + 18} ${y0 - 2} A 18 18 0 0 0 ${x0 + 2} ${y0 - 18}`} fill="none" stroke="var(--fg-muted)" strokeWidth="1" />
      )}
    </svg>
  );
}
