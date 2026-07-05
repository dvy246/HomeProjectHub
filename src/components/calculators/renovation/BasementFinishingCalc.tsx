import { useState, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import BasementDiagram from "../../diagrams/renovation/BasementDiagram";
import { parseNumber } from "../../../lib/helpers";
import { PRESETS } from "../../../lib/presets";
import ContractorRfqForm from "./ContractorRfqForm";
import DiyQuizWidget from "./DiyQuizWidget";

export default function BasementFinishingCalc() {
  const [length, setLength] = useState("24");
  const [width, setWidth] = useState("20");
  const [wallHeight, setWallHeight] = useState("8");

  // Custom unit costs mapping (user editable)
  const [framingUnitPrice, setFramingUnitPrice] = useState("3.50"); // $/sq ft of wall
  const [drywallUnitPrice, setDrywallUnitPrice] = useState("1.50"); // $/sq ft of wall/ceiling
  const [ceilingType, setCeilingType] = useState("suspended"); // suspended vs drywall
  const [ceilingUnitPrice, setCeilingUnitPrice] = useState("4.50"); // $/sq ft of floor
  const [insulationUnitPrice, setInsulationUnitPrice] = useState("0.95"); // $/sq ft of wall
  const [flooringUnitPrice, setFlooringUnitPrice] = useState("4.50"); // $/sq ft of floor
  const [numDoors, setNumDoors] = useState("2");
  const [doorPrice, setDoorPrice] = useState("180"); // $/door pack

  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(40);
  const [contingencyPercent, setContingencyPercent] = useState(15);
  const [regionalModifier, setRegionalModifier] = useState("1.0");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("basement-finishing", "Basement Finishing Calculator");

  const lenNum = parseNumber(length) || 0;
  const widNum = parseNumber(width) || 0;
  const htNum = parseNumber(wallHeight) || 0;
  const doorsCount = parseNumber(numDoors) || 0;

  const framingPriceVal = parseNumber(framingUnitPrice) || 0;
  const drywallPriceVal = parseNumber(drywallUnitPrice) || 0;
  const ceilingPriceVal = parseNumber(ceilingUnitPrice) || 0;
  const insulationPriceVal = parseNumber(insulationUnitPrice) || 0;
  const flooringPriceVal = parseNumber(flooringUnitPrice) || 0;
  const doorPriceVal = parseNumber(doorPrice) || 0;

  // Presets mapping for ceilings & flooring
  const CEILING_PRESET_PRICES: Record<string, number> = {
    suspended: 4.5,
    drywall: 2.2,
  };

  const FLOORING_PRESET_PRICES: Record<string, number> = {
    lvp: 4.5,
    carpet: 3.5,
    concretePaint: 1.2,
  };

  const handleCeilingPresetChange = (key: string) => {
    setCeilingType(key);
    if (CEILING_PRESET_PRICES[key]) {
      setCeilingUnitPrice(CEILING_PRESET_PRICES[key].toString());
    }
  };

  // Dimensions
  const floorArea = lenNum * widNum;
  const wallPerimeter = (lenNum + widNum) * 2;
  const wallArea = wallPerimeter * htNum;
  const drywalledArea = wallArea + (ceilingType === "drywall" ? floorArea : 0);

  // Cost estimates (Transparent Planning Cost Model)
  const framingCost = wallArea * framingPriceVal;
  const drywallCost = drywalledArea * drywallPriceVal;
  const insulationCost = wallArea * insulationPriceVal;
  const ceilingCost = floorArea * ceilingPriceVal;
  const flooringCost = floorArea * flooringPriceVal;
  const doorsCost = doorsCount * doorPriceVal;

  const totalMaterialCost = framingCost + drywallCost + insulationCost + ceilingCost + flooringCost + doorsCost;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100) * parseFloat(regionalModifier);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "drywall" | "framing" | "ceiling" | "insulation") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "framing" && lengthInputRef.current) {
      lengthInputRef.current.focus();
    } else if (part === "ceiling" && heightInputRef.current) {
      heightInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Basement Footprint": `${length}x${width} ft`,
    "Wall Height": `${wallHeight} ft`,
    "Framing Price/SF": `$${framingPriceVal}/sq ft`,
    "Drywall Price/SF": `$${drywallPriceVal}/sq ft`,
    "Ceiling Type": `${ceilingType.toUpperCase()} ($${ceilingPriceVal}/SF)`,
    "Insulation Price/SF": `$${insulationPriceVal}/sq ft`,
    "Flooring Price/SF": `$${flooringPriceVal}/sq ft`,
    "Doors": `${numDoors} units`,
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Basement Area": `${Math.round(floorArea)} sq ft`,
    "Wall surface area": `${Math.round(wallArea)} sq ft`,
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Basement wall timber framing studs", qty: Math.round(wallArea), unit: "sq ft wall", cost: framingCost },
    { name: "Drywall boards & tape rolls", qty: Math.round(drywalledArea), unit: "sq ft surface", cost: drywallCost },
    { name: "Fiberglass insulation batts", qty: Math.round(wallArea), unit: "sq ft", cost: insulationCost },
    { name: `Finished flooring (${ceilingType})`, qty: Math.round(floorArea), unit: "sq ft", cost: flooringCost },
    { name: `Ceiling tiles/grid assembly`, qty: Math.round(floorArea), unit: "sq ft", cost: ceilingCost },
    ...(doorsCount > 0 ? [{ name: "Interior pre-hung door packs", qty: doorsCount, unit: "unit", cost: doorsCost }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Parameters Panel */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Basement Sizing Parameters</h2>
            
            {/* Dimension Presets */}
            <div className="w-1/2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (idx > 0) {
                    const p = PRESETS.rooms[idx];
                    setLength(p.length);
                    setWidth(p.width);
                    setWallHeight(p.height || "8");
                  }
                }}
                className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-9 px-2 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
              >
                {PRESETS.rooms.map((p, i) => (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input
              ref={lengthInputRef}
              label="Basement Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 24"
            />
            <Input
              label="Basement Width (ft)"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 20"
            />
            <Input
              ref={heightInputRef}
              label="Wall Height (ft)"
              type="number"
              inputMode="decimal"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value)}
              placeholder="e.g. 8"
              className={focusedField === "ceiling" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Wall Framing Cost ($/sq ft wall)"
              type="number"
              inputMode="decimal"
              value={framingUnitPrice}
              onChange={(e) => setFramingUnitPrice(e.target.value)}
              className={focusedField === "framing" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Drywall Cost ($/sq ft sheet)"
              type="number"
              inputMode="decimal"
              value={drywallUnitPrice}
              onChange={(e) => setDrywallUnitPrice(e.target.value)}
              className={focusedField === "drywall" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Ceiling Style Presets</label>
              <select
                onChange={(e) => handleCeilingPresetChange(e.target.value)}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="suspended">Suspended Grid Tiles ($4.50/SF)</option>
                <option value="drywall">Drywall Ceiling ($2.20/SF)</option>
              </select>
            </div>
            
            <Input
              label="Ceiling Material Cost ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={ceilingUnitPrice}
              onChange={(e) => setCeilingUnitPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Flooring Material Presets</label>
              <select
                onChange={(e) => {
                  const val = FLOORING_PRESET_PRICES[e.target.value];
                  if (val) setFlooringUnitPrice(val.toString());
                }}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="lvp">Luxury Vinyl Plank ($4.50/SF)</option>
                <option value="carpet">Cozy Berber Carpet ($3.50/SF)</option>
                <option value="concretePaint">Epoxy Concrete Seal ($1.20/SF)</option>
              </select>
            </div>
            
            <Input
              label="Flooring Material Cost ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={flooringUnitPrice}
              onChange={(e) => setFlooringUnitPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Insulation Price ($/sq ft wall)"
              type="number"
              inputMode="decimal"
              value={insulationUnitPrice}
              onChange={(e) => setInsulationUnitPrice(e.target.value)}
              className={focusedField === "insulation" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Number of Pre-hung Doors"
              type="number"
              inputMode="numeric"
              value={numDoors}
              onChange={(e) => setNumDoors(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Door Unit Cost ($)"
              type="number"
              inputMode="decimal"
              value={doorPrice}
              onChange={(e) => setDoorPrice(e.target.value)}
            />
          </div>
        </Card>

        {/* Labor & Contingency Slider */}
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h2 className="text-sm font-semibold tracking-tight">Labor & Contingency Adjustments</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="regional-cost" className="text-xs font-semibold text-[var(--fg-secondary)]">Regional Cost Adjuster</label>
              <select
                id="regional-cost"
                value={regionalModifier}
                onChange={(e) => setRegionalModifier(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--bg-inset)] text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="1.0">National Average (1.0x)</option>
                <option value="1.3">High Cost Metro / West Coast (1.3x)</option>
                <option value="1.1">Medium Cost / East Coast / South (1.1x)</option>
                <option value="0.8">Low Cost Area / Rural Midwest (0.8x)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[var(--fg-secondary)]">Installation Labor Fees</span>
                <span className="font-bold text-[var(--accent)]">{laborPercent}% of Materials</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={laborPercent}
                onChange={(e) => setLaborPercent(parseInt(e.target.value))}
                className="accent-[var(--accent)] w-full h-1.5 rounded-lg bg-[var(--border)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-muted)]">
                <span>0% (DIY)</span>
                <span>40% (Average Contractor)</span>
                <span>100%+ (Commercial Team)</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[var(--fg-secondary)]">Contingency Buffer</span>
                <span className="font-bold text-[var(--accent)]">{contingencyPercent}% of Base Cost</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={contingencyPercent}
                onChange={(e) => setContingencyPercent(parseInt(e.target.value))}
                className="accent-[var(--accent)] w-full h-1.5 rounded-lg bg-[var(--border)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-muted)]">
                <span>0% (Perfect Plan)</span>
                <span>15% (Recommended)</span>
                <span>30%+ (Subfloor moisture / leveling needs)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Save card */}
        <div id="add-to-project-section">
          <AddToProjectCard
            projects={projects}
            onAdd={(pid) => {
              clearSuccess();
              addToProject(pid, projectInputs, projectResults, projectMaterials);
            }}
            successMessage={projectSuccess}
          />
        </div>
      </div>

      {/* SVG Diagram and Results */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Render Interactive SVG Diagram */}
        <BasementDiagram
          length={lenNum}
          width={widNum}
          height={htNum}
          ceilingType={ceilingType.toUpperCase()}
          onFocusElement={handleDiagramFocus}
        />

        {/* Results Panel */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 card-elevated">
          <h2 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Cost Receipt Summary</h2>

          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Grand Estimated Expense</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">${Math.round(grandTotal).toLocaleString()}</span>
                <span className="text-sm font-semibold text-[var(--fg-muted)]">USD</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Wall Framing studs ({Math.round(wallArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(framingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Drywall sheets & tape ({Math.round(drywalledArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(drywallCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Fiberglass Insulation ({Math.round(wallArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(insulationCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Ceiling tiles & grids ({Math.round(floorArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(ceilingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Finished Flooring ({Math.round(floorArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(flooringCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Interior doors ({doorsCount} units)</span>
                <span className="font-semibold tabular-nums">${Math.round(doorsCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--fg-muted)]">Material Subtotal</span>
                <span className="font-semibold tabular-nums">${Math.round(totalMaterialCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[var(--fg-secondary)]">
                <span>Labor Fees ({laborPercent}%)</span>
                <span className="font-semibold tabular-nums">${Math.round(totalLaborCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)] text-[var(--accent)] font-semibold">
                <span>Contingency Buffer ({contingencyPercent}%)</span>
                <span className="tabular-nums">${Math.round(contingencyCost).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[var(--border)] pt-8 mt-4 no-print">
        <DiyQuizWidget projectType="Basement Finishing" />
        <ContractorRfqForm projectType="Basement Finishing" />
      </div>
    </div>
  );
}
