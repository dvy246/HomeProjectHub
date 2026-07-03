import materials from "../data/materials.json";

export interface PackageOption {
  name: string;
  unitPerPackage: number;
  unitType: string;
}

export const CONCRETE_BAG_YIELDS = {
  "80lb": 0.6,
  "60lb": 0.45,
  "50lb": 0.375,
  "40lb": 0.3,
};

export function applyWasteFactor(amount: number, wasteFactor: number): number {
  return amount * (1 + wasteFactor);
}

export function calculatePackaging(totalAmount: number, unitPerPackage: number): number {
  if (unitPerPackage <= 0) return 0;
  return Math.ceil(totalAmount / unitPerPackage);
}

export function calculateConcreteBags(
  volumeCuFt: number,
  bagSize: "40lb" | "50lb" | "60lb" | "80lb"
): number {
  const yieldPerBag = CONCRETE_BAG_YIELDS[bagSize];
  return calculatePackaging(volumeCuFt, yieldPerBag);
}

export function estimateConcreteWeightLbs(volumeCuFt: number): number {
  return volumeCuFt * 150;
}

const densityDB = (materials as any).densities as Record<string, { lb_per_cu_ft?: number; kg_per_cu_m?: number; name: string }>;
const aggregateDB = (materials as any).aggregates as Record<string, { lb_per_cu_ft: number; tons_per_cu_yd: number; name: string }>;
const mulchDB = (materials as any).mulch as Record<string, { lb_per_cu_ft: number; bags_per_cu_yd: number; bag_size_cuft: number; name: string }>;

export function calculateWeight(
  materialKey: string,
  volumeCuIn: number
): { lb: number; kg: number; materialName: string } {
  const material = densityDB[materialKey];
  if (!material) return { lb: 0, kg: 0, materialName: materialKey };
  const cuFt = volumeCuIn / 1728;
  const lbPerCuFt = material.lb_per_cu_ft || 490;
  const lb = cuFt * lbPerCuFt;
  return {
    lb: parseFloat(lb.toFixed(2)),
    kg: parseFloat((lb * 0.453592).toFixed(2)),
    materialName: material.name,
  };
}

export function calculateAggregateTons(
  type: string,
  cubicYards: number
): { tons: number; lb: number; materialName: string } {
  const agg = aggregateDB[type];
  if (!agg) return { tons: 0, lb: 0, materialName: type };
  const tons = cubicYards * agg.tons_per_cu_yd;
  return {
    tons: parseFloat(tons.toFixed(2)),
    lb: parseFloat((tons * 2000).toFixed(0)),
    materialName: agg.name,
  };
}

export function calculateMulchBags(
  type: string,
  cubicYards: number
): { bags: number; weightLb: number; materialName: string } {
  const mulch = mulchDB[type];
  if (!mulch) return { bags: 0, weightLb: 0, materialName: type };
  const cubicFeet = cubicYards * 27;
  const bags = Math.ceil(cubicFeet / mulch.bag_size_cuft);
  const weightLb = Math.round(cubicFeet * mulch.lb_per_cu_ft);
  return { bags, weightLb, materialName: mulch.name };
}

export function calculateDrywallSheets(
  wallAreaSqFt: number,
  sheetSize: "4x8" | "4x10" | "4x12" = "4x8"
): { sheets: number; tapeLf: number; mudLb: number; screwsLb: number } {
  const sheetArea = sheetSize === "4x8" ? 32 : sheetSize === "4x10" ? 40 : 48;
  const sheets = Math.ceil(wallAreaSqFt / sheetArea);
  const tapeLf = wallAreaSqFt * 0.33;
  const mudLb = Math.ceil(wallAreaSqFt * 0.06);
  const screwsLb = Math.ceil(sheets * 0.25);
  return { sheets, tapeLf: Math.ceil(tapeLf), mudLb, screwsLb };
}

export function calculateStudCount(wallLengthFt: number, spacing: 16 | 24 = 16): number {
  return Math.ceil((wallLengthFt * 12) / spacing) + 1;
}

export function calculateDrywallScrews(sheetCount: number): number {
  return sheetCount * 28;
}

export function calculateConcreteBlockCount(wallLengthFt: number, wallHeightFt: number): number {
  const blocksPerRow = Math.ceil((wallLengthFt * 12) / 16);
  const rows = Math.ceil((wallHeightFt * 12) / 8);
  return blocksPerRow * rows;
}

export const GRAVEL_TYPES = [
  { key: "gravel_pea", name: "Pea Gravel", tonsPerCy: 1.4 },
  { key: "gravel_crushed", name: "Crushed Stone", tonsPerCy: 1.5 },
  { key: "gravel_57", name: "#57 Crushed Stone", tonsPerCy: 1.4 },
  { key: "gravel_3", name: "#3 Crushed Stone", tonsPerCy: 1.35 },
  { key: "limestone", name: "Crushed Limestone", tonsPerCy: 1.55 },
];

export const MULCH_TYPES = [
  { key: "bark", name: "Bark Mulch", bagSizeCuFt: 2 },
  { key: "cedar", name: "Cedar Mulch", bagSizeCuFt: 2 },
  { key: "rubber", name: "Rubber Mulch", bagSizeCuFt: 2 },
  { key: "dyed", name: "Dyed Mulch", bagSizeCuFt: 2 },
];

export function getMaterialName(key: string): string {
  const all = { ...densityDB, ...aggregateDB, ...mulchDB } as Record<string, { name: string }>;
  return all[key]?.name || key;
}
