import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { sqftToCuYd } from "../../lib/geometry";
import { parseNumber } from "../../lib/helpers";

export default function SqFtToCuYdCalc() {
  const [sqft, setSqft] = useState("100");
  const [depth, setDepth] = useState("4");

  const sf = parseNumber(sqft);
  const d = parseNumber(depth);
  const cuYd = sqftToCuYd(sf, d);
  const cuFt = sf * (d / 12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Square Footage" type="number" inputMode="decimal" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="100" />
            <Input label="Depth (in)" type="number" inputMode="decimal" value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="4" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Cubic Yards</span>
              <span className="text-sm font-bold tabular-nums">{cuYd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Cubic Feet</span>
              <span className="text-sm font-semibold tabular-nums">{cuFt.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
