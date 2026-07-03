import React from "react";

interface Props {
  bagCount: number;
  bagSize: string;
}

export default function PalletVisualizer({ bagCount, bagSize }: Props) {
  const roundedBags = Math.max(0, Math.ceil(bagCount));
  const fullPallets = Math.floor(roundedBags / 50);
  const remainingBags = roundedBags % 50;

  // Generate array for visual bags representation (max 50 to avoid clutter)
  const visualBagsCount = fullPallets > 0 ? 50 : remainingBags;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col gap-3 select-none">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          Material Logistics: Bag Stack
        </span>
        <span className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--bg-muted)] px-1.5 py-0.5 rounded">
          50 Bags / Pallet
        </span>
      </div>

      {roundedBags === 0 ? (
        <p className="text-xs text-[var(--fg-muted)] italic text-center py-6">
          Enter dimensions to view estimated stacking.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Visual grid of bags */}
          <div className="grid grid-cols-10 gap-1.5 p-2 bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg">
            {Array.from({ length: 50 }).map((_, idx) => {
              const isActive = idx < visualBagsCount;
              return (
                <div
                  key={idx}
                  className={`aspect-[3/2] rounded-sm transition-all duration-300 relative group/bag ${
                    isActive
                      ? "bg-[var(--accent)] border border-[var(--accent)] shadow-sm opacity-80 hover:opacity-100"
                      : "bg-[var(--bg-muted)]/40 border border-dashed border-[var(--border)]"
                  }`}
                  title={isActive ? `Bag ${idx + 1}` : undefined}
                >
                  {/* Subtle bag outline line */}
                  {isActive && (
                    <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--accent-fg)] opacity-30" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stacking status text */}
          <div className="flex flex-col gap-0.5 text-xs text-[var(--fg-secondary)] mt-1 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>
                Total: <strong className="text-[var(--fg)]">{roundedBags}</strong> bags ({bagSize})
              </span>
            </div>
            {fullPallets > 0 && (
              <p className="text-[11px] text-[var(--fg-muted)] pl-3">
                Requires {fullPallets} full pallet{fullPallets > 1 ? "s" : ""}
                {remainingBags > 0 ? ` plus ${remainingBags} loose bags` : ""}.
              </p>
            )}
            {fullPallets === 0 && (
              <p className="text-[11px] text-[var(--fg-muted)] pl-3">
                Fits on a single pallet (loose load).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
