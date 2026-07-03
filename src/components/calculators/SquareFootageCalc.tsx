import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateRectArea, calculateLShapeArea, calculateTriangleArea, calculateCircleAreaFromDiameter, sqftToSqYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";

type Shape = "rectangle" | "lshape" | "triangle" | "circle";

export default function SquareFootageCalc() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("10");
  const [lenA, setLenA] = useState("12");
  const [widA, setWidA] = useState("8");
  const [lenB, setLenB] = useState("6");
  const [widB, setWidB] = useState("4");
  const [base, setBase] = useState("10");
  const [height, setHeight] = useState("8");
  const [diameter, setDiameter] = useState("10");

  let area = 0;
  switch (shape) {
    case "rectangle":
      area = calculateRectArea(parseNumber(length), parseNumber(width));
      break;
    case "lshape":
      area = calculateLShapeArea(parseNumber(lenA), parseNumber(widA), parseNumber(lenB), parseNumber(widB));
      break;
    case "triangle":
      area = calculateTriangleArea(parseNumber(base), parseNumber(height));
      break;
    case "circle":
      area = calculateCircleAreaFromDiameter(parseNumber(diameter));
      break;
  }

  const sqMeters = area * 0.092903;
  const sqYards = sqftToSqYd(area);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex flex-wrap gap-2 mb-4">
            {(["rectangle", "lshape", "triangle", "circle"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setShape(s)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${shape === s ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>
                {s === "rectangle" ? "Rectangle" : s === "lshape" ? "L-Shape" : s === "triangle" ? "Triangle" : "Circle"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {shape === "rectangle" && (
              <><Input label="Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} /><Input label="Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} /></>
            )}
            {shape === "lshape" && (
              <><Input label="Section A - Length (ft)" type="number" inputMode="decimal" value={lenA} onChange={(e) => setLenA(e.target.value)} /><Input label="Section A - Width (ft)" type="number" inputMode="decimal" value={widA} onChange={(e) => setWidA(e.target.value)} /><Input label="Section B - Length (ft)" type="number" inputMode="decimal" value={lenB} onChange={(e) => setLenB(e.target.value)} /><Input label="Section B - Width (ft)" type="number" inputMode="decimal" value={widB} onChange={(e) => setWidB(e.target.value)} /></>
            )}
            {shape === "triangle" && (
              <><Input label="Base (ft)" type="number" inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} /><Input label="Height (ft)" type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} /></>
            )}
            {shape === "circle" && (
              <Input label="Diameter (ft)" type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="col-span-2" />
            )}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Square Feet</span>
              <span className="text-sm font-bold tabular-nums">{area.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Square Yards</span>
              <span className="text-sm font-semibold tabular-nums">{sqYards.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Square Meters</span>
              <span className="text-sm font-semibold tabular-nums">{sqMeters.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
