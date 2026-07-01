import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

const RATIOS: Record<string, [number, number, number]> = {
  "1:2:3 (Standard)": [1, 2, 3],
  "1:2:2 (High Strength)": [1, 2, 2],
  "1:2.5:3.5 (General)": [1, 2.5, 3.5],
  "1:3:3 (Footings)": [1, 3, 3],
  "1:3:5 (Lean Mix)": [1, 3, 5],
};

export default function MixRatioCalc() {
  const [volume, setVolume] = useState<string>("1");
  const [unit, setUnit] = useState<"cuyd" | "cuft">("cuyd");
  const [ratioLabel, setRatioLabel] = useState<string>("1:2:3 (Standard)");
  const [cementBagSize, setCementBagSize] = useState<string>("94");

  const vol = parseNumber(volume);
  const volCuFt = unit === "cuyd" ? vol * 27 : vol;
  const bagLbs = parseNumber(cementBagSize) || 94;

  const ratio = RATIOS[ratioLabel] || RATIOS["1:2:3 (Standard)"];
  const totalParts = ratio[0] + ratio[1] + ratio[2];

  const cementParts = ratio[0] / totalParts;
  const sandParts = ratio[1] / totalParts;
  const gravelParts = ratio[2] / totalParts;

  const cementVolume = volCuFt * cementParts;
  const sandVolume = volCuFt * sandParts;
  const gravelVolume = volCuFt * gravelParts;

  const cementWeight = cementVolume * 94;
  const cementBags = Math.ceil(cementWeight / bagLbs);
  const waterGallons = Math.ceil(cementBags * 4.5);

  const sandCubicYards = sandVolume / 27;
  const gravelCubicYards = gravelVolume / 27;
  const sandTons = sandVolume * 0.075;
  const gravelTons = gravelVolume * 0.075;

  const mixName = ratioLabel;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Concrete Volume</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={`Volume (${unit === "cuyd" ? "cubic yards" : "cubic feet"})`} type="number" inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="e.g. 1" />
            <div>
              <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Unit</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setUnit("cuyd")} className={`border rounded-lg py-2 text-xs font-semibold transition-all ${unit === "cuyd" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>Cubic Yards</button>
                <button type="button" onClick={() => setUnit("cuft")} className={`border rounded-lg py-2 text-xs font-semibold transition-all ${unit === "cuft" ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>Cubic Feet</button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Mix Design</h3>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Mix Ratio (Cement : Sand : Gravel)</label>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.keys(RATIOS).map((label) => {
                const [c, s, g] = RATIOS[label];
                return (
                  <button key={label} type="button" onClick={() => setRatioLabel(label)} className={`flex items-center justify-between px-3 py-2 border rounded-lg text-xs transition-all ${ratioLabel === label ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>
                    <span className="font-semibold font-mono">{c}:{s}:{g}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">{label.replace(/^\d[\d.:]+\s*/, "")}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Input label="Cement Bag Weight (lbs)" type="number" inputMode="decimal" value={cementBagSize} onChange={(e) => setCementBagSize(e.target.value)} placeholder="e.g. 94" helperText="Standard bag is 94 lbs" />
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Mix Results for {volCuFt.toFixed(1)} cu ft</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Cement</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{cementBags}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{bagLbs}lb bags</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{mixName}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Sand Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{sandCubicYards.toFixed(2)}</span>
                <span className="text-xs text-[var(--fg-muted)]">cu yd</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)]">~{sandTons.toFixed(1)} tons</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Gravel Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{gravelCubicYards.toFixed(2)}</span>
                <span className="text-xs text-[var(--fg-muted)]">cu yd</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)]">~{gravelTons.toFixed(1)} tons</span>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Estimated Water</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold">{waterGallons}</span>
                <span className="text-xs text-[var(--fg-muted)]">gallons</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">~4.5 gal per bag of cement</span>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Volume Breakdown</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Total Wet Volume</span>
              <span className="text-sm font-bold tabular-nums">{volCuFt.toFixed(1)} cu ft</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Cement Volume</span>
              <span className="text-sm font-bold tabular-nums">{cementVolume.toFixed(2)} cu ft</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Sand Volume</span>
              <span className="text-sm font-bold tabular-nums">{sandVolume.toFixed(2)} cu ft</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">Gravel Volume</span>
              <span className="text-sm font-bold tabular-nums">{gravelVolume.toFixed(2)} cu ft</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
