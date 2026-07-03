import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

interface MaterialOption {
  id: string;
  label: string;
}

interface Props {
  materials: MaterialOption[];
  defaultMaterial?: string;
  defaultLength?: string;
  defaultWidth?: string;
  defaultThickness?: string;
  showQuantity?: boolean;
}

export default function WeightCalc({
  materials,
  defaultMaterial,
  defaultLength = "12",
  defaultWidth = "12",
  defaultThickness = "0.5",
  showQuantity = false,
}: Props) {
  const [material, setMaterial] = useState(defaultMaterial || materials[0]?.id || "");
  const [length, setLength] = useState(defaultLength);
  const [width, setWidth] = useState(defaultWidth);
  const [thickness, setThickness] = useState(defaultThickness);
  const [quantity, setQuantity] = useState("1");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("weight", "Weight Calculator");

  const l = parseNumber(length);
  const w = parseNumber(width);
  const t = parseNumber(thickness);
  const qty = Math.max(1, parseNumber(quantity) || 1);
  const volPerUnit = l * w * t;
  const totalVol = volPerUnit * qty;
  const weight = calculateWeight(material, totalVol);
  const weightEach = volPerUnit > 0 ? calculateWeight(material, volPerUnit) : { lb: 0, kg: 0, materialName: "" };
  const weightTons = weight.lb / 2000;

  const projectInputs = { length: l, width: w, thickness: t, quantity: qty };
  const projectResults = { weightLbs: weight.lb, weightKg: weight.kg, weightTons };
  const projectMaterials: MaterialItem[] = [{ name: weight.materialName || "Material", quantity: weight.lb, unit: "lbs", category: "weight" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Material</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {materials.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Length (in)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="12" />
            <Input label="Width (in)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="12" />
            <Input label="Thickness (in)" type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="0.5" />
          </div>
          {showQuantity && (
            <div className="mt-4">
              <Input label="Quantity" type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
            </div>
          )}
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Weight Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Material</span>
              <span className="text-sm font-semibold">{weight.materialName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Volume</span>
              <span className="text-sm font-semibold tabular-nums">{totalVol.toFixed(2)} cu in</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{qty > 1 ? "Total Weight (lbs)" : "Weight (lbs)"}</span>
              <span className="text-sm font-bold tabular-nums">{weight.lb.toFixed(2)}</span>
            </div>
            {qty > 1 && (
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="text-xs text-[var(--fg-secondary)]">Weight Each (lbs)</span>
                <span className="text-sm font-semibold tabular-nums">{weightEach.lb.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Weight (kg)</span>
              <span className="text-sm font-semibold tabular-nums">{weight.kg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Weight (tons)</span>
              <span className="text-sm font-semibold tabular-nums">{weightTons.toFixed(4)}</span>
            </div>
          </div>
        </Card>
          <AddToProjectCard
            projects={projects}
            onAdd={(pid) => {
              clearSuccess();
              addToProject(pid, projectInputs, projectResults, projectMaterials);
            }}
            successMessage={projectSuccess}
          />
      </div>
    </div>
  );
}
