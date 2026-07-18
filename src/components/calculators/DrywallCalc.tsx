import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { PRESETS } from "../../lib/presets";
import { calculateDrywallSheets } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { ReportEngine } from "../ui/ReportEngine";

const SHEET_SIZES = ["4x8", "4x10", "4x12"] as const;

function DrywallCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void } = {}) {
  const { t } = useI18n();
  const [wallLengths, setWallLengths] = useState("40");
  const [wallHeight, setWallHeight] = useState("8");
  const [sheetSize, setSheetSize] = useState<"4x8" | "4x10" | "4x12">("4x8");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("drywall", "Drywall Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [wallLengths, wallHeight, sheetSize, waste, onCalculate]);

  const wl = parseNumber(wallLengths);
  const wh = parseNumber(wallHeight);
  const ws = parseNumber(waste) / 100;

  const wallArea = wl * wh;
  const result = calculateDrywallSheets(wallArea, sheetSize);
  const sheetsWithWaste = Math.ceil(result.sheets * (1 + ws));

  const projectInputs = { wallLengths: wl, wallHeight: wh, waste: ws };
  const projectResults = { sheets: result.sheets, sheetsWithWaste, jointTapeLf: result.tapeLf, jointCompoundLb: result.mudLb, screwsLb: result.screwsLb };
  const projectMaterials: MaterialItem[] = [
    { name: "Drywall Sheets", quantity: sheetsWithWaste, unit: "sheets", category: "drywall" },
    { name: "Joint Tape", quantity: result.tapeLf, unit: "lf", category: "drywall" },
    { name: "Joint Compound", quantity: result.mudLb, unit: "lb", category: "drywall" },
    { name: "Drywall Screws", quantity: result.screwsLb, unit: "lb", category: "drywall" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.common.size_presets') ?? 'Standard Room Presets'}</label>
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.rooms[idx];
                  const l = parseFloat(p.length);
                  const w = parseFloat(p.width);
                  setWallLengths(((l + w) * 2).toString());
                  setWallHeight(p.height || "8");
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-2.5 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
            >
              {PRESETS.rooms.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.detail.finishing.drywall.total_wall_length') ?? 'Total Wall Length (ft)'} type="number" inputMode="decimal" value={wallLengths} onChange={(e) => setWallLengths(e.target.value)} placeholder="40" helperText={t('calculators.detail.finishing.drywall.total_wall_length_hint') ?? 'Sum of all wall lengths'} />
            <Input label={t('fields.height_ft') ?? 'Wall Height (ft)'} type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="8" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.sheet_size') ?? 'Sheet Size'}</label>
              <select value={sheetSize} onChange={(e) => setSheetSize(e.target.value as "4x8" | "4x10" | "4x12")} className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors">
                {SHEET_SIZES.map((size) => (
                  <option key={size} value={size}>{size} ({size === "4x8" ? 32 : size === "4x10" ? 40 : 48} {t('units.sq_ft') ?? 'sq ft'})</option>
                ))}
              </select>
            </div>
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
          <h3 className="text-sm font-semibold mb-3">{t('calculators.detail.finishing.drywall.drywall_materials') ?? 'Drywall Materials'}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.wall_area') ?? 'Wall Area'}</span>
              <span className="text-sm font-semibold tabular-nums">{wallArea.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.sheets_label', { size: sheetSize }) ?? `${sheetSize} Sheets`}</span>
              <span className="text-sm font-bold tabular-nums">{result.sheets}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.with_waste', { waste: parseNumber(waste).toFixed(0) }) ?? `With ${parseNumber(waste).toFixed(0)}% Waste`}</span>
              <span className="text-sm font-bold tabular-nums">{sheetsWithWaste}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.joint_tape') ?? 'Joint Tape'}</span>
              <span className="text-sm font-semibold tabular-nums">{result.tapeLf} lf</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.joint_compound') ?? 'Joint Compound'}</span>
              <span className="text-sm font-semibold tabular-nums">{result.mudLb} lb</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">{t('calculators.detail.finishing.drywall.drywall_screws') ?? 'Drywall Screws'}</span>
              <span className="text-sm font-semibold tabular-nums">{result.screwsLb} lb</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-12">
        <ReportEngine
          calculatorId="drywall"
          inputs={{
            wallLengths: { value: wl, unit: "ft", label: "Wall Length" },
            wallHeight: { value: wh, unit: "ft", label: "Wall Height" },
          }}
          results={{
            wallArea: { value: wallArea, unit: "sq ft", label: "Wall Area" },
          }}
          materials={projectMaterials}
          metrics={{
            wasteFactorPercent: ws,
            weightLbs: sheetsWithWaste * 50, // Drywall sheets average weight
          }}
        />
      </div>
    </div>
  );
}

export default withI18n(DrywallCalc);
