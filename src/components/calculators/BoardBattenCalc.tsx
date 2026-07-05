import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function BoardBattenCalc() {
  const { t } = useI18n();
  const [wallWidth, setWallWidth] = useState("120");
  const [wallHeight, setWallHeight] = useState("96");
  const [boardWidth, setBoardWidth] = useState("5.5");
  const [battenWidth, setBattenWidth] = useState("1.5");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("board-batten", "Board and Batten Calculator");

  const ww = parseNumber(wallWidth);
  const wh = parseNumber(wallHeight);
  const bw = parseNumber(boardWidth);
  const btw = parseNumber(battenWidth);
  const ws = parseNumber(waste) / 100;
  const totalPerBay = bw + btw;
  const bayCount = totalPerBay > 0 ? Math.floor(ww / totalPerBay) : 0;
  const boards = bayCount + 1;
  const boardLf = (boards * wh) / 12;
  const battenLf = (bayCount * wh) / 12;
  const boardLfWaste = boardLf * (1 + ws);
  const battenLfWaste = battenLf * (1 + ws);

  const projectInputs = { wallWidth: ww, wallHeight: wh, boardWidth: bw, battenWidth: btw, waste: ws };
  const projectResults = { boards, battens: bayCount, boardLf, battenLf, boardLfWaste, battenLfWaste };
  const projectMaterials: MaterialItem[] = [
    { name: "Boards", quantity: boards, unit: "pieces", category: "siding" },
    { name: "Batten Strips", quantity: bayCount, unit: "pieces", category: "siding" },
    { name: "Nails (est)", quantity: Math.ceil((boards + bayCount) * 8), unit: "nails", category: "siding" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.finishing.board_batten.wall_width') ?? 'Wall Width (in)'} type="number" inputMode="decimal" value={wallWidth} onChange={(e) => setWallWidth(e.target.value)} placeholder="120" />
            <Input label={t('calculators.detail.finishing.board_batten.wall_height') ?? 'Wall Height (in)'} type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="96" />
            <Input label={t('calculators.detail.finishing.board_batten.board_width') ?? 'Board Width (in)'} type="number" inputMode="decimal" value={boardWidth} onChange={(e) => setBoardWidth(e.target.value)} placeholder="5.5" />
            <Input label={t('calculators.detail.finishing.board_batten.batten_width') ?? 'Batten Width (in)'} type="number" inputMode="decimal" value={battenWidth} onChange={(e) => setBattenWidth(e.target.value)} placeholder="1.5" />
            <Input label={t('calculators.common.waste_factor') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="10" />
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
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.finishing.board_batten.materials_needed') ?? 'Materials Needed'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.board_batten.number_of_boards') ?? 'Number of Boards'}</span>
              <span className="text-sm font-bold tabular-nums">{boards}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.board_batten.battens_needed') ?? 'Battens Needed'}</span>
              <span className="text-sm font-bold tabular-nums">{bayCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.board_batten.board_linear_feet') ?? 'Board Linear Feet'}</span>
              <span className="text-sm font-semibold tabular-nums">{boardLf.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.board_batten.board_lf_waste', { waste: parseNumber(waste).toFixed(0) }) ?? `Board LF (+${parseNumber(waste).toFixed(0)}% waste)`}</span>
              <span className="text-sm font-semibold tabular-nums">{boardLfWaste.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.board_batten.batten_lf_waste', { waste: parseNumber(waste).toFixed(0) }) ?? `Batten LF (+${parseNumber(waste).toFixed(0)}% waste)`}</span>
              <span className="text-sm font-semibold tabular-nums">{battenLfWaste.toFixed(1)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(BoardBattenCalc);
