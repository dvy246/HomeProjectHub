import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

export default function RoofPitchCalc() {
  const [rise, setRise] = useState<string>("6");
  const [run, setRun] = useState<string>("12");
  const [buildingLength, setBuildingLength] = useState<string>("40");
  const [buildingWidth, setBuildingWidth] = useState<string>("30");

  const riseNum = parseNumber(rise) || 0.001;
  const runNum = parseNumber(run) || 0.001;
  const bLen = parseNumber(buildingLength);
  const bWid = parseNumber(buildingWidth);

  const pitchRatio = `${riseNum}:${runNum}`;
  const pitchDegrees = Math.atan(riseNum / runNum) * (180 / Math.PI);
  const pitchFactor = Math.sqrt(1 + Math.pow(riseNum / runNum, 2));
  const slopePercent = (riseNum / runNum) * 100;

  const roofArea = bLen * bWid * pitchFactor;
  const rafterLength = (bWid / 2) * pitchFactor;

  const pitchCategory = slopePercent < 10 ? "Low Slope" : slopePercent < 25 ? "Conventional" : slopePercent < 50 ? "Steep" : "Very Steep";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Pitch Measurements</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Rise (inches)" type="number" inputMode="decimal" value={rise} onChange={(e) => setRise(e.target.value)} placeholder="e.g. 6" helperText="Vertical distance per 12 in run" />
            <Input label="Run (inches)" type="number" inputMode="decimal" value={run} onChange={(e) => setRun(e.target.value)} placeholder="e.g. 12" helperText="Horizontal distance (usually 12)" />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Building Footprint (Optional)</label>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Building Length (ft)" type="number" inputMode="decimal" value={buildingLength} onChange={(e) => setBuildingLength(e.target.value)} placeholder="e.g. 40" />
              <Input label="Building Width (ft)" type="number" inputMode="decimal" value={buildingWidth} onChange={(e) => setBuildingWidth(e.target.value)} placeholder="e.g. 30" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Common Roof Pitches</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { pitch: "2:12", use: "Low-slope / shed" },
              { pitch: "4:12", use: "Standard residential" },
              { pitch: "6:12", use: "Common gable" },
              { pitch: "8:12", use: "Steep residential" },
              { pitch: "10:12", use: "Very steep" },
              { pitch: "12:12", use: "A-frame / cabin" },
            ].map((p) => (
              <button key={p.pitch} type="button" onClick={() => setRise(p.pitch.split(":")[0])} className="flex flex-col items-start p-2 border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] transition-colors text-left">
                <span className="font-mono font-bold text-[var(--fg)]">{p.pitch}</span>
                <span className="text-[10px] text-[var(--fg-muted)]">{p.use}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Pitch Analysis</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Roof Pitch Ratio</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{pitchRatio}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Angle in Degrees</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight">{pitchDegrees.toFixed(1)}</span>
                <span className="text-lg text-[var(--fg-muted)] font-semibold">degrees</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Slope Percentage</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight">{slopePercent.toFixed(1)}</span>
                <span className="text-lg text-[var(--fg-muted)] font-semibold">%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Pitch Multiplier</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight">{pitchFactor.toFixed(3)}</span>
                <span className="text-xs text-[var(--fg-muted)]">x footprint</span>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Category</span>
              <span className="text-lg font-bold text-[var(--fg)]">{pitchCategory}</span>
            </div>
          </div>
        </div>

        {bLen > 0 && bWid > 0 && (
          <Card>
            <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Derived Roof Values</h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm font-medium">Actual Roof Area</span>
                <span className="text-sm font-bold tabular-nums">{roofArea.toFixed(0)} sq ft</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm font-medium">Rafter Length (each side)</span>
                <span className="text-sm font-bold tabular-nums">{rafterLength.toFixed(2)} ft</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm font-medium">Ridge Height (from wall top)</span>
                <span className="text-sm font-bold tabular-nums">{(bWid / 2 * (riseNum / runNum)).toFixed(2)} ft</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
