import { useId } from "react";
import { computeBox } from "../../lib/isometric";

interface Props {
  length: number;
  width: number;
  thickness: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteSlabDiagram({ length, width, thickness, unitSystem }: Props) {
  const id = useId();
  const lenUnit = unitSystem === "imperial" ? "ft" : "m";
  const thickUnit = unitSystem === "imperial" ? "in" : "cm";

  const l = Math.max(length, 0.1);
  const w = Math.max(width, 0.1);
  const t = Math.max(thickness, 0.1);

  const minDim = Math.min(l, w);
  const visualThickness = Math.max(t, minDim * 0.08);

  const scale = 140 / Math.max(l, w);
  const sl = l * scale;
  const sw = w * scale;
  const st = visualThickness * scale;

  const cx = 190;
  const cy = 150;
  const box = computeBox(sl, sw, st, cx, cy);

  const lenMidX = (box.corners[1].x + box.corners[5].x) / 2;
  const lenMidY = (box.corners[1].y + box.corners[5].y) / 2;
  const lenOffsetY = 18;

  const widMidX = (box.corners[0].x + box.corners[4].x) / 2;
  const widMidY = (box.corners[0].y + box.corners[4].y) / 2;
  const widOffsetX = -18;

  const thickMidX = box.corners[2].x + 12;
  const thickMidY = (box.corners[2].y + box.corners[1].y) / 2;
  const thickEndX = box.corners[2].x + 12;
  const thickEndY1 = box.corners[2].y;
  const thickEndY2 = box.corners[1].y;

  return (
    <svg viewBox="0 0 380 280" className="w-full h-auto" role="img" aria-label={`Concrete slab diagram: ${length} by ${width} by ${thickness}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <polygon points={box.topFace} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={box.rightFace} fill="var(--accent)" fillOpacity="0.12" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={box.frontFace} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinejoin="round" />

      <line x1={box.corners[0].x} y1={box.corners[0].y} x2={box.corners[4].x} y2={box.corners[4].y} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
      <line x1={box.corners[3].x} y1={box.corners[3].y} x2={box.corners[7].x} y2={box.corners[7].y} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
      <line x1={box.corners[4].x} y1={box.corners[4].y} x2={box.corners[5].x} y2={box.corners[5].y} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
      <line x1={box.corners[7].x} y1={box.corners[7].y} x2={box.corners[6].x} y2={box.corners[6].y} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />
      <line x1={box.corners[5].x} y1={box.corners[5].y} x2={box.corners[6].x} y2={box.corners[6].y} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 3" opacity="0.35" />

      <line x1={box.corners[1].x} y1={box.corners[1].y + 6} x2={box.corners[5].x} y2={box.corners[5].y + 6} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={lenMidX} y={lenMidY + lenOffsetY} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" fontFamily="system-ui" className="transition-[fill] duration-200">
        {l.toFixed(1)}
      </text>
      <text x={lenMidX} y={lenMidY + lenOffsetY + 14} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" fontFamily="system-ui">
        Length ({lenUnit})
      </text>

      <line x1={box.corners[0].x - 6} y1={box.corners[0].y} x2={box.corners[4].x - 6} y2={box.corners[4].y} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={widMidX + widOffsetX} y={widMidY + 4} textAnchor="end" fill="var(--fg)" fontSize="13" fontWeight="600" fontFamily="system-ui" className="transition-[fill] duration-200">
        {w.toFixed(1)}
      </text>
      <text x={widMidX + widOffsetX} y={widMidY + 18} textAnchor="end" fill="var(--fg-muted)" fontSize="10" fontFamily="system-ui">
        Width ({lenUnit})
      </text>

      <line x1={thickEndX} y1={thickEndY1} x2={thickEndX} y2={thickEndY2} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={thickMidX} y={thickMidY + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600" fontFamily="system-ui" className="transition-[fill] duration-200">
        {t.toFixed(1)}
      </text>
      <text x={thickMidX} y={thickMidY + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10" fontFamily="system-ui">
        Thickness ({thickUnit})
      </text>
    </svg>
  );
}
