import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { sqftToSqYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";

export default function SquareYardsCalc() {
  const [sqft, setSqft] = useState("100");

  const sf = parseNumber(sqft);
  const sqYd = sqftToSqYd(sf);
  const sqM = sf * 0.092903;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <Input label="Square Feet" type="number" inputMode="decimal" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="100" />
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Square Yards</span>
              <span className="text-sm font-bold tabular-nums">{sqYd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Square Meters</span>
              <span className="text-sm font-semibold tabular-nums">{sqM.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
