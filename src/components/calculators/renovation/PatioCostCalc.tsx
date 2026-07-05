import { useState, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import PatioDiagram from "../../diagrams/renovation/PatioDiagram";
import { parseNumber } from "../../../lib/helpers";
import { PRESETS } from "../../../lib/presets";
import ContractorRfqForm from "./ContractorRfqForm";
import DiyQuizWidget from "./DiyQuizWidget";

export default function PatioCostCalc() {
  const [length, setLength] = useState("15");
  const [width, setWidth] = useState("15");
  const [baseDepth, setBaseDepth] = useState("4");
  const [sandDepth, setSandDepth] = useState("1");
  
  // Custom unit costs mapping (user editable)
  const [paverPrice, setPaverPrice] = useState("5.50"); // $/sq ft
  const [gravelPricePerTon, setGravelPricePerTon] = useState("45"); // $/ton
  const [sandPricePerTon, setSandPricePerTon] = useState("50"); // $/ton
  const [fabricPrice, setFabricPrice] = useState("0.45"); // $/sq ft

  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(40);
  const [contingencyPercent, setContingencyPercent] = useState(15);
  const [regionalModifier, setRegionalModifier] = useState("1.0");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const baseInputRef = useRef<HTMLInputElement>(null);
  const sandInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("patio-cost", "Patio Cost Calculator");

  const lenNum = parseNumber(length) || 0;
  const widNum = parseNumber(width) || 0;
  const baseNum = parseNumber(baseDepth) || 0;
  const sandNum = parseNumber(sandDepth) || 0;

  const paverPriceVal = parseNumber(paverPrice) || 0;
  const gravelPriceVal = parseNumber(gravelPricePerTon) || 0;
  const sandPriceVal = parseNumber(sandPricePerTon) || 0;
  const fabricPriceVal = parseNumber(fabricPrice) || 0;

  // Presets mapping for materials
  const PAVER_PRESET_PRICES: Record<string, number> = {
    concrete: 4.5,
    brick: 6.0,
    cobblestone: 12.0,
    flagstone: 15.0,
  };

  const handlePaverPresetChange = (key: string) => {
    if (PAVER_PRESET_PRICES[key]) {
      setPaverPrice(PAVER_PRESET_PRICES[key].toString());
    }
  };

  // 1 Cubic Yard of Gravel ~ 1.35 tons, density ~ 100 lbs/cu ft
  // 1 Cubic Yard of Sand ~ 1.4 tons, density ~ 105 lbs/cu ft
  const GRAVEL_TONS_PER_CUFT = 0.05;
  const SAND_TONS_PER_CUFT = 0.0525;

  const sqFt = lenNum * widNum;

  // Volumes in cubic feet
  const gravelCuFt = sqFt * (baseNum / 12);
  const sandCuFt = sqFt * (sandNum / 12);

  // Material Weights in Tons
  const gravelTons = gravelCuFt * GRAVEL_TONS_PER_CUFT;
  const sandTons = sandCuFt * SAND_TONS_PER_CUFT;

  // Material costs
  const paverCost = sqFt * paverPriceVal;
  const gravelCost = gravelTons * gravelPriceVal;
  const sandCost = sandTons * sandPriceVal;
  const fabricCost = sqFt * fabricPriceVal;

  const totalMaterialCost = paverCost + gravelCost + sandCost + fabricCost;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100) * parseFloat(regionalModifier);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "paver" | "sand" | "gravel") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "paver" && lengthInputRef.current) {
      lengthInputRef.current.focus();
    } else if (part === "sand" && sandInputRef.current) {
      sandInputRef.current.focus();
    } else if (part === "gravel" && baseInputRef.current) {
      baseInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Patio Dimensions": `${length}x${width} ft`,
    "Gravel Base Depth": `${baseDepth} in`,
    "Sand Bedding Depth": `${sandDepth} in`,
    "Paver Price/SF": `$${paverPriceVal}/sq ft`,
    "Gravel Price/Ton": `$${gravelPriceVal}/ton`,
    "Sand Price/Ton": `$${sandPriceVal}/ton`,
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Patio Area": `${Math.round(sqFt)} sq ft`,
    "Gravel Base Tonnage": `${gravelTons.toFixed(1)} tons`,
    "Sand Bedding Tonnage": `${sandTons.toFixed(1)} tons`,
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Patio Paver Blocks", qty: Math.round(sqFt), unit: "sq ft", cost: paverCost },
    { name: "Crushed stone aggregate gravel sub-base", qty: parseFloat(gravelTons.toFixed(1)), unit: "tons", cost: gravelCost },
    { name: "Coarse bedding sand layer", qty: parseFloat(sandTons.toFixed(1)), unit: "tons", cost: sandCost },
    { name: "Geotextile barrier landscape fabric", qty: Math.round(sqFt * 1.05), unit: "sq ft", cost: fabricCost },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Parameters Panel */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Patio Base & Paver Parameters</h2>
            
            {/* Dimension Presets */}
            <div className="w-1/2">
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  if (idx > 0) {
                    const p = PRESETS.landscaping[idx];
                    const l = parseFloat(p.length);
                    const w = parseFloat(p.width);
                    setLength(l.toString());
                    setWidth(w.toString());
                    setBaseDepth(p.depth || "4");
                  }
                }}
                className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-9 px-2 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors w-full"
              >
                {PRESETS.landscaping.map((p, i) => (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              ref={lengthInputRef}
              label="Patio Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 15"
              className={focusedField === "paver" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Patio Width (ft)"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 15"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Paver Style Presets</label>
              <select
                onChange={(e) => handlePaverPresetChange(e.target.value)}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="concrete">Interlocking Concrete ($4.50/SF)</option>
                <option value="brick">Clay Brick Pavers ($6.00/SF)</option>
                <option value="cobblestone">Rustic Cobblestone ($12.00/SF)</option>
                <option value="flagstone">Natural Flagstone ($15.00/SF)</option>
              </select>
            </div>
            
            <Input
              label="Paver Material Price ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={paverPrice}
              onChange={(e) => setPaverPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              ref={baseInputRef}
              label="Gravel Base Depth (inches)"
              type="number"
              inputMode="decimal"
              value={baseDepth}
              onChange={(e) => setBaseDepth(e.target.value)}
              className={focusedField === "gravel" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Gravel Cost ($/ton)"
              type="number"
              inputMode="decimal"
              value={gravelPricePerTon}
              onChange={(e) => setGravelPricePerTon(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              ref={sandInputRef}
              label="Sand Bedding Depth (inches)"
              type="number"
              inputMode="decimal"
              value={sandDepth}
              className={focusedField === "sand" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
              onChange={(e) => setSandDepth(e.target.value)}
            />
            <Input
              label="Bedding Sand Cost ($/ton)"
              type="number"
              inputMode="decimal"
              value={sandPricePerTon}
              onChange={(e) => setSandPricePerTon(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Geotextile Fabric ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={fabricPrice}
              onChange={(e) => setFabricPrice(e.target.value)}
            />
          </div>
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
                <span>100%+ (Specialty Masonry)</span>
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
                <span>30%+ (Poor subsoil / drainage upgrades)</span>
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
        <PatioDiagram
          length={lenNum}
          width={widNum}
          baseDepth={baseNum}
          sandDepth={sandNum}
          paverType="Custom"
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
                <span className="text-[var(--fg-muted)]">Paver Blocks ({sqFt} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(paverCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Gravel Base ({gravelTons.toFixed(1)} Tons)</span>
                <span className="font-semibold tabular-nums">${Math.round(gravelCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Bedding Sand ({sandTons.toFixed(1)} Tons)</span>
                <span className="font-semibold tabular-nums">${Math.round(sandCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Geotextile Barrier Fabric</span>
                <span className="font-semibold tabular-nums">${Math.round(fabricCost).toLocaleString()}</span>
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
        <DiyQuizWidget projectType="Patio Construction" />
        <ContractorRfqForm projectType="Patio Construction" />
      </div>
    </div>
  );
}
