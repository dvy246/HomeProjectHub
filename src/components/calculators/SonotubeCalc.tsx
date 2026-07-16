import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { cuFeetToCuYards, calculateCircleAreaFromDiameter } from "../../lib/geometry";
import { applyWasteFactor, calculateConcreteBags, estimateConcreteWeightLbs } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function SonotubeCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [diameter, setDiameter] = useState("10");
  const [height, setHeight] = useState("48");
  const [quantity, setQuantity] = useState("1");
  const [waste, setWaste] = useState("5");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("sonotube", "Sonotube Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [diameter, height, quantity, waste, onCalculate]);

  const d = parseNumber(diameter);
  const h = parseNumber(height);
  const qty = Math.max(1, Math.round(parseNumber(quantity) || 1));
  const ws = parseNumber(waste) / 100;
  const radiusFt = (d / 2) / 12;
  const heightFt = h / 12;
  const volPerTube = Math.PI * radiusFt * radiusFt * heightFt;
  const totalVol = volPerTube * qty;
  const cuYd = cuFeetToCuYards(totalVol);
  const cuYdWaste = applyWasteFactor(cuYd, ws);
  const bags80 = calculateConcreteBags(totalVol, "80lb");
  const weightLbs = estimateConcreteWeightLbs(totalVol);

  const projectInputs = { diameter: d, height: h, quantity: qty, wastePct: ws * 100 };
  const projectResults = { volPerTubeCuFt: volPerTube, totalConcreteCuYd: cuYd, cuYdWithWaste: cuYdWaste, bags80, weightLbs };
  const projectMaterials: MaterialItem[] = [
    { name: "Sonotube Forms", quantity: qty, unit: "each", category: "concrete" },
    { name: "Concrete", quantity: cuYdWaste, unit: "cu yd", category: "concrete" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.specialty.sonotube.tube_diameter') ?? 'Tube Diameter (in)'} type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="10" />
            <Input label={t('calculators.detail.specialty.sonotube.tube_height') ?? 'Tube Height (in)'} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="48" />
            <Input label={t('calculators.detail.specialty.sonotube.number_of_tubes') ?? 'Number of Tubes'} type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
            <Input label={t('calculators.common.waste_factor') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="5" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.specialty.sonotube.sonotube_concrete') ?? 'Sonotube Concrete'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.sonotube.volume_per_tube') ?? 'Volume per Tube'}</span>
              <span className="text-sm font-semibold tabular-nums">{volPerTube.toFixed(3)} {t('units.cu_ft') ?? 'cu ft'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.sonotube.total_concrete', { qty }) ?? `Total Concrete (${qty} tubes)`}</span>
              <span className="text-sm font-bold tabular-nums">{cuYd.toFixed(3)} {t('units.cu_yd') ?? 'cu yd'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.sonotube.with_waste', { waste: parseNumber(waste).toFixed(0) }) ?? `With ${parseNumber(waste).toFixed(0)}% Waste`}</span>
              <span className="text-sm font-bold tabular-nums">{cuYdWaste.toFixed(3)} {t('units.cu_yd') ?? 'cu yd'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.specialty.sonotube.bags_needed', { bagSize: 80 }) ?? '80 lb Bags Needed'}</span>
              <span className="text-sm font-semibold tabular-nums">{bags80}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.common.dry_weight') ?? 'Weight'}</span>
              <span className="text-sm font-semibold tabular-nums">{weightLbs.toFixed(0)} {t('units.lbs') ?? 'lbs'} ({ (weightLbs / 2000).toFixed(2) } tons)</span>
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

export default withI18n(SonotubeCalc);
