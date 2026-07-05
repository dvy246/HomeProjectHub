import { useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { calculateRectArea, calculateLShapeArea, calculateTriangleArea, calculateCircleAreaFromDiameter, sqftToSqYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";

type Shape = "rectangle" | "lshape" | "triangle" | "circle";

export default function SquareFootageCalc() {
  const { t } = useI18n();
  const [shape, setShape] = useState<Shape>("rectangle");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("10");
  const [lenA, setLenA] = useState("12");
  const [widA, setWidA] = useState("8");
  const [lenB, setLenB] = useState("6");
  const [widB, setWidB] = useState("4");
  const [base, setBase] = useState("10");
  const [height, setHeight] = useState("8");
  const [diameter, setDiameter] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("square-footage", "Square Footage Calculator");

  let area = 0;
  switch (shape) {
    case "rectangle":
      area = calculateRectArea(parseNumber(length), parseNumber(width));
      break;
    case "lshape":
      area = calculateLShapeArea(parseNumber(lenA), parseNumber(widA), parseNumber(lenB), parseNumber(widB));
      break;
    case "triangle":
      area = calculateTriangleArea(parseNumber(base), parseNumber(height));
      break;
    case "circle":
      area = calculateCircleAreaFromDiameter(parseNumber(diameter));
      break;
  }

  const sqMeters = area * 0.092903;
  const sqYards = sqftToSqYd(area);

  const projectInputs: Record<string, number> = {
    length: shape === "rectangle" ? parseNumber(length) : 0,
    width: shape === "rectangle" ? parseNumber(width) : 0,
    lenA: shape === "lshape" ? parseNumber(lenA) : 0,
    widA: shape === "lshape" ? parseNumber(widA) : 0,
    lenB: shape === "lshape" ? parseNumber(lenB) : 0,
    widB: shape === "lshape" ? parseNumber(widB) : 0,
    base: shape === "triangle" ? parseNumber(base) : 0,
    height: shape === "triangle" ? parseNumber(height) : 0,
    diameter: shape === "circle" ? parseNumber(diameter) : 0,
  };
  const projectResults = { sqft: area, sqYards, sqMeters };
  const projectMaterials: MaterialItem[] = [{ name: "Area", quantity: area, unit: "sq ft", category: "area" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Select label={t('calculators.detail.area.square_footage.shape') ?? 'Shape'} value={shape} onChange={(v) => setShape(v as "rectangle" | "lshape" | "triangle" | "circle")} options={[{ value: "rectangle", label: t('calculators.detail.area.square_footage.shape_rectangle') ?? 'Rectangle' }, { value: "lshape", label: t('calculators.detail.area.square_footage.shape_lshape') ?? 'L-Shape' }, { value: "triangle", label: t('calculators.detail.area.square_footage.shape_triangle') ?? 'Triangle' }, { value: "circle", label: t('calculators.detail.area.square_footage.shape_circle') ?? 'Circle' }]} />
          <div className="grid grid-cols-2 gap-4">
            {shape === "rectangle" && (
              <><Input label={t('fields.length_ft') ?? 'Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} /><Input label={t('fields.width_ft') ?? 'Width (ft)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} /></>
            )}
            {shape === "lshape" && (
              <><Input label={t('calculators.detail.area.square_footage.section_a_length') ?? 'Section A - Length (ft)'} type="number" inputMode="decimal" value={lenA} onChange={(e) => setLenA(e.target.value)} /><Input label={t('calculators.detail.area.square_footage.section_a_width') ?? 'Section A - Width (ft)'} type="number" inputMode="decimal" value={widA} onChange={(e) => setWidA(e.target.value)} /><Input label={t('calculators.detail.area.square_footage.section_b_length') ?? 'Section B - Length (ft)'} type="number" inputMode="decimal" value={lenB} onChange={(e) => setLenB(e.target.value)} /><Input label={t('calculators.detail.area.square_footage.section_b_width') ?? 'Section B - Width (ft)'} type="number" inputMode="decimal" value={widB} onChange={(e) => setWidB(e.target.value)} /></>
            )}
            {shape === "triangle" && (
              <><Input label={t('calculators.detail.area.square_footage.base') ?? 'Base (ft)'} type="number" inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} /><Input label={t('fields.height_ft') ?? 'Height (ft)'} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} /></>
            )}
            {shape === "circle" && (
              <Input label={t('calculators.detail.area.square_footage.diameter') ?? 'Diameter (ft)'} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="col-span-2" />
            )}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.common.results') ?? 'Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.sq_ft') ?? 'Square Feet'}</span>
              <span className="text-sm font-bold tabular-nums">{area.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.sq_yd') ?? 'Square Yards'}</span>
              <span className="text-sm font-semibold tabular-nums">{sqYards.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.sq_m') ?? 'Square Meters'}</span>
              <span className="text-sm font-semibold tabular-nums">{sqMeters.toFixed(2)}</span>
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
