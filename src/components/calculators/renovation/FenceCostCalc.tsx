import { useState, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import FenceDiagram from "../../diagrams/renovation/FenceDiagram";
import { parseNumber } from "../../../lib/helpers";

export default function FenceCostCalc() {
  const [length, setLength] = useState("120");
  const [postSpacing, setPostSpacing] = useState("8");

  // Custom unit costs mapping (user editable)
  const [postPrice, setPostPrice] = useState("22"); // $/post (wood 4x4)
  const [railPrice, setRailPrice] = useState("1.50"); // $/linear ft of rail
  const [picketPrice, setPicketPrice] = useState("3.50"); // $/picket board
  const [concreteBagPrice, setConcreteBagPrice] = useState("6.50"); // $/bag of concrete
  const [bagsPerPost, setBagsPerPost] = useState("2"); // bags per post hole
  const [numGates, setNumGates] = useState("1");
  const [gatePrice, setGatePrice] = useState("180"); // $/gate

  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(40);
  const [contingencyPercent, setContingencyPercent] = useState(15);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const postInputRef = useRef<HTMLInputElement>(null);
  const gateInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("fence-cost", "Fence Cost Calculator");

  const lenNum = parseNumber(length) || 0;
  const spacingNum = parseNumber(postSpacing) || 8;
  const postPriceVal = parseNumber(postPrice) || 0;
  const railPriceVal = parseNumber(railPrice) || 0;
  const picketPriceVal = parseNumber(picketPrice) || 0;
  const concretePriceVal = parseNumber(concreteBagPrice) || 0;
  const bagsVal = parseNumber(bagsPerPost) || 0;
  const gatesCount = parseNumber(numGates) || 0;
  const gatePriceVal = parseNumber(gatePrice) || 0;

  // Presets mapping for fence materials
  const POST_PRESET_PRICES: Record<string, number> = {
    wood: 22,
    vinyl: 45,
    metal: 35,
  };

  const handlePostPresetChange = (key: string) => {
    if (POST_PRESET_PRICES[key]) {
      setPostPrice(POST_PRESET_PRICES[key].toString());
    }
  };

  // Dimensions & Quantities calculations
  const totalPosts = Math.ceil(lenNum / spacingNum) + 1;
  // Rails: 3 horizontal runs (top, middle, bottom) along total length
  const totalRailsFt = lenNum * 3;
  // Pickets: 2 pickets per linear foot (assuming standard 6" wide pickets)
  const totalPickets = Math.ceil(lenNum * 2);
  const totalConcreteBags = totalPosts * bagsVal;

  // Cost estimates (Transparent Planning Cost Model)
  const postsCost = totalPosts * postPriceVal;
  const railsCost = totalRailsFt * railPriceVal;
  const picketsCost = totalPickets * picketPriceVal;
  const concreteCost = totalConcreteBags * concretePriceVal;
  const gatesCost = gatesCount * gatePriceVal;

  const totalMaterialCost = postsCost + railsCost + picketsCost + concreteCost + gatesCost;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "post" | "picket" | "gate") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "post" && lengthInputRef.current) {
      lengthInputRef.current.focus();
    } else if (part === "gate" && gateInputRef.current) {
      gateInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Fence Total Length": `${length} ft`,
    "Post Spacing": `${postSpacing} ft`,
    "Post Price/Unit": `$${postPriceVal}`,
    "Rail Price/LF": `$${railPriceVal}/linear ft`,
    "Picket Price/Unit": `$${picketPriceVal}`,
    "Concrete Bags/Post": `${bagsPerPost} bags`,
    "Gates Count": `${numGates} units`,
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Total Line Posts": `${totalPosts} units`,
    "Total Pickets": `${totalPickets} boards`,
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Structural Fence Posts (4x4)", qty: totalPosts, unit: "unit", cost: postsCost },
    { name: "Horizontal structural rails (2x4)", qty: Math.round(totalRailsFt), unit: "linear ft", cost: railsCost },
    { name: "Vertical fence pickets (1x6)", qty: totalPickets, unit: "boards", cost: picketsCost },
    { name: "Ready-mix concrete footing bags", qty: totalConcreteBags, unit: "bags", cost: concreteCost },
    ...(gatesCount > 0 ? [{ name: "Gates hardware and picket set", qty: gatesCount, unit: "unit", cost: gatesCost }] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Parameters Panel */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Fence Layout Parameters</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              ref={lengthInputRef}
              label="Fence Total Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 120"
            />
            <Input
              label="Post Spacing (ft)"
              type="number"
              inputMode="decimal"
              value={postSpacing}
              onChange={(e) => setPostSpacing(e.target.value)}
              placeholder="e.g. 8"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Post Material Presets</label>
              <select
                onChange={(e) => handlePostPresetChange(e.target.value)}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="wood">Treated Wood 4x4 ($22)</option>
                <option value="metal">Metal T-Post ($35)</option>
                <option value="vinyl">Vinyl Post ($45)</option>
              </select>
            </div>
            
            <Input
              ref={postInputRef}
              label="Post Unit Price ($)"
              type="number"
              inputMode="decimal"
              value={postPrice}
              onChange={(e) => setPostPrice(e.target.value)}
              className={focusedField === "post" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Rail Price ($/linear ft)"
              type="number"
              inputMode="decimal"
              value={railPrice}
              onChange={(e) => setRailPrice(e.target.value)}
            />
            <Input
              label="Picket Board Price ($/unit)"
              type="number"
              inputMode="decimal"
              value={picketPrice}
              onChange={(e) => setPicketPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Concrete Cost ($/bag)"
              type="number"
              inputMode="decimal"
              value={concreteBagPrice}
              onChange={(e) => setConcreteBagPrice(e.target.value)}
            />
            <Input
              label="Bags per Post Hole"
              type="number"
              inputMode="numeric"
              value={bagsPerPost}
              onChange={(e) => setBagsPerPost(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              ref={gateInputRef}
              label="Number of Access Gates"
              type="number"
              inputMode="numeric"
              value={numGates}
              onChange={(e) => setNumGates(e.target.value)}
              className={focusedField === "gate" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Gate Unit Price ($)"
              type="number"
              inputMode="decimal"
              value={gatePrice}
              onChange={(e) => setGatePrice(e.target.value)}
            />
          </div>
        </Card>

        {/* Labor & Contingency slider */}
        <Card>
          <div className="border-b border-[var(--border)] pb-4 mb-5">
            <h2 className="text-sm font-semibold tracking-tight">Labor & Contingency Adjustments</h2>
          </div>

          <div className="flex flex-col gap-6">
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
                <span>90%+ (Premium Fencing Guilds)</span>
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
                <span>30%+ (Rocky soil / slope excavations)</span>
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
        <FenceDiagram
          length={lenNum}
          postSpacing={spacingNum}
          numGates={gatesCount}
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
                <span className="text-[var(--fg-muted)]">Line Posts ({totalPosts} units)</span>
                <span className="font-semibold tabular-nums">${Math.round(postsCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Horizontal Rails ({Math.round(totalRailsFt)} LF)</span>
                <span className="font-semibold tabular-nums">${Math.round(railsCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Vertical Pickets ({totalPickets} boards)</span>
                <span className="font-semibold tabular-nums">${Math.round(picketsCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Footing Concrete ({totalConcreteBags} bags)</span>
                <span className="font-semibold tabular-nums">${Math.round(concreteCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Access Gates ({gatesCount} units)</span>
                <span className="font-semibold tabular-nums">${Math.round(gatesCost).toLocaleString()}</span>
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
    </div>
  );
}
