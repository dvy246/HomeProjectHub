import { useId } from "react";
import { computeBox } from "../../lib/isometric";

interface Props {
  width: number;
  depth: number;
  height: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteFootingDiagram({ width, depth, height, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const w = Math.max(width, 0.1);
  const d = Math.max(depth, 0.1);
  const h = Math.max(height, 0.1);

  const scale = 100 / Math.max(w, d, h);
  const sw = w * scale;
  const sd = d * scale;
  const sh = h * scale;

  const cx = 160;
  const cy = 140;
  const box = computeBox(sw, sd, sh, cx, cy);

  const lenMidX = (box.corners[1].x + box.corners[5].x) / 2;
  const lenMidY = (box.corners[1].y + box.corners[5].y) / 2;

  const widMidX = (box.corners[0].x + box.corners[4].x) / 2;
  const widMidY = (box.corners[0].y + box.corners[4].y) / 2;

  const thickMidX = box.corners[2].x + 16;
  const thickMidY = (box.corners[2].y + box.corners[1].y) / 2;

  return (
    <svg viewBox="0 0 320 260" className="w-full h-auto" role="img" aria-label={`Footing diagram: ${w}×${d}×${h}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <polygon points={box.topFace} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={box.rightFace} fill="var(--accent)" fillOpacity="0.12" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={box.frontFace} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />

      <line x1={box.corners[0].x - 6} y1={box.corners[0].y} x2={box.corners[4].x - 6} y2={box.corners[4].y} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={widMidX - 8} y={widMidY + 4} textAnchor="end" fill="var(--fg)" fontSize="13" fontWeight="600">{w.toFixed(0)}</text>
      <text x={widMidX - 8} y={widMidY + 18} textAnchor="end" fill="var(--fg-muted)" fontSize="10">Width ({unit})</text>

      <line x1={box.corners[1].x} y1={box.corners[1].y + 6} x2={box.corners[5].x} y2={box.corners[5].y + 6} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={lenMidX} y={lenMidY + 20} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{d.toFixed(0)}</text>
      <text x={lenMidX} y={lenMidY + 34} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Depth ({unit})</text>

      <line x1={thickMidX} y1={box.corners[2].y} x2={thickMidX} y2={box.corners[1].y} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={thickMidX + 4} y={thickMidY + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600">{h.toFixed(0)}</text>
      <text x={thickMidX + 4} y={thickMidY + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10">Height ({unit})</text>
    </svg>
  );
}
