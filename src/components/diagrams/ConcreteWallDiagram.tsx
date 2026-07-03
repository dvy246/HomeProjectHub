import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  length: number;
  width: number;
  height: number;
  unitSystem: "imperial" | "metric";
}

export default function ConcreteWallDiagram({ length, width, height, unitSystem }: Props) {
  const id = useId();
  const lenUnit = unitSystem === "imperial" ? "ft" : "m";
  const smUnit = unitSystem === "imperial" ? "in" : "cm";

  const l = Math.max(length, 0.1);
  const w = Math.max(width, 0.1);
  const h = Math.max(height, 0.1);

  const scale = 100 / Math.max(l, h);
  const sl = l * scale;
  const sh = h * scale;
  const sw = Math.min(w * scale, 40);

  const x0 = 50;
  const y0 = 30;
  const x1 = x0 + sl;
  const y1 = y0 + sh;

  const wallTop = y0;
  const wallBot = y1;
  const wallLeft = x0 + sl / 2 - sw / 2;
  const wallRight = wallLeft + sw;

  return (
    <svg viewBox="0 0 380 220" className="diagram-svg w-full h-auto" role="img" aria-label={`Wall diagram: ${l}×${h}×${w}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
        <marker id={`arr-rev-${id}`} markerWidth="7" markerHeight="5" refX="0" refY="2.5" orient="auto">
          <polygon points="7 0, 0 2.5, 7 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Concrete wall">
        <rect x={wallLeft} y={wallTop} width={sw} height={sh} fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1.5" rx="2" />
      </DiagramPart>

      <line x1={wallLeft - 12} y1={wallTop} x2={wallLeft - 12} y2={wallBot} stroke="var(--fg-muted)" strokeWidth="1" className="diagram-dim" markerStart={`url(#arr-rev-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={wallLeft - 14} y={(wallTop + wallBot) / 2 + 4} textAnchor="end" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{h.toFixed(1)}</text>
      <text x={wallLeft - 14} y={(wallTop + wallBot) / 2 + 18} textAnchor="end" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Height ({lenUnit})</text>

      <line x1={wallLeft} y1={wallBot + 10} x2={wallRight} y2={wallBot + 10} stroke="var(--fg-muted)" strokeWidth="1" className="diagram-dim" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={(wallLeft + wallRight) / 2} y={wallBot + 24} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{w.toFixed(0)}</text>
      <text x={(wallLeft + wallRight) / 2} y={wallBot + 38} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Width ({smUnit})</text>

      <DiagramPart title="Rebar reinforcement">
        <rect x={wallLeft} y={wallTop + sh * 0.3} width={sw} height={sh * 0.15} fill="var(--accent)" fillOpacity="0.15" stroke="var(--border-strong)" strokeWidth="0.75" />
      </DiagramPart>
      <text x={wallRight + 8} y={wallTop + sh * 0.375 + 4} textAnchor="start" fill="var(--fg-muted)" fontSize="9" className="diagram-annotate">rebar</text>
    </svg>
  );
}
