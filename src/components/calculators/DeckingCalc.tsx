import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { PRESETS } from "../../lib/presets";
import { parseNumber } from "../../lib/helpers";
import DeckingDiagram from "../diagrams/DeckingDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const BOARD_WIDTHS = [
  { value: "5.5", label: "5.5\" (Actual 2x6)" },
  { value: "3.5", label: "3.5\" (Actual 2x4)" },
  { value: "7.25", label: "7.25\" (Actual 2x8)" },
  { value: "5", label: "5\" (5/4 Decking)" },
  { value: "6", label: "6\" (Composite)" },
];

function DeckingCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [deckLength, setDeckLength] = useState("12");
  const [deckWidth, setDeckWidth] = useState("10");
  const [boardWidth, setBoardWidth] = useState("5.5");
  const [gap, setGap] = useState("0.125");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("decking", "Decking Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [deckLength, deckWidth, boardWidth, gap, waste, onCalculate]);

  const dl = parseNumber(deckLength);
  const dw = parseNumber(deckWidth);
  const bw = parseNumber(boardWidth);
  const g = parseNumber(gap);
  const ws = parseNumber(waste) / 100;

  const totalWidthIn = dw * 12;
  const boardsAcross = (bw + g) > 0 ? Math.ceil(totalWidthIn / (bw + g)) : 0;
  const totalBoards = boardsAcross * 1;
  const linearFt = totalBoards * dl;
  const deckSqFt = dl * dw;
  const boardsWithWaste = Math.ceil(totalBoards * (1 + ws));
  const fastenerCount = Math.ceil(linearFt * 2.5);

  const projectInputs = { deckLength: dl, deckWidth: dw, boardWidth: bw, gap: g, waste: ws };
  const projectResults = { boards: boardsAcross, linearFt, deckSqFt, boardsWithWaste, fastenerCount };
  const projectMaterials: MaterialItem[] = [
    { name: "Deck Boards", quantity: boardsWithWaste, unit: "boards", category: "decking" },
    { name: "Fasteners/Screws", quantity: fastenerCount, unit: "screws", category: "decking" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.size_presets') ?? 'Deck Size Presets'}</label>
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.deck[idx];
                  setDeckLength(p.length);
                  setDeckWidth(p.width);
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-9 px-2.5 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
            >
              {PRESETS.deck.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.wood.decking.deck_length_ft') ?? 'Deck Length (ft)'} type="number" inputMode="decimal" value={deckLength} onChange={(e) => setDeckLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '12'} />
            <Input label={t('calculators.detail.wood.decking.deck_width_ft') ?? 'Deck Width (ft)'} type="number" inputMode="decimal" value={deckWidth} onChange={(e) => setDeckWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '10'} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.board_width') ?? 'Board Width'}</label>
              <select value={boardWidth} onChange={(e) => setBoardWidth(e.target.value)} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {BOARD_WIDTHS.map((bw) => (
                  <option key={bw.value} value={bw.value}>{bw.label}</option>
                ))}
              </select>
            </div>
            <Input label={t('calculators.detail.wood.decking.gap_between_boards') ?? 'Gap Between Boards (in)'} type="number" inputMode="decimal" value={gap} onChange={(e) => setGap(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '0.125'} />
            <Input label={t('calculators.detail.wood.decking.waste_factor_pct') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder={t('calculators.common.placeholder') ?? '10'} />
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
          <DeckingDiagram length={dl} width={dw} joistSpacing={16} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.wood.decking.estimate') ?? 'Decking Estimate'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.deck_boards') ?? 'Deck Boards'} ({bw}{t('units.in') ?? 'in'} {t('calculators.detail.wood.decking.wide') ?? 'wide'})</span>
              <span className="text-sm font-bold tabular-nums">{boardsAcross}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.total_linear_ft') ?? 'Total Linear Feet'}</span>
              <span className="text-sm font-semibold tabular-nums">{linearFt.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.deck_area') ?? 'Deck Area'}</span>
              <span className="text-sm font-semibold tabular-nums">{deckSqFt.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.with_waste') ?? 'With'} {parseNumber(waste).toFixed(0)}% {t('calculators.detail.wood.decking.waste') ?? 'Waste'}</span>
              <span className="text-sm font-bold tabular-nums">{boardsWithWaste}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.wood.decking.fasteners_approx') ?? 'Fasteners (approx)'}</span>
              <span className="text-sm font-semibold tabular-nums">{fastenerCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(DeckingCalc);
