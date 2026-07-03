import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { sqftToCuYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

export default function SqFtToCuYdCalc() {
  const [sqft, setSqft] = useState("100");
  const [depth, setDepth] = useState("4");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("sq-ft-to-cu-yard", "Sq Ft to Cu Yd Calculator");

  const sf = parseNumber(sqft);
  const d = parseNumber(depth);
  const cuYd = sqftToCuYd(sf, d);
  const cuFt = sf * (d / 12);

  const projectInputs = { sqft: sf, depth: d };
  const projectResults = { cuYd, cuFt };
  const projectMaterials: MaterialItem[] = [{ name: "Material Volume", quantity: cuYd, unit: "cu yd", category: "volume" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Square Footage" type="number" inputMode="decimal" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="100" />
            <Input label="Depth (in)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="4" />
          </div>
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
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Cubic Feet</span>
              <span className="text-sm font-semibold tabular-nums">{cuFt.toFixed(2)}</span>
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
