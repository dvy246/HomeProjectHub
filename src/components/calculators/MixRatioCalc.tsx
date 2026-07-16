import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const RATIOS: Record<string, [number, number, number]> = {
  "1:2:3 (Standard)": [1, 2, 3],
  "1:2:2 (High Strength)": [1, 2, 2],
  "1:2.5:3.5 (General)": [1, 2.5, 3.5],
  "1:3:3 (Footings)": [1, 3, 3],
  "1:3:5 (Lean Mix)": [1, 3, 5],
};

function MixRatioCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [volume, setVolume] = useState<string>("1");
  const [unit, setUnit] = useState<"cuyd" | "cuft">("cuyd");
  const [ratioLabel, setRatioLabel] = useState<string>("1:2:3 (Standard)");
  const [cementBagSize, setCementBagSize] = useState<string>("94");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("mix-ratio", "Concrete Mix Ratio Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [volume, unit, ratioLabel, cementBagSize, onCalculate]);

  const vol = parseNumber(volume);
  const volCuFt = unit === "cuyd" ? vol * 27 : vol;
  const bagLbs = parseNumber(cementBagSize) || 94;

  const ratio = RATIOS[ratioLabel] || RATIOS["1:2:3 (Standard)"];
  const totalParts = ratio[0] + ratio[1] + ratio[2];

  const cementParts = ratio[0] / totalParts;
  const sandParts = ratio[1] / totalParts;
  const gravelParts = ratio[2] / totalParts;

  const cementVolume = volCuFt * cementParts;
  const sandVolume = volCuFt * sandParts;
  const gravelVolume = volCuFt * gravelParts;

  const cementWeight = cementVolume * 94;
  const cementBags = Math.ceil(cementWeight / bagLbs);
  const waterGallons = Math.ceil(cementBags * 4.5);

  const sandCubicYards = sandVolume / 27;
  const gravelCubicYards = gravelVolume / 27;
  const sandTons = sandVolume * 0.075;
  const gravelTons = gravelVolume * 0.075;

  const mixName = ratioLabel;

  const projectInputs = { volume: vol, bagLbs };
  const projectResults = { cementBags, sandCubicYards, gravelCubicYards, sandTons, gravelTons, waterGallons, cementVolume, sandVolume, gravelVolume, volCuFt };
  const projectMaterials: MaterialItem[] = [
    { name: "Cement", quantity: cementBags, unit: "bags", category: "concrete" },
    { name: "Sand", quantity: sandCubicYards, unit: "cu yd", category: "aggregate" },
    { name: "Gravel", quantity: gravelCubicYards, unit: "cu yd", category: "aggregate" },
    { name: "Water", quantity: waterGallons, unit: "gallons", category: "other" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.specialty.mix_ratio.concrete_volume') ?? 'Concrete Volume'}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.specialty.mix_ratio.volume_label', { unit: unit === 'cuyd' ? t('units.cu_yd') ?? 'cubic yards' : t('units.cu_ft') ?? 'cubic feet' }) ?? `Volume (${unit === 'cuyd' ? 'cubic yards' : 'cubic feet'})`} type="number" inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="e.g. 1" />
            <Select label={t('calculators.common.unit') ?? 'Unit'} value={unit} onChange={(v) => setUnit(v as "cuyd" | "cuft")} options={[{ value: "cuyd", label: t('units.cu_yd') ?? 'Cubic Yards' }, { value: "cuft", label: t('units.cu_ft') ?? 'Cubic Feet' }]} />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.specialty.mix_ratio.mix_design') ?? 'Mix Design'}</h3>
          </div>
          <Select label={t('calculators.detail.specialty.mix_ratio.mix_ratio_label') ?? 'Mix Ratio (Cement : Sand : Gravel)'} value={ratioLabel} onChange={setRatioLabel} options={Object.keys(RATIOS).map((label) => ({ value: label, label: `${RATIOS[label][0]}:${RATIOS[label][1]}:${RATIOS[label][2]} — ${label.replace(/^\d[\d.:]+\s*/, "")}` }))} />
          <Input label={t('calculators.detail.specialty.mix_ratio.cement_bag_weight') ?? 'Cement Bag Weight (lbs)'} type="number" inputMode="decimal" value={cementBagSize} onChange={(e) => setCementBagSize(e.target.value)} placeholder="e.g. 94" helperText={t('calculators.detail.specialty.mix_ratio.standard_bag_hint') ?? 'Standard bag is 94 lbs'} />
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.specialty.mix_ratio.mix_results', { volume: volCuFt.toFixed(1) }) ?? `Mix Results for ${volCuFt.toFixed(1)} cu ft`}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.specialty.mix_ratio.cement') ?? 'Cement'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{cementBags}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{bagLbs}{t('units.lbs') ?? 'lb'} {t('units.bags') ?? 'bags'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{mixName}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.specialty.mix_ratio.sand_needed') ?? 'Sand Needed'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{sandCubicYards.toFixed(2)}</span>
                <span className="text-xs text-[var(--fg-muted)]">{t('units.cu_yd') ?? 'cu yd'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)]">{t('calculators.detail.specialty.mix_ratio.approx_tons', { tons: sandTons.toFixed(1) }) ?? `~${sandTons.toFixed(1)} tons`}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.specialty.mix_ratio.gravel_needed') ?? 'Gravel Needed'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{gravelCubicYards.toFixed(2)}</span>
                <span className="text-xs text-[var(--fg-muted)]">{t('units.cu_yd') ?? 'cu yd'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)]">{t('calculators.detail.specialty.mix_ratio.approx_tons', { tons: gravelTons.toFixed(1) }) ?? `~${gravelTons.toFixed(1)} tons`}</span>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.specialty.mix_ratio.estimated_water') ?? 'Estimated Water'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-2xl font-bold">{waterGallons}</span>
                <span className="text-xs text-[var(--fg-muted)]">{t('units.gallons') ?? 'gallons'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{t('calculators.detail.specialty.mix_ratio.water_per_bag_hint') ?? '~4.5 gal per bag of cement'}</span>
            </div>
          </div>
        </div>

        <AddToProjectCard
          projects={projects}
          onAdd={(pid) => {
            clearSuccess();
            addToProject(pid, projectInputs, projectResults, projectMaterials);
          }}
          successMessage={projectSuccess}
        />

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.specialty.mix_ratio.volume_breakdown') ?? 'Volume Breakdown'}</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.specialty.mix_ratio.total_wet_volume') ?? 'Total Wet Volume'}</span>
              <span className="text-sm font-bold tabular-nums">{volCuFt.toFixed(1)} {t('units.cu_ft') ?? 'cu ft'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.specialty.mix_ratio.cement_volume') ?? 'Cement Volume'}</span>
              <span className="text-sm font-bold tabular-nums">{cementVolume.toFixed(2)} {t('units.cu_ft') ?? 'cu ft'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">{t('calculators.detail.specialty.mix_ratio.sand_volume') ?? 'Sand Volume'}</span>
              <span className="text-sm font-bold tabular-nums">{sandVolume.toFixed(2)} {t('units.cu_ft') ?? 'cu ft'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">{t('calculators.detail.specialty.mix_ratio.gravel_volume') ?? 'Gravel Volume'}</span>
              <span className="text-sm bold tabular-nums">{gravelVolume.toFixed(2)} {t('units.cu_ft') ?? 'cu ft'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(MixRatioCalc);
