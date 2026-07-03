import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import VinylFenceDiagram from "../diagrams/VinylFenceDiagram";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

export default function VinylFenceCalc() {
  const [fenceLength, setFenceLength] = useState("100");
  const [fenceHeight, setFenceHeight] = useState("6");
  const [panelWidth, setPanelWidth] = useState("8");
  const [gateCount, setGateCount] = useState("1");
  const [gateWidth, setGateWidth] = useState("4");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("vinyl-fence", "Vinyl Fence Calculator");

  const fl = parseNumber(fenceLength);
  const fh = parseNumber(fenceHeight);
  const pw = parseNumber(panelWidth);
  const gc = Math.round(parseNumber(gateCount));
  const gw = parseNumber(gateWidth);
  const gateFt = gc * gw;
  const fenceFt = Math.max(0, fl - gateFt);
  const panels = pw > 0 ? Math.ceil(fenceFt / pw) : 0;
  const posts = panels + 1 + gc;
  const gatePosts = gc * 2;
  const totalPosts = posts + gatePosts;
  const rails = panels * 2;

  const projectInputs = { fenceLength: fl, fenceHeight: fh, panelWidth: pw, gateCount: gc, gateWidth: gw };
  const projectResults = { panels, linePosts: posts, gatePosts, totalPosts, rails, gates: gc };
  const projectMaterials: MaterialItem[] = [
    { name: "Fence Panels", quantity: panels, unit: "panels", category: "fence" },
    { name: "Line Posts", quantity: posts, unit: "posts", category: "fence" },
    { name: "Gate Posts", quantity: gatePosts, unit: "posts", category: "fence" },
    { name: "Rails", quantity: rails, unit: "sections", category: "fence" },
    { name: "Gates", quantity: gc, unit: "gates", category: "fence" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fence Length (ft)" type="number" inputMode="decimal" value={fenceLength} onChange={(e) => setFenceLength(e.target.value)} placeholder="100" />
            <Input label="Fence Height (ft)" type="number" inputMode="decimal" value={fenceHeight} onChange={(e) => setFenceHeight(e.target.value)} placeholder="6" />
            <Input label="Panel Width (ft)" type="number" inputMode="decimal" value={panelWidth} onChange={(e) => setPanelWidth(e.target.value)} placeholder="8" />
            <Input label="Number of Gates" type="number" inputMode="decimal" value={gateCount} onChange={(e) => setGateCount(e.target.value)} placeholder="1" />
            <Input label="Gate Width (ft)" type="number" inputMode="decimal" value={gateWidth} onChange={(e) => setGateWidth(e.target.value)} placeholder="4" />
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
          <VinylFenceDiagram length={fl} height={fh} numSections={panels} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">Fence Materials</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{pw}ft Fence Panels</span>
              <span className="text-sm font-bold tabular-nums">{panels}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Line Posts</span>
              <span className="text-sm font-semibold tabular-nums">{posts}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Gate Posts</span>
              <span className="text-sm font-semibold tabular-nums">{gatePosts}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Total Posts</span>
              <span className="text-sm font-bold tabular-nums">{totalPosts}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Rail sections</span>
              <span className="text-sm font-semibold tabular-nums">{rails}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Gates ({gw}ft)</span>
              <span className="text-sm font-semibold tabular-nums">{gc}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
