import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

const ROLL_COVERAGE_SQFT = 200;

export default function IceWaterShieldCalc() {
  const [eaveLength, setEaveLength] = useState<string>("80");
  const [eaveWidth, setEaveWidth] = useState<string>("36");
  const [valleyLength, setValleyLength] = useState<string>("30");
  const [valleyWidth, setValleyWidth] = useState<string>("24");
  const [pitch, setPitch] = useState<string>("6");
  const [wasteFactor, setWasteFactor] = useState<string>("8");

  const eLen = parseNumber(eaveLength);
  const eWid = parseNumber(eaveWidth) / 12;
  const vLen = parseNumber(valleyLength);
  const vWid = parseNumber(valleyWidth) / 12;
  const pitchNum = parseNumber(pitch);
  const waste = parseNumber(wasteFactor) / 100;

  const pitchFactor = Math.sqrt(1 + Math.pow(pitchNum / 12, 2));

  const eaveArea = eLen * eWid * pitchFactor;
  const valleyArea = vLen * vWid * 2;
  const totalArea = eaveArea + valleyArea;
  const areaWithWaste = totalArea * (1 + waste);
  const rolls = Math.ceil(areaWithWaste / ROLL_COVERAGE_SQFT);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Eave / Rake Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Eave / Rake Length (ft)" type="number" inputMode="decimal" value={eaveLength} onChange={(e) => setEaveLength(e.target.value)} placeholder="e.g. 80" helperText="Total linear ft of eaves + rakes" />
            <Input label="Eave Overhang Width (in)" type="number" inputMode="decimal" value={eaveWidth} onChange={(e) => setEaveWidth(e.target.value)} placeholder="e.g. 36" helperText="Typically 36 inches (3 ft)" />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Valley Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Valley Length (ft)" type="number" inputMode="decimal" value={valleyLength} onChange={(e) => setValleyLength(e.target.value)} placeholder="e.g. 30" helperText="Length of each valley" />
            <Input label="Valley Width (in)" type="number" inputMode="decimal" value={valleyWidth} onChange={(e) => setValleyWidth(e.target.value)} placeholder="e.g. 24" helperText="Width on each side (24 in = 2 ft)" />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Roof Conditions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 6" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 8" helperText="8-12% for overlaps and cuts" />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Ice & Water Shield Output</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Coverage Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{areaWithWaste.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">sq ft</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">With {wasteFactor}% waste</span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Rolls Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{rolls}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">rolls</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{ROLL_COVERAGE_SQFT} sq ft per roll</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Eave Area</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold">{eaveArea.toFixed(0)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">sq ft</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Valley Area</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold">{valleyArea.toFixed(0)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">sq ft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Installation Notes</h3>
          <div className="flex flex-col gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
            <p>Apply ice & water shield starting at the eave edge, extending at least 24 inches past the interior wall line (typically 3 ft from the eave edge in cold climates).</p>
            <p>Valley applications should extend 12-24 inches on each side of the valley centerline. Overlap horizontal strips by 6 inches.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
