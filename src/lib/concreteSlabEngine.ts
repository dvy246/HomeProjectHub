import { calculateRectArea, calculateCircleArea, calculateLShapeArea, calculateVolume, cuFeetToCuYards } from "./geometry";
import { calculateConcreteBags, estimateConcreteWeightLbs, applyWasteFactor, CONCRETE_BAG_YIELDS } from "./materialEngine";
import type { MaterialItem } from "./projectEngine";

export type SlabShape = "rect" | "l-shape" | "circle";
export type FinishType = "broom" | "smooth" | "stamped" | "exposed" | "colored";
export type ReinforcementType = "rebar" | "mesh" | "fiber" | "none";
export type SubBaseMaterial = "gravel" | "crushed-stone" | "sand";

export const REBAR_WEIGHT: Record<string, number> = { "#3": 0.376, "#4": 0.668, "#5": 1.043 };
export const REBAR_STOCK_LENGTH = 20;
export const STANDARD_SPACING = { rebar: 18, mesh: 24 };
export const VAPOR_BARRIER_OVERLAP = 0.15;
export const SEALER_COVERAGE_SQFT_PER_GAL = 300;
export const WIRE_MESH_PRICE_PER_SQFT = 0.35;

export interface SlabDesignInput {
  shape: SlabShape;
  lengthA: number;
  widthA: number;
  lengthB?: number;
  widthB?: number;
  diameter?: number;
  thickness: number;
  subBaseMaterial: SubBaseMaterial;
  subBaseDepth: number;
  reinforcement: ReinforcementType;
  rebarSize?: "#3" | "#4" | "#5";
  rebarSpacing?: number;
  finish: FinishType;
  vaporBarrier: boolean;
  wasteFactor: number;
  bagSize: "40lb" | "50lb" | "60lb" | "80lb";
  customBagPrice?: number;
  taxRate?: number;
}

export interface RebarGrid {
  barSize: string;
  spacing: number;
  barsAlongLength: number;
  barsAlongWidth: number;
  totalLinearFt: number;
  totalWeightLbs: number;
  sticksCount: number;
}

export interface ControlJointLayout {
  spacingX: number;
  spacingY: number;
  jointsAlongLength: number;
  jointsAlongWidth: number;
  totalLinearFt: number;
}

export interface LayerItem {
  type: "sub-base" | "vapor-barrier" | "concrete" | "sealer" | "reinforcement";
  label: string;
  depthIn: number;
  quantity: number;
  unit: string;
  material: string;
}

export interface SlabResults {
  area: number;
  volumeCuYd: number;
  volumeCuFt: number;
  layers: LayerItem[];
  rebarGrid: RebarGrid | null;
  controlJoints: ControlJointLayout;
  materialList: MaterialItem[];
  totalCost: number;
  weightLbs: number;
  bagCount: number;
  bagSize: string;
  bags: { size: string; count: number }[];
  readyMixCost: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function computeSlabArea(input: SlabDesignInput): number {
  switch (input.shape) {
    case "rect":
      return calculateRectArea(input.lengthA, input.widthA);
    case "l-shape":
      return calculateLShapeArea(
        input.lengthA, input.widthA,
        input.lengthB ?? 0, input.widthB ?? 0
      );
    case "circle": {
      const d = input.diameter ?? input.lengthA;
      return calculateCircleArea(d / 2);
    }
  }
}

export function computeSlabVolume(area: number, thicknessIn: number, wasteFactor: number): { volumeCuFt: number; volumeCuYd: number } {
  const thicknessFt = clamp(thicknessIn, 2, 48) / 12;
  const rawCuFt = calculateVolume(area, thicknessFt);
  const totalCuFt = applyWasteFactor(rawCuFt, clamp(wasteFactor, 0, 0.5));
  return { volumeCuFt: totalCuFt, volumeCuYd: cuFeetToCuYards(totalCuFt) };
}

export function computeRebarGrid(
  length: number,
  width: number,
  barSize: "#3" | "#4" | "#5",
  spacingIn: number
): RebarGrid {
  const s = clamp(spacingIn, 6, 48);
  const barsAlongLength = Math.ceil((length * 12) / s) + 1;
  const barsAlongWidth = Math.ceil((width * 12) / s) + 1;
  const totalLinearFt = (barsAlongLength * width) + (barsAlongWidth * length);
  const lbPerFt = REBAR_WEIGHT[barSize] ?? 0.668;
  const totalWeightLbs = totalLinearFt * lbPerFt;
  const sticksCount = Math.ceil(totalLinearFt / REBAR_STOCK_LENGTH);

  return { barSize, spacing: s, barsAlongLength, barsAlongWidth, totalLinearFt, totalWeightLbs, sticksCount };
}

export function computeControlJoints(length: number, width: number, thicknessIn: number): ControlJointLayout {
  const maxSpacing = clamp(30 * (thicknessIn / 12), 4, 15);
  const jointsAlongLength = Math.max(0, Math.ceil(length / maxSpacing) - 1);
  const jointsAlongWidth = Math.max(0, Math.ceil(width / maxSpacing) - 1);
  const totalLinearFt = jointsAlongLength * width + jointsAlongWidth * length;
  return { spacingX: maxSpacing, spacingY: maxSpacing, jointsAlongLength, jointsAlongWidth, totalLinearFt };
}

export function computeSubBase(area: number, depthIn: number, material: SubBaseMaterial): { volumeCuYd: number; volumeCuFt: number; tons: number } {
  const depthFt = clamp(depthIn, 2, 24) / 12;
  const volumeCuFt = area * depthFt;
  const volumeCuYd = cuFeetToCuYards(volumeCuFt);
  const tonsPerCuYd: Record<SubBaseMaterial, number> = { gravel: 1.4, "crushed-stone": 1.4, sand: 1.3 };
  const tons = volumeCuYd * (tonsPerCuYd[material] ?? 1.4);
  return { volumeCuYd, volumeCuFt, tons };
}

export function computeMaterialList(results: SlabResults, input: SlabDesignInput): MaterialItem[] {
  const items: MaterialItem[] = [];

  const bagSizes: ("40lb" | "50lb" | "60lb" | "80lb")[] = ["80lb", "60lb", "50lb", "40lb"];
  const selectedBagCount = calculateConcreteBags(results.volumeCuFt, input.bagSize);
  items.push({
    name: `${input.bagSize} Concrete Mix (${selectedBagCount} bags)`,
    quantity: selectedBagCount,
    unit: "bags",
    category: "Concrete",
  });

  if (input.reinforcement === "rebar" && results.rebarGrid) {
    items.push({
      name: `Rebar ${results.rebarGrid.barSize} (${results.rebarGrid.sticksCount} sticks x ${REBAR_STOCK_LENGTH}ft)`,
      quantity: results.rebarGrid.sticksCount,
      unit: "sticks",
      category: "Rebar",
    });
    items.push({
      name: "Rebar Tie Wire (5lb coil)",
      quantity: Math.ceil(results.rebarGrid.sticksCount / 10),
      unit: "coils",
      category: "Rebar",
    });
  }

  if (input.reinforcement === "mesh") {
    const meshSqFt = results.area;
    const meshRolls = Math.ceil(meshSqFt / 500);
    items.push({
      name: `6x6 W1.4/W1.4 Welded Wire Mesh (${meshRolls} rolls)`,
      quantity: meshRolls,
      unit: "rolls",
      category: "Reinforcement",
    });
  }

  const subBase = computeSubBase(results.area, input.subBaseDepth, input.subBaseMaterial);
  items.push({
    name: `${input.subBaseMaterial.replace("-", " ")} base (${subBase.tons.toFixed(1)} tons)`,
    quantity: Math.ceil(subBase.tons),
    unit: "tons",
    category: "Sub-base",
  });

  if (input.vaporBarrier) {
    const barrierSqFt = results.area * (1 + VAPOR_BARRIER_OVERLAP);
    const barrierRolls = Math.ceil(barrierSqFt / 1000);
    items.push({
      name: `6mil Vapor Barrier (${barrierRolls} roll${barrierRolls > 1 ? "s" : ""})`,
      quantity: barrierRolls,
      unit: "rolls",
      category: "Vapor Barrier",
    });
  }

  const sealerGals = Math.ceil(results.area / SEALER_COVERAGE_SQFT_PER_GAL);
  if (sealerGals > 0) {
    items.push({
      name: `Concrete Sealer (${sealerGals} gal)`,
      quantity: sealerGals,
      unit: "gal",
      category: "Sealer",
    });
  }

  return items;
}

export function computeSlab(input: SlabDesignInput): SlabResults {
  const area = computeSlabArea(input);
  const { volumeCuFt, volumeCuYd } = computeSlabVolume(area, input.thickness, input.wasteFactor / 100);

  const rebarGrid = input.reinforcement === "rebar" && input.rebarSize && input.rebarSpacing
    ? computeRebarGrid(input.lengthA, input.widthA, input.rebarSize, input.rebarSpacing)
    : null;

  const controlJoints = computeControlJoints(input.lengthA, input.widthA, input.thickness);

  const weightLbs = estimateConcreteWeightLbs(volumeCuFt);
  const bagCount = calculateConcreteBags(volumeCuFt, input.bagSize);

  const bags: { size: string; count: number }[] = [];
  for (const size of ["80lb", "60lb", "50lb", "40lb"] as const) {
    bags.push({ size, count: calculateConcreteBags(volumeCuFt, size) });
  }

  const layers: LayerItem[] = [
    { type: "sub-base", label: "Sub-base", depthIn: input.subBaseDepth, quantity: computeSubBase(area, input.subBaseDepth, input.subBaseMaterial).volumeCuYd, unit: "cu yd", material: input.subBaseMaterial },
  ];
  if (input.vaporBarrier) {
    layers.push({ type: "vapor-barrier", label: "Vapor Barrier", depthIn: 0, quantity: area * (1 + VAPOR_BARRIER_OVERLAP), unit: "sq ft", material: "6mil polyethylene" });
  }
  layers.push({ type: "concrete", label: "Concrete Slab", depthIn: input.thickness, quantity: volumeCuYd, unit: "cu yd", material: "3000-4000 PSI concrete" });
  layers.push({ type: "sealer", label: "Sealer", depthIn: 0, quantity: Math.ceil(area / SEALER_COVERAGE_SQFT_PER_GAL), unit: "gal", material: input.finish });

  const defaultPricePerBag = input.bagSize === "80lb" ? 7.20 : input.bagSize === "60lb" ? 6.10 : input.bagSize === "50lb" ? 5.20 : 4.30;
  const pricePerBag = input.customBagPrice ?? defaultPricePerBag;
  const subtotal = bagCount * pricePerBag;
  const taxMultiplier = 1 + ((input.taxRate ?? 8) / 100);
  const materialCost = subtotal * taxMultiplier;

  const subBase = computeSubBase(area, input.subBaseDepth, input.subBaseMaterial);
  const subBaseCost = subBase.tons * 45;
  const readyMixCost = volumeCuYd * 145 + (volumeCuYd < 4 ? 150 : 0);

  let reinforcementCost = 0;
  if (rebarGrid) {
    reinforcementCost = rebarGrid.sticksCount * 12 + rebarGrid.totalWeightLbs * 0.85;
  } else if (input.reinforcement === "mesh") {
    reinforcementCost = area * WIRE_MESH_PRICE_PER_SQFT;
  }

  let barrierCost = 0;
  if (input.vaporBarrier) {
    const barrierSqFt = area * (1 + VAPOR_BARRIER_OVERLAP);
    barrierCost = (barrierSqFt / 1000) * 85;
  }

  const sealerCost = Math.ceil(area / SEALER_COVERAGE_SQFT_PER_GAL) * 35;

  const totalCost = materialCost + subBaseCost + reinforcementCost + barrierCost + sealerCost;

  const results: SlabResults = {
    area, volumeCuYd, volumeCuFt,
    layers,
    rebarGrid,
    controlJoints,
    materialList: [],
    totalCost, weightLbs,
    bagCount, bagSize: input.bagSize, bags, readyMixCost,
  };

  results.materialList = computeMaterialList(results, input);
  return results;
}
