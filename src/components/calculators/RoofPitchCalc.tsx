import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import RoofPitchDiagram from "../diagrams/RoofPitchDiagram";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

interface RoofPitchCalcProps {
  initialLength?: string;
  initialWidth?: string;
  projectId?: string;
  onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void;
}

function RoofPitchCalc({ initialLength, initialWidth, projectId, onCalculate }: RoofPitchCalcProps = {}) {
  const { t } = useI18n();
  const [rise, setRise] = useState<string>("6");
  const [run, setRun] = useState<string>("12");
  const [buildingLength, setBuildingLength] = useState<string>(initialLength || "40");
  const [buildingWidth, setBuildingWidth] = useState<string>(initialWidth || "30");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("roof-pitch", "Roof Pitch Calculator");

  useEffect(() => {
    const riseNum = parseFloat(rise) || 6;
    const runNum = parseFloat(run) || 12;
    const bLen = parseFloat(buildingLength) || 0;
    const bWid = parseFloat(buildingWidth) || 0;
    const pitchDegrees = Math.atan(riseNum / runNum) * (180 / Math.PI);
    const pitchFactor = Math.sqrt(1 + (riseNum / runNum) ** 2);
    const slopePercent = (riseNum / runNum) * 100;
    const roofArea = bLen * bWid * pitchFactor;
    const rafterLength = (bWid / 2) * pitchFactor;

    const projectInputs = { rise: riseNum, run: runNum, buildingLength: bLen, buildingWidth: bWid };
    const projectResults = { pitchDegrees, slopePercent, pitchFactor, roofArea, rafterLength };
    const projectMaterials: MaterialItem[] = [
      { name: "Rafter Lumber", quantity: rafterLength * 2, unit: "linear ft", category: "lumber" },
    ];
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [rise, run, buildingLength, buildingWidth, onCalculate]);

  const riseNum = parseNumber(rise) || 0.001;
  const runNum = parseNumber(run) || 0.001;
  const bLen = parseNumber(buildingLength);
  const bWid = parseNumber(buildingWidth);

  const pitchRatio = `${riseNum}:${runNum}`;
  const pitchDegrees = Math.atan(riseNum / runNum) * (180 / Math.PI);
  const pitchFactor = Math.sqrt(1 + (riseNum / runNum) ** 2);
  const slopePercent = (riseNum / runNum) * 100;

  const roofArea = bLen * bWid * pitchFactor;
  const rafterLength = (bWid / 2) * pitchFactor;

  const pitchCategory = slopePercent < 10 ? (t('calculators.detail.roofing.pitch.low_slope') ?? 'Low Slope') : slopePercent < 25 ? (t('calculators.detail.roofing.pitch.conventional') ?? 'Conventional') : slopePercent < 50 ? (t('calculators.detail.roofing.pitch.steep') ?? 'Steep') : (t('calculators.detail.roofing.pitch.very_steep') ?? 'Very Steep');

  const projectInputs = { rise: riseNum, run: runNum, buildingLength: bLen, buildingWidth: bWid };
  const projectResults = { pitchDegrees, slopePercent, pitchFactor, roofArea, rafterLength };
  const projectMaterials: MaterialItem[] = [
    { name: "Rafter Lumber", quantity: rafterLength * 2, unit: "linear ft", category: "lumber" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.roofing.pitch.measurements') ?? 'Pitch Measurements'}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.roofing.pitch.rise_in') ?? 'Rise (inches)'} type="number" inputMode="decimal" value={rise} onChange={(e) => setRise(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 6'} helperText={t('calculators.detail.roofing.pitch.rise_helper') ?? 'Vertical distance per 12 in run'} />
            <Input label={t('calculators.detail.roofing.pitch.run_in') ?? 'Run (inches)'} type="number" inputMode="decimal" value={run} onChange={(e) => setRun(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 12'} helperText={t('calculators.detail.roofing.pitch.run_helper') ?? 'Horizontal distance (usually 12)'} />
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-xs font-medium text-[var(--fg-secondary)] mb-2">{t('calculators.detail.roofing.pitch.building_footprint') ?? 'Building Footprint (Optional)'}</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('calculators.detail.roofing.pitch.building_length_ft') ?? 'Building Length (ft)'} type="number" inputMode="decimal" value={buildingLength} onChange={(e) => setBuildingLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 40'} />
              <Input label={t('calculators.detail.roofing.pitch.building_width_ft') ?? 'Building Width (ft)'} type="number" inputMode="decimal" value={buildingWidth} onChange={(e) => setBuildingWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 30'} />
            </div>
          </div>
        </Card>

        <Select label={t('calculators.detail.roofing.pitch.common_pitch_preset') ?? 'Common Pitch Preset'} value={rise} onChange={setRise} options={[
          { value: "2", label: t('calculators.detail.roofing.pitch.preset_2_12') ?? '2:12 — Low-slope / shed' },
          { value: "4", label: t('calculators.detail.roofing.pitch.preset_4_12') ?? '4:12 — Standard residential' },
          { value: "6", label: t('calculators.detail.roofing.pitch.preset_6_12') ?? '6:12 — Common gable' },
          { value: "8", label: t('calculators.detail.roofing.pitch.preset_8_12') ?? '8:12 — Steep residential' },
          { value: "10", label: t('calculators.detail.roofing.pitch.preset_10_12') ?? '10:12 — Very steep' },
          { value: "12", label: t('calculators.detail.roofing.pitch.preset_12_12') ?? '12:12 — A-frame / cabin' },
        ]} />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <RoofPitchDiagram rise={riseNum} run={runNum} />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.roofing.pitch.analysis') ?? 'Pitch Analysis'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.pitch.pitch_ratio') ?? 'Roof Pitch Ratio'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{pitchRatio}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.pitch.angle_degrees') ?? 'Angle in Degrees'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight">{pitchDegrees.toFixed(1)}</span>
                <span className="text-lg text-[var(--fg-muted)] font-semibold">{t('calculators.detail.roofing.pitch.degrees_unit') ?? 'degrees'}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.pitch.slope_percentage') ?? 'Slope Percentage'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight">{slopePercent.toFixed(1)}</span>
                <span className="text-lg text-[var(--fg-muted)] font-semibold">%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.pitch.pitch_multiplier') ?? 'Pitch Multiplier'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight">{pitchFactor.toFixed(3)}</span>
                <span className="text-xs text-[var(--fg-muted)]">{t('calculators.detail.roofing.pitch.x_footprint') ?? 'x footprint'}</span>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.roofing.pitch.category_label') ?? 'Category'}</span>
              <span className="text-lg font-bold text-[var(--fg)]">{pitchCategory}</span>
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

        {bLen > 0 && bWid > 0 && (
          <Card>
            <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.roofing.pitch.derived_values') ?? 'Derived Roof Values'}</h3>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm font-medium">{t('calculators.detail.roofing.pitch.actual_roof_area') ?? 'Actual Roof Area'}</span>
                <span className="text-sm font-bold tabular-nums">{roofArea.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <span className="text-sm font-medium">{t('calculators.detail.roofing.pitch.rafter_length') ?? 'Rafter Length (each side)'}</span>
                <span className="text-sm font-bold tabular-nums">{rafterLength.toFixed(2)} {t('units.ft') ?? 'ft'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm font-medium">{t('calculators.detail.roofing.pitch.ridge_height') ?? 'Ridge Height (from wall top)'}</span>
                <span className="text-sm font-bold tabular-nums">{(bWid / 2 * (riseNum / runNum)).toFixed(2)} {t('units.ft') ?? 'ft'}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withI18n(RoofPitchCalc);
