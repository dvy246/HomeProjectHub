import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";

const PIPE_MATERIALS = [
  { key: "steel_a36", label: "Steel (A36)" },
  { key: "steel_stainless_304", label: "Stainless Steel 304" },
  { key: "aluminum_6061", label: "Aluminum 6061" },
  { key: "copper", label: "Copper" },
  { key: "brass", label: "Brass" },
];

export default function PipeWeightCalc() {
  const [material, setMaterial] = useState("steel_a36");
  const [od, setOd] = useState("4");
  const [wall, setWall] = useState("0.25");
  const [length, setLength] = useState("12");
  const [quantity, setQuantity] = useState("1");

  const outerD = parseNumber(od);
  const wallT = parseNumber(wall);
  const len = parseNumber(length);
  const qty = Math.max(1, parseNumber(quantity) || 1);
  const innerD = Math.max(0, outerD - 2 * wallT);
  const outerR = outerD / 2;
  const innerR = innerD / 2;
  const volPerLen = Math.PI * (outerR * outerR - innerR * innerR) * len;
  const totalVol = volPerLen * qty;
  const weight = calculateWeight(material, totalVol);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Material</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {PIPE_MATERIALS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Outer Diameter (in)" type="number" inputMode="decimal" value={od} onChange={(e) => setOd(e.target.value)} placeholder="4" />
            <Input label="Wall Thickness (in)" type="number" inputMode="decimal" value={wall} onChange={(e) => setWall(e.target.value)} placeholder="0.25" />
            <Input label="Length (in)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="12" />
            <Input label="Quantity" type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Pipe Weight Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Material</span>
              <span className="text-sm font-semibold">{weight.materialName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Inner Diameter</span>
              <span className="text-sm font-semibold tabular-nums">{innerD.toFixed(3)} in</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{qty > 1 ? "Total Weight (lbs)" : "Weight (lbs)"}</span>
              <span className="text-sm font-bold tabular-nums">{weight.lb.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Weight (kg)</span>
              <span className="text-sm font-semibold tabular-nums">{weight.kg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Weight per ft (lbs)</span>
              <span className="text-sm font-semibold tabular-nums">{len > 0 ? ((weight.lb / len) * 12).toFixed(2) : "0.00"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
