export const PAVER_PRESETS: Record<string, { w: number; h: number; label: string }> = {
  "4x8": { w: 4, h: 8, label: '4" × 8" Brick' },
  "6x9": { w: 6, h: 9, label: '6" × 9" Holland' },
  "8x8": { w: 8, h: 8, label: '8" × 8" Square' },
  "12x12": { w: 12, h: 12, label: '12" × 12" Square' },
  "16x24": { w: 16, h: 24, label: '16" × 24" Tumbled' },
};

export const PAVER_PATTERNS: Record<string, { label: string; wasteFactor: number }> = {
  "running-bond": { label: "Running Bond", wasteFactor: 0.08 },
  "herringbone": { label: "Herringbone 45°", wasteFactor: 0.15 },
  "basketweave": { label: "Basketweave", wasteFactor: 0.10 },
  "stacked": { label: "Stacked Grid", wasteFactor: 0.06 },
};

export const AGGREGATE_TYPES: Record<string, { name: string; tonsPerCy: number; lbPerCuFt: number }> = {
  "gravel_pea": { name: "Pea Gravel", tonsPerCy: 1.4, lbPerCuFt: 105 },
  "gravel_crushed": { name: "Crushed Stone", tonsPerCy: 1.5, lbPerCuFt: 110 },
  "gravel_57": { name: "#57 Crushed Stone", tonsPerCy: 1.4, lbPerCuFt: 105 },
  "sand": { name: "Concrete Sand", tonsPerCy: 1.35, lbPerCuFt: 100 },
  "limestone": { name: "Crushed Limestone", tonsPerCy: 1.55, lbPerCuFt: 115 },
};

export type ElementType = "patio" | "walkway" | "fire-pit" | "retaining-wall" | "garden-bed";

export interface HardscapeElement {
  id: string;
  type: ElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  diameter: number;
  paverPreset?: string;
  paverPattern?: string;
  aggregateKey?: string;
  wallHeight?: number;
}

export interface MaterialLineItem {
  name: string;
  quantity: number;
  unit: string;
  weightLbs: number;
  notes?: string;
}

function assertNever(x: never): never {
  throw new Error(`unexpected element type: ${x}`);
}

function clampPositive(n: number): number {
  return Math.max(0, n);
}

export function getElementDefault(type: ElementType, index: number): HardscapeElement {
  const baseId = `${type}-${index}`;
  switch (type) {
    case "patio":
      return { id: baseId, type, label: `Patio ${index}`, x: 2, y: 2, width: 12, depth: 10, diameter: 0, paverPreset: "12x12", paverPattern: "running-bond" };
    case "walkway":
      return { id: baseId, type, label: `Walkway ${index}`, x: 2, y: 14, width: 3, depth: 12, diameter: 0, paverPreset: "12x12", paverPattern: "stacked" };
    case "fire-pit":
      return { id: baseId, type, label: `Fire Pit ${index}`, x: 10, y: 16, width: 0, depth: 0, diameter: 4, paverPreset: "8x8", paverPattern: "stacked", aggregateKey: "gravel_pea" };
    case "retaining-wall":
      return { id: baseId, type, label: `Retaining Wall ${index}`, x: 0, y: 0, width: 20, depth: 0, diameter: 0, wallHeight: 2 };
    case "garden-bed":
      return { id: baseId, type, label: `Garden Bed ${index}`, x: 16, y: 2, width: 6, depth: 8, diameter: 0, aggregateKey: "gravel_pea" };
    default:
      assertNever(type);
  }
}

export function calculateAreaSqFt(el: HardscapeElement): number {
  if (el.type === "fire-pit" && el.diameter > 0) {
    return clampPositive(Math.PI * (el.diameter / 2) ** 2);
  }
  if (el.type === "retaining-wall") {
    return clampPositive(el.width * (el.wallHeight ?? 2));
  }
  return clampPositive(el.width * el.depth);
}

export function calculatePerimeterFt(el: HardscapeElement): number {
  if (el.type === "fire-pit" && el.diameter > 0) {
    return clampPositive(Math.PI * el.diameter);
  }
  return clampPositive(2 * (el.width + el.depth));
}

export function calculatePaverCount(areaSqFt: number, paverPreset: string, pattern: string): {
  pavers: number; wasteFactor: number; totalPavers: number; boxCount: number;
} {
  const size = PAVER_PRESETS[paverPreset];
  const pat = PAVER_PATTERNS[pattern];
  if (!size || !pat) return { pavers: 0, wasteFactor: 0, totalPavers: 0, boxCount: 0 };

  const paverAreaSqIn = size.w * size.h;
  const paversPerSqFt = 144 / paverAreaSqIn;
  const rawPavers = areaSqFt * paversPerSqFt;
  const totalPavers = Math.max(0, Math.ceil(rawPavers * (1 + pat.wasteFactor)));
  const boxCount = Math.max(0, Math.ceil(totalPavers / 10));
  return { pavers: Math.ceil(rawPavers), wasteFactor: pat.wasteFactor, totalPavers, boxCount };
}

export function calculateBaseGravel(areaSqFt: number, depthIn: number, aggKey: string): {
  cubicYards: number; tons: number; weightLbs: number;
} {
  const agg = AGGREGATE_TYPES[aggKey];
  if (!agg || areaSqFt <= 0 || depthIn <= 0) return { cubicYards: 0, tons: 0, weightLbs: 0 };

  const cuFt = areaSqFt * depthIn / 12;
  const cubicYards = cuFt / 27;
  const tons = cubicYards * agg.tonsPerCy;
  return {
    cubicYards: Math.round(cubicYards * 100) / 100,
    tons: Math.round(tons * 100) / 100,
    weightLbs: Math.round(cubicYards * agg.tonsPerCy * 2000),
  };
}

export function calculateEdging(perimeterFt: number): { linearFeet: number; weightLbs: number } {
  return { linearFeet: Math.ceil(clampPositive(perimeterFt)), weightLbs: Math.ceil(clampPositive(perimeterFt) * 5) };
}

export function calculateSandBed(areaSqFt: number): { cubicYards: number; weightLbs: number } {
  return calculateBaseGravel(areaSqFt, 1, "sand");
}

export function calculateRetainingWall(lengthFt: number, heightFt: number): MaterialLineItem[] {
  if (lengthFt <= 0 || heightFt <= 0) return [];

  const blockCount = Math.ceil(lengthFt * heightFt * 1.125);
  const capCount = Math.max(0, Math.ceil(lengthFt * 12 / 16));
  const drainVol = calculateBaseGravel(lengthFt * 2, 12, "gravel_crushed");
  return [
    { name: "Retaining Wall Blocks", quantity: blockCount, unit: "blocks", weightLbs: blockCount * 52 },
    { name: "Cap Stones", quantity: capCount, unit: "pieces", weightLbs: capCount * 15 },
    { name: "Drainage Gravel", quantity: drainVol.cubicYards, unit: "cu yds", weightLbs: drainVol.weightLbs },
    { name: "Perforated Drain Pipe", quantity: Math.ceil(clampPositive(lengthFt)), unit: "ft", weightLbs: Math.ceil(clampPositive(lengthFt) * 2) },
    { name: "Geotextile Fabric", quantity: Math.ceil(clampPositive(lengthFt * heightFt)), unit: "sq ft", weightLbs: Math.ceil(clampPositive(lengthFt * heightFt) * 0.2) },
  ];
}

export function calculateFirePit(diameterFt: number): MaterialLineItem[] {
  if (diameterFt <= 0) return [];

  const radius = diameterFt / 2;
  const circumference = Math.PI * diameterFt;
  const wallBlocks = Math.ceil(circumference * 12 / 16) * 3;
  const baseArea = Math.PI * radius ** 2;
  const fireGlassLbs = Math.max(0, Math.round(baseArea * 12));
  const baseGravel = calculateBaseGravel(baseArea, 4, "gravel_crushed");
  return [
    { name: "Fire Pit Blocks", quantity: wallBlocks, unit: "blocks", weightLbs: wallBlocks * 22 },
    { name: "Fire Glass", quantity: fireGlassLbs, unit: "lbs", weightLbs: fireGlassLbs },
    { name: "Base Gravel", quantity: baseGravel.cubicYards, unit: "cu yds", weightLbs: baseGravel.weightLbs },
  ];
}

export function calculateElementMaterials(el: HardscapeElement): MaterialLineItem[] {
  const area = calculateAreaSqFt(el);
  const perimeter = calculatePerimeterFt(el);

  switch (el.type) {
    case "patio": {
      const paver = calculatePaverCount(area, el.paverPreset || "12x12", el.paverPattern || "running-bond");
      const gravel = calculateBaseGravel(area, 4, "gravel_crushed");
      const sand = calculateSandBed(area);
      const edge = calculateEdging(perimeter);
      return [
        { name: `Pavers (${el.paverPreset || "12x12"}, ${(PAVER_PATTERNS[el.paverPattern || "running-bond"]?.label || "Running Bond")})`, quantity: paver.totalPavers, unit: "pieces", weightLbs: paver.totalPavers * 8 },
        { name: "Compacted Gravel Base (4\")", quantity: gravel.cubicYards, unit: "cu yds", weightLbs: gravel.weightLbs },
        { name: "Sand Setting Bed (1\")", quantity: sand.cubicYards, unit: "cu yds", weightLbs: sand.weightLbs },
        { name: "Edge Restraints", quantity: edge.linearFeet, unit: "ft", weightLbs: edge.weightLbs },
      ];
    }
    case "walkway": {
      const paver = calculatePaverCount(area, el.paverPreset || "12x12", el.paverPattern || "stacked");
      const gravel = calculateBaseGravel(area, 4, "gravel_crushed");
      const sand = calculateSandBed(area);
      const edge = calculateEdging(perimeter);
      return [
        { name: `Walkway Pavers (${el.paverPreset || "12x12"})`, quantity: paver.totalPavers, unit: "pieces", weightLbs: paver.totalPavers * 8 },
        { name: "Gravel Base (4\")", quantity: gravel.cubicYards, unit: "cu yds", weightLbs: gravel.weightLbs },
        { name: "Sand Bed (1\")", quantity: sand.cubicYards, unit: "cu yds", weightLbs: sand.weightLbs },
        { name: "Edge Restraints", quantity: edge.linearFeet, unit: "ft", weightLbs: edge.weightLbs },
      ];
    }
    case "fire-pit":
      return calculateFirePit(el.diameter);
    case "retaining-wall":
      return calculateRetainingWall(el.width, el.wallHeight ?? 2);
    case "garden-bed": {
      const mulchVol = calculateBaseGravel(area, 3, "gravel_pea");
      const edge = calculateEdging(perimeter);
      return [
        { name: "Decorative Gravel / Mulch (3\")", quantity: mulchVol.cubicYards, unit: "cu yds", weightLbs: mulchVol.weightLbs },
        { name: "Edge Restraints", quantity: edge.linearFeet, unit: "ft", weightLbs: edge.weightLbs },
        { name: "Weed Barrier Fabric", quantity: Math.ceil(clampPositive(area)), unit: "sq ft", weightLbs: Math.ceil(clampPositive(area) * 0.2) },
      ];
    }
    default:
      assertNever(el.type);
  }
}

export function aggregateMaterials(elements: HardscapeElement[]): MaterialLineItem[] {
  const all = elements.flatMap(calculateElementMaterials);
  const merged: Record<string, MaterialLineItem> = {};

  for (const item of all) {
    if (merged[item.name]) {
      const existing = merged[item.name];
      existing.quantity += item.quantity;
      existing.weightLbs += item.weightLbs;
    } else {
      merged[item.name] = { ...item };
    }
  }

  return Object.values(merged).sort((a, b) => b.weightLbs - a.weightLbs);
}

export function getTotalWeight(items: MaterialLineItem[]): number {
  const total = items.reduce((s, i) => s + i.weightLbs, 0);
  return Number.isFinite(total) ? total : 0;
}

export function getTotalCost(items: MaterialLineItem[]): number {
  let cost = 0;
  for (const item of items) {
    if (item.unit === "pieces" && item.name.includes("Paver")) {
      cost += item.quantity * 0.85;
    } else if (item.unit === "blocks") {
      cost += item.quantity * 2.5;
    } else if (item.unit === "pieces" && (item.name.includes("Block") || item.name.includes("Cap"))) {
      cost += item.quantity * 3.5;
    } else if (item.unit === "cu yds") {
      cost += item.quantity * 50;
    } else if (item.unit === "lbs" && item.name.includes("Glass")) {
      cost += item.quantity * 6;
    } else if (item.unit === "ft" && item.name.includes("Pipe")) {
      cost += item.quantity * 0.5;
    } else if (item.unit === "sq ft") {
      cost += item.quantity * 0.15;
    } else {
      cost += item.quantity * 0.5;
    }
  }
  return Math.round(cost);
}
