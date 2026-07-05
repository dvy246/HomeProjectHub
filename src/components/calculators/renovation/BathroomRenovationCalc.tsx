import { useState, useRef } from "react";
import { Input } from "../../ui/Input";
import { Card } from "../../ui/Card";
import AddToProjectCard from "../../ui/AddToProjectCard";
import { useProjects } from "../../../lib/useProjects";
import BathroomDiagram from "../../diagrams/renovation/BathroomDiagram";
import { parseNumber } from "../../../lib/helpers";
import { PRESETS } from "../../../lib/presets";
import ContractorRfqForm from "./ContractorRfqForm";
import DiyQuizWidget from "./DiyQuizWidget";

export default function BathroomRenovationCalc() {
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("8");
  const [wallHeight, setWallHeight] = useState("8");

  // Custom unit costs mapping (user editable)
  const [floorTilePrice, setFloorTilePrice] = useState("10"); // $/sq ft
  const [wallPaintPrice, setWallPaintPrice] = useState("1.75"); // $/sq ft
  const [vanityCabinetPrice, setVanityCabinetPrice] = useState("550"); // $/unit
  const [showerFixturePrice, setShowerFixturePrice] = useState("1200"); // $/unit
  const [toiletFixturePrice, setToiletFixturePrice] = useState("220"); // $/unit
  const [drywallGroutAllowance, setDrywallGroutAllowance] = useState("450"); // general materials package

  const [hasVanity, setHasVanity] = useState(true);
  const [hasShower, setHasShower] = useState(true);
  const [hasToilet, setHasToilet] = useState(true);

  // Labor & Contingency sliders
  const [laborPercent, setLaborPercent] = useState(45);
  const [contingencyPercent, setContingencyPercent] = useState(15);
  const [regionalModifier, setRegionalModifier] = useState("1.0");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const heightInputRef = useRef<HTMLInputElement>(null);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("bathroom-remodel", "Bathroom Renovation Calculator");

  const lenNum = parseNumber(length) || 0;
  const widNum = parseNumber(width) || 0;
  const htNum = parseNumber(wallHeight) || 0;

  const floorTilePriceVal = parseNumber(floorTilePrice) || 0;
  const wallPaintPriceVal = parseNumber(wallPaintPrice) || 0;
  const vanityCabinetPriceVal = parseNumber(vanityCabinetPrice) || 0;
  const showerFixturePriceVal = parseNumber(showerFixturePrice) || 0;
  const toiletFixturePriceVal = parseNumber(toiletFixturePrice) || 0;
  const drywallAllowanceVal = parseNumber(drywallGroutAllowance) || 0;

  // Presets mapping for fixtures
  const VANITY_PRESET_PRICES: Record<string, number> = {
    "24": 350,
    "36": 550,
    "48": 750,
    "60": 1050,
  };

  const SHOWER_PRESET_PRICES: Record<string, number> = {
    tub: 800,
    standardShower: 1200,
    customTile: 3200,
  };

  const TOILET_PRESET_PRICES: Record<string, number> = {
    standard: 220,
    premium: 480,
  };

  // Dimensions
  const grossFloorArea = lenNum * widNum;
  // Deduct shower space (approx 12.5 sq ft for a standard tub) from tiling calculations
  const floorTilingArea = Math.max(0, grossFloorArea - (hasShower ? 12.5 : 0));
  // Walls perimeter times height, minus doors/windows allowance (~30 sq ft)
  const wallArea = Math.max(0, (lenNum + widNum) * 2 * htNum - 30);

  // Cost estimates (Transparent Planning Cost Model)
  const floorCost = floorTilingArea * floorTilePriceVal;
  const wallPaintCost = wallArea * wallPaintPriceVal;
  const vanityCost = hasVanity ? vanityCabinetPriceVal : 0;
  const showerCost = hasShower ? showerFixturePriceVal : 0;
  const toiletCost = hasToilet ? toiletFixturePriceVal : 0;
  
  const totalMaterialCost = floorCost + wallPaintCost + vanityCost + showerCost + toiletCost + drywallAllowanceVal;
  const totalLaborCost = totalMaterialCost * (laborPercent / 100) * parseFloat(regionalModifier);
  const baseCost = totalMaterialCost + totalLaborCost;
  const contingencyCost = baseCost * (contingencyPercent / 100);
  const grandTotal = baseCost + contingencyCost;

  const handleDiagramFocus = (part: "flooring" | "walls" | "vanity" | "shower" | "toilet") => {
    setFocusedField(part);
    setTimeout(() => setFocusedField(null), 2500);

    if (part === "flooring" && lengthInputRef.current) {
      lengthInputRef.current.focus();
    } else if (part === "walls" && heightInputRef.current) {
      heightInputRef.current.focus();
    }
  };

  // Setup inputs for projects storage
  const projectInputs = {
    "Bathroom Dimensions": `${length}x${width} ft`,
    "Wall Height": `${wallHeight} ft`,
    "Tile Price/SF": `$${floorTilePriceVal}/sq ft`,
    "Paint Price/SF": `$${wallPaintPriceVal}/sq ft`,
    "Vanity Cabinet": hasVanity ? `$${vanityCabinetPriceVal}` : "NONE",
    "Shower Fixture": hasShower ? `$${showerFixturePriceVal}` : "NONE",
    "Toilet Fixture": hasToilet ? `$${toiletFixturePriceVal}` : "NONE",
    "Labor": `${laborPercent}%`,
    "Contingency": `${contingencyPercent}%`,
  };

  const projectResults = {
    "Floor Tiling Area": `${Math.round(floorTilingArea)} sq ft`,
    "Wall Paint Area": `${Math.round(wallArea)} sq ft`,
    "Material Subtotal": `$${Math.round(totalMaterialCost).toLocaleString()}`,
    "Grand Total": `$${Math.round(grandTotal).toLocaleString()}`,
  };

  const projectMaterials = [
    { name: "Floor tiles", qty: Math.round(floorTilingArea * 1.1), unit: "sq ft", cost: floorCost },
    { name: "Bathroom paints & primers", qty: Math.round(wallArea), unit: "sq ft", cost: wallPaintCost },
    ...(hasVanity ? [{ name: "Bathroom Vanity Cabinet", qty: 1, unit: "unit", cost: vanityCost }] : []),
    ...(hasShower ? [{ name: "Shower/Tub unit fixture", qty: 1, unit: "unit", cost: showerCost }] : []),
    ...(hasToilet ? [{ name: "Toilet unit fixture", qty: 1, unit: "unit", cost: toiletCost }] : []),
    { name: "Screws, grout, thinset, backing boards", qty: 1, unit: "pkg", cost: drywallAllowanceVal },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Parameters Panel */}
        <Card className={focusedField ? "ring-2 ring-[var(--accent)] transition-all duration-300" : ""}>
          <div className="border-b border-[var(--border)] pb-4 mb-5 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-tight">Bathroom Remodel Parameters</h2>
            
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
              label="Room Length (ft)"
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 10"
              className={focusedField === "flooring" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
            <Input
              label="Room Width (ft)"
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 8"
            />
            <Input
              ref={heightInputRef}
              label="Wall Height (ft)"
              type="number"
              inputMode="decimal"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value)}
              placeholder="e.g. 8"
              className={focusedField === "walls" ? "bg-[var(--accent)]/5 border-[var(--accent)]" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Floor Tile Price ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={floorTilePrice}
              onChange={(e) => setFloorTilePrice(e.target.value)}
            />
            <Input
              label="Paint Cost ($/sq ft)"
              type="number"
              inputMode="decimal"
              value={wallPaintPrice}
              onChange={(e) => setWallPaintPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Vanity Size Presets</label>
              <select
                onChange={(e) => {
                  const val = VANITY_PRESET_PRICES[e.target.value];
                  if (val) setVanityCabinetPrice(val.toString());
                }}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="36">36 inch Vanity ($550)</option>
                <option value="24">24 inch Vanity ($350)</option>
                <option value="48">48 inch Vanity ($750)</option>
                <option value="60">60 inch Vanity ($1,050)</option>
              </select>
            </div>
            
            <Input
              label="Vanity Cabinet Cost ($)"
              type="number"
              inputMode="decimal"
              value={vanityCabinetPrice}
              onChange={(e) => setVanityCabinetPrice(e.target.value)}
              disabled={!hasVanity}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Shower Style Presets</label>
              <select
                onChange={(e) => {
                  const val = SHOWER_PRESET_PRICES[e.target.value];
                  if (val) setShowerFixturePrice(val.toString());
                }}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="standardShower">Acrylic Shower Stall ($1,200)</option>
                <option value="tub">Standard Alcove Tub ($800)</option>
                <option value="customTile">Walk-in Custom Tiled Shower ($3,200)</option>
              </select>
            </div>
            
            <Input
              label="Shower/Tub Cost ($)"
              type="number"
              inputMode="decimal"
              value={showerFixturePrice}
              onChange={(e) => setShowerFixturePrice(e.target.value)}
              disabled={!hasShower}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--fg-secondary)]">Toilet Style Presets</label>
              <select
                onChange={(e) => {
                  const val = TOILET_PRESET_PRICES[e.target.value];
                  if (val) setToiletFixturePrice(val.toString());
                }}
                className="text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none w-full"
              >
                <option value="standard">Standard Round ($220)</option>
                <option value="premium">Dual-Flush Elongated ($480)</option>
              </select>
            </div>
            
            <Input
              label="Toilet Fixture Cost ($)"
              type="number"
              inputMode="decimal"
              value={toiletFixturePrice}
              onChange={(e) => setToiletFixturePrice(e.target.value)}
              disabled={!hasToilet}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <Input
              label="Acc. package (drywall/grout) ($)"
              type="number"
              inputMode="decimal"
              value={drywallGroutAllowance}
              onChange={(e) => setDrywallGroutAllowance(e.target.value)}
            />
            <div className="flex items-center gap-4 h-10 mt-6">
              <label className="inline-flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer">
                <input type="checkbox" checked={hasVanity} onChange={(e) => setHasVanity(e.target.checked)} className="accent-[var(--accent)]" aria-label="Include Vanity Cabinet" />
                Vanity
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer">
                <input type="checkbox" checked={hasShower} onChange={(e) => setHasShower(e.target.checked)} className="accent-[var(--accent)]" aria-label="Include Shower Unit" />
                Shower
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-[var(--fg)] cursor-pointer">
                <input type="checkbox" checked={hasToilet} onChange={(e) => setHasToilet(e.target.checked)} className="accent-[var(--accent)]" aria-label="Include Toilet Bowl" />
                Toilet
              </label>
            </div>
          </div>
        </Card>

        {/* Labor & Contingency Sliders */}
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
                <span>45% (Contractor Remodel)</span>
                <span>100%+ (Premium Design Agency)</span>
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
                <span>30%+ (Old wiring / mold repair)</span>
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
        <BathroomDiagram
          length={lenNum}
          width={widNum}
          hasVanity={hasVanity}
          hasShower={hasShower}
          hasToilet={hasToilet}
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
                <span className="text-[var(--fg-muted)]">Floor Tiles ({Math.round(floorTilingArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(floorCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Wall Paint / Primer ({Math.round(wallArea)} SF)</span>
                <span className="font-semibold tabular-nums">${Math.round(wallPaintCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Vanity Cabinet Sink</span>
                <span className="font-semibold tabular-nums">${Math.round(vanityCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Shower / Tub fixture</span>
                <span className="font-semibold tabular-nums">${Math.round(showerCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">Toilet Unit</span>
                <span className="font-semibold tabular-nums">${Math.round(toiletCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-muted)]">General Drywall / thinset package</span>
                <span className="font-semibold tabular-nums">${drywallAllowanceVal}</span>
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
        <DiyQuizWidget projectType="Bathroom Remodel" />
        <ContractorRfqForm projectType="Bathroom Remodel" />
      </div>
    </div>
  );
}
