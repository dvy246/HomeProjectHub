import React, { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../lib/geometry";
import { applyWasteFactor } from "../lib/materialEngine";

export default function CompareMaterials() {
  const [length, setLength] = useState<string>("20");
  const [width, setWidth] = useState<string>("10");
  const [thickness, setThickness] = useState<string>("4"); // inches

  const parseInput = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const lenNum = parseInput(length);
  const widNum = parseInput(width);
  const thickNum = parseInput(thickness);

  // Calculations
  const areaSqFt = calculateRectArea(lenNum, widNum);
  const thicknessFt = thickNum / 12;
  const volumeCuFt = calculateVolume(areaSqFt, thicknessFt);
  
  // Concrete: 10% waste
  const concreteVolumeCuYd = cuFeetToCuYards(applyWasteFactor(volumeCuFt, 0.10));
  // Pavers: Sq footage + 5% waste
  const paversSqFt = applyWasteFactor(areaSqFt, 0.05);
  // Gravel: 10% compaction waste
  const gravelVolumeCuYd = cuFeetToCuYards(applyWasteFactor(volumeCuFt, 0.10));

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <h3 className="font-bold text-base uppercase tracking-wider text-neutral-800 dark:text-neutral-200 mb-4">
          Project Dimensions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Length (ft)"
            type="number"
            inputMode="decimal"
            autocomplete="off"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="e.g. 20…"
          />
          <Input
            label="Width (ft)"
            type="number"
            inputMode="decimal"
            autocomplete="off"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g. 10…"
          />
          <Input
            label="Depth/Thickness (inches)"
            type="number"
            inputMode="decimal"
            autocomplete="off"
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            placeholder="e.g. 4…"
          />
        </div>
      </Card>

      {/* Comparison Grid */}
      <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <table className="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400">
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Material Option</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Quantity Needed</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Durability</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Maintenance</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">DIY Difficulty</th>
              <th className="p-4 font-semibold text-xs uppercase tracking-wider">Lifespan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850 tabular-nums">
            {/* Option 1: Concrete */}
            <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
              <td className="p-4">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">Poured Concrete</div>
                <div className="text-xs text-neutral-400">Solid monolith slab</div>
              </td>
              <td className="p-4">
                <span className="font-extrabold text-base">{concreteVolumeCuYd.toFixed(2)}</span>
                <span className="text-xs text-neutral-400 ml-1">cu yd</span>
              </td>
              <td className="p-4 text-xs font-semibold text-green-600 dark:text-green-500">High</td>
              <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">Low (Seal once/3 yrs)</td>
              <td className="p-4 text-xs text-red-600 dark:text-red-500 font-semibold">Hard (Pro Help Recommended)</td>
              <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">30–50 years</td>
            </tr>

            {/* Option 2: Pavers */}
            <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
              <td className="p-4">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">Concrete Pavers</div>
                <div className="text-xs text-neutral-400">Interlocking brick grid</div>
              </td>
              <td className="p-4">
                <span className="font-extrabold text-base">{Math.ceil(paversSqFt)}</span>
                <span className="text-xs text-neutral-400 ml-1">sq ft</span>
              </td>
              <td className="p-4 text-xs font-semibold text-green-600 dark:text-green-500">High</td>
              <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">Medium (Weed control)</td>
              <td className="p-4 text-xs text-yellow-600 dark:text-yellow-500 font-semibold">Medium (Great DIY Project)</td>
              <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">25–50 years</td>
            </tr>

            {/* Option 3: Gravel */}
            <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
              <td className="p-4">
                <div className="font-bold text-neutral-900 dark:text-neutral-100">Pea Gravel / Rock</div>
                <div className="text-xs text-neutral-400">Loose loose aggregates</div>
              </td>
              <td className="p-4">
                <span className="font-extrabold text-base">{gravelVolumeCuYd.toFixed(2)}</span>
                <span className="text-xs text-neutral-400 ml-1">cu yd</span>
              </td>
              <td className="p-4 text-xs text-neutral-500">Medium</td>
              <td className="p-4 text-xs text-red-500">High (Raking & replenishment)</td>
              <td className="p-4 text-xs text-green-600 dark:text-green-500 font-semibold">Easy (Perfect for Beginners)</td>
              <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">Indefinite (requires top-off)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Supplier Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Concrete Sourcing
            </h4>
            <p className="text-xs text-neutral-500 mb-4 text-pretty">
              Best for permanent patios and structures. Consider ordering ready-mix truck delivery for projects over 1.5 cubic yards.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.open(`https://www.lowes.com/search?searchTerm=concrete+mix+80lb`, "_blank")}
            className="w-full text-xs"
          >
            Shop Concrete at Lowe's
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Paver Sourcing
            </h4>
            <p className="text-xs text-neutral-500 mb-4 text-pretty">
              Perfect for a modular patio setup. Order pavers individually or in pallets to fit your layout.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.open(`https://www.lowes.com/search?searchTerm=concrete+pavers`, "_blank")}
            className="w-full text-xs"
          >
            Shop Pavers at Lowe's
          </Button>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Gravel Sourcing
            </h4>
            <p className="text-xs text-neutral-500 mb-4 text-pretty">
              Low-cost, beautiful path option. Pick up bags locally or order bulk deliveries.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.open(`https://www.lowes.com/search?searchTerm=pea+gravel`, "_blank")}
            className="w-full text-xs"
          >
            Shop Gravel at Lowe's
          </Button>
        </Card>
      </div>
    </div>
  );
}
