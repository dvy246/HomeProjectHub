import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateCircleArea, calculateRectArea } from "../../lib/geometry";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";

export default function FireGlassCalc() {
  const [shape, setShape] = useState<"round" | "square">("round");
  const [diameter, setDiameter] = useState("24");
  const [length, setLength] = useState("24");
  const [width, setWidth] = useState("24");
  const [depth, setDepth] = useState("2");

  const d = parseNumber(diameter);
  const l = parseNumber(length);
  const w = parseNumber(width);
  const dep = parseNumber(depth);
  const area = shape === "round" ? calculateCircleArea(d / 2 / 12) : calculateRectArea(l / 12, w / 12);
  const depthFt = dep / 12;
  const cuFt = area * depthFt;
  const cuIn = cuFt * 1728;
  const weight = calculateWeight("glass_annealed", cuIn);
  const lbs = weight.lb;
  const bags5lb = Math.ceil(lbs / 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setShape("round")} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${shape === "round" ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>Round Fire Pit</button>
            <button type="button" onClick={() => setShape("square")} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${shape === "square" ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>Square Fire Pit</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shape === "round" ? (
              <Input label="Diameter (in)" type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="24" className="col-span-2" />
            ) : (
              <><Input label="Length (in)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="24" /><Input label="Width (in)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="24" /></>
            )}
            <Input label="Desired Depth (in)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="2" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Fire Glass Needed</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Area</span>
              <span className="text-sm font-semibold tabular-nums">{area.toFixed(2)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Volume</span>
              <span className="text-sm font-semibold tabular-nums">{cuFt.toFixed(3)} cu ft ({cuIn.toFixed(0)} cu in)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Weight Needed</span>
              <span className="text-sm font-bold tabular-nums">{lbs.toFixed(1)} lbs</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">5 lb Bags</span>
              <span className="text-sm font-bold tabular-nums">{bags5lb}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
