import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { PRESETS } from "../../lib/presets";
import { sqftToCuYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

interface AggregateOption {
  id: string;
  label: string;
  tonsPerCuYd: number;
}

interface Props {
  aggregates: AggregateOption[];
  defaultKey?: string;
  calculatorLabel?: string;
}

export default function AggregateCalc({ aggregates, defaultKey, calculatorLabel = "Material" }: Props) {
  const [aggId, setAggId] = useState(defaultKey || aggregates[0]?.id || "");
  const [sqft, setSqft] = useState("100");
  const [depth, setDepth] = useState("4");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("aggregate", "Aggregate Calculator");

  const agg = aggregates.find((a) => a.id === aggId) || aggregates[0];

  if (!agg) {
    return (
      <Card>
        <p className="text-sm text-[var(--fg-secondary)]">No materials configured.</p>
      </Card>
    );
  }

  const sf = parseNumber(sqft);
  const d = parseNumber(depth);
  const ws = parseNumber(waste) / 100;
  const cuYd = sqftToCuYd(sf, d);
  const tons = cuYd * (agg?.tonsPerCuYd ?? 0);
  const tonsWaste = tons * (1 + ws);
  const lbs = tons * 2000;
  const cuFt = cuYd * 27;

  const projectInputs = { sqft: sf, depth: d, wastePct: ws * 100 };
  const projectResults = { cuYd, tons, tonsWaste, lbs, cuFt };
  const projectMaterials: MaterialItem[] = [{ name: agg?.label || "Aggregate", quantity: tonsWaste, unit: "tons", category: "aggregate" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]">Area & Depth Presets</label>
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.landscaping[idx];
                  const l = parseFloat(p.length);
                  const w = parseFloat(p.width);
                  setSqft((l * w).toString());
                  setDepth(p.depth || "4");
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-9 px-2.5 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
            >
              {PRESETS.landscaping.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">{calculatorLabel} Type</label>
            <select value={aggId} onChange={(e) => setAggId(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
               {aggregates.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Area (sq ft)" type="number" inputMode="decimal" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="100" />
            <Input label="Depth (in)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="4" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="10" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{agg?.label || calculatorLabel} Estimate</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Volume</span>
              <span className="text-sm font-semibold tabular-nums">{cuYd.toFixed(2)} cu yd ({cuFt.toFixed(1)} cu ft)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Weight</span>
              <span className="text-sm font-semibold tabular-nums">{tons.toFixed(2)} tons ({lbs.toFixed(0)} lbs)</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">With {parseNumber(waste).toFixed(0)}% Waste</span>
              <span className="text-sm font-bold tabular-nums">{tonsWaste.toFixed(2)} tons</span>
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
