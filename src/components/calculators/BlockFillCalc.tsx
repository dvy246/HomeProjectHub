import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

const BLOCK_SIZES: Record<string, { face: number; mortar: number }> = {
  "4x8x16": { face: 0.89, mortar: 0.004 },
  "6x8x16": { face: 1.33, mortar: 0.006 },
  "8x8x16": { face: 1.78, mortar: 0.007 },
  "10x8x16": { face: 2.22, mortar: 0.009 },
  "12x8x16": { face: 2.67, mortar: 0.011 },
};

export default function BlockFillCalc() {
  const [length, setLength] = useState<string>("30");
  const [height, setHeight] = useState<string>("8");
  const [blockSize, setBlockSize] = useState<string>("8x8x16");
  const [mortarJoint, setMortarJoint] = useState<string>("⅜");
  const [coreFill, setCoreFill] = useState<"none" | "partial" | "full">("none");
  const [wasteFactor, setWasteFactor] = useState<string>("5");

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Wall Dimensions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Wall Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 30" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 8" />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Block Configuration</h3>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Block Size</label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.keys(BLOCK_SIZES).map((s) => (
                <button key={s} type="button" onClick={() => setBlockSize(s)} className={`border rounded-lg py-2 text-xs font-semibold font-mono transition-all active:scale-[0.97] ${blockSize === s ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Core Fill</label>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "partial", "full"] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => setCoreFill(opt)} className={`border rounded-lg py-2 text-xs font-semibold transition-all active:scale-[0.97] ${coreFill === opt ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]" : "border-[var(--border)] text-[var(--fg-secondary)] hover:border-[var(--border-hover)]"}`}>{opt === "none" ? "None" : opt === "partial" ? "Partial" : "Full"}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 5" helperText="Allow for cuts and breakage" />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Block Output</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Blocks Needed</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{blocks}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">blocks</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">{blockSize} block, {wallArea.toFixed(0)} sq ft wall</span>
            </div>
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Mortar Mix (80lb bags)</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-extrabold tracking-tight animate-fade-in-up">{mortarBags}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">bags</span>
              </div>
            </div>
            {coreFill !== "none" && (
              <div className="pt-4 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Grout Fill ({coreFill === "partial" ? "Every other" : "Every"} core)</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-2xl font-bold">{fillBags}</span>
                  <span className="text-xs text-[var(--fg-muted)]">80lb bags</span>
                </div>
                <span className="text-xs text-[var(--fg-muted)] block mt-1">{fillVolume.toFixed(1)} cu ft of grout</span>
              </div>
            )}
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Block Size Reference</h3>
          <div className="flex flex-col gap-1">
            {Object.entries(BLOCK_SIZES).map(([size, data]) => (
              <div key={size} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm font-mono font-semibold">{size}</span>
                <span className="text-xs text-[var(--fg-muted)]">{data.face.toFixed(2)} sq ft face</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
