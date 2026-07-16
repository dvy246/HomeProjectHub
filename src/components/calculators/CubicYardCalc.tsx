import { useState, useEffect } from "react";
import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateCubicYards, cuFeetToCuYards, cuYardsToCuFeet } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function CubicYardCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"dimensions" | "cuft">("dimensions");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [depth, setDepth] = useState("4");
  const [cuFtInput, setCuFtInput] = useState("27");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("cubic-yard", "Cubic Yard Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [mode, length, width, depth, cuFtInput, onCalculate]);

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

  const projectInputs: Record<string, number> = mode === "dimensions" ? { length: len, width: wid, depth: dep } : { cubicFeet: cf };
  const projectResults = { cuYd, cuFt: totalCuFt, cuM };
  const projectMaterials: MaterialItem[] = [{ name: "Material Volume", quantity: cuYd, unit: "cu yd", category: "volume" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Select label={t('calculators.detail.converters.cubic_yard.calc_mode') ?? 'Calculation Mode'} value={mode} onChange={(v) => setMode(v as "dimensions" | "cuft")} options={[{ value: "dimensions", label: t('calculators.detail.converters.cubic_yard.by_dimensions') ?? 'By Dimensions' }, { value: "cuft", label: t('calculators.detail.converters.cubic_yard.by_cubic_feet') ?? 'By Cubic Feet' }]} />
          {mode === "dimensions" ? (
            <div className="grid grid-cols-3 gap-4">
              <Input label={t('fields.length_ft') ?? 'Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="10" />
              <Input label={t('fields.width_ft') ?? 'Width (ft)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="10" />
              <Input label={t('fields.depth_in') ?? 'Depth (in)'} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="4" />
            </div>
          ) : (
            <Input label={t('calculators.detail.converters.cubic_yard.cubic_feet') ?? 'Cubic Feet'} type="number" inputMode="decimal" value={cuFtInput} onChange={(e) => setCuFtInput(e.target.value)} placeholder="27" />
          )}
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.common.results') ?? 'Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.cu_yd') ?? 'Cubic Yards'}</span>
              <span className="text-sm font-bold tabular-nums">{cuYd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.cu_ft') ?? 'Cubic Feet'}</span>
              <span className="text-sm font-semibold tabular-nums">{totalCuFt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.cu_m') ?? 'Cubic Meters'}</span>
              <span className="text-sm font-semibold tabular-nums">{cuM.toFixed(3)}</span>
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

export default withI18n(CubicYardCalc);
