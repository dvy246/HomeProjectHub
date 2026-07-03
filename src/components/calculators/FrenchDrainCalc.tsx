import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { sqftToCuYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import FrenchDrainDiagram from "../diagrams/FrenchDrainDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

const GRAVEL = { tonsPerCuYd: 1.4, label: "Drainage Gravel" };

export default function FrenchDrainCalc() {
  const [length, setLength] = useState("50");
  const [width, setWidth] = useState("12");
  const [depth, setDepth] = useState("18");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("french-drain", "French Drain Calculator");

  const l = parseNumber(length);
  const w = parseNumber(width);
  const d = parseNumber(depth);
  const trenchVol = (l * (w / 12) * (d / 12));
  const gravelVol = trenchVol * 0.67;
  const cuYd = gravelVol / 27;
  const tons = cuYd * GRAVEL.tonsPerCuYd;
  const pipeLength = l;
  const fabricSqFt = (l * (w / 12)) + (l * (d / 12) * 2);

  const projectInputs = { length: l, width: w, depth: d };
  const projectResults = { trenchVolCuFt: trenchVol, gravelCuYd: cuYd, gravelTons: tons, pipeLength, fabricSqFt };
  const projectMaterials: MaterialItem[] = [
    { name: "Perforated Pipe", quantity: pipeLength, unit: "lf", category: "drainage" },
    { name: "Drainage Gravel", quantity: cuYd, unit: "cu yd", category: "aggregate" },
    { name: "Filter Fabric", quantity: fabricSqFt, unit: "sq ft", category: "drainage" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Trench Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="50" />
            <Input label="Trench Width (in)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="12" />
            <Input label="Trench Depth (in)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="18" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <FrenchDrainDiagram length={l} width={w} depth={d} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">French Drain Materials</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Trench Volume</span>
              <span className="text-sm font-semibold tabular-nums">{(trenchVol).toFixed(1)} cu ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Gravel (67% fill)</span>
              <span className="text-sm font-bold tabular-nums">{cuYd.toFixed(2)} cu yd ({tons.toFixed(2)} tons)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Perforated Pipe</span>
              <span className="text-sm font-semibold tabular-nums">{pipeLength.toFixed(0)} ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Filter Fabric</span>
              <span className="text-sm font-semibold tabular-nums">{fabricSqFt.toFixed(0)} sq ft</span>
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
