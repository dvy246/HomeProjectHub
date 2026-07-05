import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateBoardFeet } from "../../lib/geometry";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const SPECIES = [
  { key: "lumber_douglas_fir", name: "Douglas Fir" },
  { key: "lumber_oak", name: "Oak" },
  { key: "lumber_pine", name: "Pine" },
  { key: "lumber_cedar", name: "Cedar" },
  { key: "lumber_maple", name: "Maple" },
  { key: "lumber_walnut", name: "Walnut" },
];

function LumberCalc() {
  const { t } = useI18n();
  const [length, setLength] = useState("8");
  const [width, setWidth] = useState("6");
  const [thickness, setThickness] = useState("1");
  const [quantity, setQuantity] = useState("10");
  const [species, setSpecies] = useState("lumber_douglas_fir");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("lumber", "Lumber Calculator");

  const l = parseNumber(length);
  const w = parseNumber(width);
  const thk = parseNumber(thickness);
  const qty = Math.max(1, parseNumber(quantity) || 1);

  const bdFt = calculateBoardFeet(l * 12, w, thk, qty);
  const volumeCuIn = (l * 12) * w * thk * qty;
  const weight = calculateWeight(species, volumeCuIn);
  const perPieceBdFt = bdFt / qty;
  const cuFt = (l * (w / 12) * (thk / 12)) * qty;

  const projectInputs = { length: l, width: w, thickness: thk, quantity: qty };
  const projectResults = { boardFeet: bdFt, perPieceBdFt, cuFt, totalWeightLb: weight.lb };
  const projectMaterials: MaterialItem[] = [
    { name: "Lumber Boards", quantity: qty, unit: "pieces", category: "lumber" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.wood.lumber.length_ft') ?? 'Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '8'} />
            <Input label={t('calculators.detail.wood.lumber.width_in') ?? 'Width (in)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '6'} />
            <Input label={t('calculators.detail.wood.lumber.thickness_in') ?? 'Thickness (in)'} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '1'} />
            <Input label={t('calculators.detail.wood.lumber.quantity') ?? 'Quantity'} type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '10'} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.detail.wood.lumber.species') ?? 'Species'}</label>
              <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {SPECIES.map((s) => (
                  <option key={s.key} value={s.key}>{s.name}</option>
                ))}
              </select>
            </div>
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
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.wood.lumber.estimate') ?? 'Lumber Estimate'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.lumber.board_feet_total') ?? 'Board Feet (total)'}</span>
              <span className="text-sm font-bold tabular-nums">{bdFt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.lumber.per_piece') ?? 'Per Piece'}</span>
              <span className="text-sm font-semibold tabular-nums">{perPieceBdFt.toFixed(2)} {t('calculators.detail.wood.lumber.bd_ft') ?? 'bd ft'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.lumber.cubic_feet') ?? 'Cubic Feet'}</span>
              <span className="text-sm font-semibold tabular-nums">{cuFt.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.lumber.total_weight') ?? 'Total Weight'} ({weight.materialName})</span>
              <span className="text-sm font-bold tabular-nums">{weight.lb.toFixed(1)} {t('units.lbs') ?? 'lb'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.lumber.weight_per_piece') ?? 'Weight per Piece'}</span>
              <span className="text-sm font-semibold tabular-nums">{(weight.lb / qty).toFixed(1)} {t('units.lbs') ?? 'lb'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(LumberCalc);
