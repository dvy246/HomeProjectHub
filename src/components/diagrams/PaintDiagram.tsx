import { useId } from "react";
import DiagramPart from "./DiagramPart";

interface Props {
  width: number;
  height: number;
  numDoors: number;
  numWindows: number;
  unitSystem: "imperial" | "metric";
}

export default function PaintDiagram({ width, height, numDoors, numWindows, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "ft" : "m";

  const w = Math.max(width, 1);
  const h = Math.max(height, 1);
  const doors = Math.min(Math.max(numDoors, 0), 4);
  const windows = Math.min(Math.max(numWindows, 0), 6);

  const scale = 100 / Math.max(w, h);
  const sw = w * scale;
  const sh = h * scale;

  const pad = 30;
  const viewW = sw + pad * 2;
  const viewH = sh + pad * 2 + 30;

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto diagram-svg" role="img" aria-label={`Wall elevation: ${w}×${h}`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <DiagramPart title="Wall surface">
        <rect x={pad} y={pad} width={sw} height={sh} fill="var(--accent)" fillOpacity="0.05" stroke="var(--border-strong)" strokeWidth="1.5" rx="2" />
      </DiagramPart>

      {Array.from({ length: doors }, (_, i) => {
        const x = pad + sw * (0.15 + i * 0.25);
        const dh = sh * 0.7;
        return (
          <DiagramPart key={`d-${i}`} title={`Door ${i + 1}`}>
            <rect x={x} y={pad + sh - dh} width={sw * 0.12} height={dh}
              fill="var(--bg-subtle)" stroke="var(--border-strong)" strokeWidth="1" rx="1" />
          </DiagramPart>
        );
      })}

      {Array.from({ length: windows }, (_, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = pad + sw * (0.5 + col * 0.3);
        const y = pad + sh * (0.1 + row * 0.25);
        return (
          <DiagramPart key={`w-${i}`} title={`Window ${i + 1}`}>
            <rect x={x} y={y} width={sw * 0.15} height={sh * 0.2}
              fill="var(--accent)" fillOpacity="0.08" stroke="var(--border-strong)" strokeWidth="1" rx="1" />
          </DiagramPart>
        );
      })}

      <line x1={pad} y1={pad + sh + 8} x2={pad + sw} y2={pad + sh + 8} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={pad + sw / 2} y={pad + sh + 22} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{w.toFixed(0)}</text>
      <text x={pad + sw / 2} y={pad + sh + 36} textAnchor="middle" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Width ({unit})</text>

      <line x1={pad + sw + 8} y1={pad} x2={pad + sw + 8} y2={pad + sh} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} className="diagram-dim" />
      <text x={pad + sw + 10} y={pad + sh / 2 + 4} textAnchor="start" fill="var(--fg)" fontSize="13" fontWeight="600" className="diagram-label">{h.toFixed(0)}</text>
      <text x={pad + sw + 10} y={pad + sh / 2 + 18} textAnchor="start" fill="var(--fg-muted)" fontSize="10" className="diagram-label">Height ({unit})</text>
    </svg>
  );
}
