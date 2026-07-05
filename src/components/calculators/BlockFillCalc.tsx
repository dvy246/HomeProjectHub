import { useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";

const BLOCK_SIZES: Record<string, { face: number; mortar: number }> = {
  "4x8x16": { face: 0.89, mortar: 0.004 },
  "6x8x16": { face: 1.33, mortar: 0.006 },
  "8x8x16": { face: 1.78, mortar: 0.007 },
  "10x8x16": { face: 2.22, mortar: 0.009 },
  "12x8x16": { face: 2.67, mortar: 0.011 },
};

export default function BlockFillCalc() {
  const { t } = useI18n();
  const [length, setLength] = useState<string>("30");
  const [height, setHeight] = useState<string>("8");
  const [blockSize, setBlockSize] = useState<string>("8x8x16");
  const [_mortarJoint, _setMortarJoint] = useState<string>("⅜");
  const [coreFill, setCoreFill] = useState<"none" | "partial" | "full">("none");
  const [wasteFactor, setWasteFactor] = useState<string>("5");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("block-fill", "Concrete Block Fill Calculator");

  const len = parseNumber(length);
  const hgt = parseNumber(height);
  const waste = parseNumber(wasteFactor) / 100;

  const block = BLOCK_SIZES[blockSize] || BLOCK_SIZES["8x8x16"];

  const wallArea = len * hgt;
  const blocksPerSqFt = 1 / block.face;
  const rawBlocks = Math.ceil(wallArea * blocksPerSqFt);
  const blocks = Math.ceil(rawBlocks * (1 + waste));

  const mortarBags = Math.ceil(wallArea * block.mortar);

  const fillFactors: Record<string, number> = {
    "4x8x16": 0.01, "6x8x16": 0.02, "8x8x16": 0.03, "10x8x16": 0.05, "12x8x16": 0.07,
  };
  const coreFillFactor = fillFactors[blockSize] || 0.03;
  const fillVolume = coreFill === "none" ? 0 : coreFill === "partial" ? wallArea * coreFillFactor * 0.5 : wallArea * coreFillFactor;
  const fillBags = coreFill === "none" ? 0 : Math.ceil(fillVolume / 0.6);

  const projectInputs = { length: len, height: hgt, wastePct: waste * 100 };
  const projectResults = { blocks, mortarBags, fillBags, fillVolume, wallArea };
  const projectMaterials: MaterialItem[] = [
    { name: "Concrete Mix (80lb bags)", quantity: blocks * 0.5 + mortarBags, unit: "bags", category: "concrete" },
    { name: "Grout", quantity: fillVolume, unit: "cu ft", category: "concrete" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.masonry.block_fill.wall_dimensions') ?? 'Wall Dimensions'}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label={t('calculators.detail.masonry.block_fill.wall_length_ft') ?? 'Wall Length (ft)'} type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 30'} />
            <Input label={t('calculators.detail.masonry.block_fill.wall_height_ft') ?? 'Wall Height (ft)'} type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 8'} />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">{t('calculators.detail.masonry.block_fill.block_config') ?? 'Block Configuration'}</h3>
          </div>
          <Select label={t('calculators.detail.masonry.block_fill.block_size') ?? 'Block Size'} value={blockSize} onChange={setBlockSize} options={Object.keys(BLOCK_SIZES).map((s) => ({ value: s, label: s }))} />
          <div className="mt-4">
            <Select label={t('calculators.detail.masonry.block_fill.core_fill') ?? 'Core Fill'} value={coreFill} onChange={(v) => setCoreFill(v as "none" | "partial" | "full")} options={[{ value: "none", label: t('calculators.detail.masonry.block_fill.core_none') ?? 'None' }, { value: "partial", label: t('calculators.detail.masonry.block_fill.core_partial') ?? 'Partial' }, { value: "full", label: t('calculators.detail.masonry.block_fill.core_full') ?? 'Full' }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('calculators.common.waste_factor') ?? 'Waste Factor (%)'} type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder={t('calculators.common.placeholder') ?? 'e.g. 5'} helperText={t('calculators.detail.masonry.block_fill.waste_helper') ?? 'Allow for cuts and breakage'} />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">{t('calculators.detail.masonry.block_fill.block_output') ?? 'Block Output'}</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.masonry.block_fill.blocks_needed') ?? 'Blocks Needed'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{blocks}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('calculators.detail.masonry.block_fill.blocks_unit') ?? 'blocks'}</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{blockSize} {t('calculators.detail.masonry.block_fill.block') ?? 'block'}, {wallArea.toFixed(0)} {t('units.sq_ft') ?? 'sq ft'} {t('calculators.detail.masonry.block_fill.wall') ?? 'wall'}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.masonry.block_fill.mortar_mix') ?? 'Mortar Mix (80lb bags)'}</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{mortarBags}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">{t('units.bags') ?? 'bags'}</span>
              </div>
            </div>
            {coreFill !== "none" && (
              <div className="pt-4 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--fg-muted)] block mb-1">{t('calculators.detail.masonry.block_fill.grout_fill') ?? 'Grout Fill'} ({coreFill === "partial" ? t('calculators.detail.masonry.block_fill.every_other') ?? 'Every other' : t('calculators.detail.masonry.block_fill.every') ?? 'Every'} {t('calculators.detail.masonry.block_fill.core') ?? 'core'})</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-bold">{fillBags}</span>
                  <span className="text-xs text-[var(--fg-muted)]">{t('calculators.detail.masonry.block_fill.bags_80lb') ?? '80lb bags'}</span>
                </div>
                <span className="text-xs text-[var(--fg-muted)] block mt-1">{fillVolume.toFixed(1)} {t('units.cu_ft') ?? 'cu ft'} {t('calculators.detail.masonry.block_fill.of_grout') ?? 'of grout'}</span>
              </div>
            )}
          </div>
        </div>

        <AddToProjectCard
          projects={projects}
          onAdd={(pid) => {
            clearSuccess();
            addToProject(pid, projectInputs, projectResults, projectMaterials);
          }}
          successMessage={projectSuccess}
        />

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">{t('calculators.detail.masonry.block_fill.size_reference') ?? 'Block Size Reference'}</h3>
          <div className="flex flex-col gap-1">
            {Object.entries(BLOCK_SIZES).map(([size, data]) => (
              <div key={size} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm font-mono font-semibold">{size}</span>
                <span className="text-xs text-[var(--fg-muted)]">{data.face.toFixed(2)} {t('units.sq_ft') ?? 'sq ft'} {t('calculators.detail.masonry.block_fill.face') ?? 'face'}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
