import { useState, useEffect, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import GarageDiagram from "../../diagrams/renovation/GarageDiagram";
import { parseNumber } from "../../../lib/helpers";
import { PRESETS } from "../../../lib/presets";
import ContractorRfqForm from "./ContractorRfqForm";
import DiyQuizWidget from "./DiyQuizWidget";

export default function GarageRemodelCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: import("../../../lib/projectEngine").MaterialItem[]) => void } = {}) {
  const [length, setLength] = useState("24");
  const [width, setWidth] = useState("24");

  // Custom unit costs mapping (user editable)
  const [epoxyUnitPrice, setEpoxyUnitPrice] = useState("5.50"); // $/sq ft floor
  const [numDoors, setNumDoors] = useState("2");
  const [doorPriceVal, setDoorPriceVal] = useState("1200"); // $/door
  const [wallPanelPrice, setWallPanelPrice] = useState("1.25"); // $/sq ft wall
  
  const [hasShelving, setHasShelving] = useState(true);
  const [shelvingLength, setShelvingLength] = useState("30"); // linear ft
  const [shelvingPrice, setShelvingPrice] = useState("18"); // $/linear ft

  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(35);
  const [contingencyPercent, setContingencyPercent] = useState(15);
  const [regionalModifier, setRegionalModifier] = useState("1.0");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const doorInputRef = useRef<HTMLInputElement>(null);
  const shelvingInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("garage-remodel", "Garage Remodel Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [length, width, epoxyUnitPrice, numDoors, doorPriceVal, wallPanelPrice, hasShelving, shelvingLength, shelvingPrice, laborPercent, contingencyPercent, regionalModifier, focusedField, onCalculate]);

  const lenNum = parseNumber(length) || 0;
  const widNum = parseNumber(width) || 0;
  const doorsCount = parseNumber(numDoors) || 0;
  const epoxyPriceVal = parseNumber(epoxyUnitPrice) || 0;
  const doorCostVal = parseNumber(doorPriceVal) || 0;
  const panelPriceVal = parseNumber(wallPanelPrice) || 0;
  const shelfLenVal = parseNumber(shelvingLength) || 0;
  const shelfPriceVal = parseNumber(shelvingPrice) || 0;

  // Presets mapping for garage doors
  const DOOR_PRESET_PRICES: Record<string, number> = {
    standard: 800,
    insulated: 1200,
    carriage: 2200,
  };

  const handleDoorPresetChange = (key: string) => {
    if (DOOR_PRESET_PRICES[key]) {
      setDoorPriceVal(DOOR_PRESET_PRICES[key].toString());
    }
  };

  // Dimensions
  const floorArea = lenNum * widNum;
  // Wall Area (assume average 9.5 ft garage ceiling)
  const wallArea = (lenNum + widNum) * 2 * 9.5;

  // Cost estimates (Transparent Planning Cost Model)
  const epoxyCost = floorArea * epoxyPriceVal;
  const doorCost = doorsCount * doorCostVal;
  const shelvingCost = hasShelving ? shelfLenVal * shelfPriceVal : 0;
  const wallPanelCost = wallArea * panelPriceVal;

  const totalMaterialCost = epoxyCost + doorCost + shelvingCost + wallPanelCost;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100) * parseFloat(regionalModifier);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "floor" | "door" | "shelving") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "floor" && lengthInputRef.current) {
      lengthInputRef.current.focus();
    } else if (part === "door" && doorInputRef.current) {
      doorInputRef.current.focus();
    } else if (part === "shelving" && shelvingInputRef.current) {
      shelvingInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Garage Footprint": `${length}x${width} ft`,
    "Epoxy Price/SF": `$${epoxyPriceVal}/sq ft`,
    "Garage Doors": `${numDoors} overhead doors`,
    "Door Cost/Unit": `$${doorCostVal}`,
    "Storage Shelves": hasShelving ? `${shelvingLength} ft` : "NONE",
    "Wall Panels Price/SF": `$${panelPriceVal}/sq ft`,
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Garage Floor Area": `${Math.round(floorArea)} sq ft`,
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Labor Subtotal": `$${Math.round(totalLaborCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Epoxy Floor Flake Coating", quantity: Math.round(floorArea), unit: "sq ft", cost: epoxyCost },
    { name: "Overhead steel garage door units", quantity: doorsCount, unit: "unit", cost: doorCost },
    ...(hasShelving ? [{ name: "Heavy-duty wall shelving racks", quantity: Math.round(shelfLenVal), unit: "linear ft", cost: shelvingCost }] : []),
    { name: "Wall drywall/paneling boards", quantity: Math.round(wallArea), unit: "sq ft", cost: wallPanelCost },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Parameters Panel */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Garage Remodel Parameters</h2>
            
            {/* Dimension Presets */}
            <div className="w-1/2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (idx > 0) {
                    const p = PRESETS.rooms[idx];
                    setLength(p.length);
                    setWidth(p.width);
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

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              ref={lengthInputRef}
              label="Garage Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 24"
            />
            <Input
              label="Garage Width (ft)"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Epoxy Floor Cost ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={epoxyUnitPrice}
              onChange={(e) => setEpoxyUnitPrice(e.target.value)}
            />
            <Input
              label="Wall Panels Cost ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={wallPanelPrice}
              onChange={(e) => setWallPanelPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Overhead Door Grade Presets</label>
              <select
                onChange={(e) => handleDoorPresetChange(e.target.value)}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="insulated">Insulated Steel ($1200)</option>
                <option value="standard">Non-Insulated Stock ($800)</option>
                <option value="carriage">Custom Carriage House ($2200)</option>
              </select>
            </div>
            
            <Input
              ref={doorInputRef}
              label="Number of Garage Doors"
              type="number"
              inputMode="numeric"
              value={numDoors}
              onChange={(e) => setNumDoors(e.target.value)}
              className={focusedField === "door" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Door Replacement Cost ($)"
              type="number"
              inputMode="decimal"
              value={doorPriceVal}
              onChange={(e) => setDoorPriceVal(e.target.value)}
            />
            <div className="flex items-center gap-4 h-10 mt-6">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer">
                <input type="checkbox" checked={hasShelving} onChange={(e) => setHasShelving(e.target.checked)} className="accent-[var(--accent)]" aria-label="Include Storage Shelving" />
                Include Storage Shelving
              </label>
            </div>
          </div>

          {hasShelving && (
            <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4 animate-fade-in">
              <Input
                ref={shelvingInputRef}
                label="Shelving Run Length (ft)"
                type="number"
                inputMode="decimal"
                value={shelvingLength}
                onChange={(e) => setShelvingLength(e.target.value)}
                className={focusedField === "shelving" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
              />
              <Input
                label="Shelving Rack Cost ($/linear ft)"
                type="number"
                inputMode="decimal"
                value={shelvingPrice}
                onChange={(e) => setShelvingPrice(e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* Labor & Contingency card */}
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
                aria-label="Installation Labor Fees Percentage"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-muted)]">
                <span>0% (DIY)</span>
                <span>35% (Average Contractor)</span>
                <span>80%+ (Specialty Garage Builders)</span>
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
                aria-label="Contingency Buffer Percentage"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-muted)]">
                <span>0% (Perfect Plan)</span>
                <span>15% (Recommended)</span>
                <span>30%+ (Concrete crack / drainage leveling)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Save Card */}
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
        <GarageDiagram
          length={lenNum}
          width={widNum}
          hasShelving={hasShelving}
          numDoors={doorsCount}
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
                <span className="text-[var(--fg-muted)]">Epoxy Floor Coating ({Math.round(floorArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(epoxyCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Overhead Garage Doors ({doorsCount} units)</span>
                <span className="font-semibold tabular-nums">${Math.round(doorCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Storage Shelving racks ({hasShelving ? shelfLenVal + " LF" : "None"})</span>
                <span className="font-semibold tabular-nums">${Math.round(shelvingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Wall panels & trim boards ({Math.round(wallArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(wallPanelCost).toLocaleString()}</span>
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
        <DiyQuizWidget projectType="Garage Remodel" />
        <ContractorRfqForm projectType="Garage Remodel" />
      </div>
    </div>
  );
}
