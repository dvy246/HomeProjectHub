import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import RetainingWallDiagram from "../diagrams/RetainingWallDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

export default function RetainingWallCalc() {
  const [wallLength, setWallLength] = useState("20");
  const [wallHeight, setWallHeight] = useState("4");
  const [blockHeight, setBlockHeight] = useState("8");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("retaining-wall", "Retaining Wall Calculator");

  const wl = parseNumber(wallLength);
  const wh = parseNumber(wallHeight);
  const bh = parseNumber(blockHeight);
  const ws = parseNumber(waste) / 100;

  const blocksPerRow = Math.ceil((wl * 12) / 16);
  const rows = bh > 0 ? Math.ceil((wh * 12) / bh) : 0;
  const blockCount = blocksPerRow * rows;
  const blockWithWaste = Math.ceil(blockCount * (1 + ws));
  const capBlocks = blocksPerRow;
  const baseCuYd = (wl * 2 * 0.5) / 27;
  const drainCuYd = (wl * 1 * 0.5) / 27;

  const projectInputs = { wallLength: wl, wallHeight: wh, blockHeight: bh, waste: ws };
  const projectResults = { blockCount, blockWithWaste, capBlocks, baseCuYd, drainCuYd };
  const projectMaterials: MaterialItem[] = [
    { name: "Wall Blocks", quantity: blockCount, unit: "blocks", category: "retaining-wall" },
    { name: "Cap Blocks", quantity: capBlocks, unit: "blocks", category: "retaining-wall" },
    { name: "Base Gravel", quantity: baseCuYd, unit: "cu yd", category: "retaining-wall" },
    { name: "Drainage Gravel", quantity: drainCuYd, unit: "cu yd", category: "retaining-wall" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Wall Length (ft)" type="number" inputMode="decimal" value={wallLength} onChange={(e) => setWallLength(e.target.value)} placeholder="20" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="4" />
            <Input label="Block Height (in)" type="number" inputMode="decimal" value={blockHeight} onChange={(e) => setBlockHeight(e.target.value)} placeholder="8" />
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <RetainingWallDiagram length={wl} height={wh} baseWidth={2} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">Retaining Wall Estimate</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Blocks per Row</span>
              <span className="text-sm font-semibold tabular-nums">{blocksPerRow}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Number of Rows</span>
              <span className="text-sm font-semibold tabular-nums">{rows}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Blocks Needed</span>
              <span className="text-sm font-bold tabular-nums">{blockCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Cap Blocks</span>
              <span className="text-sm font-semibold tabular-nums">{capBlocks}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">With {parseNumber(waste).toFixed(0)}% Waste</span>
              <span className="text-sm font-bold tabular-nums">{blockWithWaste}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Base Gravel (cu yd)</span>
              <span className="text-sm font-semibold tabular-nums">{baseCuYd.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
