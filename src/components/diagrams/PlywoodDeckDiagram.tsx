import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  length: number;
  width: number;
  pitch: number;
}

export default function PlywoodDeckDiagram({ length, width, pitch }: Props) {
  const id = useId();
  const p = Math.max(pitch, 0.5);
  const w = Math.max(width, 1);

  const houseW = Math.min(w * 50, 180);
  const houseH = 70;
  const roofRise = (houseW / 2) * (p / 12);
  const riseClamped = Math.min(roofRise, houseW * 0.45);

  const x0 = (320 - houseW) / 2;
  const yBase = 50 + houseH;
  const yPeak = yBase - riseClamped;
  const yRoofBase = yBase - houseH * 0.15;

  const rows = 3;
  const cols = 4;
  const sheetW = houseW / cols;
  const sheetH = (yRoofBase - yPeak) / rows;

  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto diagram-svg" role="img" aria-label="Plywood roof deck diagram">
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <pattern id={`ply-${id}`} width={sheetW} height={sheetH} patternUnits="userSpaceOnUse">
          <rect width={sheetW} height={sheetH} fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx={sheetW * 0.3} cy={sheetH * 0.3} r="1" fill="var(--accent)" fillOpacity="0.3" />
          <circle cx={sheetW * 0.7} cy={sheetH * 0.6} r="1" fill="var(--accent)" fillOpacity="0.3" />
          <circle cx={sheetW * 0.5} cy={sheetH * 0.8} r="1" fill="var(--accent)" fillOpacity="0.3" />
        </pattern>
      </defs>

      <DiagramPart title="Plywood sheathing">
        <polygon points={`${x0},${yRoofBase} ${x0 + houseW / 2},${yPeak} ${x0 + houseW},${yRoofBase} ${x0},${yRoofBase}`} fill={`url(#ply-${id})`} fillOpacity="0.6" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      </DiagramPart>

      <DiagramPart title="Rafters">
        <g>
          <line x1={x0 + houseW * 0.25} y1={yRoofBase} x2={x0 + houseW * 0.25} y2={yPeak + (yRoofBase - yPeak) * 0.5} stroke="var(--fg-muted)" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
          <line x1={x0 + houseW * 0.75} y1={yRoofBase} x2={x0 + houseW * 0.75} y2={yPeak + (yRoofBase - yPeak) * 0.5} stroke="var(--fg-muted)" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
        </g>
      </DiagramPart>

      <DiagramPart title="H-clips">
        <g>
          <rect x={x0 + houseW * 0.5 - 3} y={yRoofBase - sheetH * 1.5 - 3} width="6" height="6" fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="1" rx="1" />
          <rect x={x0 + houseW * 0.5 - 3} y={yPeak + sheetH * 0.5 - 3} width="6" height="6" fill="var(--accent)" fillOpacity="0.3" stroke="var(--accent)" strokeWidth="1" rx="1" />
        </g>
      </DiagramPart>

      <text x={x0 + houseW / 2} y={yRoofBase + 14} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Wall</text>
      <text x={x0 + houseW / 2} y={(yRoofBase + yPeak) / 2 - 8} textAnchor="middle" fill="var(--fg)" fontSize="10" fontWeight="600" fontFamily="system-ui" className="diagram-label">4x8 plywood sheets</text>
      <text x={x0 + houseW / 2} y={(yRoofBase + yPeak) / 2 + 8} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui" className="diagram-label">{p}/12 pitch &middot; staggered joints</text>

      <line x1={x0 + houseW / 2} y1={yRoofBase} x2={x0 + houseW / 2} y2={yBase + 6} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" className="diagram-dim" />
      <text x={x0 + houseW / 2 + 10} y={(yRoofBase + yBase) / 2 + 4} textAnchor="start" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">{w.toFixed(0)}ft span</text>

      <line x1={x0 + 4} y1={yRoofBase} x2={x0 + 4} y2={yPeak} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={x0 + 6} y={(yRoofBase + yPeak) / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="9" fontWeight="600" fontFamily="system-ui" className="diagram-label">Rake</text>
    </svg>
  );
}
