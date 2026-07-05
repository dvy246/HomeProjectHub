import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { sqftToCuYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const MULCH_TYPES = [
  { key: "bark", label: "Bark Mulch", lbsPerCuFt: 25, bagsPerCuYd: 13.5 },
  { key: "cedar", label: "Cedar Mulch", lbsPerCuFt: 22, bagsPerCuYd: 13.5 },
  { key: "rubber", label: "Rubber Mulch", lbsPerCuFt: 55, bagsPerCuYd: 13.5 },
  { key: "dyed", label: "Dyed Mulch", lbsPerCuFt: 25, bagsPerCuYd: 13.5 },
];

function MulchCalc() {
  const { t } = useI18n();
  const [type, setType] = useState("bark");
  const [sqft, setSqft] = useState("100");
  const [depth, setDepth] = useState("3");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("mulch", "Mulch Calculator");

  const mt = MULCH_TYPES.find((m) => m.key === type) || MULCH_TYPES[0];
  const sf = parseNumber(sqft);
  const d = parseNumber(depth);
  const cuYd = sqftToCuYd(sf, d);
  const cuFt = cuYd * 27;
  const bags = Math.ceil(cuYd * mt.bagsPerCuYd);
  const lbs = cuFt * mt.lbsPerCuFt;

  const projectInputs = { sqft: sf, depth: d };
  const projectResults = { cuYd, cuFt, bags, lbs };
  const projectMaterials: MaterialItem[] = [{ name: `${mt.label} Mulch`, quantity: cuYd, unit: "cu yd", category: "mulch" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">{t('calculators.detail.landscaping.mulch.type') ?? 'Mulch Type'}</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)]">
              {MULCH_TYPES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.landscaping.mulch.area_sqft') ?? 'Area (sq ft)'} type="number" inputMode="decimal" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="100" />
            <Input label={t('calculators.detail.landscaping.mulch.depth_in') ?? 'Depth (in)'} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="3" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.landscaping.mulch.needed') ?? 'Mulch Needed'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.common.volume') ?? 'Volume'}</span>
              <span className="text-sm font-semibold tabular-nums">{cuYd.toFixed(2)} {t('units.cu_yd') ?? 'cu yd'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.landscaping.mulch.bags_needed') ?? 'Bags Needed (2 cu ft)'}</span>
              <span className="text-sm font-bold tabular-nums">{bags}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.landscaping.mulch.weight') ?? 'Weight'}</span>
              <span className="text-sm font-semibold tabular-nums">{lbs.toFixed(0)} {t('units.lbs') ?? 'lbs'} ({ (lbs / 2000).toFixed(2) } tons)</span>
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

export default withI18n(MulchCalc);
