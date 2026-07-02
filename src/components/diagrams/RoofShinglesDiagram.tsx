import { useId } from "react";

interface Props {
  shape: "gable" | "hip";
  length: number;
  width: number;
  pitch: number;
}

export default function RoofShinglesDiagram({ shape, length, width, pitch }: Props) {
  const id = useId();
  const p = Math.max(pitch, 0.5);
  const w = Math.max(width, 1);
  const l = Math.max(length, 1);

  const scale = 60;
  const houseW = Math.min(w * scale, 160);
  const houseH = Math.min(100, houseW * 0.5);
  const roofRise = (houseW / 2) * (p / 12);
  const roofRiseClamped = Math.min(roofRise, houseW * 0.6);

  const x0 = (320 - houseW) / 2;
  const yBase = 40 + houseH;
  const yPeak = yBase - roofRiseClamped;
  const yRoofBase = yBase - houseH * 0.15;

  const pitchAngle = p > 0 ? (Math.atan(p / 12) * 180 / Math.PI).toFixed(1) : "0";

  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto" role="img" aria-label={`${shape} roof diagram`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>
      {shape === "gable" ? (
        <>
          <polygon points={`${x0},${yBase} ${x0 + houseW},${yBase} ${x0 + houseW},${yRoofBase} ${x0},${yRoofBase}`} fill="var(--accent)" fillOpacity="0.06" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points={`${x0},${yRoofBase} ${x0 + houseW / 2},${yPeak} ${x0 + houseW},${yRoofBase} ${x0},${yRoofBase}`} fill="var(--accent)" fillOpacity="0.1" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />

          <text x={x0 + houseW / 2} y={yRoofBase + 14} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Wall</text>
          <text x={x0 + houseW / 2} y={(yRoofBase + yPeak) / 2 - 6} textAnchor="middle" fill="var(--fg)" fontSize="11" fontWeight="600" fontFamily="system-ui">{p}/12</text>
          <text x={x0 + houseW / 2} y={(yRoofBase + yPeak) / 2 + 8} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">{pitchAngle}° pitch</text>

          <line x1={x0 + houseW / 2} y1={yRoofBase} x2={x0 + houseW / 2} y2={yBase} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" />
          <text x={x0 + houseW / 2 + 10} y={(yRoofBase + yBase) / 2 + 4} textAnchor="start" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">{w.toFixed(0)}ft wide</text>

          <line x1={x0 + houseW / 2 + 40} y1={yBase + 14} x2={x0 + houseW - 8} y2={yBase + 14} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
          <text x={x0 + houseW / 2 + 40 + (houseW / 2 - 48) / 2} y={yBase + 28} textAnchor="middle" fill="var(--fg)" fontSize="11" fontWeight="600" fontFamily="system-ui">{l.toFixed(0)}</text>
          <text x={x0 + houseW / 2 + 40 + (houseW / 2 - 48) / 2} y={yBase + 40} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Length (ft)</text>
        </>
      ) : (
        <>
          <path d={`M ${x0 + 20} ${yBase} L ${x0 + houseW - 20} ${yBase} L ${x0 + houseW - 10} ${yRoofBase} L ${x0 + houseW / 2} ${yPeak - 10} L ${x0 + 10} ${yRoofBase} Z`} fill="var(--accent)" fillOpacity="0.06" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={`M ${x0 + 10} ${yRoofBase} L ${x0 + houseW / 2} ${yPeak - 10} L ${x0 + houseW - 10} ${yRoofBase} Z`} fill="var(--accent)" fillOpacity="0.1" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />

          <text x={x0 + houseW / 2} y={yRoofBase + 14} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Hip (4 sloped sides)</text>
          <text x={x0 + houseW / 2} y={(yRoofBase + yPeak - 10) / 2 - 6} textAnchor="middle" fill="var(--fg)" fontSize="11" fontWeight="600" fontFamily="system-ui">{p}/12</text>
          <text x={x0 + houseW / 2} y={(yRoofBase + yPeak - 10) / 2 + 8} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">{pitchAngle}° pitch</text>
        </>
      )}
    </svg>
  );
}
