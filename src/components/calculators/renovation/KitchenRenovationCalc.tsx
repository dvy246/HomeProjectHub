import { useState, useEffect, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import KitchenDiagram from "../../diagrams/renovation/KitchenDiagram";
import { parseNumber } from "../../../lib/helpers";
import { PRESETS } from "../../../lib/presets";
import ContractorRfqForm from "./ContractorRfqForm";
import DiyQuizWidget from "./DiyQuizWidget";

export default function KitchenRenovationCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: import("../../../lib/projectEngine").MaterialItem[]) => void } = {}) {
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("14");

  // Custom unit costs mapping (user editable)
  const [cabinetLinearRun, setCabinetLinearRun] = useState("20"); // linear ft
  const [cabinetUnitPrice, setCabinetUnitPrice] = useState("280"); // $/linear ft
  const [countertopArea, setCountertopArea] = useState("45"); // sq ft
  const [countertopUnitPrice, setCountertopUnitPrice] = useState("75"); // $/sq ft
  const [applianceAllowance, setApplianceAllowance] = useState("4500"); // appliances pack
  const [sinkFaucetAllowance, setSinkFaucetAllowance] = useState("800"); // sink/plumbing pack

  const [hasIsland, setHasIsland] = useState(true);
  const [islandArea, setIslandArea] = useState("15"); // sq ft
  const [islandUnitPrice, setIslandUnitPrice] = useState("120"); // $/sq ft

  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(40);
  const [contingencyPercent, setContingencyPercent] = useState(15);
  const [regionalModifier, setRegionalModifier] = useState("1.0");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const cabinetInputRef = useRef<HTMLInputElement>(null);
  const countertopInputRef = useRef<HTMLInputElement>(null);
  const islandInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("kitchen-remodel", "Kitchen Renovation Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [length, width, cabinetLinearRun, cabinetUnitPrice, countertopArea, countertopUnitPrice, applianceAllowance, sinkFaucetAllowance, hasIsland, islandArea, islandUnitPrice, laborPercent, contingencyPercent, regionalModifier, focusedField, onCalculate]);

  const lenNum = parseNumber(length) || 0;
  const widNum = parseNumber(width) || 0;
  const cabRunVal = parseNumber(cabinetLinearRun) || 0;
  const cabPriceVal = parseNumber(cabinetUnitPrice) || 0;
  const counterAreaVal = parseNumber(countertopArea) || 0;
  const counterPriceVal = parseNumber(countertopUnitPrice) || 0;
  const applianceVal = parseNumber(applianceAllowance) || 0;
  const sinkVal = parseNumber(sinkFaucetAllowance) || 0;
  const islandAreaVal = parseNumber(islandArea) || 0;
  const islandPriceVal = parseNumber(islandUnitPrice) || 0;

  // Presets mapping for cabinet and stone lines
  const CABINET_PRESET_PRICES: Record<string, number> = {
    laminate: 150,
    wood: 280,
    custom: 550,
  };

  const STONE_PRESET_PRICES: Record<string, number> = {
    laminate: 25,
    quartz: 65,
    granite: 75,
    marble: 120,
  };

  // Dimensions
  const floorArea = lenNum * widNum;

  // Cost estimates (Transparent Planning Cost Model)
  const cabinetCost = cabRunVal * cabPriceVal;
  const countertopCost = counterAreaVal * counterPriceVal;
  const islandCost = hasIsland ? islandAreaVal * islandPriceVal : 0;
  
  const totalMaterialCost = cabinetCost + countertopCost + islandCost + applianceVal + sinkVal;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100) * parseFloat(regionalModifier);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "countertop" | "cabinet" | "island" | "sink") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "cabinet" && cabinetInputRef.current) {
      cabinetInputRef.current.focus();
    } else if (part === "countertop" && countertopInputRef.current) {
      countertopInputRef.current.focus();
    } else if (part === "island" && islandInputRef.current) {
      islandInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Kitchen Footprint": `${length}x${width} ft`,
    "Cabinet Run Length": `${cabinetLinearRun} ft`,
    "Cabinet Price/LF": `$${cabPriceVal}/linear ft`,
    "Countertop Area": `${countertopArea} sq ft`,
    "Countertop Price/SF": `$${counterPriceVal}/sq ft`,
    "Kitchen Island": hasIsland ? `${islandArea} sq ft` : "NONE",
    "Appliance Allowance": `$${applianceVal}`,
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Kitchen Area": `${Math.round(floorArea)} sq ft`,
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Labor Subtotal": `$${Math.round(totalLaborCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Kitchen Cabinetry Runs", quantity: Math.round(cabRunVal), unit: "linear ft", cost: cabinetCost },
    { name: "Stone Slab Countertops", quantity: Math.round(counterAreaVal), unit: "sq ft", cost: countertopCost },
    ...(hasIsland ? [{ name: "Prep Island Cabinetry/Stone", quantity: Math.round(islandAreaVal), unit: "sq ft", cost: islandCost }] : []),
    { name: "Stainless Steel Appliance Package", quantity: 1, unit: "set", cost: applianceVal },
    { name: "Under-mount sink basin & fixtures", quantity: 1, unit: "unit", cost: sinkVal },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Parameters Panel */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Kitchen Layout Parameters</h2>
            
            {/* Dimension Presets */}
            <div className="w-1/2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (idx > 0) {
                    const p = PRESETS.rooms[idx];
                    setLength(p.length);
                    setWidth(p.width);
                    // Approximate linear runs based on room sizes
                    setCabinetLinearRun((parseFloat(p.length) * 1.5).toFixed(0));
                    setCountertopArea((parseFloat(p.length) * 1.5 * 2.1).toFixed(0));
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
              label="Kitchen Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 12"
            />
            <Input
              label="Kitchen Width (ft)"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 14"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Cabinet Grade Presets</label>
              <select
                onChange={(e) => {
                  const val = CABINET_PRESET_PRICES[e.target.value];
                  if (val) setCabinetUnitPrice(val.toString());
                }}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="wood">Solid Wood Cabinets ($280/LF)</option>
                <option value="laminate">Stock Laminate ($150/LF)</option>
                <option value="custom">Premium Custom-Painted ($550/LF)</option>
              </select>
            </div>
            
            <Input
              ref={cabinetInputRef}
              label="Cabinet Linear Run (ft)"
              type="number"
              inputMode="decimal"
              value={cabinetLinearRun}
              onChange={(e) => setCabinetLinearRun(e.target.value)}
              className={focusedField === "cabinet" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Cabinet Cost ($/linear ft)"
              type="number"
              inputMode="decimal"
              value={cabinetUnitPrice}
              onChange={(e) => setCabinetUnitPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Countertop Material Presets</label>
              <select
                onChange={(e) => {
                  const val = STONE_PRESET_PRICES[e.target.value];
                  if (val) setCountertopUnitPrice(val.toString());
                }}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="granite">Granite Slab ($75/SF)</option>
                <option value="laminate">Formica Laminate ($25/SF)</option>
                <option value="quartz">Engineered Quartz ($65/SF)</option>
                <option value="marble">Natural White Carrara ($120/SF)</option>
              </select>
            </div>
            
            <Input
              ref={countertopInputRef}
              label="Countertop Surface Area (sq ft)"
              type="number"
              inputMode="decimal"
              value={countertopArea}
              onChange={(e) => setCountertopArea(e.target.value)}
              className={focusedField === "countertop" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Countertop Cost ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={countertopUnitPrice}
              onChange={(e) => setCountertopUnitPrice(e.target.value)}
            />
            <div className="flex items-center gap-4 h-10 mt-6">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer">
                <input type="checkbox" checked={hasIsland} onChange={(e) => setHasIsland(e.target.checked)} className="accent-[var(--accent)]" aria-label="Include Prep Island" />
                Include Prep Island
              </label>
            </div>
          </div>

          {hasIsland && (
            <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4 animate-fade-in">
              <Input
                ref={islandInputRef}
                label="Island Area (sq ft)"
                type="number"
                inputMode="decimal"
                value={islandArea}
                onChange={(e) => setIslandArea(e.target.value)}
                className={focusedField === "island" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
              />
              <Input
                label="Island Base/Top Cost ($/sq ft)"
                type="number"
                inputMode="decimal"
                value={islandUnitPrice}
                onChange={(e) => setIslandUnitPrice(e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Appliance Package Allowance ($)"
              type="number"
              inputMode="decimal"
              value={applianceAllowance}
              onChange={(e) => setApplianceAllowance(e.target.value)}
            />
            <Input
              label="Sink & Faucets Package ($)"
              type="number"
              inputMode="decimal"
              value={sinkFaucetAllowance}
              onChange={(e) => setSinkFaucetAllowance(e.target.value)}
            />
          </div>
        </Card>

        {/* Labor & Contingency Card */}
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
                <span>40% (Average Contractor)</span>
                <span>100%+ (Specialty design house)</span>
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
                <span>30%+ (Old plumbing / floor framing repairs)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Planner Save integration */}
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
        <KitchenDiagram
          length={lenNum}
          width={widNum}
          hasIsland={hasIsland}
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
                <span className="text-[var(--fg-muted)]">Base Cabinetry runs ({cabinetLinearRun} LF)</span>
                <span className="font-semibold tabular-nums">${Math.round(cabinetCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Stone Countertops ({countertopArea} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(countertopCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Central Kitchen Island ({hasIsland ? islandArea + " SF" : "None"})</span>
                <span className="font-semibold tabular-nums">${Math.round(islandCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Appliance Package</span>
                <span className="font-semibold tabular-nums">${Math.round(applianceVal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Sink & Plumbing Fixtures</span>
                <span className="font-semibold tabular-nums">${Math.round(sinkVal).toLocaleString()}</span>
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
        <DiyQuizWidget projectType="Kitchen Remodel" />
        <ContractorRfqForm projectType="Kitchen Remodel" />
      </div>
    </div>
  );
}
