import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import SnowLoadDiagram from "../diagrams/SnowLoadDiagram";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const SNOW_DENSITIES: Record<string, number> = {
  "Fresh": 5,
  "Settled": 15,
  "Old / Packed": 25,
  "Wet / Heavy": 40,
  "Ice": 57,
};

function SnowLoadCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [depth, setDepth] = useState<string>("24");
  const [snowType, setSnowType] = useState<string>("Settled");
  const [pitch, setPitch] = useState<string>("6");
  const [buildingLength, setBuildingLength] = useState<string>("40");
  const [buildingWidth, setBuildingWidth] = useState<string>("30");
  const [groundSnowLoad, setGroundSnowLoad] = useState<string>("30");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("snow-load", "Snow Load Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [depth, snowType, pitch, buildingLength, buildingWidth, groundSnowLoad, onCalculate]);

  const dep = parseNumber(depth) / 12;
  const pitchNum = parseNumber(pitch);
  const bLen = parseNumber(buildingLength);
  const bWid = parseNumber(buildingWidth);
  const gsl = parseNumber(groundSnowLoad);

  const density = SNOW_DENSITIES[snowType] || 15;
  const pitchFactor = Math.sqrt(1 + (pitchNum / 12) ** 2);
  const roofArea = bLen * bWid * pitchFactor;

  const depthSnowLoad = dep * density * 1.25;
  const groundSnowLoadPsf = gsl;
  const flatRoofFactor = pitchNum < 12 ? 0.7 : 0.7 * (1 - (pitchNum - 12) * 0.02);
  const calculatedSnowLoad = groundSnowLoadPsf * flatRoofFactor;
  const designLoad = Math.max(depthSnowLoad, calculatedSnowLoad);
  const totalLoad = designLoad * roofArea;

  const isBalanced = depthSnowLoad <= calculatedSnowLoad * 1.1;
  const exceedsDanger = designLoad > 50;

  const projectInputs = { depth: dep * 12, pitch: pitchNum, buildingLength: bLen, buildingWidth: bWid, groundSnowLoad: gsl };
  const projectResults = { designLoad, totalLoad, depthSnowLoad, calculatedSnowLoad, roofArea };
  const projectMaterials: MaterialItem[] = [
    { name: "Structural Materials (snow load)", quantity: 1, unit: "lot", category: "structural" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.roofing.snow_load.snow_conditions') ?? 'Snow Conditions'}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.roofing.snow_load.snow_depth_in') ?? 'Snow Depth (inches)'} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 24'} />
            <Select label={t('calculators.detail.roofing.snow_load.snow_type') ?? 'Snow Type'} value={snowType} onChange={setSnowType} options={Object.entries(SNOW_DENSITIES).map(([label]) => ({ value: label, label }))} />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.roofing.snow_load.building_details') ?? 'Building Details'}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.roofing.snow_load.building_length_ft') ?? 'Building Length (ft)'} type="number" inputMode="decimal" value={buildingLength} onChange={(e) => setBuildingLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 40'} />
            <Input label={t('calculators.detail.roofing.snow_load.building_width_ft') ?? 'Building Width (ft)'} type="number" inputMode="decimal" value={buildingWidth} onChange={(e) => setBuildingWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 30'} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.roofing.snow_load.roof_pitch') ?? 'Roof Pitch (rise per 12 in)'} type="number" inputMode="decimal" value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 6'} />
            <Input label={t('calculators.detail.roofing.snow_load.ground_snow_load_psf') ?? 'Ground Snow Load (psf)'} type="number" inputMode="decimal" value={groundSnowLoad} onChange={(e) => setGroundSnowLoad(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 30'} helperText={t('calculators.detail.roofing.snow_load.gsl_helper') ?? 'From local building code map'} />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <SnowLoadDiagram pitch={pitchNum} snowDepth={dep} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.roofing.snow_load.analysis') ?? 'Snow Load Analysis'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.snow_load.design_snow_load') ?? 'Design Snow Load'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{designLoad.toFixed(0)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.psf') ?? 'psf'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">
                {isBalanced ? (t('calculators.detail.roofing.snow_load.balanced') ?? 'Balanced load') : (t('calculators.detail.roofing.snow_load.drift') ?? 'Drift / unbalanced')} | {t('calculators.detail.roofing.snow_load.max_recommended') ?? 'Max recommended'}: 50 {t('units.psf') ?? 'psf'}
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.snow_load.total_roof_load') ?? 'Total Roof Load'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{totalLoad.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.lbs') ?? 'lbs'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{t('calculators.detail.roofing.snow_load.roof_area_label') ?? 'Roof area'}: {roofArea.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'}</span>
            </div>

            {exceedsDanger && (
              <div className="pt-4 border-t border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--error)]">{t('calculators.detail.roofing.snow_load.exceeds_limit') ?? 'EXCEEDS SAFE LIMIT'}</span>
                <p className="text-xs text-[var(--fg-muted)] mt-1">{t('calculators.detail.roofing.snow_load.exceeds_warning') ?? 'Consider removing snow from the roof immediately. This load may exceed standard residential design capacity.'}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.snow_load.depth_based') ?? 'Depth-based'}</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-xl font-bold">{depthSnowLoad.toFixed(0)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('units.psf') ?? 'psf'}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.snow_load.code_based') ?? 'Code-based'}</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-xl font-bold">{calculatedSnowLoad.toFixed(0)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('units.psf') ?? 'psf'}</span>
                </div>
              </div>
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
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.roofing.snow_load.density_reference') ?? 'Snow Density Reference'}</h3>
          <div className="flex flex-col gap-1">
            {Object.entries(SNOW_DENSITIES).map(([type, dens]) => (
              <div key={type} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm">{type}</span>
                <span className="text-xs text-[var(--fg-muted)]">{dens} {t('calculators.detail.roofing.snow_load.pcf') ?? 'pcf'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(SnowLoadCalc);
