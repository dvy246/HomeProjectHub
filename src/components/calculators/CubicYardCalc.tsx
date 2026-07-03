import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateCubicYards, cuFeetToCuYards, cuYardsToCuFeet } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";

export default function CubicYardCalc() {
  const [mode, setMode] = useState<"dimensions" | "cuft">("dimensions");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [depth, setDepth] = useState("4");
  const [cuFtInput, setCuFtInput] = useState("27");

  const len = parseNumber(length);
  const wid = parseNumber(width);
  const dep = parseNumber(depth);
  const cf = parseNumber(cuFtInput);

  let cuYd = 0, totalCuFt = 0, cuM = 0;
  if (mode === "dimensions") {
    cuYd = calculateCubicYards(len, wid, dep);
    totalCuFt = cuYd * 27;
  } else {
    totalCuFt = cf;
    cuYd = cuFeetToCuYards(cf);
  }
  cuM = totalCuFt * 0.0283168;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex gap-2 mb-4">
            <button type="button" onClick={() => setMode("dimensions")} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${mode === "dimensions" ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>By Dimensions</button>
            <button type="button" onClick={() => setMode("cuft")} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${mode === "cuft" ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>By Cubic Feet</button>
          </div>
          {mode === "dimensions" ? (
            <div className="grid grid-cols-3 gap-4">
              <Input label="Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="10" />
              <Input label="Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="10" />
              <Input label="Depth (in)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="4" />
            </div>
          ) : (
            <Input label="Cubic Feet" type="number" inputMode="decimal" value={cuFtInput} onChange={(e) => setCuFtInput(e.target.value)} placeholder="27" />
          )}
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Cubic Yards</span>
              <span className="text-sm font-bold tabular-nums">{cuYd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Cubic Feet</span>
              <span className="text-sm font-semibold tabular-nums">{totalCuFt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Cubic Meters</span>
              <span className="text-sm font-semibold tabular-nums">{cuM.toFixed(3)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
