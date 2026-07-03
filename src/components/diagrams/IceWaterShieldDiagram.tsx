import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  pitch: number;
}

export default function IceWaterShieldDiagram({ pitch }: Props) {
  const id = useId();
  const p = Math.max(pitch, 0.5);

  const roofW = 200;
  const rise = (roofW / 2) * (p / 12);
  const riseClamped = Math.min(rise, roofW * 0.3);
  const yPeak = 25;
  const yEave = yPeak + riseClamped;
  const x0 = (320 - roofW) / 2;
  const xMid = x0 + roofW / 2;

  const eaveZoneH = (yEave - yPeak) * 0.35;
  const valleyX = x0 + roofW * 0.35;
  const valleyX2 = x0 + roofW * 0.65;

  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto diagram-svg" role="img" aria-label="Ice and water shield diagram">
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <pattern id={`shield-${id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="none" />
          <rect width="4" height="4" fill="var(--accent)" fillOpacity="0.08" />
        </pattern>
      </defs>

      <DiagramPart title="Roof deck">
        <polygon points={`${x0},${yEave} ${xMid},${yPeak} ${x0 + roofW},${yEave} ${x0 + roofW},200 ${x0},200`} fill="var(--accent)" fillOpacity="0.03" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      </DiagramPart>

      <DiagramPart title="Ice & water shield at eave">
        <polygon points={`${x0},${yEave} ${xMid + (x0 + roofW / 2 - xMid) * 0.5},${yEave - eaveZoneH * 1.2} ${x0 + roofW},${yEave}`} fill={`url(#shield-${id})`} fillOpacity="0.6" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeOpacity="0.5" />
      </DiagramPart>

      <DiagramPart title="Ice & water shield in valley">
        <rect x={valleyX} y={yPeak + (yEave - yPeak) * 0.25} width={valleyX2 - valleyX} height={(yEave - yPeak) * 0.55} fill={`url(#shield-${id})`} fillOpacity="0.6" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.5" rx="2" />
      </DiagramPart>

      <DiagramPart title="Drip edge">
        <g>
          <path d={`M ${x0 - 2} ${yEave} L ${x0 + 2} ${yEave} L ${x0 + 4} ${yEave + 8}`} fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${x0 + roofW + 2} ${yEave} L ${x0 + roofW - 2} ${yEave} L ${x0 + roofW - 4} ${yEave + 8}`} fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </DiagramPart>

      <text x={xMid} y={yEave + 18} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Interior</text>

      <text x={xMid} y={(yEave + yEave - eaveZoneH * 1.2) / 2} textAnchor="middle" fill="var(--fg)" fontSize="9" fontWeight="700" fontFamily="system-ui" className="diagram-label">Eave membrane</text>

      <text x={(valleyX + valleyX2) / 2} y={yPeak + (yEave - yPeak) * 0.6} textAnchor="middle" fill="var(--fg)" fontSize="9" fontWeight="700" fontFamily="system-ui" className="diagram-label">Valley membrane</text>

      <line x1={x0 - 8} y1={yEave} x2={x0 - 8} y2={yEave - eaveZoneH * 1.2} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={x0 - 10} y={(yEave * 2 - eaveZoneH * 1.2) / 2 + 4} textAnchor="end" fill="var(--fg)" fontSize="9" fontWeight="600" fontFamily="system-ui" className="diagram-label">Eave zone</text>

      <text x={xMid} y={yPeak - 6} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">{p}/12 pitch</text>
    </svg>
  );
}
