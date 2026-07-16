import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const WOOD_TYPES = [
  { key: "lumber_douglas_fir", label: "Douglas Fir" },
  { key: "lumber_oak", label: "Oak" },
  { key: "lumber_pine", label: "Pine" },
  { key: "lumber_cedar", label: "Cedar" },
  { key: "lumber_maple", label: "Maple" },
  { key: "lumber_walnut", label: "Walnut" },
];

function LogWeightCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [wood, setWood] = useState("lumber_pine");
  const [diameter, setDiameter] = useState("12");
  const [length, setLength] = useState("96");
  const [quantity, setQuantity] = useState("1");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("log-weight", "Log Weight Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [wood, diameter, length, quantity, onCalculate]);

  const d = parseNumber(diameter);
  const len = parseNumber(length);
  const qty = Math.max(1, parseNumber(quantity) || 1);
  const radius = d / 2;
  const volPerLog = Math.PI * radius * radius * len;
  const totalVol = volPerLog * qty;
  const weight = calculateWeight(wood, totalVol);
  const weightEach = volPerLog > 0 ? calculateWeight(wood, volPerLog) : { lb: 0, kg: 0, materialName: "" };

  const projectInputs = { diameter: d, length: len, quantity: qty };
  const projectResults = { totalWeightLbs: weight.lb, totalWeightKg: weight.kg, volPerLog };
  const projectMaterials: MaterialItem[] = [{ name: weight.materialName || (t('calculators.detail.weight.log.name') ?? 'Logs'), quantity: weight.lb, unit: "lbs", category: "weight" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">{t('calculators.detail.weight.log.wood_type') ?? 'Wood Type'}</label>
            <select value={wood} onChange={(e) => setWood(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {WOOD_TYPES.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label={t('calculators.detail.weight.log.diameter') ?? 'Diameter (in)'} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="12" />
            <Input label={t('calculators.detail.weight.log.length') ?? 'Length (in)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="96" />
            <Input label={t('calculators.detail.weight.log.quantity') ?? 'Quantity'} type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.weight.log.results') ?? 'Log Weight Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.log.wood_type') ?? 'Wood Type'}</span>
              <span className="text-sm font-semibold">{weight.materialName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.log.volume_per_log') ?? 'Volume per Log'}</span>
              <span className="text-sm font-semibold tabular-nums">{volPerLog.toFixed(1)} cu in</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{qty > 1 ? (t('calculators.detail.weight.log.total_weight_lbs') ?? 'Total Weight (lbs)') : (t('calculators.detail.weight.log.weight_lbs') ?? 'Weight (lbs)')}</span>
              <span className="text-sm font-bold tabular-nums">{weight.lb.toFixed(2)}</span>
            </div>
            {qty > 1 && (
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.log.weight_per_log_lbs') ?? 'Weight per Log (lbs)'}</span>
                <span className="text-sm font-semibold tabular-nums">{weightEach.lb.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.log.weight_kg') ?? 'Weight (kg)'}</span>
              <span className="text-sm font-semibold tabular-nums">{weight.kg.toFixed(2)}</span>
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

export default withI18n(LogWeightCalc);
