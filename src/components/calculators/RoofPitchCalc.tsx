import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

export default function RoofPitchCalc() {
  const [rise, setRise] = useState<string>("6");
  const [run, setRun] = useState<string>("12");
  const [buildingLength, setBuildingLength] = useState<string>("40");
  const [buildingWidth, setBuildingWidth] = useState<string>("30");

  const parse = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) || n <= 0 ? 0 : n;
  };

  const riseNum = parse(rise);
  const runNum = parse(run);
  const bLen = parse(buildingLength);
  const bWid = parse(buildingWidth);

  const pitchRatio = `${riseNum}:${runNum}`;
  const pitchDegrees = runNum > 0 ? Math.atan(riseNum / runNum) * (180 / Math.PI) : 0;
  const pitchFactor = runNum > 0 ? Math.sqrt(1 + Math.pow(riseNum / runNum, 2)) : 1;
  const slopePercent = runNum > 0 ? (riseNum / runNum) * 100 : 0;

  const roofArea = bLen * bWid * pitchFactor;
  const rafterLength = runNum > 0 ? (bWid / 2) * pitchFactor : 0;

  const pitchCategory = slopePercent < 10 ? "Low Slope" : slopePercent < 25 ? "Conventional" : slopePercent < 50 ? "Steep" : "Very Steep";

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-7 flex flex-col gap-6">
        <Card>
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">Pitch Measurements</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Rise (inches)" type="number" inputMode="decimal" autocomplete="off" value={rise} onChange={(e) => setRise(e.target.value)} placeholder="e.g. 6" helperText="Vertical distance per 12 in run" />
            <Input label="Run (inches)" type="number" inputMode="decimal" autocomplete="off" value={run} onChange={(e) => setRun(e.target.value)} placeholder="e.g. 12" helperText="Horizontal distance (usually 12)" />
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Building Footprint (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Building Length (ft)" type="number" inputMode="decimal" autocomplete="off" value={buildingLength} onChange={(e) => setBuildingLength(e.target.value)} placeholder="e.g. 40" />
              <Input label="Building Width (ft)" type="number" inputMode="decimal" autocomplete="off" value={buildingWidth} onChange={(e) => setBuildingWidth(e.target.value)} placeholder="e.g. 30" />
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3">Common Roof Pitches</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { pitch: "2:12", use: "Low-slope / shed" },
              { pitch: "4:12", use: "Standard residential" },
              { pitch: "6:12", use: "Common gable" },
              { pitch: "8:12", use: "Steep residential" },
              { pitch: "10:12", use: "Very steep" },
              { pitch: "12:12", use: "A-frame / cabin" },
            ].map((p) => (
              <button key={p.pitch} type="button" onClick={() => setRise(p.pitch.split(":")[0])} className="flex flex-col items-start p-2 border border-neutral-200 dark:border-neutral-800 rounded-md hover:border-neutral-800 dark:hover:border-neutral-200 transition-colors text-left">
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{p.pitch}</span>
                <span className="text-[10px] text-neutral-400">{p.use}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="md:col-span-5 flex flex-col gap-6">
        <Card className="bg-black text-white dark:bg-neutral-950 dark:border-neutral-800">
          <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400 mb-6">Pitch Analysis</h3>
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-xs font-medium text-neutral-400 block mb-1">Roof Pitch Ratio</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{pitchRatio}</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-400 block mb-1">Angle in Degrees</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight text-white">{pitchDegrees.toFixed(1)}</span>
                <span className="text-lg text-neutral-400 font-semibold">degrees</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-400 block mb-1">Slope Percentage</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight text-white">{slopePercent.toFixed(1)}</span>
                <span className="text-lg text-neutral-400 font-semibold">%</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-400 block mb-1">Pitch Multiplier</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight text-white">{pitchFactor.toFixed(3)}</span>
                <span className="text-xs text-neutral-400">x footprint</span>
              </div>
            </div>
            <div className="border-t border-neutral-800 pt-4">
              <span className="text-xs font-medium text-neutral-400 block mb-1">Category</span>
              <span className="text-lg font-bold text-white">{pitchCategory}</span>
            </div>
          </div>
        </Card>

        {bLen > 0 && bWid > 0 && (
          <Card>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">Derived Roof Values</h4>
            <table className="w-full text-xs text-left">
              <tbody className="tabular-nums">
                <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                  <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">Actual Roof Area</td>
                  <td className="py-2.5 text-right font-bold text-neutral-950 dark:text-white">{roofArea.toFixed(0)} sq ft</td>
                </tr>
                <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                  <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">Rafter Length (each side)</td>
                  <td className="py-2.5 text-right font-bold text-neutral-950 dark:text-white">{rafterLength.toFixed(2)} ft</td>
                </tr>
                <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                  <td className="py-2.5 font-medium text-neutral-800 dark:text-neutral-200">Ridge Height (from wall top)</td>
                  <td className="py-2.5 text-right font-bold text-neutral-950 dark:text-white">{(bWid / 2 * (riseNum / runNum)).toFixed(2)} ft</td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
