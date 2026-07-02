import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

const SNOW_DENSITIES: Record<string, number> = {
  "Fresh": 5,
  "Settled": 15,
  "Old / Packed": 25,
  "Wet / Heavy": 40,
  "Ice": 57,
};

export default function SnowLoadCalc() {
  const [depth, setDepth] = useState<string>("24");
  const [snowType, setSnowType] = useState<string>("Settled");
  const [pitch, setPitch] = useState<string>("6");
  const [buildingLength, setBuildingLength] = useState<string>("40");
  const [buildingWidth, setBuildingWidth] = useState<string>("30");
  const [groundSnowLoad, setGroundSnowLoad] = useState<string>("30");

  const dep = parseNumber(depth) / 12;
  const pitchNum = parseNumber(pitch);
  const bLen = parseNumber(buildingLength);
  const bWid = parseNumber(buildingWidth);
  const gsl = parseNumber(groundSnowLoad);

  const density = SNOW_DENSITIES[snowType] || 15;
  const pitchFactor = Math.sqrt(1 + (pitchNum / 12) ** 2);
  const roofArea = bLen * bWid * pitchFactor;

  const depthSnowLoad = dep * density * 1.25;
  const groundSnowLoadPsf = gsl;
  const flatRoofFactor = pitchNum < 12 ? 0.7 : 0.7 * (1 - (pitchNum - 12) * 0.02);
  const calculatedSnowLoad = groundSnowLoadPsf * flatRoofFactor;
  const designLoad = Math.max(depthSnowLoad, calculatedSnowLoad);
  const totalLoad = designLoad * roofArea;

  const isBalanced = depthSnowLoad <= calculatedSnowLoad * 1.1;
  const exceedsDanger = designLoad > 50;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Snow Conditions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Snow Depth (inches)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="e.g. 24" />
            <div>
              <p className="text-xs font-medium text-[var(--fg-secondary)] mb-2">Snow Type</p>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(SNOW_DENSITIES).map(([label]) => (
                  <button key={label} type="button" onClick={() => setSnowType(label)} className={`border rounded-lg py-1.5 text-xs font-semibold transition-all ${snowType === label ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Building Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Building Length (ft)" type="number" inputMode="decimal" value={buildingLength} onChange={(e) => setBuildingLength(e.target.value)} placeholder="e.g. 40" />
            <Input label="Building Width (ft)" type="number" inputMode="decimal" value={buildingWidth} onChange={(e) => setBuildingWidth(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Roof Pitch (rise per 12 in)" type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g. 6" />
            <Input label="Ground Snow Load (psf)" type="number" inputMode="decimal" value={groundSnowLoad} onChange={(e) => setGroundSnowLoad(e.target.value)} placeholder="e.g. 30" helperText="From local building code map" />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Snow Load Analysis</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Design Snow Load</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{designLoad.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">psf</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">
                {isBalanced ? "Balanced load" : "Drift / unbalanced"} | Max recommended: 50 psf
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Roof Load</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{totalLoad.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">lbs</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">Roof area: {roofArea.toFixed(0)} sq ft</span>
            </div>

            {exceedsDanger && (
              <div className="pt-4 border-t border-[var(--border)]">
                <span className="text-xs font-semibold text-red-500">EXCEEDS SAFE LIMIT</span>
                <p className="text-xs text-[var(--fg-muted)] mt-1">Consider removing snow from the roof immediately. This load may exceed standard residential design capacity.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Depth-based</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-xl font-bold">{depthSnowLoad.toFixed(0)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">psf</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Code-based</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-xl font-bold">{calculatedSnowLoad.toFixed(0)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">psf</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Snow Density Reference</h3>
          <div className="flex flex-col gap-1">
            {Object.entries(SNOW_DENSITIES).map(([type, dens]) => (
              <div key={type} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm">{type}</span>
                <span className="text-xs text-[var(--fg-muted)]">{dens} pcf</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
