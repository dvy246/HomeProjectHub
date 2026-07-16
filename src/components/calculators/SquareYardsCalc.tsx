import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { sqftToSqYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function SquareYardsCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [sqft, setSqft] = useState("100");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("square-yards", "Square Yards Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [sqft, onCalculate]);

  const sf = parseNumber(sqft);
  const sqYd = sqftToSqYd(sf);
  const sqM = sf * 0.092903;

  const projectInputs = { sqft: sf };
  const projectResults = { sqYd, sqMeters: sqM };
  const projectMaterials: MaterialItem[] = [{ name: "Area", quantity: sqYd, unit: "sq yd", category: "area" }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Input label={t('units.sq_ft') ?? 'Square Feet'} type="number" inputMode="decimal" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="100" />
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.common.results') ?? 'Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.sq_yd') ?? 'Square Yards'}</span>
              <span className="text-sm font-bold tabular-nums">{sqYd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('units.sq_m') ?? 'Square Meters'}</span>
              <span className="text-sm font-semibold tabular-nums">{sqM.toFixed(2)}</span>
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

export default withI18n(SquareYardsCalc);
