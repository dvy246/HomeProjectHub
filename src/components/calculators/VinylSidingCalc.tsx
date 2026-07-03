import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateRectArea, sqftToSqYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";

export default function VinylSidingCalc() {
  const [wallLength, setWallLength] = useState("40");
  const [wallHeight, setWallHeight] = useState("10");
  const [windows, setWindows] = useState("3");
  const [windowSqft, setWindowSqft] = useState("15");
  const [doors, setDoors] = useState("1");
  const [doorSqft, setDoorSqft] = useState("21");
  const [waste, setWaste] = useState("10");

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("vinyl-siding", "Vinyl Siding Calculator");

  const wl = parseNumber(wallLength);
  const wh = parseNumber(wallHeight);
  const win = Math.round(parseNumber(windows));
  const winSf = parseNumber(windowSqft);
  const dr = Math.round(parseNumber(doors));
  const drSf = parseNumber(doorSqft);
  const ws = parseNumber(waste) / 100;

  const grossArea = calculateRectArea(wl, wh);
  const openings = win * winSf + dr * drSf;
  const netArea = Math.max(0, grossArea - openings);
  const netSqYd = sqftToSqYd(netArea);
  const withWasteSf = netArea * (1 + ws);
  const starterStrip = wl / 12;
  const jChannel = ((wl * 2) + (wh * 2)) / 12;

  const projectInputs = { wallLength: wl, wallHeight: wh, windows: win, windowSqft: winSf, doors: dr, doorSqft: drSf, waste: ws };
  const projectResults = { grossArea, netArea, withWasteSf, starterPieces: Math.ceil(starterStrip) };
  const projectMaterials: MaterialItem[] = [
    { name: "Siding Panels", quantity: Math.ceil(withWasteSf / 100 * 4), unit: "panels", category: "siding" },
    { name: "J-Channel", quantity: Math.ceil(jChannel), unit: "pieces", category: "siding" },
    { name: "Starter Strips", quantity: Math.ceil(starterStrip), unit: "pieces", category: "siding" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Wall Perimeter (ft)" type="number" inputMode="decimal" value={wallLength} onChange={(e) => setWallLength(e.target.value)} placeholder="40" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="10" />
            <Input label="Windows" type="number" inputMode="numeric" value={windows} onChange={(e) => setWindows(e.target.value)} placeholder="3" />
            <Input label="Window Area (sq ft each)" type="number" inputMode="decimal" value={windowSqft} onChange={(e) => setWindowSqft(e.target.value)} placeholder="15" />
            <Input label="Doors" type="number" inputMode="numeric" value={doors} onChange={(e) => setDoors(e.target.value)} placeholder="1" />
            <Input label="Door Area (sq ft each)" type="number" inputMode="decimal" value={doorSqft} onChange={(e) => setDoorSqft(e.target.value)} placeholder="21" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="10" />
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
          <h3 className="text-sm font-semibold mb-3">Siding Estimate</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Gross Area</span>
              <span className="text-sm font-semibold tabular-nums">{grossArea.toFixed(1)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Openings</span>
              <span className="text-sm font-semibold tabular-nums">{openings.toFixed(1)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Net Siding Area</span>
              <span className="text-sm font-bold tabular-nums">{netArea.toFixed(1)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Siding Squares (100 sq ft)</span>
              <span className="text-sm font-semibold tabular-nums">{(netArea / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">With {parseNumber(waste).toFixed(0)}% Waste</span>
              <span className="text-sm font-bold tabular-nums">{withWasteSf.toFixed(1)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Starter Strip (pcs)</span>
              <span className="text-sm font-semibold tabular-nums">{Math.ceil(starterStrip)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
