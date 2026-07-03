import { useState } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { parseNumber } from "../../lib/helpers";

export default function GallonsPerSqFtCalc() {
  const [area, setArea] = useState("400");
  const [gallons, setGallons] = useState("1");
  const [coatings, setCoatings] = useState("1");

  const a = parseNumber(area);
  const gal = parseNumber(gallons);
  const coats = Math.max(1, Math.round(parseNumber(coatings) || 1));
  const gpsf = a > 0 ? gal / a : 0;
  const coveragePerGal = gal > 0 ? a / gal : 0;
  const totalNeeded = a > 0 ? (a / (coveragePerGal || 1)) * coats : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Area (sq ft)" type="number" inputMode="decimal" value={area} onChange={(e) => setArea(e.target.value)} placeholder="400" />
            <Input label="Gallons Used" type="number" inputMode="decimal" value={gallons} onChange={(e) => setGallons(e.target.value)} placeholder="1" />
            <Input label="Number of Coats" type="number" inputMode="numeric" value={coatings} onChange={(e) => setCoatings(e.target.value)} placeholder="1" />
          </div>
        </Card>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-4">
        <Card>
          <h3 className="text-sm font-semibold mb-3">Results</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Gallons per Sq Ft</span>
              <span className="text-sm font-bold tabular-nums">{gpsf.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
              <span className="text-xs text-[var(--fg-secondary)]">Coverage per Gallon</span>
              <span className="text-sm font-semibold tabular-nums">{coveragePerGal.toFixed(1)} sq ft</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-[var(--fg-secondary)]">Total Needed ({coats} coat{coats > 1 ? "s" : ""})</span>
              <span className="text-sm font-bold tabular-nums">{totalNeeded.toFixed(2)} gal</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
