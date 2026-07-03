import { useId } from "react";

interface Props {
  roomWidth: number;
  roomLength: number;
  tileWidth: number;
  tileLength: number;
  pattern: 'grid' | 'diagonal' | 'herringbone';
  unitSystem: "imperial" | "metric";
}

export default function TileDiagram({ roomWidth, roomLength, tileWidth, tileLength, pattern, unitSystem }: Props) {
  const id = useId();
  const unit = unitSystem === "imperial" ? "in" : "cm";

  const rw = Math.max(roomWidth, 1);
  const rl = Math.max(roomLength, 1);

  const scale = 80 / Math.max(rw, rl);
  const srw = rw * scale;
  const srl = rl * scale;

  const tileSW = Math.max(tileWidth * scale, 8);
  const tileSL = Math.max(tileLength * scale, 8);

  const pad = 40;
  const viewW = srl + pad * 2;
  const viewH = srw + pad * 2 + 30;

  const cols = Math.min(Math.floor(srl / tileSL), 12);
  const rows = Math.min(Math.floor(srw / tileSW), 10);

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto" role="img" aria-label={`Tile layout: ${rw}×${rl} room`}>
      <defs>
        <marker id={`arr-${id}`} markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
          <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
        </marker>
      </defs>

      <rect x={pad} y={pad} width={srl} height={srw} fill="var(--bg-subtle)" stroke="var(--border-strong)" strokeWidth="1.5" rx="2" />

      {Array.from({ length: Math.max(cols, 1) }, (_, ci) =>
        Array.from({ length: Math.max(rows, 1) }, (_, ri) => {
          let x = pad + ci * tileSL;
          let y = pad + ri * tileSW;

          if (pattern === 'diagonal') {
            x += (ri % 2) * tileSL / 2;
            const offX = ci * tileSL;
            const offY = ri * tileSW;
            return (
              <g key={`t-${ci}-${ri}`}>
                <rect x={pad + offX} y={pad + offY} width={tileSL} height={tileSW}
                  fill="var(--accent)" fillOpacity="0.06" stroke="var(--border-strong)" strokeWidth="0.75"
                  transform={`rotate(45 ${pad + offX + tileSL/2} ${pad + offY + tileSW/2})`} />
              </g>
            );
          }

          if (pattern === 'herringbone') {
            const offX = ci * tileSL;
            const offY = ri * tileSW;
            const ang = (ci + ri) % 2 === 0 ? 0 : 90;
            return (
              <rect key={`t-${ci}-${ri}`} x={pad + offX} y={pad + offY} width={tileSL} height={tileSW}
                fill="var(--accent)" fillOpacity="0.06" stroke="var(--border-strong)" strokeWidth="0.75"
                transform={`rotate(${ang} ${pad + offX + tileSL/2} ${pad + offY + tileSW/2})`} />
            );
          }

          return (
            <rect key={`t-${ci}-${ri}`} x={x} y={y} width={tileSL} height={tileSW}
              fill="var(--accent)" fillOpacity="0.06" stroke="var(--border-strong)" strokeWidth="0.75" />
          );
        })
      )}

      <text x={pad + 4} y={pad + srw + 8} fill="var(--fg-muted)" fontSize="9" textTransform="capitalize">{pattern}</text>

      <line x1={pad} y1={pad + srw + 12} x2={pad + srl} y2={pad + srw + 12} stroke="var(--fg-muted)" strokeWidth="1" markerStart={`url(#arr-${id})`} markerEnd={`url(#arr-${id})`} />
      <text x={pad + srl / 2} y={pad + srw + 26} textAnchor="middle" fill="var(--fg)" fontSize="13" fontWeight="600">{rl.toFixed(0)}</text>
      <text x={pad + srl / 2} y={pad + srw + 40} textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Length ({unit})</text>
    </svg>
  );
}
