import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import SpiralStaircaseDiagram from "../diagrams/SpiralStaircaseDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function SpiralStaircaseCalc() {
  const { t } = useI18n();
  const [totalRise, setTotalRise] = useState("108");
  const [diameter, setDiameter] = useState("5");
  const [treadCount, setTreadCount] = useState("13");
  const [treadThickness, setTreadThickness] = useState("2");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("spiral-staircase", "Spiral Staircase Calculator");

  const tr = parseNumber(totalRise);
  const d = parseNumber(diameter);
  const tc = Math.max(2, Math.round(parseNumber(treadCount) || 2));
  const tt = parseNumber(treadThickness);

  const actualRiser = tc > 0 ? tr / tc : 0;
  const walkLineDiam = d - 1;
  const walkLineCirc = walkLineDiam * Math.PI;
  const treadWidthOuter = d * Math.PI / tc * 12;
  const treadWidthWalk = walkLineCirc / tc * 12;
  const degreesPerTread = 360 / tc;
  const totalDegrees = degreesPerTread * tc;
  const heliRise = actualRiser + tt;
  const stringerLength = tc > 0 ? Math.sqrt((walkLineCirc * 12) ** 2 + tr ** 2) / 12 : 0;
  const headroomClearance = tr > 0 ? 80 : 0;

  const ircRiserOk = actualRiser <= 9.5;
  const ircTreadOk = treadWidthWalk >= 7.5;

  const projectInputs = { totalRise: tr, diameter: d, treadCount: tc, treadThickness: tt };
  const projectResults = { riserHeight: actualRiser, treadWidthWalk, treadWidthOuter, stringerLength, totalTreads: tc };
  const projectMaterials: MaterialItem[] = [
    { name: "Treads", quantity: tc, unit: "pieces", category: "stairs" },
    { name: "Risers", quantity: tc, unit: "pieces", category: "stairs" },
    { name: "Stringer (approx)", quantity: 1, unit: "assembly", category: "stairs" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.structure.spiral_staircase.total_rise_in') ?? 'Total Rise (in)'} type="number" inputMode="decimal" value={totalRise} onChange={(e) => setTotalRise(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '108'} helperText={t('calculators.detail.structure.spiral_staircase.rise_helper') ?? 'Floor to floor height'} />
            <Input label={t('calculators.detail.structure.spiral_staircase.diameter_ft') ?? 'Diameter (ft)'} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '5'} />
            <Input label={t('calculators.detail.structure.spiral_staircase.number_of_treads') ?? 'Number of Treads'} type="number" inputMode="numeric" value={treadCount} onChange={(e) => setTreadCount(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '13'} />
            <Input label={t('calculators.detail.structure.spiral_staircase.tread_thickness_in') ?? 'Tread Thickness (in)'} type="number" inputMode="decimal" value={treadThickness} onChange={(e) => setTreadThickness(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '2'} />
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <SpiralStaircaseDiagram diameter={d} numSteps={tc} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.structure.spiral_staircase.dimensions') ?? 'Spiral Staircase Dimensions'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.riser_height') ?? 'Riser Height'}</span>
              <span className="text-sm font-bold tabular-nums">{actualRiser.toFixed(2)}{t('units.in') ?? 'in'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.tread_width_outer') ?? 'Tread Width (outer edge)'}</span>
              <span className="text-sm font-semibold tabular-nums">{treadWidthOuter.toFixed(1)}{t('units.in') ?? 'in'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.tread_width_walk') ?? 'Tread Width (walk line)'}</span>
              <span className="text-sm font-semibold tabular-nums">{treadWidthWalk.toFixed(1)}{t('units.in') ?? 'in'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.degrees_per_tread') ?? 'Degrees per Tread'}</span>
              <span className="text-sm font-semibold tabular-nums">{degreesPerTread.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.stringer_length') ?? 'Stringer Length (approx)'}</span>
              <span className="text-sm font-semibold tabular-nums">{stringerLength.toFixed(1)} {t('units.ft') ?? 'ft'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.total_treads') ?? 'Total Treads'}</span>
              <span className="text-sm font-bold tabular-nums">{tc}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.spiral_staircase.irc_compliance') ?? 'IRC Compliance'}</span>
              <span className={`text-sm font-bold tabular-nums ${ircRiserOk && ircTreadOk ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                {ircRiserOk && ircTreadOk ? (t('calculators.detail.structure.spiral_staircase.pass') ?? 'Pass') : (t('calculators.detail.structure.spiral_staircase.check') ?? 'Check')}
              </span>
            </div>
          </div>
          {(!ircRiserOk || !ircTreadOk) && (
            <div className="mt-4 p-3 rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 text-xs text-[var(--error)] leading-relaxed space-y-1.5">
              <p className="font-bold">⚠️ IRC R311.7.5 Safety Violations:</p>
              {!ircRiserOk && (
                <p>• <strong>Riser Height ({actualRiser.toFixed(2)}″)</strong> exceeds the maximum allowed <strong>9.5″</strong> for spiral steps.</p>
              )}
              {!ircTreadOk && (
                <p>• <strong>Walk Line Tread Width ({treadWidthWalk.toFixed(1)}″)</strong> is below the minimum allowed <strong>7.5″</strong>.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default withI18n(SpiralStaircaseCalc);
