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

const STONE_TYPES = [
  { key: "concrete", label: "Concrete" },
  { key: "limestone", label: "Limestone" },
  { key: "granite", label: "Granite" },
  { key: "marble", label: "Marble" },
  { key: "sandstone", label: "Sandstone" },
];

const STONE_DENSITIES: Record<string, number> = {
  concrete: 150,
  limestone: 175,
  granite: 190,
  marble: 170,
  sandstone: 145,
};

function StoneWeightCalc() {
  const { t } = useI18n();
  const [stone, setStone] = useState("concrete");
  const [length, setLength] = useState("24");
  const [width, setWidth] = useState("24");
  const [thickness, setThickness] = useState("2");
  const [quantity, setQuantity] = useState("1");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("stone-weight", "Stone Weight Calculator");

  const s = stone;
  const l = parseNumber(length);
  const w = parseNumber(width);
  const thk = parseNumber(thickness);
  const qty = Math.max(1, parseNumber(quantity) || 1);
  const volCuIn = l * w * thk;
  const totalVol = volCuIn * qty;
  const cuFt = totalVol / 1728;
  const density = STONE_DENSITIES[s] || 150;
  const weightLbs = cuFt * density;
  const weightKg = weightLbs * 0.453592;
  const weightTons = weightLbs / 2000;
  const weight = calculateWeight(s, totalVol);
  const displayName = weight.materialName || s.charAt(0).toUpperCase() + s.slice(1);

  const projectInputs = { length: l, width: w, thickness: thk, quantity: qty };
  const projectResults = { totalVolCuIn: totalVol, cuFt, weightLbs, weightKg, weightTons };
  const projectMaterials: MaterialItem[] = [{ name: t('calculators.detail.weight.stone.name') ?? 'Stone', quantity: weightLbs, unit: "lbs", category: "weight" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">{t('calculators.detail.weight.stone.type') ?? 'Stone Type'}</label>
            <select value={stone} onChange={(e) => setStone(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {STONE_TYPES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.weight.stone.length') ?? 'Length (in)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="24" />
            <Input label={t('calculators.detail.weight.stone.width') ?? 'Width (in)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="24" />
            <Input label={t('calculators.detail.weight.stone.thickness') ?? 'Thickness (in)'} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="2" />
            <Input label={t('calculators.detail.weight.stone.quantity') ?? 'Quantity'} type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.weight.stone.results') ?? 'Stone Weight Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.stone.type') ?? 'Stone Type'}</span>
              <span className="text-sm font-semibold">{displayName}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.stone.volume') ?? 'Volume'}</span>
              <span className="text-sm font-semibold tabular-nums">{totalVol.toFixed(1)} cu in ({cuFt.toFixed(3)} cu ft)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{qty > 1 ? (t('calculators.detail.weight.stone.total_weight_lbs') ?? 'Total Weight (lbs)') : (t('calculators.detail.weight.stone.weight_lbs') ?? 'Weight (lbs)')}</span>
              <span className="text-sm font-bold tabular-nums">{weightLbs.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.stone.weight_kg') ?? 'Weight (kg)'}</span>
              <span className="text-sm font-semibold tabular-nums">{weightKg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.stone.weight_tons') ?? 'Weight (tons)'}</span>
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

export default withI18n(StoneWeightCalc);
