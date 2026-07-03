import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import ConcreteCurbGutterDiagram from "../diagrams/ConcreteCurbGutterDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

export default function CurbGutterCalc() {
  const [length, setLength] = useState<string>("50");
  const [curbWidth, setCurbWidth] = useState<string>("6");
  const [curbHeight, setCurbHeight] = useState<string>("18");
  const [gutterWidth, setGutterWidth] = useState<string>("24");
  const [gutterDepth, setGutterDepth] = useState<string>("6");
  const [wasteFactor, setWasteFactor] = useState<string>("5");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("curb-gutter", "Curb and Gutter Calculator");

  const len = parseNumber(length);
  const cw = parseNumber(curbWidth) / 12;
  const ch = parseNumber(curbHeight) / 12;
  const gw = parseNumber(gutterWidth) / 12;
  const gd = parseNumber(gutterDepth) / 12;
  const waste = parseNumber(wasteFactor) / 100;

  const curbVolume = len * cw * ch;
  const gutterVolume = len * gw * gd;
  const totalVolumeCubicFeet = curbVolume + gutterVolume;
  const _totalVolumeCubicYards = totalVolumeCubicFeet / 27;
  const volumeWithWaste = totalVolumeCubicFeet * (1 + waste);
  const yardsWithWaste = volumeWithWaste / 27;

  const bags80 = Math.ceil(volumeWithWaste / 0.6);
  const bags60 = Math.ceil(volumeWithWaste / 0.45);

  const projectInputs = { length: len, curbWidthIn: parseNumber(curbWidth), curbHeightIn: parseNumber(curbHeight), gutterWidthIn: parseNumber(gutterWidth), gutterDepthIn: parseNumber(gutterDepth), wastePct: waste * 100 };
  const projectResults = { curbVolumeCuFt: curbVolume, gutterVolumeCuFt: gutterVolume, totalVolumeCuFt: totalVolumeCubicFeet, totalWithWasteCuYd: yardsWithWaste, bags80, bags60 };
  const projectMaterials: MaterialItem[] = [
    { name: "Concrete", quantity: yardsWithWaste, unit: "cu yd", category: "concrete" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Curb Dimensions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Curb Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 50" />
            <Input label="Curb Width (in)" type="number" inputMode="decimal" value={curbWidth} onChange={(e) => setCurbWidth(e.target.value)} placeholder="e.g. 6" helperText="Typically 6 inches" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Curb Height (in)" type="number" inputMode="decimal" value={curbHeight} onChange={(e) => setCurbHeight(e.target.value)} placeholder="e.g. 18" helperText="From base to top" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={wasteFactor} onChange={(e) => setWasteFactor(e.target.value)} placeholder="e.g. 5" />
          </div>
        </Card>

        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h3 className="text-sm font-semibold tracking-tight">Gutter Dimensions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Gutter Width (in)" type="number" inputMode="decimal" value={gutterWidth} onChange={(e) => setGutterWidth(e.target.value)} placeholder="e.g. 24" helperText="Width of the gutter pan" />
            <Input label="Gutter Depth (in)" type="number" inputMode="decimal" value={gutterDepth} onChange={(e) => setGutterDepth(e.target.value)} placeholder="e.g. 6" helperText="Thickness of gutter slab" />
          </div>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <ConcreteCurbGutterDiagram curbWidth={parseNumber(curbWidth)} gutterWidth={parseNumber(gutterWidth)} height={parseNumber(curbHeight)} length={len} unitSystem="imperial" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Concrete Output</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Concrete Volume</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight animate-fade-in-up">{yardsWithWaste.toFixed(2)}</span>
                <span className="text-base text-[var(--fg-muted)] font-medium">cu yd</span>
              </div>
              <span className="text-xs text-[var(--fg-muted)] block mt-1">With waste: {volumeWithWaste.toFixed(0)} cu ft</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Curb Volume</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold">{curbVolume.toFixed(1)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">cu ft</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Gutter Volume</span>
                <div className="flex items-baseline gap-1 tabular-nums">
                  <span className="text-2xl font-bold">{gutterVolume.toFixed(1)}</span>
                  <span className="text-xs text-[var(--fg-muted)]">cu ft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Bag Counts</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">80lb Bags</span>
              <span className="text-sm font-bold tabular-nums">{bags80}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">60lb Bags</span>
              <span className="text-sm font-bold tabular-nums">{bags60}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-3">Volume Breakdown</h3>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Curb ({curbWidth}"×{curbHeight}")</span>
              <span className="text-sm font-bold tabular-nums">{curbVolume.toFixed(1)} cu ft</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm font-medium">Gutter ({gutterWidth}"×{gutterDepth}")</span>
              <span className="text-sm font-bold tabular-nums">{gutterVolume.toFixed(1)} cu ft</span>
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
