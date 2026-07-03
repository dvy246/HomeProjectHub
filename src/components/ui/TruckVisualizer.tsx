import React from "react";

interface Props {
  volumeCuYd: number;
}

export default function TruckVisualizer({ volumeCuYd }: Props) {
  const vol = Math.max(0, volumeCuYd);
  const capacityPerTruck = 10; // cubic yards
  const trucksNeeded = Math.max(1, Math.ceil(vol / capacityPerTruck));
  
  // Calculate percentage fill of the last truck in line
  const lastTruckVolume = vol % capacityPerTruck;
  const currentTruckFillPercentage = vol > 0 && lastTruckVolume === 0 
    ? 100 
    : (lastTruckVolume / capacityPerTruck) * 100;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col gap-3 select-none">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          Material Logistics: Ready-Mix Truck
        </span>
        <span className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--bg-muted)] px-1.5 py-0.5 rounded">
          Max {capacityPerTruck} cu yd / Truck
        </span>
      </div>

      {vol === 0 ? (
        <p className="text-xs text-[var(--fg-muted)] italic text-center py-6">
          Enter dimensions to view estimated truck load.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Visual Truck representation */}
          <div className="flex flex-wrap gap-4 items-center justify-center p-3 bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg">
            {Array.from({ length: Math.min(3, trucksNeeded) }).map((_, idx) => {
              const isLast = idx === trucksNeeded - 1;
              const fill = isLast ? currentTruckFillPercentage : 100;

              return (
                <div key={idx} className="flex flex-col items-center gap-1 shrink-0 relative">
                  {/* Custom CSS/SVG Concrete Truck */}
                  <svg viewBox="0 0 160 90" className="w-28 h-auto" role="img" aria-label={`Concrete truck fill: ${fill.toFixed(0)}%`}>
                    {/* Cabin */}
                    <path d="M 110,65 L 140,65 L 140,45 L 125,35 L 110,35 Z" fill="var(--fg-secondary)" />
                    <rect x="122" y="40" width="12" height="10" fill="var(--bg)" rx="1" />
                    
                    {/* Truck Bed Frame */}
                    <rect x="20" y="60" width="100" height="8" fill="var(--border-strong)" />
                    <rect x="25" y="45" width="8" height="15" fill="var(--fg-muted)" />

                    {/* Mixer Drum Background */}
                    <ellipse cx="65" cy="40" rx="35" ry="22" fill="var(--bg-muted)" stroke="var(--border-strong)" strokeWidth="1.5" />
                    
                    {/* Mixer Drum Colored Liquid Fill Indicator (clipped using SVG clipPath) */}
                    <g clipPath="url(#drum-clip)">
                      <ellipse cx="65" cy="40" rx="35" ry="22" fill="var(--accent)" fillOpacity="0.15" />
                      {/* We fill from bottom to top using height rect */}
                      <rect x="30" y={62 - (22 * 2 * (fill / 100))} width="70" height="50" fill="var(--accent)" fillOpacity="0.5" />
                    </g>

                    {/* Chute */}
                    <path d="M 18,63 L 5,72 L 5,75 L 18,68 Z" fill="var(--fg-muted)" />

                    {/* Wheels */}
                    <circle cx="45" cy="74" r="8" fill="var(--fg)" />
                    <circle cx="45" cy="74" r="3" fill="var(--bg)" />
                    <circle cx="65" cy="74" r="8" fill="var(--fg)" />
                    <circle cx="65" cy="74" r="3" fill="var(--bg)" />
                    <circle cx="125" cy="74" r="8" fill="var(--fg)" />
                    <circle cx="125" cy="74" r="3" fill="var(--bg)" />

                    <defs>
                      <clipPath id="drum-clip">
                        <ellipse cx="65" cy="40" rx="35" ry="22" />
                      </clipPath>
                    </defs>
                  </svg>
                  
                  <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                    Truck {idx + 1}: {fill.toFixed(0)}% full
                  </span>
                </div>
              );
            })}
            
            {trucksNeeded > 3 && (
              <div className="text-xs font-bold text-[var(--fg-secondary)] flex items-center justify-center bg-[var(--bg-muted)] w-12 h-12 rounded-full border border-[var(--border)]">
                +{trucksNeeded - 3} more
              </div>
            )}
          </div>

          {/* Stacking status text */}
          <div className="flex flex-col gap-0.5 text-xs text-[var(--fg-secondary)] mt-1 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>
                Total Volume: <strong className="text-[var(--fg)]">{vol.toFixed(2)}</strong> cu yd
              </span>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] pl-3">
              Requires <strong className="text-[var(--fg)] font-semibold">{trucksNeeded}</strong> concrete ready-mix truck{trucksNeeded > 1 ? "s" : ""} in total.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
