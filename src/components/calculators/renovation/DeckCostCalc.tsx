import { useState, useEffect, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import DeckDiagram from "../../diagrams/renovation/DeckDiagram";
import { parseNumber } from "../../../lib/helpers";
import { PRESETS } from "../../../lib/presets";
import ContractorRfqForm from "./ContractorRfqForm";
import DiyQuizWidget from "./DiyQuizWidget";

export default function DeckCostCalc({ projectId, onCalculate }: { projectId?: string; onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: import("../../../lib/projectEngine").MaterialItem[]) => void } = {}) {
  const [length, setLength] = useState("16");
  const [width, setWidth] = useState("12");
  const [height, setHeight] = useState("3");
  
  // Custom unit costs mapping (user editable)
  const [deckingMaterialPrice, setDeckingMaterialPrice] = useState("18"); // $/sq ft
  const [framingLumberFactor, setFramingLumberFactor] = useState("8.50"); // $/sq ft
  const [railingPrice, setRailingPrice] = useState("28"); // $/linear ft
  const [stairPrice, setStairPrice] = useState("250"); // $/staircase unit
  
  const [hasRailing, setHasRailing] = useState(true);
  const [numStairs, setNumStairs] = useState("1");
  
  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(40); // % of material subtotal
  const [contingencyPercent, setContingencyPercent] = useState(15); // % of base total
  const [regionalModifier, setRegionalModifier] = useState("1.0");

  // Highlighted field state for interactive SVG focus
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // References for focusing input fields
  const lengthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const stairsInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("deck-cost", "Deck Cost Calculator");

  useEffect(() => {
    onCalculate?.(projectInputs, projectResults, projectMaterials);
  }, [length, width, height, deckingMaterialPrice, framingLumberFactor, railingPrice, stairPrice, hasRailing, numStairs, laborPercent, contingencyPercent, regionalModifier, focusedField, onCalculate]);

  const lenNum = parseNumber(length) || 0;
  const widNum = parseNumber(width) || 0;
  const htNum = parseNumber(height) || 0;
  const stairsCount = parseNumber(numStairs) || 0;

  const deckPriceVal = parseNumber(deckingMaterialPrice) || 0;
  const framePriceVal = parseNumber(framingLumberFactor) || 0;
  const railPriceVal = parseNumber(railingPrice) || 0;
  const stairPriceVal = parseNumber(stairPrice) || 0;

  // Presets mapping for materials
  const MATERIAL_PRESET_PRICES: Record<string, number> = {
    treated: 15,
    cedar: 28,
    redwood: 35,
    composite: 48,
  };

  const handleMaterialPresetChange = (key: string) => {
    if (MATERIAL_PRESET_PRICES[key]) {
      setDeckingMaterialPrice(MATERIAL_PRESET_PRICES[key].toString());
    }
  };

  // Dimensions
  const sqFt = lenNum * widNum;
  // Railing runs along three outer sides
  const railingLinearFt = lenNum + widNum * 2;

  // Cost estimates (Transparent Planning Cost Model)
  const deckingCost = sqFt * deckPriceVal;
  const postFramingCost = sqFt * framePriceVal + (htNum > 4 ? sqFt * 2 : 0);
  const railingCost = hasRailing ? railingLinearFt * railPriceVal : 0;
  const stairsCost = stairsCount * stairPriceVal;

  const totalMaterialCost = deckingCost + postFramingCost + railingCost + stairsCost;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100) * parseFloat(regionalModifier);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "decking" | "posts" | "railing" | "stairs") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "decking" && lengthInputRef.current) {
      lengthInputRef.current.focus();
    } else if (part === "posts" && heightInputRef.current) {
      heightInputRef.current.focus();
    } else if (part === "stairs" && stairsInputRef.current) {
      stairsInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Deck Dimensions": `${length}x${width} ft`,
    "Deck Height": `${height} ft`,
    "Decking Price/SF": `$${deckPriceVal}/sq ft`,
    "Framing Price/SF": `$${framePriceVal}/sq ft`,
    "Railings": hasRailing ? `$${railPriceVal}/linear ft` : "NONE",
    "Staircases": `${numStairs} units`,
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Deck Area": `${Math.round(sqFt)} sq ft`,
    "Railing Length": hasRailing ? `${Math.round(railingLinearFt)} ft` : "N/A",
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Labor Subtotal": `$${Math.round(totalLaborCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Decking boards", quantity: Math.round(sqFt * 1.1), unit: "sq ft", cost: deckingCost },
    { name: "Framing joists, hangers & post hardware", quantity: 1, unit: "pkg", cost: postFramingCost },
    ...(hasRailing ? [{ name: "Railing assembly posts/rails", quantity: Math.round(railingLinearFt), unit: "linear ft", cost: railingCost }] : []),
    ...(stairsCount > 0 ? [{ name: "Stair step stringer pack", quantity: stairsCount, unit: "set", cost: stairsCost }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Presets and Main Parameters */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Deck Cost Parameters</h2>
            
            {/* Dimension Presets */}
            <div className="w-1/2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (idx > 0) {
                    const p = PRESETS.deck[idx];
                    setLength(p.length);
                    setWidth(p.width);
                  }
                }}
                className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-11 px-2 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
              >
                {PRESETS.deck.map((p, i) => (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input
              ref={lengthInputRef}
              label="Deck Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 16"
              className={focusedField === "decking" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Deck Width (ft)"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 12"
            />
            <Input
              ref={heightInputRef}
              label="Height off Ground (ft)"
              type="number"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 3"
              className={focusedField === "posts" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Decking Material Presets</label>
              <select
                onChange={(e) => handleMaterialPresetChange(e.target.value)}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="treated">Pressure-Treated Wood ($15/SF)</option>
                <option value="cedar">Western Red Cedar ($28/SF)</option>
                <option value="redwood">California Redwood ($35/SF)</option>
                <option value="composite">Premium Composite ($48/SF)</option>
              </select>
            </div>
            
            <Input
              label="Decking Price ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={deckingMaterialPrice}
              onChange={(e) => setDeckingMaterialPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Framing Price ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={framingLumberFactor}
              onChange={(e) => setFramingLumberFactor(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Railings</label>
              <div className="flex items-center gap-4 h-10">
                <label className="inline-flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRailing}
                    onChange={(e) => setHasRailing(e.target.checked)}
                    className="accent-[var(--accent)] w-4 h-4 rounded"
                    aria-label="Include Safety Railings"
                  />
                  Include Safety Railings
                </label>
              </div>
            </div>
          </div>

          {hasRailing && (
            <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4 animate-fade-in">
              <Input
                label="Railing Cost ($/linear ft)"
                type="number"
                inputMode="decimal"
                value={railingPrice}
                onChange={(e) => setRailingPrice(e.target.value)}
              />
              <Input
                ref={stairsInputRef}
                label="Staircase Units Count"
                type="number"
                inputMode="numeric"
                value={numStairs}
                onChange={(e) => setNumStairs(e.target.value)}
                placeholder="e.g. 1"
                className={focusedField === "stairs" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
              />
            </div>
          )}

          {stairsCount > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                label="Staircase Unit Price ($)"
                type="number"
                inputMode="decimal"
                value={stairPrice}
                onChange={(e) => setStairPrice(e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* Labor & Contingency Planning Card */}
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
                <span>100%+ (Specialty Builder)</span>
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
                <span>30%+ (Complex site/demolition)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Project Planner Save Integration */}
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
        <DeckDiagram
          length={lenNum}
          width={widNum}
          height={htNum}
          hasRailing={hasRailing}
          numStairs={stairsCount}
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
                <span className="text-[var(--fg-muted)]">Decking boards ({sqFt} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(deckingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Joists & support posts frame</span>
                <span className="font-semibold tabular-nums">${Math.round(postFramingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Railing system ({hasRailing ? Math.round(railingLinearFt) + " LF" : "None"})</span>
                <span className="font-semibold tabular-nums">${Math.round(railingCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Staircases ({stairsCount} units)</span>
                <span className="font-semibold tabular-nums">${Math.round(stairsCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--fg-muted)]">Material Subtotal</span>
                <span className="font-semibold tabular-nums">${Math.round(totalMaterialCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--fg-secondary)]">
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
        <DiyQuizWidget projectType="Deck Construction" />
        <ContractorRfqForm projectType="Deck Construction" />
      </div>
    </div>
  );
}
