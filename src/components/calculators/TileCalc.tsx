import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { PRESETS } from "../../lib/presets";
import { calculateRectArea } from "../../lib/geometry";
import { applyWasteFactor, calculatePackaging } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import TileDiagram from "../diagrams/TileDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";

export default function TileCalc() {
  const { t } = useI18n();
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [tileWidth, setTileWidth] = useState("12");
  const [tileLength, setTileLength] = useState("12");
  const [tilesPerBox, setTilesPerBox] = useState("10");
  const [wasteFactor, setWasteFactor] = useState("10");
  const [layout, setLayout] = useState<"grid" | "diagonal" | "herringbone">("grid");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("tile", "Tile Calculator");

  const lenNum = parseNumber(length);
  const widNum = parseNumber(width);
  const tileWidthInches = parseNumber(tileWidth);
  const tileLengthInches = parseNumber(tileLength);
  const tilesPerBoxNum = parseNumber(tilesPerBox);
  const wastePercent = parseNumber(wasteFactor) / 100;

  const effectiveWaste = layout === "diagonal" ? wastePercent + 0.05 : layout === "herringbone" ? wastePercent + 0.10 : wastePercent;

  const canCompute = lenNum > 0 && widNum > 0 && tileWidthInches > 0 && tileLengthInches > 0;

  const areaSqIn = calculateRectArea(lenNum * 12, widNum * 12);
  const tileAreaSqIn = tileWidthInches * tileLengthInches;
  const areaWithWasteSqIn = applyWasteFactor(areaSqIn, effectiveWaste);
  const tilesNeeded = canCompute ? Math.ceil(areaSqIn / tileAreaSqIn) : 0;
  const tilesWithWaste = canCompute ? Math.ceil(areaWithWasteSqIn / tileAreaSqIn) : 0;

  const sqFtArea = lenNum * widNum;
  const sqFtWithWaste = canCompute ? applyWasteFactor(sqFtArea, effectiveWaste) : 0;

  const boxesNeeded = canCompute && tilesPerBoxNum > 0 ? calculatePackaging(tilesWithWaste, tilesPerBoxNum) : 0;
  const tileSqFt = tileAreaSqIn / 144;

  const projectInputs = { length: lenNum, width: widNum, tileWidth: tileWidthInches, tileLength: tileLengthInches, tilesPerBox: tilesPerBoxNum, waste: wastePercent };
  const projectResults = { sqFtArea, sqFtWithWaste, tilesNeeded, tilesWithWaste, boxesNeeded };
  const projectMaterials: MaterialItem[] = [
    { name: "Tiles", quantity: tilesWithWaste, unit: "tiles", category: "flooring" },
    { name: "Boxes of Tiles", quantity: boxesNeeded, unit: "boxes", category: "flooring" },
    { name: "Grout (est)", quantity: Math.ceil(sqFtArea * 0.02), unit: "lb", category: "flooring" },
    { name: "Thinset (est)", quantity: Math.ceil(sqFtArea * 0.05), unit: "lb", category: "flooring" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h2 className="text-sm font-semibold tracking-tight">{t('calculators.detail.finishing.tile.floor_dimensions') ?? 'Floor Dimensions'}</h2>
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]">{t('calculators.common.size_presets') ?? 'Standard Room Presets'}</label>
            <select
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.rooms[idx];
                  setLength(p.length);
                  setWidth(p.width);
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-9 px-2.5 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
            >
              {PRESETS.rooms.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('fields.length_ft') ?? 'Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} />
            <Input label={t('fields.width_ft') ?? 'Width (ft)'} type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.finishing.tile.tile_width') ?? 'Tile Width (inches)'} type="number" inputMode="decimal" value={tileWidth} onChange={(e) => setTileWidth(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 12'} helperText={t('calculators.detail.finishing.tile.tile_width_hint') ?? 'Short side of one tile'} />
            <Input label={t('calculators.detail.finishing.tile.tile_length') ?? 'Tile Length (inches)'} type="number" inputMode="decimal" value={tileLength} onChange={(e) => setTileLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 24'} helperText={t('calculators.detail.finishing.tile.tile_length_hint') ?? 'Long side of one tile'} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.finishing.tile.tiles_per_box') ?? 'Tiles per Box'} type="number" inputMode="numeric" value={tilesPerBox} onChange={(e) => setTilesPerBox(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} helperText={t('calculators.detail.finishing.tile.tiles_per_box_hint') ?? 'Check product packaging'} />
            <Input label={t('calculators.common.waste_factor') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 10'} />
          </div>

          <div className="mb-2">
            <label htmlFor="tile-layout" className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">
              {t('calculators.detail.finishing.tile.layout_pattern') ?? 'Layout Pattern'}
            </label>
            <select
              id="tile-layout"
              value={layout}
              onChange={(event) => setLayout(event.target.value as "grid" | "diagonal" | "herringbone")}
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] focus:bg-[var(--bg)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors"
            >
              <option value="grid">{t('calculators.detail.finishing.tile.layout_grid') ?? 'Grid - base waste only'}</option>
              <option value="diagonal">{t('calculators.detail.finishing.tile.layout_diagonal') ?? 'Diagonal - adds 5% waste'}</option>
              <option value="herringbone">{t('calculators.detail.finishing.tile.layout_herringbone') ?? 'Herringbone - adds 10% waste'}</option>
            </select>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <TileDiagram roomWidth={widNum} roomLength={lenNum} tileWidth={tileWidthInches} tileLength={tileLengthInches} pattern={layout} unitSystem="imperial" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.finishing.tile.tile_results') ?? 'Tile Results'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.finishing.tile.total_area') ?? 'Total Area'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{sqFtArea.toFixed(1)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.sq_ft') ?? 'sq ft'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">
                {t('calculators.detail.finishing.tile.order_coverage_target', { sqFtWithWaste: sqFtWithWaste.toFixed(1) }) ?? `Order coverage target: ${sqFtWithWaste.toFixed(1)} sq ft with waste`}
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">
                {t('calculators.detail.finishing.tile.tiles_needed', { tileWidth: tileWidthInches || 0, tileLength: tileLengthInches || 0, layout }) ?? `Tiles Needed (${tileWidthInches || 0}\u00d7${tileLengthInches || 0} in, ${layout} layout)`}
              </span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">{tilesWithWaste}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('calculators.detail.finishing.tile.tiles') ?? 'tiles'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">
                {t('calculators.detail.finishing.tile.base_tiles', { tilesNeeded, tileSqFt: tileSqFt.toFixed(2), wastePct: (effectiveWaste * 100).toFixed(0) }) ?? `Base: ${tilesNeeded} tiles at ${tileSqFt.toFixed(2)} sq ft each + ${(effectiveWaste * 100).toFixed(0)}% waste`}
              </span>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--fg-muted)] block mb-2">{t('calculators.detail.finishing.tile.boxes_needed') ?? 'Boxes Needed'}</span>
              <div className="rounded-lg bg-[var(--bg-muted)] p-3 text-center">
                <span className="text-2xl font-bold tabular-nums block">{boxesNeeded}</span>
                <span className="text-[10px] text-[var(--fg-muted)]">{t('calculators.detail.finishing.tile.boxes_at', { tilesPerBox: tilesPerBoxNum || 0 }) ?? `boxes at ${tilesPerBoxNum || 0} tiles per box`}</span>
              </div>
              <p className="text-[10px] text-[var(--fg-muted)] leading-relaxed mt-2">
                {t('calculators.detail.finishing.tile.box_coverage_hint', { sqFtWithWaste: sqFtWithWaste.toFixed(1) }) ?? `If the store lists box coverage in square feet instead of tile count, divide ${sqFtWithWaste.toFixed(1)} sq ft by the box coverage and round up.`}
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--border)] mt-1">
              <a
                href="#add-to-project-section"
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors text-center shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('calculators.common.save_to_planner') ?? 'Save to Project Planner'}
              </a>
            </div>
          </div>
        </div>
        <div id="add-to-project-section" className="mt-4">
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
    </div>
  );
}
