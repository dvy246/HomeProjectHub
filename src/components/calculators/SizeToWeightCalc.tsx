import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";

const MATERIALS = [
  { key: "aluminum_6061", label: "Aluminum 6061" },
  { key: "steel_a36", label: "Steel A36" },
  { key: "copper", label: "Copper" },
  { key: "glass_annealed", label: "Annealed Glass" },
  { key: "lumber_pine", label: "Pine (Wood)" },
  { key: "lumber_oak", label: "Oak (Wood)" },
  { key: "concrete", label: "Concrete" },
];

export default function SizeToWeightCalc() {
  const [material, setMaterial] = useState("steel_a36");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("12");
  const [thickness, setThickness] = useState("0.25");

  const l = parseNumber(length);
  const w = parseNumber(width);
  const t = parseNumber(thickness);
  const volumeCuIn = l * w * t;
  const weight = calculateWeight(material, volumeCuIn);
  const weightLbs = weight.lb;
  const weightKg = weight.kg;
  const weightTons = weightLbs / 2000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Material</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {MATERIALS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Length (in)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="12" />
            <Input label="Width (in)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="12" />
            <Input label="Thickness (in)" type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="0.25" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Volume</span>
              <span className="text-sm font-semibold tabular-nums">{volumeCuIn.toFixed(2)} cu in</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Weight (lbs)</span>
              <span className="text-sm font-bold tabular-nums">{weightLbs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Weight (kg)</span>
              <span className="text-sm font-semibold tabular-nums">{weightKg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Weight (tons)</span>
              <span className="text-sm font-semibold tabular-nums">{weightTons.toFixed(4)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
