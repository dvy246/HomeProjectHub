import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

interface Props {
  labelSingular: string;
  labelPlural: string;
  defaultRailLength?: string;
  defaultSpacing?: string;
  defaultThickness?: string;
}

export default function SpacingCalc({
  labelSingular,
  labelPlural,
  defaultRailLength = "96",
  defaultSpacing = "4",
  defaultThickness = "1.5",
}: Props) {
  const [railLength, setRailLength] = useState(defaultRailLength);
  const [spacing, setSpacing] = useState(defaultSpacing);
  const [thickness, setThickness] = useState(defaultThickness);

  const rl = parseNumber(railLength);
  const sp = parseNumber(spacing);
  const th = parseNumber(thickness);
  const totalPerUnit = sp + th;
  const count = totalPerUnit > 0 ? Math.floor(rl / totalPerUnit) : 0;
  const actualSpacing = count > 0 ? (rl - count * th) / (count + 1) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-3 gap-4">
            <Input label={`Rail Length (in)`} type="number" inputMode="decimal" value={railLength} onChange={(e) => setRailLength(e.target.value)} placeholder={defaultRailLength} />
            <Input label={`Max ${labelSingular} Spacing (in)`} type="number" inputMode="decimal" value={spacing} onChange={(e) => setSpacing(e.target.value)} placeholder={defaultSpacing} />
            <Input label={`${labelSingular} Thickness (in)`} type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder={defaultThickness} />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Spacing Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">{labelPlural} Needed</span>
              <span className="text-sm font-bold tabular-nums">{count}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Actual Spacing</span>
              <span className="text-sm font-semibold tabular-nums">{actualSpacing > 0 ? `${actualSpacing.toFixed(2)} in` : "—"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
