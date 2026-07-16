import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function TonnageCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [pounds, setPounds] = useState("1000");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("tonnage", "Tonnage Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [pounds, onCalculate]);

  const lb = parseNumber(pounds);
  const kg = lb * 0.453592;
  const shortTons = lb / 2000;
  const metricTons = kg / 1000;
  const longTons = lb / 2240;

  const projectInputs = { pounds: lb };
  const projectResults = { kg, shortTons, metricTons, longTons };
  const projectMaterials: MaterialItem[] = [{ name: t('calculators.detail.weight.tonnage.name') ?? 'Material', quantity: shortTons, unit: "tons", category: "weight" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Input label={t('calculators.detail.weight.tonnage.weight_pounds') ?? 'Weight (pounds)'} type="number" inputMode="decimal" value={pounds} onChange={(e) => setPounds(e.target.value)} placeholder="1000" />
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.weight.tonnage.results') ?? 'Tonnage Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.tonnage.kilograms') ?? 'Kilograms'}</span>
              <span className="text-sm font-bold tabular-nums">{kg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.tonnage.short_tons_us') ?? 'Short Tons (US)'}</span>
              <span className="text-sm font-bold tabular-nums">{shortTons.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.tonnage.metric_tons') ?? 'Metric Tons'}</span>
              <span className="text-sm font-semibold tabular-nums">{metricTons.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.weight.tonnage.long_tons_uk') ?? 'Long Tons (UK)'}</span>
              <span className="text-sm font-semibold tabular-nums">{longTons.toFixed(4)}</span>
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

export default withI18n(TonnageCalc);
