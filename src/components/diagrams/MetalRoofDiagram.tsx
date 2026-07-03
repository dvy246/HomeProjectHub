import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  length: number;
  width: number;
  pitch: number;
}

export default function MetalRoofDiagram({ length, width, pitch }: Props) {
  const id = useId();
  const p = Math.max(pitch, 0.5);
  const w = Math.max(width, 1);

  const houseW = Math.min(w * 55, 180);
  const houseH = 80;
  const roofRise = (houseW / 2) * (p / 12);
  const riseClamped = Math.min(roofRise, houseW * 0.5);

  const x0 = (320 - houseW) / 2;
  const yBase = 50 + houseH;
  const yPeak = yBase - riseClamped;
  const yRoofBase = yBase - houseH * 0.15;

  const panelRows = 6;
  const panelW = houseW / panelRows;

  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto diagram-svg" role="img" aria-label="Metal roof diagram">
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <pattern id={`rib-${id}`} width={panelW} height="4" patternUnits="userSpaceOnUse">
          <rect width={panelW * 0.6} height="4" fill="none" />
          <rect x={panelW * 0.6} width={panelW * 0.15} height="4" fill="var(--accent)" fillOpacity="0.15" />
          <rect x={panelW * 0.75} width={panelW * 0.25} height="4" fill="none" />
        </pattern>
      </defs>

      <DiagramPart title="Wall">
        <rect x={x0} y={yRoofBase} width={houseW} height={houseH} fill="var(--accent)" fillOpacity="0.04" stroke="var(--border-strong)" strokeWidth="1.5" rx="2" />
      </DiagramPart>

      <DiagramPart title="Metal panels">
        <polygon points={`${x0},${yRoofBase} ${x0 + houseW / 2},${yPeak} ${x0 + houseW},${yRoofBase} ${x0},${yRoofBase}`} fill={`url(#rib-${id})`} fillOpacity="0.7" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      </DiagramPart>

      <DiagramPart title="Ridge cap">
        <rect x={x0 + houseW / 2 - 6} y={yPeak - 4} width="12" height="10" fill="var(--accent)" fillOpacity="0.2" stroke="var(--border-strong)" strokeWidth="1" rx="2" />
      </DiagramPart>

      <text x={x0 + houseW / 2} y={yRoofBase + 16} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Wall</text>
      <text x={x0 + houseW / 2} y={(yRoofBase + yPeak) / 2 - 8} textAnchor="middle" fill="var(--fg)" fontSize="10" fontWeight="600" fontFamily="system-ui" className="diagram-label">Corrugated metal panels</text>
      <text x={x0 + houseW / 2} y={(yRoofBase + yPeak) / 2 + 8} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui" className="diagram-label">{p}/12 pitch</text>

      <line x1={x0 + houseW / 2} y1={yRoofBase} x2={x0 + houseW / 2} y2={yBase + 8} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" className="diagram-dim" />
      <text x={x0 + houseW / 2 + 10} y={(yRoofBase + yBase) / 2 + 4} textAnchor="start" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">{w.toFixed(0)}ft wide</text>

      <line x1={x0 - 6} y1={yRoofBase} x2={x0 - 6} y2={yPeak} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={x0 - 8} y={(yRoofBase + yPeak) / 2 + 4} textAnchor="end" fill="var(--fg)" fontSize="10" fontWeight="600" fontFamily="system-ui" className="diagram-label">Rake</text>

      <line x1={x0} y1={yBase + 12} x2={x0 + houseW} y2={yBase + 12} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={x0 + houseW / 2} y={yBase + 26} textAnchor="middle" fill="var(--fg)" fontSize="10" fontWeight="600" fontFamily="system-ui" className="diagram-label">{length.toFixed(0)} ft</text>
      <text x={x0 + houseW / 2} y={yBase + 38} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Eave length</text>
    </svg>
  );
}
