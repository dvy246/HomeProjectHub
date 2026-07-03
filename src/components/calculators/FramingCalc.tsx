import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { calculateStudCount } from "../../lib/materialEngine";
import { parseNumber } from "../../lib/helpers";
import FramingDiagram from "../diagrams/FramingDiagram";

export default function FramingCalc() {
  const [wallLength, setWallLength] = useState("20");
  const [wallHeight, setWallHeight] = useState("8");
  const [studSpacing, setStudSpacing] = useState("16");
  const [waste, setWaste] = useState("5");

  const wl = parseNumber(wallLength);
  const wh = parseNumber(wallHeight);
  const sp = parseNumber(studSpacing) || 1;
  const ws = parseNumber(waste) / 100;

  const studs = calculateStudCount(wl, sp);
  const platesTotal = (wl * 3) / 12;
  const studsTotal = studs + Math.ceil(platesTotal);
  const studsWithWaste = Math.ceil(studsTotal * (1 + ws));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Wall Length (ft)" type="number" inputMode="decimal" value={wallLength} onChange={(e) => setWallLength(e.target.value)} placeholder="20" />
            <Input label="Wall Height (ft)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="8" />
            <Input label="Stud Spacing (in)" type="number" inputMode="decimal" value={studSpacing} onChange={(e) => setStudSpacing(e.target.value)} placeholder="16" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="5" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <FramingDiagram length={wl} height={wh} studSpacing={sp} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">Framing Estimate</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Wall Studs ({sp}" oc)</span>
              <span className="text-sm font-bold tabular-nums">{studs}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Plates (3 rows, stud-lengths)</span>
              <span className="text-sm font-semibold tabular-nums">{Math.ceil(platesTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Total 2x{wh.toFixed(0)}' Pieces</span>
              <span className="text-sm font-bold tabular-nums">{studsTotal}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Sheet Metal (sq ft)</span>
              <span className="text-sm font-semibold tabular-nums">{((wl * wh) * 0.1).toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">With {parseNumber(waste).toFixed(0)}% Waste</span>
              <span className="text-sm font-bold tabular-nums">{studsWithWaste}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
