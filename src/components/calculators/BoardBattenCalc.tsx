import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

export default function BoardBattenCalc() {
  const [wallWidth, setWallWidth] = useState("120");
  const [wallHeight, setWallHeight] = useState("96");
  const [boardWidth, setBoardWidth] = useState("5.5");
  const [battenWidth, setBattenWidth] = useState("1.5");
  const [waste, setWaste] = useState("10");

  const ww = parseNumber(wallWidth);
  const wh = parseNumber(wallHeight);
  const bw = parseNumber(boardWidth);
  const btw = parseNumber(battenWidth);
  const ws = parseNumber(waste) / 100;
  const totalPerBay = bw + btw;
  const bayCount = totalPerBay > 0 ? Math.floor(ww / totalPerBay) : 0;
  const boards = bayCount + 1;
  const boardLf = (boards * wh) / 12;
  const battenLf = (bayCount * wh) / 12;
  const boardLfWaste = boardLf * (1 + ws);
  const battenLfWaste = battenLf * (1 + ws);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Wall Width (in)" type="number" inputMode="decimal" value={wallWidth} onChange={(e) => setWallWidth(e.target.value)} placeholder="120" />
            <Input label="Wall Height (in)" type="number" inputMode="decimal" value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} placeholder="96" />
            <Input label="Board Width (in)" type="number" inputMode="decimal" value={boardWidth} onChange={(e) => setBoardWidth(e.target.value)} placeholder="5.5" />
            <Input label="Batten Width (in)" type="number" inputMode="decimal" value={battenWidth} onChange={(e) => setBattenWidth(e.target.value)} placeholder="1.5" />
            <Input label="Waste Factor (%)" type="number" inputMode="decimal" value={waste} onChange={(e) => setWaste(e.target.value)} placeholder="10" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Materials Needed</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Number of Boards</span>
              <span className="text-sm font-bold tabular-nums">{boards}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Battens Needed</span>
              <span className="text-sm font-bold tabular-nums">{bayCount}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Board Linear Feet</span>
              <span className="text-sm font-semibold tabular-nums">{boardLf.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Board LF (+{parseNumber(waste).toFixed(0)}% waste)</span>
              <span className="text-sm font-semibold tabular-nums">{boardLfWaste.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Batten LF (+{parseNumber(waste).toFixed(0)}% waste)</span>
              <span className="text-sm font-semibold tabular-nums">{battenLfWaste.toFixed(1)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
