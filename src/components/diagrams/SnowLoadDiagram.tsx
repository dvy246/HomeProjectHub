import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  pitch: number;
  snowDepth: number;
}

export default function SnowLoadDiagram({ pitch, snowDepth }: Props) {
  const id = useId();
  const p = Math.max(pitch, 0.5);

  const roofW = 200;
  const roofH = roofW * 0.35;
  const rise = (roofW / 2) * (p / 12);
  const riseClamped = Math.min(rise, roofW * 0.35);
  const yPeak = 30;
  const yEave = yPeak + riseClamped;
  const snowH = Math.min(Math.max(snowDepth * 2, 10), 50);

  const x0 = (320 - roofW) / 2;
  const xMid = x0 + roofW / 2;

  const roofPts = `${x0},${yEave} ${xMid},${yPeak} ${x0 + roofW},${yEave}`;
  const snowPts = `${x0},${yEave} ${xMid},${yPeak - snowH} ${x0 + roofW},${yEave} ${x0 + roofW},${yEave} ${x0},${yEave}`;

  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto diagram-svg" role="img" aria-label="Snow load diagram">
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Attic space">
        <polygon points={`${x0},${yEave} ${xMid},${yPeak} ${x0 + roofW},${yEave} ${x0 + roofW},200 ${x0},200`} fill="var(--accent)" fillOpacity="0.03" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      </DiagramPart>

      <DiagramPart title="Snow layer">
        <g>
          <path d={`M ${x0} ${yEave} L ${xMid} ${yPeak - snowH} L ${x0 + roofW} ${yEave} Z`} fill="#e8f4f8" fillOpacity="0.5" stroke="#94b8c7" strokeWidth="1.5" strokeLinejoin="round" />
          <path d={`M ${x0} ${yEave} L ${xMid} ${yPeak - snowH} L ${x0 + roofW} ${yEave}`} fill="none" stroke="#c0d6e0" strokeWidth="0.8" strokeDasharray="4 3" />
        </g>
      </DiagramPart>

      <DiagramPart title="Rafter / roof deck">
        <polygon points={roofPts} fill="none" stroke="var(--fg)" strokeWidth="2.5" strokeLinejoin="round" />
      </DiagramPart>

      <DiagramPart title="Snow depth indicator">
        <line x1={x0 + roofW * 0.25} y1={yEave - 4} x2={x0 + roofW * 0.25} y2={yPeak - snowH + (yEave - yPeak + snowH) * 0.5 + 4} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      </DiagramPart>

      <text x={xMid} y={yEave + 16} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui">Interior space</text>
      <text x={xMid} y={(yPeak - snowH + yEave) / 2 - 8} textAnchor="middle" fill="#4a7c94" fontSize="11" fontWeight="700" fontFamily="system-ui" className="diagram-label">Snow load</text>
      <text x={xMid} y={(yPeak - snowH + yEave) / 2 + 8} textAnchor="middle" fill="var(--fg-muted)" fontSize="9" fontFamily="system-ui" className="diagram-label">{snowDepth.toFixed(1)}ft &middot; {p}/12 pitch</text>

      <text x={x0 + roofW * 0.25 + 6} y={(yEave + yPeak - snowH) * 0.5 + 2} textAnchor="start" fill="var(--fg)" fontSize="9" fontWeight="600" fontFamily="system-ui" className="diagram-label">Snow depth</text>

      <line x1={x0 + roofW / 2 - 30} y1={yPeak - snowH - 6} x2={x0 + roofW / 2 + 30} y2={yPeak - snowH - 6} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={xMid} y={yPeak - snowH - 10} textAnchor="middle" fill="var(--fg)" fontSize="9" fontWeight="600" fontFamily="system-ui" className="diagram-label">Ridge</text>
    </svg>
  );
}
