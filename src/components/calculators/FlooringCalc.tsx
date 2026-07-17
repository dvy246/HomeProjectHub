import { useState, useEffect, useMemo } from "react";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { PRESETS } from "../../lib/presets";
import { parseNumber } from "../../lib/helpers";
import { calculateFlooringMaterials, type FlooringMaterialType, DEFAULT_BOX_COVERAGE } from "../../lib/flooringEngine";
import CostEstimatorWidget, { type CostItem } from "../ui/CostEstimatorWidget";
import { useProjects } from "../../lib/useProjects";
import type { MaterialItem } from "../../lib/projectEngine";
import AddToProjectCard from "../ui/AddToProjectCard";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import UnitToggle from "../ui/UnitToggle";

// Default material names
const MATERIAL_LABELS: Record<FlooringMaterialType, string> = {
  hardwood: "Solid Hardwood Planks",
  engineered_wood: "Engineered Hardwood",
  lvp: "Luxury Vinyl Plank (LVP)",
  laminate: "Laminate Planks",
  carpet: "Plush Pile Carpet",
  vinyl_sheet: "Vinyl Sheet Roll",
};

function FlooringCalc({
  projectId,
  onCalculate,
}: {
  projectId?: string;
  onCalculate?: (inputs: Record<string, any>, results: Record<string, any>, materials: MaterialItem[]) => void;
} = {}) {
  const { t } = useI18n();
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [length, setLength] = useState("15");
  const [width, setWidth] = useState("12");
  const [materialType, setMaterialType] = useState<FlooringMaterialType>("lvp");
  const [wasteFactor, setWasteFactor] = useState("10");

  // Custom Box Sizes (user-adjustable for plank types)
  const [customBoxSize, setCustomBoxSize] = useState<string>("24");

  // Keep custom box size in sync with material preset defaults
  useEffect(() => {
    const defaultCoverage = DEFAULT_BOX_COVERAGE[materialType];
    if (defaultCoverage) {
      setCustomBoxSize(defaultCoverage.toString());
    }
  }, [materialType]);

  const { projects, addToProject, successMessage: projectSuccess, clearSuccess } = useProjects("flooring-calc", "Flooring Calculator");

  // Parse numerical inputs
  const rawLenNum = parseNumber(length) || 0;
  const rawWidNum = parseNumber(width) || 0;
  const wastePercent = parseNumber(wasteFactor) || 0;
  const boxSqFt = parseNumber(customBoxSize) || 20;

  // Convert inputs to feet for the calculation engine if metric is selected
  const lengthFt = unitSystem === "metric" ? rawLenNum / 0.3048 : rawLenNum;
  const widthFt = unitSystem === "metric" ? rawWidNum / 0.3048 : rawWidNum;

  // Perform material estimation
  const results = useMemo(() => {
    return calculateFlooringMaterials({
      lengthFt,
      widthFt,
      materialType,
      wastePercent,
      boxSizeSqFt: boxSqFt,
      unitSystem,
    });
  }, [lengthFt, widthFt, materialType, wastePercent, boxSqFt, unitSystem]);

  // Sync results back to parent/planner
  useEffect(() => {
    onCalculate?.(
      { length, width, materialType, wasteFactor, unitSystem },
      { areaSqFt: results.areaSqFt, boxesNeeded: results.boxesNeeded, weightLbs: results.weightLbs },
      results.materialList
    );
  }, [results, length, width, materialType, wasteFactor, unitSystem, onCalculate]);

  // Construct items list for CostEstimatorWidget
  const costItems = useMemo<CostItem[]>(() => {
    const list: CostItem[] = [];
    if (results.areaSqFt <= 0) return [];

    const isPlankType = ["hardwood", "lvp", "laminate", "engineered_wood"].includes(materialType);

    if (isPlankType && results.boxesNeeded) {
      // Box costs
      let defaultPricePerBox = 84.00; // default LVP box price
      if (materialType === "hardwood") defaultPricePerBox = 130.00;
      if (materialType === "laminate") defaultPricePerBox = 45.00;
      if (materialType === "engineered_wood") defaultPricePerBox = 110.00;

      list.push({
        key: `flooring_box_${materialType}`,
        name: `${MATERIAL_LABELS[materialType]} (${boxSqFt} sq ft/box)`,
        quantity: results.boxesNeeded,
        unit: "boxes",
        defaultPrice: defaultPricePerBox,
      });

      if (results.underlaymentRolls) {
        list.push({
          key: "underlayment_roll",
          name: "Underlayment Membrane Roll (100 sq ft)",
          quantity: results.underlaymentRolls,
          unit: "rolls",
          defaultPrice: 48.00,
        });
      }
    } else {
      // Roll-based carpet or vinyl
      const quantity = results.linearYdNeeded || 0;
      const defaultPricePerYard = materialType === "carpet" ? 28.00 : 22.00;

      list.push({
        key: `flooring_roll_${materialType}`,
        name: MATERIAL_LABELS[materialType],
        quantity,
        unit: "yd",
        defaultPrice: defaultPricePerYard,
      });

      if (materialType === "carpet") {
        const paddingRolls = Math.ceil(results.totalAreaWithWasteSqFt / 270);
        list.push({
          key: "carpet_padding_roll",
          name: "Carpet Padding Roll (30 sq yd)",
          quantity: paddingRolls,
          unit: "rolls",
          defaultPrice: 65.00,
        });
      }
    }

    return list;
  }, [results, materialType, boxSqFt]);

  // Input Validation Errors
  const validationError = useMemo(() => {
    if (length && rawLenNum <= 0) return "Length must be greater than zero.";
    if (width && rawWidNum <= 0) return "Width must be greater than zero.";
    if (wasteFactor && wastePercent < 0) return "Waste factor cannot be negative.";
    if (customBoxSize && boxSqFt <= 0) return "Box size must be greater than zero.";
    return "";
  }, [length, width, wasteFactor, customBoxSize, rawLenNum, rawWidNum, wastePercent, boxSqFt]);

  // Project Planner Payload mapping
  const projectInputs = {
    "Dimensions": `${length}x${width} ${unitSystem === "metric" ? "m" : "ft"}`,
    "Material": MATERIAL_LABELS[materialType],
    "Waste Factor": `${wasteFactor}%`,
  };

  const projectResults = {
    "Total Area": `${results.areaSqFt.toFixed(1)} sq ft (${results.areaSqM?.toFixed(1)} sq m)`,
    "Calculated Needs": results.boxesNeeded
      ? `${results.boxesNeeded} boxes`
      : `${results.linearYdNeeded} linear yards`,
    "Total Weight": `${results.weightLbs} lbs (${results.weightKgs} kgs)`,
  };

  // Dynamic floor SVG visual representation
  const renderVisualFloor = () => {
    const isPlankType = ["hardwood", "lvp", "laminate", "engineered_wood"].includes(materialType);
    const elements: React.ReactNode[] = [];

    // Scale coordinates inside a fixed viewBox
    const boxW = 280;
    const boxH = 180;
    const padding = 10;
    const drawW = boxW - padding * 2;
    const drawH = boxH - padding * 2;

    if (rawLenNum <= 0 || rawWidNum <= 0) {
      return (
        <svg viewBox="0 0 280 180" className="w-full h-auto rounded-lg bg-[var(--bg-inset)] border border-[var(--border)]">
          <text x="50%" y="50%" textAnchor="middle" fill="var(--fg-muted)" fontSize="10">Enter dimensions to preview floor plan</text>
        </svg>
      );
    }

    if (isPlankType) {
      // Draw grid pattern of planks
      const rows = 12;
      const cols = 8;
      const stepX = drawW / cols;
      const stepY = drawH / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Stagger plank starts
          const offset = r % 2 === 0 ? stepX / 2 : 0;
          const x = padding + c * stepX - offset;
          const y = padding + r * stepY;

          if (x + stepX > padding && x < padding + drawW) {
            elements.push(
              <rect
                key={`plank-${r}-${c}`}
                x={Math.max(padding, x)}
                y={y}
                width={Math.min(stepX, padding + drawW - x)}
                height={stepY - 1}
                fill="none"
                stroke="var(--fg-muted)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            );
          }
        }
      }
    } else {
      // Draw rolls runs stripes
      const runs = Math.ceil(widthFt / 12);
      const stepX = drawW / Math.max(1, runs);
      for (let i = 0; i < runs; i++) {
        const x = padding + i * stepX;
        elements.push(
          <rect
            key={`run-${i}`}
            x={x}
            y={padding}
            width={stepX}
            height={drawH}
            fill="none"
            stroke="var(--fg-muted)"
            strokeWidth="0.8"
            strokeDasharray="4 2"
            opacity="0.5"
          />
        );
      }
    }

    return (
      <svg viewBox="0 0 280 180" className="w-full h-auto rounded-lg bg-[var(--bg-inset)] border border-[var(--border)]" role="img" aria-label="Visual flooring layout diagram">
        {/* Floor bounding perimeter */}
        <rect x={padding} y={padding} width={drawW} height={drawH} fill="none" stroke="var(--fg)" strokeWidth="1.5" />
        {elements}
        <text x="50%" y="90%" textAnchor="middle" fill="var(--fg)" fontSize="10" fontWeight="bold">
          {rawLenNum} &times; {rawWidNum} {unitSystem === "metric" ? "m" : "ft"}
        </text>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-5">
            <h2 className="text-sm font-semibold tracking-tight">Room Sizing & Options</h2>
            <UnitToggle unitSystem={unitSystem} onChange={(sys) => setUnitSystem(sys)} />
          </div>

          {/* Quick Room Presets */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Room presets</label>
            <select
              id="select-presets"
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                if (idx > 0) {
                  const p = PRESETS.rooms[idx];
                  if (unitSystem === "metric") {
                    setLength((parseFloat(p.length) * 0.3048).toFixed(2));
                    setWidth((parseFloat(p.width) * 0.3048).toFixed(2));
                  } else {
                    setLength(p.length);
                    setWidth(p.width);
                  }
                }
              }}
              className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors w-full"
            >
              {PRESETS.rooms.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label={`Room Length (${unitSystem === "metric" ? "m" : "ft"})`}
              type="number"
              inputMode="decimal"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="e.g. 15"
              error={length && rawLenNum <= 0 ? validationError : ""}
            />
            <Input
              label={`Room Width (${unitSystem === "metric" ? "m" : "ft"})`}
              type="number"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 12"
              error={width && rawWidNum <= 0 ? validationError : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="select-material" className="text-[10px] font-semibold text-[var(--fg-muted)] uppercase tracking-wider">Flooring Material</label>
              <select
                id="select-material"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as FlooringMaterialType)}
                className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors w-full"
              >
                {Object.entries(MATERIAL_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Waste Factor (%)"
              type="number"
              inputMode="decimal"
              value={wasteFactor}
              onChange={(e) => setWasteFactor(e.target.value)}
              error={wasteFactor && wastePercent < 0 ? validationError : ""}
            />
          </div>

          {["hardwood", "lvp", "laminate", "engineered_wood"].includes(materialType) && (
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
              <Input
                label="Box Sizing Coverage (sq ft)"
                type="number"
                inputMode="decimal"
                value={customBoxSize}
                onChange={(e) => setCustomBoxSize(e.target.value)}
                error={customBoxSize && boxSqFt <= 0 ? validationError : ""}
                helperText="Specify total square feet covered per box"
              />
            </div>
          )}
        </Card>

        {/* Dynamic Formula transparency */}
        <Card>
          <details className="group">
            <summary className="text-xs font-semibold text-[var(--fg)] cursor-pointer list-none flex justify-between items-center">
              <span>Mathematical Formula & Calculator Assumptions</span>
              <svg className="w-4 h-4 text-[var(--fg-muted)] group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div className="mt-3 text-[11px] text-[var(--fg-secondary)] space-y-2 leading-relaxed border-t border-[var(--border)] pt-3">
              <p>
                {"Plank Formula: Flooring area is computed as Area = Length * Width. The waste factor is then added: Area_waste = Area * (1 + Waste / 100). Finally, box quantities are calculated by dividing the waste-adjusted area by the box coverage and rounding up:"}
                {" \\[Boxes = \\lceil \\frac{Area_{waste}}{BoxSqFt} \\rceil\\]"}
              </p>
              <p>
                {"Roll Formula (Carpet & Vinyl): Assumes standard 12-foot wide rolls. The total number of runs (strips) is calculated as:"}
                {" \\[Runs = \\lceil \\frac{Width}{12} \\rceil\\]"}
                {" The required length is then computed by multiplying the runs by the room length plus the waste cushion:"}
                {" \\[Length_{total} = Runs \\times Length \\times (1 + \\frac{Waste\\%}{100})\\]"}
                {" Linear yards are obtained by dividing linear feet by 3: \\(Yards = \\lceil \\frac{Length_{total}}{3} \\rceil\\)."}
              </p>
            </div>
          </details>
        </Card>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Live SVG visualizer preview */}
        {renderVisualFloor()}

        <Card className="card-elevated">
          <h3 className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider mb-4">Sizing Estimation Results</h3>
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-[var(--fg-muted)] block mb-1">Total Coverage Area</span>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-4xl font-extrabold tracking-tight">
                  {unitSystem === "metric" ? results.areaSqM?.toFixed(1) : results.areaSqFt.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-[var(--fg-muted)]">
                  {unitSystem === "metric" ? "sq m" : "sq ft"}
                </span>
              </div>
              {unitSystem === "metric" && (
                <span className="text-[10px] text-[var(--fg-muted)] block mt-1">
                  ({results.areaSqFt.toFixed(1)} sq ft)
                </span>
              )}
            </div>

            {results.boxesNeeded !== undefined ? (
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-1">Boxes of Flooring Needed</span>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-4xl font-extrabold tracking-tight">{results.boxesNeeded}</span>
                  <span className="text-sm font-semibold text-[var(--fg-muted)]">boxes</span>
                </div>
                <span className="text-[10px] text-[var(--fg-muted)] block mt-1">
                  Target coverage: {results.totalAreaWithWasteSqFt.toFixed(1)} sq ft with {wasteFactor}% waste
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3">
                <div>
                  <span className="text-[10px] text-[var(--fg-muted)] block mb-1">Linear Yards</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-[var(--fg)]">{results.linearYdNeeded} yd</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--fg-muted)] block mb-1">Roll Area Coverage</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-[var(--fg)]">{results.sqYdNeeded} sq yd</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--fg-muted)] flex justify-between">
              <span>Estimated shipping weight:</span>
              <span className="font-semibold tabular-nums text-[var(--fg)]">
                {unitSystem === "metric" ? `${results.weightKgs} kg` : `${results.weightLbs} lbs`}
              </span>
            </div>

            <div className="no-print">
              <a
                id="link-to-save-section"
                href="#add-to-project-section"
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors text-center shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Save to Project Planner
              </a>
            </div>
          </div>
        </Card>

        {/* Local Storage cost override list */}
        {results.areaSqFt > 0 && (
          <CostEstimatorWidget
            items={costItems}
            defaultLaborHours={Math.max(4, Math.ceil(results.areaSqFt / 80))}
          />
        )}

        <div id="add-to-project-section" className="no-print">
          <AddToProjectCard
            projects={projects}
            onAdd={(pid) => {
              clearSuccess();
              addToProject(pid, projectInputs, projectResults, results.materialList);
            }}
            successMessage={projectSuccess}
          />
        </div>
      </div>
    </div>
  );
}

export default withI18n(FlooringCalc);
