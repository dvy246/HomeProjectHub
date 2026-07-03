import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";
import SpiralStaircaseDiagram from "../diagrams/SpiralStaircaseDiagram";

export default function SpiralStaircaseCalc() {
  const [totalRise, setTotalRise] = useState("108");
  const [diameter, setDiameter] = useState("5");
  const [treadCount, setTreadCount] = useState("13");
  const [treadThickness, setTreadThickness] = useState("2");

  const tr = parseNumber(totalRise);
  const d = parseNumber(diameter);
  const tc = Math.max(2, Math.round(parseNumber(treadCount) || 2));
  const tt = parseNumber(treadThickness);

  const actualRiser = tc > 0 ? tr / tc : 0;
  const walkLineDiam = d - 1;
  const walkLineCirc = walkLineDiam * Math.PI;
  const treadWidthOuter = d * Math.PI / tc * 12;
  const treadWidthWalk = walkLineCirc / tc * 12;
  const degreesPerTread = 360 / tc;
  const totalDegrees = degreesPerTread * tc;
  const heliRise = actualRiser + tt;
  const stringerLength = tc > 0 ? Math.sqrt((walkLineCirc * 12) ** 2 + tr ** 2) / 12 : 0;
  const headroomClearance = tr > 0 ? 80 : 0;

  const ircRiserOk = actualRiser <= 9.5;
  const ircTreadOk = treadWidthWalk >= 7.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Rise (in)" type="number" inputMode="decimal" value={totalRise} onChange={(e) => setTotalRise(e.target.value)} placeholder="108" helperText="Floor to floor height" />
            <Input label="Diameter (ft)" type="number" inputMode="decimal" value={diameter} onChange={(e) => setDiameter(e.target.value)} placeholder="5" />
            <Input label="Number of Treads" type="number" inputMode="numeric" value={treadCount} onChange={(e) => setTreadCount(e.target.value)} placeholder="13" />
            <Input label="Tread Thickness (in)" type="number" inputMode="decimal" value={treadThickness} onChange={(e) => setTreadThickness(e.target.value)} placeholder="2" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 overflow-hidden">
          <SpiralStaircaseDiagram diameter={d} numSteps={tc} unitSystem="imperial" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold mb-3">Spiral Staircase Dimensions</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Riser Height</span>
              <span className="text-sm font-bold tabular-nums">{actualRiser.toFixed(2)}"</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Tread Width (outer edge)</span>
              <span className="text-sm font-semibold tabular-nums">{treadWidthOuter.toFixed(1)}"</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Tread Width (walk line)</span>
              <span className="text-sm font-semibold tabular-nums">{treadWidthWalk.toFixed(1)}"</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Degrees per Tread</span>
              <span className="text-sm font-semibold tabular-nums">{degreesPerTread.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Stringer Length (approx)</span>
              <span className="text-sm font-semibold tabular-nums">{stringerLength.toFixed(1)} ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Total Treads</span>
              <span className="text-sm font-bold tabular-nums">{tc}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">IRC Compliance</span>
              <span className={`text-sm font-bold tabular-nums ${ircRiserOk && ircTreadOk ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {ircRiserOk && ircTreadOk ? "Pass" : "Check"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
