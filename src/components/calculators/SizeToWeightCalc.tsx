import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const MATERIALS = [
  { key: "aluminum_6061", label: "Aluminum 6061" },
  { key: "steel_a36", label: "Steel A36" },
  { key: "copper", label: "Copper" },
  { key: "glass_annealed", label: "Annealed Glass" },
  { key: "lumber_pine", label: "Pine (Wood)" },
  { key: "lumber_oak", label: "Oak (Wood)" },
  { key: "concrete", label: "Concrete" },
];

function SizeToWeightCalc() {
  const { t } = useI18n();
  const [material, setMaterial] = useState("steel_a36");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("12");
  const [thickness, setThickness] = useState("0.25");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("size-to-weight", "Size to Weight Calculator");

  const l = parseNumber(length);
  const w = parseNumber(width);
  const thk = parseNumber(thickness);
  const volumeCuIn = l * w * thk;
  const weight = calculateWeight(material, volumeCuIn);
  const weightLbs = weight.lb;
  const weightKg = weight.kg;
  const weightTons = weightLbs / 2000;

  const projectInputs = { length: l, width: w, thickness: thk, volumeCuIn };
  const projectResults = { weightLbs, weightKg, weightTons };
  const projectMaterials: MaterialItem[] = [{ name: t('calculators.detail.weight.size_to_weight.name') ?? 'Material', quantity: weightLbs, unit: "lbs", category: "weight" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">{t('calculators.detail.weight.size_to_weight.material') ?? 'Material'}</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {MATERIALS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label={t('calculators.detail.weight.size_to_weight.length') ?? 'Length (in)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="12" />
            <Input label={t('calculators.detail.weight.size_to_weight.width') ?? 'Width (in)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="12" />
            <Input label={t('calculators.detail.weight.size_to_weight.thickness') ?? 'Thickness (in)'} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="0.25" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.weight.size_to_weight.results') ?? 'Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.size_to_weight.volume') ?? 'Volume'}</span>
              <span className="text-sm font-semibold tabular-nums">{volumeCuIn.toFixed(2)} cu in</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.size_to_weight.weight_lbs') ?? 'Weight (lbs)'}</span>
              <span className="text-sm font-bold tabular-nums">{weightLbs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.size_to_weight.weight_kg') ?? 'Weight (kg)'}</span>
              <span className="text-sm font-semibold tabular-nums">{weightKg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.size_to_weight.weight_tons') ?? 'Weight (tons)'}</span>
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

export default withI18n(SizeToWeightCalc);
