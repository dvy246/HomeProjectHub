import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

const ROOF_TYPES = [
  { value: "flat", label: "Flat / Shed Roof", costMultiplier: 1.0 },
  { value: "gable", label: "Gable Roof (4/12)", costMultiplier: 1.15 },
  { value: "gable_steep", label: "Gable Roof (6/12)", costMultiplier: 1.2 },
];

const SIDING_TYPES = [
  { value: "plywood", label: "Plywood T1-11", costSqft: 2.5 },
  { value: "vinyl", label: "Vinyl Siding", costSqft: 3.5 },
  { value: "metal", label: "Metal Siding", costSqft: 4.0 },
  { value: "cedar", label: "Cedar Shakes", costSqft: 6.0 },
];

const FLOOR_TYPES = [
  { value: "plywood", label: "Plywood (3/4\")", costSqft: 2.0 },
  { value: "osb", label: "OSB (3/4\")", costSqft: 1.5 },
  { value: "pressure", label: "Pressure Treated", costSqft: 3.0 },
];

export default function ShedCostCalc() {
  const [shedLength, setShedLength] = useState("8");
  const [shedWidth, setShedWidth] = useState("10");
  const [wallHeight, setWallHeight] = useState("7");
  const [roofType, setRoofType] = useState("gable");
  const [sidingType, setSidingType] = useState("plywood");
  const [floorType, setFloorType] = useState("plywood");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("shed-cost", "Shed Cost Calculator");

  const sl = parseNumber(shedLength);
  const sw = parseNumber(shedWidth);
  const wh = parseNumber(wallHeight);

  const floorSqFt = sl * sw;
  const wallArea = 2 * (sl + sw) * wh;
  const roofOverhang = 1;
  const roofSqFt = roofType === "flat"
    ? (sl + roofOverhang * 2) * (sw + roofOverhang * 2)
    : (sl + roofOverhang * 2) * (sw + roofOverhang * 2) * 1.15;
  const roofSquares = Math.ceil(roofSqFt / 100);

  const roofMultiplier = ROOF_TYPES.find((r) => r.value === roofType)?.costMultiplier || 1;
  const sidingCostSqft = SIDING_TYPES.find((s) => s.value === sidingType)?.costSqft || 2.5;
  const floorCostSqft = FLOOR_TYPES.find((f) => f.value === floorType)?.costSqft || 2;

  const floorCost = floorSqFt * floorCostSqft;
  const wallLumberCost = wallArea * 1.2;
  const sidingCost = wallArea * sidingCostSqft;
  const roofCost = roofSqFt * 3.5 * roofMultiplier;
  const hardwareCost = 150;
  const totalLow = Math.round((floorCost + wallLumberCost + sidingCost + roofCost + hardwareCost) * 0.9);
  const totalMid = Math.round(floorCost + wallLumberCost + sidingCost + roofCost + hardwareCost);
  const totalHigh = Math.round(totalMid * 1.15);

  const studCount = Math.ceil(sl / 1.33) * 2 + Math.ceil(sw / 1.33) * 2;
  const joistCount = Math.ceil(sl / 1.33) * sw;

  const projectInputs = { shedLength: sl, shedWidth: sw, wallHeight: wh };
  const projectResults = { floorSqFt, wallArea, roofSqFt, studCount, joistCount, totalLow, totalMid, totalHigh };
  const projectMaterials: MaterialItem[] = [
    { name: "Shed Materials (est)", quantity: Math.ceil(totalMid), unit: "dollars", category: "shed" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Shed Length (ft)" type="number" inputMode="decimal" value={shedLength} onChange={(e) => setShedLength(e.target.value)} placeholder="8" />
            <Input label="Shed Width (ft)" type="number" inputMode="decimal" value={shedWidth} onChange={(e) => setShedWidth(e.target.value)} placeholder="10" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="7" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Roof Type</label>
              <select value={roofType} onChange={(e) => setRoofType(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {ROOF_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Siding Type</label>
              <select value={sidingType} onChange={(e) => setSidingType(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {SIDING_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label} (${s.costSqft}/sq ft)</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Floor Material</label>
              <select value={floorType} onChange={(e) => setFloorType(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {FLOOR_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label} (${f.costSqft}/sq ft)</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <AddToProjectCard
          projects={projects}
          onAdd={(pid) => {
            clearSuccess();
            addToProject(pid, projectInputs, projectResults, projectMaterials);
          }}
          successMessage={projectSuccess}
        />
        <Card>
          <h3 className="text-sm font-semibold mb-3">Shed Material Estimate</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Floor Area</span>
              <span className="text-sm font-semibold tabular-nums">{floorSqFt.toFixed(0)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Wall Area</span>
              <span className="text-sm font-semibold tabular-nums">{wallArea.toFixed(0)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Roofing</span>
              <span className="text-sm font-semibold tabular-nums">{roofSquares} squares ({roofSqFt.toFixed(0)} sq ft)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Wall Studs (approx)</span>
              <span className="text-sm font-semibold tabular-nums">{studCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Floor Joists (approx)</span>
              <span className="text-sm font-semibold tabular-nums">{joistCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Est. Material Cost</span>
              <span className="text-sm font-bold tabular-nums">${totalLow} – ${totalHigh}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
