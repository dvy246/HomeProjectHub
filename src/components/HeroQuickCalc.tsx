import { useState } from "react";
import type React from "react";
import { Input } from "./ui/Input";
import { subtractOpenings } from "../lib/geometry";
import { parseNumber } from "../lib/helpers";
import { useProjects } from "../lib/useProjects";
import type { MaterialItem } from "../lib/projectEngine";
import AddToProjectCard from "./ui/AddToProjectCard";

export default function HeroQuickCalc() {
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("10");
  const [doors, setDoors] = useState("1");
  const [windows, setWindows] = useState("2");
  const [coats, setCoats] = useState<1 | 2>(1);

  const { projects, addToProject, successMessage, clearSuccess } = useProjects("paint", "Interior Paint Calculator");

  const len = parseNumber(length);
  const wid = parseNumber(width);
  const doorCount = Math.round(parseNumber(doors));
  const windowCount = Math.round(parseNumber(windows));

  const wallPerimeter = 2 * (len + wid);
  const wallArea = wallPerimeter * 8;
  const netWallArea = subtractOpenings(wallArea, [
    { type: "door", count: doorCount },
    { type: "window", count: windowCount },
  ]);
  const rawGallons = (netWallArea * coats) / 350;
  const gallons = Math.max(0.5, Math.round(rawGallons * 2) / 2);

  const projectInputs: Record<string, number> = {
    length: len, width: wid, doors: doorCount, windows: windowCount, coats,
  };
  const projectResults = { wallArea: netWallArea, gallons };
  const projectMaterials: MaterialItem[] = [
    { name: "Paint", quantity: gallons, unit: "gal", category: "paint" },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          Quick Estimate — Live Preview
        </span>
      </div>

      <h3 className="text-sm font-bold tracking-tight mb-4">
        Paint Needed for a Room
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Length (ft)"
          type="number"
          inputMode="decimal"
          value={length}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLength(e.target.value)}
        />
        <Input
          label="Width (ft)"
          type="number"
          inputMode="decimal"
          value={width}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Input
          label="Doors"
          type="number"
          inputMode="numeric"
          value={doors}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoors(e.target.value)}
          min="0"
          max="10"
        />
        <Input
          label="Windows"
          type="number"
          inputMode="numeric"
          value={windows}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWindows(e.target.value)}
          min="0"
          max="10"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setCoats(1)}
          className={`flex-1 text-xs font-semibold rounded-lg h-9 transition-all ${
            coats === 1
              ? "bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm"
              : "bg-[var(--bg-inset)] text-[var(--fg-secondary)] hover:bg-[var(--border)]"
          }`}
        >
          1 Coat
        </button>
        <button
          type="button"
          onClick={() => setCoats(2)}
          className={`flex-1 text-xs font-semibold rounded-lg h-9 transition-all ${
            coats === 2
              ? "bg-[var(--accent)] text-[var(--accent-fg)] shadow-sm"
              : "bg-[var(--bg-inset)] text-[var(--fg-secondary)] hover:bg-[var(--border)]"
          }`}
        >
          2 Coats
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--border)]">
        <div className="text-center">
          <div className="text-xs text-[var(--fg-muted)] mb-0.5">You need approximately</div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-extrabold tracking-tight tabular-nums text-[var(--fg)]">
              {gallons}
            </span>
            <span className="text-sm font-semibold text-[var(--fg-secondary)]">gallons</span>
          </div>
          <div className="text-[11px] text-[var(--fg-muted)] mt-1">
            for a {len}' × {wid}' room &middot; {coats} coat{coats > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AddToProjectCard
          projects={projects}
          onAdd={(pid: string) => {
            clearSuccess();
            addToProject(pid, projectInputs, projectResults, projectMaterials);
          }}
          successMessage={successMessage}
        />
      </div>

      <a
        href="/calculators/paint/"
        className="block text-center text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] mt-3 transition-colors"
      >
        Open full Paint Calculator with primer, ceiling, and waste factor &rarr;
      </a>
    </div>
  );
}
