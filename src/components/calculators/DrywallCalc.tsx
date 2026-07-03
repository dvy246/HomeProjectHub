import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateDrywallSheets } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

const SHEET_SIZES = ["4x8", "4x10", "4x12"] as const;

export default function DrywallCalc() {
  const [wallLengths, setWallLengths] = useState("40");
  const [wallHeight, setWallHeight] = useState("8");
  const [sheetSize, setSheetSize] = useState<"4x8" | "4x10" | "4x12">("4x8");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("drywall", "Drywall Calculator");

  const wl = parseNumber(wallLengths);
  const wh = parseNumber(wallHeight);
  const ws = parseNumber(waste) / 100;

  const wallArea = wl * wh;
  const result = calculateDrywallSheets(wallArea, sheetSize);
  const sheetsWithWaste = Math.ceil(result.sheets * (1 + ws));

  const projectInputs = { wallLengths: wl, wallHeight: wh, waste: ws };
  const projectResults = { sheets: result.sheets, sheetsWithWaste, jointTapeLf: result.tapeLf, jointCompoundLb: result.mudLb, screwsLb: result.screwsLb };
  const projectMaterials: MaterialItem[] = [
    { name: "Drywall Sheets", quantity: sheetsWithWaste, unit: "sheets", category: "drywall" },
    { name: "Joint Tape", quantity: result.tapeLf, unit: "lf", category: "drywall" },
    { name: "Joint Compound", quantity: result.mudLb, unit: "lb", category: "drywall" },
    { name: "Drywall Screws", quantity: result.screwsLb, unit: "lb", category: "drywall" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Wall Length (ft)" type="number" inputMode="decimal" value={wallLengths} onChange={(e) => setWallLengths(e.target.value)} placeholder="40" helperText="Sum of all wall lengths" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="8" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Sheet Size</label>
              <select value={sheetSize} onChange={(e) => setSheetSize(e.target.value as "4x8" | "4x10" | "4x12")} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {SHEET_SIZES.map((size) => (
                  <option key={size} value={size}>{size} ({size === "4x8" ? 32 : size === "4x10" ? 40 : 48} sq ft)</option>
                ))}
              </select>
            </div>
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="10" />
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
          <h3 className="text-sm font-semibold mb-3">Drywall Materials</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Wall Area</span>
              <span className="text-sm font-semibold tabular-nums">{wallArea.toFixed(0)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{sheetSize} Sheets</span>
              <span className="text-sm font-bold tabular-nums">{result.sheets}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">With {parseNumber(waste).toFixed(0)}% Waste</span>
              <span className="text-sm font-bold tabular-nums">{sheetsWithWaste}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Joint Tape</span>
              <span className="text-sm font-semibold tabular-nums">{result.tapeLf} lf</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Joint Compound</span>
              <span className="text-sm font-semibold tabular-nums">{result.mudLb} lb</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Drywall Screws</span>
              <span className="text-sm font-semibold tabular-nums">{result.screwsLb} lb</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
