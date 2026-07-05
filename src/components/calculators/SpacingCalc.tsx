import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

interface Props {
  labelSingular: string;
  labelPlural: string;
  defaultRailLength?: string;
  defaultSpacing?: string;
  defaultThickness?: string;
  calculatorSlug?: string;
  calculatorName?: string;
}

function SpacingCalc({
  labelSingular,
  labelPlural,
  defaultRailLength = "96",
  defaultSpacing = "4",
  defaultThickness = "1.5",
  calculatorSlug = "baluster",
  calculatorName = "Baluster Spacing Calculator",
}: Props) {
  const { t } = useI18n();
  const [railLength, setRailLength] = useState(defaultRailLength);
  const [spacing, setSpacing] = useState(defaultSpacing);
  const [thickness, setThickness] = useState(defaultThickness);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects(calculatorSlug, calculatorName);

  const rl = parseNumber(railLength);
  const sp = parseNumber(spacing);
  const th = parseNumber(thickness);
  const totalPerUnit = sp + th;
  const count = totalPerUnit > 0 ? Math.floor(rl / totalPerUnit) : 0;
  const actualSpacing = count > 0 ? (rl - count * th) / (count + 1) : 0;

  const projectInputs = { railLength: rl, maxSpacing: sp, thickness: th };
  const projectResults = { count, actualSpacing };
  const projectMaterials: MaterialItem[] = [
    { name: labelPlural, quantity: count, unit: "pieces", category: "railing" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-3 gap-4">
            <Input label={t('calculators.detail.finishing.spacing.rail_length') ?? 'Rail Length (in)'} type="number" inputMode="decimal" value={railLength} onChange={(e) => setRailLength(e.target.value)} placeholder={defaultRailLength} />
            <Input label={t('calculators.detail.finishing.spacing.max_spacing', { label: labelSingular }) ?? `Max ${labelSingular} Spacing (in)`} type="number" inputMode="decimal" value={spacing} onChange={(e) => setSpacing(e.target.value)} placeholder={defaultSpacing} />
            <Input label={t('calculators.detail.finishing.spacing.thickness', { label: labelSingular }) ?? `${labelSingular} Thickness (in)`} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder={defaultThickness} />
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
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.finishing.spacing.spacing_results') ?? 'Spacing Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.spacing.needed', { label: labelPlural }) ?? `${labelPlural} Needed`}</span>
              <span className="text-sm font-bold tabular-nums">{count}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.spacing.actual_spacing') ?? 'Actual Spacing'}</span>
              <span className="text-sm font-semibold tabular-nums">{actualSpacing > 0 ? `${actualSpacing.toFixed(2)} in` : "—"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(SpacingCalc);
