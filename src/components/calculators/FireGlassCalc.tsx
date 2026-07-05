import { useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { calculateCircleArea, calculateRectArea } from "../../lib/geometry";
import { calculateWeight } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";

export default function FireGlassCalc() {
  const { t } = useI18n();
  const [shape, setShape] = useState<"round" | "square">("round");
  const [diameter, setDiameter] = useState("24");
  const [length, setLength] = useState("24");
  const [width, setWidth] = useState("24");
  const [depth, setDepth] = useState("2");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("fire-glass", "Fire Glass Calculator");

  const d = parseNumber(diameter);
  const l = parseNumber(length);
  const w = parseNumber(width);
  const dep = parseNumber(depth);
  const area = shape === "round" ? calculateCircleArea(d / 2 / 12) : calculateRectArea(l / 12, w / 12);
  const depthFt = dep / 12;
  const cuFt = area * depthFt;
  const cuIn = cuFt * 1728;
  const weight = calculateWeight("glass_annealed", cuIn);
  const lbs = weight.lb;
  const bags5lb = Math.ceil(lbs / 5);

  const projectInputs: Record<string, number> = { area: area, depth: dep };
  const projectResults = { cuFt, cuIn, lbs, bags5lb };
  const projectMaterials: MaterialItem[] = [{ name: "Fire Glass", quantity: lbs, unit: "lbs", category: "fire-pit" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Select label={t('calculators.detail.specialty.fire_glass.shape') ?? 'Shape'} value={shape} onChange={(v) => setShape(v as "round" | "square")} options={[{ value: "round", label: t('calculators.detail.specialty.fire_glass.round_fire_pit') ?? 'Round Fire Pit' }, { value: "square", label: t('calculators.detail.specialty.fire_glass.square_fire_pit') ?? 'Square Fire Pit' }]} />
          <div className="grid grid-cols-2 gap-4">
            {shape === "round" ? (
              <Input label={t('fields.diameter_in') ?? 'Diameter (in)'} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="24" className="col-span-2" />
            ) : (
              <><Input label={t('fields.length_in') ?? 'Length (in)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="24" /><Input label={t('fields.width_in') ?? 'Width (in)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="24" /></>
            )}
            <Input label={t('calculators.detail.specialty.fire_glass.desired_depth') ?? 'Desired Depth (in)'} type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="2" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.specialty.fire_glass.fire_glass_needed') ?? 'Fire Glass Needed'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.fire_glass.area') ?? 'Area'}</span>
              <span className="text-sm font-semibold tabular-nums">{area.toFixed(2)} {t('units.sq_ft') ?? 'sq ft'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.common.volume') ?? 'Volume'}</span>
              <span className="text-sm font-semibold tabular-nums">{cuFt.toFixed(3)} {t('units.cu_ft') ?? 'cu ft'} ({cuIn.toFixed(0)} cu in)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.fire_glass.weight_needed') ?? 'Weight Needed'}</span>
              <span className="text-sm font-bold tabular-nums">{lbs.toFixed(1)} {t('units.lbs') ?? 'lbs'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.fire_glass.five_lb_bags') ?? '5 lb Bags'}</span>
              <span className="text-sm font-bold tabular-nums">{bags5lb}</span>
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
