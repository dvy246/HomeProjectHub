import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

export default function TonnageCalc() {
  const [pounds, setPounds] = useState("1000");

  const lb = parseNumber(pounds);
  const kg = lb * 0.453592;
  const shortTons = lb / 2000;
  const metricTons = kg / 1000;
  const longTons = lb / 2240;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Input label="Weight (pounds)" type="number" inputMode="decimal" value={pounds} onChange={(e) => setPounds(e.target.value)} placeholder="1000" />
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Tonnage Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Kilograms</span>
              <span className="text-sm font-bold tabular-nums">{kg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Short Tons (US)</span>
              <span className="text-sm font-bold tabular-nums">{shortTons.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Metric Tons</span>
              <span className="text-sm font-semibold tabular-nums">{metricTons.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Long Tons (UK)</span>
              <span className="text-sm font-semibold tabular-nums">{longTons.toFixed(4)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
