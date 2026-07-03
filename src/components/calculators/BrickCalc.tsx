import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

const BRICK_TYPES = [
  { key: "modular", label: "Modular (2.25″ × 7.625″)", height: 2.25, depth: 7.625, mortar: 0.375 },
  { key: "standard", label: "Standard (2.25″ × 8″)", height: 2.25, depth: 8, mortar: 0.375 },
  { key: "jumbo", label: "Jumbo (2.75″ × 8″)", height: 2.75, depth: 8, mortar: 0.375 },
  { key: "roman", label: "Roman (2″ × 12″)", height: 2, depth: 12, mortar: 0.375 },
];

export default function BrickCalc() {
  const [brickType, setBrickType] = useState("modular");
  const [wallLength, setWallLength] = useState("20");
  const [wallHeight, setWallHeight] = useState("8");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("brick", "Brick Calculator");

  const bt = BRICK_TYPES.find((b) => b.key === brickType) || BRICK_TYPES[0];
  const wl = parseNumber(wallLength);
  const wh = parseNumber(wallHeight);
  const ws = parseNumber(waste) / 100;
  const brickH = bt.height + bt.mortar;
  const brickD = bt.depth + bt.mortar;
  const bricksPerSqFt = (12 / brickH) * (12 / brickD);
  const wallSqFt = wl * wh;
  const bricksNeeded = Math.ceil(wallSqFt * bricksPerSqFt);
  const bricksWithWaste = Math.ceil(bricksNeeded * (1 + ws));

  const projectInputs = { wallLength: wl, wallHeight: wh, waste: ws };
  const projectResults = { wallSqFt, bricksPerSqFt, bricksNeeded, bricksWithWaste };
  const projectMaterials: MaterialItem[] = [
    { name: "Bricks", quantity: bricksWithWaste, unit: "bricks", category: "masonry" },
    { name: "Mortar Mix (est)", quantity: Math.ceil(bricksWithWaste * 0.015), unit: "bags", category: "masonry" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Brick Type</label>
            <select value={brickType} onChange={(e) => setBrickType(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {BRICK_TYPES.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Wall Length (ft)" type="number" inputMode="decimal" value={wallLength} onChange={(e) => setWallLength(e.target.value)} placeholder="20" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="8" />
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
          <h3 className="text-sm font-semibold mb-3">Brick Estimate</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Wall Area</span>
              <span className="text-sm font-semibold tabular-nums">{wallSqFt.toFixed(1)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Bricks per Sq Ft</span>
              <span className="text-sm font-semibold tabular-nums">{bricksPerSqFt.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Bricks Needed</span>
              <span className="text-sm font-bold tabular-nums">{bricksNeeded}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">With {parseNumber(waste).toFixed(0)}% Waste</span>
              <span className="text-sm font-bold tabular-nums">{bricksWithWaste}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
