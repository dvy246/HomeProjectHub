import React, { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { calculateRectArea, calculateVolume, cuFeetToCuYards } from "../lib/geometry";
import { applyWasteFactor } from "../lib/materialEngine";

export default function CompareMaterials() {
  const [length, setLength] = useState<string>("20");
  const [width, setWidth] = useState<string>("10");
  const [thickness, setThickness] = useState<string>("4");

  const parseInput = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const lenNum = parseInput(length);
  const widNum = parseInput(width);
  const thickNum = parseInput(thickness);

  const areaSqFt = calculateRectArea(lenNum, widNum);
  const thicknessFt = thickNum / 12;
  const volumeCuFt = calculateVolume(areaSqFt, thicknessFt);

  const concreteVolumeCuYd = cuFeetToCuYards(applyWasteFactor(volumeCuFt, 0.10));
  const paversSqFt = applyWasteFactor(areaSqFt, 0.05);
  const gravelVolumeCuYd = cuFeetToCuYards(applyWasteFactor(volumeCuFt, 0.10));

  const materials = [
    {
      name: "Poured Concrete",
      subtitle: "Solid monolith slab",
      quantity: concreteVolumeCuYd.toFixed(2),
      unit: "cu yd",
      durability: { label: "High", color: "var(--success)" },
      maintenance: "Low — seal every 3 years",
      difficulty: { label: "Hard", color: "var(--error)", note: "Pro help recommended" },
      lifespan: "30–50 years",
    },
    {
      name: "Concrete Pavers",
      subtitle: "Interlocking brick grid",
      quantity: Math.ceil(paversSqFt).toString(),
      unit: "sq ft",
      durability: { label: "High", color: "var(--success)" },
      maintenance: "Medium — weed control",
      difficulty: { label: "Medium", color: "var(--warning)", note: "Great DIY project" },
      lifespan: "25–50 years",
    },
    {
      name: "Pea Gravel",
      subtitle: "Loose aggregate",
      quantity: gravelVolumeCuYd.toFixed(2),
      unit: "cu yd",
      durability: { label: "Medium", color: "var(--fg-muted)" },
      maintenance: "High — raking & replenishment",
      difficulty: { label: "Easy", color: "var(--success)", note: "Perfect for beginners" },
      lifespan: "Indefinite (needs top-off)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h3 className="text-sm font-semibold tracking-tight mb-4">Project Dimensions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 20" />
          <Input label="Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 10" />
          <Input label="Depth (inches)" type="number" inputMode="decimal" value={thickness} onChange={(e) => setThickness(e.target.value)} placeholder="e.g. 4" />
        </div>
      </Card>

      {/* Comparison cards — responsive, no horizontal scroll */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {materials.map((mat) => (
          <div key={mat.name} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 card-elevated flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold tracking-tight">{mat.name}</h4>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">{mat.subtitle}</p>
            </div>

            <div className="py-3 border-y border-[var(--border)]">
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Quantity Needed</span>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="text-2xl font-bold tracking-tight animate-fade-in-up">{mat.quantity}</span>
                <span className="text-xs text-[var(--fg-muted)]">{mat.unit}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Durability</span>
                <span className="font-semibold" style={{ color: mat.durability.color }}>{mat.durability.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Maintenance</span>
                <span className="text-[var(--fg-secondary)] text-right">{mat.maintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">DIY Difficulty</span>
                <span className="font-semibold" style={{ color: mat.difficulty.color }}>{mat.difficulty.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Lifespan</span>
                <span className="text-[var(--fg-secondary)]">{mat.lifespan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Concrete Sourcing</h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4 text-pretty">Best for permanent patios. Order ready-mix delivery for projects over 1.5 cubic yards.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.open(`https://www.lowes.com/search?searchTerm=concrete+mix+80lb`, "_blank")} className="w-full">
            Shop at Lowe's
          </Button>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Paver Sourcing</h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4 text-pretty">Perfect for modular patio setups. Order individually or by the pallet.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.open(`https://www.lowes.com/search?searchTerm=concrete+pavers`, "_blank")} className="w-full">
            Shop at Lowe's
          </Button>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Gravel Sourcing</h4>
            <p className="text-xs text-[var(--fg-secondary)] mb-4 text-pretty">Low-cost pathway option. Pick up bags locally or order bulk delivery.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.open(`https://www.lowes.com/search?searchTerm=pea+gravel`, "_blank")} className="w-full">
            Shop at Lowe's
          </Button>
        </Card>
      </div>
    </div>
  );
}
