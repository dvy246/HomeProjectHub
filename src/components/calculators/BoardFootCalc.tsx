import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateBoardFeet, cuFeetToCuYards } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function BoardFootCalc() {
  const { t } = useI18n();
  const [length, setLength] = useState("8");
  const [width, setWidth] = useState("6");
  const [thickness, setThickness] = useState("1");
  const [quantity, setQuantity] = useState("1");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("board-foot", "Board Foot Calculator");

  const l = parseNumber(length);
  const w = parseNumber(width);
  const thk = parseNumber(thickness);
  const qty = Math.max(1, parseNumber(quantity) || 1);
  const bdFt = calculateBoardFeet(l * 12, w, thk, qty);
  const cuFt = (l * (w / 12) * (thk / 12)) * qty;
  const cuYd = cuFeetToCuYards(cuFt);

  const projectInputs = { length: l, width: w, thickness: thk, quantity: qty };
  const projectResults = { boardFeet: bdFt, cuFt, cuYd };
  const projectMaterials: MaterialItem[] = [
    { name: "Lumber (Board Feet)", quantity: bdFt, unit: "bd ft", category: "lumber" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.wood.board_foot.length_ft') ?? 'Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '8'} />
            <Input label={t('calculators.detail.wood.board_foot.width_in') ?? 'Width (in)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '6'} />
            <Input label={t('calculators.detail.wood.board_foot.thickness_in') ?? 'Thickness (in)'} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '1'} />
            <Input label={t('calculators.detail.wood.board_foot.quantity') ?? 'Quantity'} type="number" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '1'} />
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
          <h3 className="text-sm font-semibold mb-3">{t('calculators.common.results') ?? 'Results'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.board_foot.board_feet') ?? 'Board Feet'}</span>
              <span className="text-sm font-bold tabular-nums">{bdFt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.board_foot.cubic_feet') ?? 'Cubic Feet'}</span>
              <span className="text-sm font-semibold tabular-nums">{cuFt.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.board_foot.cubic_yards') ?? 'Cubic Yards'}</span>
              <span className="text-sm font-semibold tabular-nums">{cuYd.toFixed(4)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(BoardFootCalc);
