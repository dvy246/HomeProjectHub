import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";

export default function ConcreteStepsCalc() {
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");

  // Inputs
  const [numSteps, setNumSteps] = useState<string>("3");
  const [stepWidth, setStepWidth] = useState<string>("36"); // inches or cm
  const [stepRise, setStepRise] = useState<string>("7"); // inches or cm
  const [stepRun, setStepRun] = useState<string>("11"); // inches or cm
  const [landingDepth, setLandingDepth] = useState<string>("0"); // extra depth on the top step (inches or cm)
  const [wasteFactor, setWasteFactor] = useState<string>("10"); // percent
  const [bagSize, setBagSize] = useState<"40lb" | "50lb" | "60lb" | "80lb">("80lb");

  const parseInput = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const stepsCount = Math.max(1, Math.round(parseInput(numSteps)));
  const widthVal = parseInput(stepWidth);
  const riseVal = parseInput(stepRise);
  const runVal = parseInput(stepRun);
  const landingVal = parseInput(landingDepth);
  const wastePercent = parseInput(wasteFactor) / 100;

  // Calculation Logic (rigorous step volume sum)
  let totalVolumeCuFt = 0;

  if (unitSystem === "imperial") {
    // Convert inputs from inches to feet
    const wFt = widthVal / 12;
    const rFt = riseVal / 12;
    const rnFt = runVal / 12;
    const lndFt = landingVal / 12;

    // Calculate individual steps:
    // Step 1: Rise * Run * Width
    // Step 2: (Rise * 2) * Run * Width
    // Step N: (Rise * N) * (Run + Landing) * Width
    for (let i = 1; i <= stepsCount; i++) {
      const stepHeight = i * rFt;
      const isTopStep = i === stepsCount;
      const stepDepth = isTopStep ? (rnFt + lndFt) : rnFt;
      totalVolumeCuFt += stepHeight * stepDepth * wFt;
    }
  } else {
    // Metric: inputs are in cm, convert to meters
    const wM = widthVal / 100;
    const rM = riseVal / 100;
    const rnM = runVal / 100;
    const lndM = landingVal / 100;

    let totalVolumeCuM = 0;
    for (let i = 1; i <= stepsCount; i++) {
      const stepHeight = i * rM;
      const isTopStep = i === stepsCount;
      const stepDepth = isTopStep ? (rnM + lndM) : rnM;
      totalVolumeCuM += stepHeight * stepDepth * wM;
    }
    // Convert cu m to cu ft for bag logic
    totalVolumeCuFt = totalVolumeCuM * 35.3147;
  }

  const totalVolumeWithWasteCuFt = applyWasteFactor(totalVolumeCuFt, wastePercent);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeWithWasteCuFt);
  const totalVolumeCuM = totalVolumeWithWasteCuFt / 35.3147;

  // Bags needed
  const bags80 = calculateConcreteBags(totalVolumeWithWasteCuFt, "80lb");
  const bags60 = calculateConcreteBags(totalVolumeWithWasteCuFt, "60lb");
  const bags50 = calculateConcreteBags(totalVolumeWithWasteCuFt, "50lb");
  const bags40 = calculateConcreteBags(totalVolumeWithWasteCuFt, "40lb");

  const selectedBags = calculateConcreteBags(totalVolumeWithWasteCuFt, bagSize);
  const estimatedWeightLbs = estimateConcreteWeightLbs(totalVolumeWithWasteCuFt);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Inputs */}
      <div className="md:col-span-7 flex flex-col gap-6">
        <Card>
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Steps Geometry
            </h3>
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md text-xs">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  unitSystem === "imperial"
                    ? "bg-white text-black shadow-sm dark:bg-black dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
                onClick={() => setUnitSystem("imperial")}
              >
                Imperial (in)
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  unitSystem === "metric"
                    ? "bg-white text-black shadow-sm dark:bg-black dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
                onClick={() => setUnitSystem("metric")}
              >
                Metric (cm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Number of Steps"
              type="number"
              inputMode="numeric"
              autocomplete="off"
              value={numSteps}
              onChange={(e) => setNumSteps(e.target.value)}
              placeholder="e.g. 3…"
            />
            <Input
              label={unitSystem === "imperial" ? "Step Width (inches)" : "Step Width (cm)"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={stepWidth}
              onChange={(e) => setStepWidth(e.target.value)}
              placeholder="e.g. 36…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label={unitSystem === "imperial" ? "Step Rise (height)" : "Step Rise (height)"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={stepRise}
              onChange={(e) => setStepRise(e.target.value)}
              placeholder="e.g. 7…"
            />
            <Input
              label={unitSystem === "imperial" ? "Step Run (depth)" : "Step Run (depth)"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={stepRun}
              onChange={(e) => setStepRun(e.target.value)}
              placeholder="e.g. 11…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input
              label={unitSystem === "imperial" ? "Top Landing Extra Depth" : "Top Landing Extra Depth"}
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={landingDepth}
              onChange={(e) => setLandingDepth(e.target.value)}
              placeholder="e.g. 0…"
              helperText="Optional landing depth extension"
            />
            <Input
              label="Waste Factor (%)"
              type="number"
              inputMode="decimal"
              autocomplete="off"
              value={wasteFactor}
              onChange={(e) => setWasteFactor(e.target.value)}
              placeholder="e.g. 10…"
            />
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block cursor-pointer">
              Output Bag Size Config
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["40lb", "50lb", "60lb", "80lb"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBagSize(size)}
                  className={`border rounded-md py-2 text-xs font-semibold font-mono tracking-tight transition-all ${
                    bagSize === size
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-800 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Outputs */}
      <div className="md:col-span-5 flex flex-col gap-6">
        <Card className="bg-black text-white dark:bg-neutral-950 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-6">
              Steps Volume Output
            </h3>
            
            <div className="flex flex-col gap-6 mb-8">
              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Required Volume (With {wasteFactor}% Waste)
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {unitSystem === "imperial"
                      ? totalVolumeCuYd.toFixed(3)
                      : totalVolumeCuM.toFixed(3)}
                  </span>
                  <span className="text-lg text-neutral-400 font-semibold">
                    {unitSystem === "imperial" ? "cu yd" : "cu m"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 block mt-1 tabular-nums">
                  Yields {totalVolumeWithWasteCuFt.toFixed(2)} cu ft total
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Bags Needed ({bagSize} bags)
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    {selectedBags}
                  </span>
                  <span className="text-lg text-neutral-400 font-semibold">bags</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-1">
                  Estimated Weight
                </span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-xl font-bold tracking-tight text-neutral-200">
                    {Math.round(estimatedWeightLbs).toLocaleString()}&nbsp;lbs
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 dark:border-neutral-800 pt-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-2">
              ⚠️ Approved Supplier Link
            </span>
            <a
              href={`https://www.lowes.com/search?searchTerm=concrete+mix+${bagSize}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-850 px-4 py-3 rounded-md border border-neutral-800 hover:border-neutral-600 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Order {selectedBags} Bags at Lowe's</span>
                <span className="text-[10px] text-neutral-400">Pick up in store</span>
              </div>
              <svg
                className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </Card>

        {/* Bags Matrix */}
        <Card>
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-3">
            Bags Matrix By Size
          </h4>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500">
                <th className="py-2 font-medium">Bag Size</th>
                <th className="py-2 font-medium">Bag Yield</th>
                <th className="py-2 text-right font-medium">Required Bags</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">80 lb</td>
                <td className="py-2 text-neutral-500">0.60 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags80}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">60 lb</td>
                <td className="py-2 text-neutral-500">0.45 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags60}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">50 lb</td>
                <td className="py-2 text-neutral-500">0.375 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags50}</td>
              </tr>
              <tr className="border-b border-neutral-50/50 dark:border-neutral-900/50">
                <td className="py-2 font-medium text-neutral-800 dark:text-neutral-200">40 lb</td>
                <td className="py-2 text-neutral-500">0.30 cu ft</td>
                <td className="py-2 text-right font-bold text-neutral-950 dark:text-white">{bags40}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
