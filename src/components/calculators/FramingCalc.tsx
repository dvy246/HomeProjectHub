import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateStudCount } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import FramingDiagram from "../diagrams/FramingDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function FramingCalc() {
  const { t } = useI18n();
  const [wallLength, setWallLength] = useState("20");
  const [wallHeight, setWallHeight] = useState("8");
  const [studSpacing, setStudSpacing] = useState("16");
  const [waste, setWaste] = useState("5");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("framing", "Framing Calculator");

  const wl = parseNumber(wallLength);
  const wh = parseNumber(wallHeight);
  const sp = parseNumber(studSpacing) || 1;
  const ws = parseNumber(waste) / 100;

  const studs = calculateStudCount(wl, sp as 16 | 24);
  const platesTotal = (wl * 3) / 12;
  const studsTotal = studs + Math.ceil(platesTotal);
  const studsWithWaste = Math.ceil(studsTotal * (1 + ws));

  const projectInputs = { wallLength: wl, wallHeight: wh, studSpacing: sp, waste: ws };
  const projectResults = { studs, plates: Math.ceil(platesTotal), studsTotal, studsWithWaste };
  const projectMaterials: MaterialItem[] = [
    { name: "Studs", quantity: studs, unit: "pieces", category: "framing" },
    { name: "Plates", quantity: Math.ceil(platesTotal), unit: "pieces", category: "framing" },
    { name: "Nails (approx)", quantity: Math.ceil(studsTotal * 6), unit: "nails", category: "framing" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-3 gap-4">
            <Input label={t('calculators.detail.structure.framing.wall_length_ft') ?? 'Wall Length (ft)'} type="number" inputMode="decimal" value={wallLength} onChange={(e) => setWallLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '20'} />
            <Input label={t('calculators.detail.structure.framing.wall_height_ft') ?? 'Wall Height (ft)'} type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '8'} />
            <Input label={t('calculators.detail.structure.framing.stud_spacing_in') ?? 'Stud Spacing (in)'} type="number" inputMode="decimal" value={studSpacing} onChange={(e) => setStudSpacing(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '16'} />
            <Input label={t('calculators.detail.structure.framing.waste_factor_pct') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '5'} />
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
          <FramingDiagram length={wl} height={wh} studSpacing={sp} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.structure.framing.estimate') ?? 'Framing Estimate'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.framing.wall_studs') ?? 'Wall Studs'} ({sp}{t('units.in') ?? 'in'} {t('calculators.detail.structure.framing.oc') ?? 'oc'})</span>
              <span className="text-sm font-bold tabular-nums">{studs}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.framing.plates') ?? 'Plates (3 rows, stud-lengths)'}</span>
              <span className="text-sm font-semibold tabular-nums">{Math.ceil(platesTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.framing.total_pieces') ?? 'Total 2x'}{wh.toFixed(0)}{t('units.ft') ?? 'ft'} {t('calculators.detail.structure.framing.pieces') ?? 'Pieces'}</span>
              <span className="text-sm font-bold tabular-nums">{studsTotal}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.framing.sheet_metal') ?? 'Sheet Metal (sq ft)'}</span>
              <span className="text-sm font-semibold tabular-nums">{((wl * wh) * 0.1).toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.structure.framing.with_waste') ?? 'With'} {parseNumber(waste).toFixed(0)}% {t('calculators.detail.structure.framing.waste') ?? 'Waste'}</span>
              <span className="text-sm font-bold tabular-nums">{studsWithWaste}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(FramingCalc);
