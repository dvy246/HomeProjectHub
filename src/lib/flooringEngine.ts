import { calculateRectArea } from "./geometry";
import { applyWasteFactor } from "./materialEngine";
import type { MaterialItem } from "./projectEngine";

export type FlooringMaterialType = "hardwood" | "lvp" | "laminate" | "carpet" | "vinyl_sheet" | "engineered_wood";

export interface FlooringDimensions {
  lengthFt: number;
  widthFt: number;
  materialType: FlooringMaterialType;
  wastePercent: number;     // e.g. 10 for 10%
  boxSizeSqFt?: number;     // box coverage for plank materials (default based on type)
  rollWidthFt?: number;     // roll width for sheet/carpet (default 12ft)
  unitSystem?: "imperial" | "metric";
}

export interface FlooringResults {
  areaSqFt: number;
  areaSqM?: number;
  wasteSqFt: number;
  totalAreaWithWasteSqFt: number;
  boxesNeeded?: number;      // only for plank types
  underlaymentRolls?: number;// for hardwood, laminate, LVP, engineered wood
  linearFtNeeded?: number;   // for carpet, vinyl sheet
  linearYdNeeded?: number;   // for carpet
  sqYdNeeded?: number;       // for carpet
  weightLbs: number;
  weightKgs: number;
  materialList: MaterialItem[];
}

// Density multipliers (lbs per sq ft)
const MATERIAL_WEIGHTS: Record<FlooringMaterialType, number> = {
  hardwood: 2.6,
  engineered_wood: 1.8,
  lvp: 1.4,
  laminate: 1.2,
  carpet: 0.8,
  vinyl_sheet: 0.7,
};

// Default box coverage values (sq ft)
export const DEFAULT_BOX_COVERAGE: Record<string, number> = {
  hardwood: 20,
  engineered_wood: 22,
  lvp: 24,
  laminate: 18,
};

/**
 * Calculates materials required for various flooring types (planks, sheets, carpet).
 */
export function calculateFlooringMaterials(dims: FlooringDimensions): FlooringResults {
  const {
    lengthFt,
    widthFt,
    materialType,
    wastePercent,
    boxSizeSqFt = DEFAULT_BOX_COVERAGE[materialType] || 20,
    rollWidthFt = 12,
    unitSystem = "imperial",
  } = dims;

  if (lengthFt <= 0 || widthFt <= 0) {
    return {
      areaSqFt: 0,
      wasteSqFt: 0,
      totalAreaWithWasteSqFt: 0,
      weightLbs: 0,
      weightKgs: 0,
      materialList: [],
    };
  }

  const areaSqFt = calculateRectArea(lengthFt, widthFt);
  const areaSqM = areaSqFt * 0.092903;
  const wasteMultiplier = wastePercent / 100;
  const totalAreaWithWasteSqFt = Math.round(applyWasteFactor(areaSqFt, wasteMultiplier) * 100) / 100;

  // Initial result structure
  const results: FlooringResults = {
    areaSqFt,
    areaSqM,
    wasteSqFt: totalAreaWithWasteSqFt - areaSqFt,
    totalAreaWithWasteSqFt,
    weightLbs: 0,
    weightKgs: 0,
    materialList: [],
  };

  const materialsList: MaterialItem[] = [];

  // Plank vs Roll calculation
  const isPlankType = ["hardwood", "lvp", "laminate", "engineered_wood"].includes(materialType);

  if (isPlankType) {
    // 1. Plank Box Calculations
    const boxesNeeded = Math.ceil(totalAreaWithWasteSqFt / boxSizeSqFt);
    results.boxesNeeded = boxesNeeded;

    const materialsLabel = materialType.replace("_", " ").toUpperCase();
    materialsList.push({
      name: `${materialsLabel} Flooring (Boxes)`,
      quantity: boxesNeeded,
      unit: "boxes",
      category: "flooring",
    });

    // 2. Underlayment calculations (100 sq ft per roll)
    // Carpet usually uses padding, but wood/planks use underlayment rolls.
    const underlaymentRolls = Math.ceil(totalAreaWithWasteSqFt / 100);
    results.underlaymentRolls = underlaymentRolls;
    materialsList.push({
      name: "Underlayment Membrane (Rolls)",
      quantity: underlaymentRolls,
      unit: "rolls",
      category: "flooring",
    });

    // 3. Weight calculations
    const weightLbs = totalAreaWithWasteSqFt * MATERIAL_WEIGHTS[materialType];
    results.weightLbs = Math.ceil(weightLbs);
    results.weightKgs = Math.ceil(weightLbs * 0.453592);
  } else {
    // Roll-based calculations (Carpet / Vinyl Sheet)
    // 12ft standard rolls. Let's compute runs needed.
    const runs = Math.ceil(widthFt / rollWidthFt);
    const linearFtNeeded = Math.round(runs * lengthFt * (1 + wasteMultiplier) * 100) / 100;
    const areaRollSqFt = Math.round(runs * lengthFt * rollWidthFt * (1 + wasteMultiplier) * 100) / 100;
    
    results.linearFtNeeded = Math.ceil(linearFtNeeded);
    results.linearYdNeeded = Math.ceil(linearFtNeeded / 3);
    results.sqYdNeeded = Math.ceil(areaRollSqFt / 9);

    const materialsLabel = materialType === "carpet" ? "Carpet Roll" : "Vinyl Sheet Roll";
    materialsList.push({
      name: `${materialsLabel} (Linear Yards)`,
      quantity: results.linearYdNeeded,
      unit: "yd",
      category: "flooring",
    });

    if (materialType === "carpet") {
      // Carpet pad is required
      const padRolls = Math.ceil(totalAreaWithWasteSqFt / 270); // 30 sq yd rolls = 270 sq ft
      materialsList.push({
        name: "Carpet Padding (Rolls)",
        quantity: padRolls,
        unit: "rolls",
        category: "flooring",
      });
    }

    const weightLbs = areaRollSqFt * MATERIAL_WEIGHTS[materialType];
    results.weightLbs = Math.ceil(weightLbs);
    results.weightKgs = Math.ceil(weightLbs * 0.453592);
  }

  results.materialList = materialsList;
  return results;
}
