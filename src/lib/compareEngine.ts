import comparisonData from "../data/compare-materials.json";

export type ComparisonCategory = "flooring" | "countertops" | "roofing" | "siding" | "decking";
export type Persona = "budget" | "balanced" | "premium" | "durable";

export interface MaterialCost {
  min: number;
  max: number;
  avg: number;
  installed?: number;
}

export interface MaterialScores {
  durability: number;
  waterResistance: number;
  scratchResistance: number;
  easeMaintenance: number;
  ecoFriendly: number;
  resaleValue: number;
  warmthComfort: number;
  soundAbsorption: number;
  easeInstallation: number;
}

export interface AffiliateLinks {
  lowes?: string;
  amazon?: string;
}

export interface ComparisonMaterialData {
  id: string;
  name: string;
  category: ComparisonCategory;
  description: string;
  unit: string;
  costPerUnit: MaterialCost;
  lifespanYears: number;
  maintenanceAnnualCostPerUnit: number;
  replacementCostPerUnit: number;
  scores: MaterialScores;
  pros: string[];
  cons: string[];
  installationDifficulty: number;
  affiliateLinks: AffiliateLinks;
  svgColors: string[];
}

export interface ComparisonWeights {
  cost: number;
  durability: number;
  maintenance: number;
  lifespan: number;
  ecoFriendly: number;
  aesthetics: number;
}

export interface LifecycleCost {
  total: number;
  upfront: number;
  maintenance: number;
  replacement: number;
}

export interface ScoreResult {
  materialId: string;
  materialName: string;
  totalScore: number;
  dimensionScores: Record<string, number>;
  upfrontCost: number;
  lifecycleCost: LifecycleCost;
  winner: boolean;
}

export interface ComparisonResult {
  materials: ScoreResult[];
  winnerId: string;
  recommendation: string;
}

const SCORE_DIMENSIONS: (keyof MaterialScores)[] = [
  "durability",
  "waterResistance",
  "scratchResistance",
  "easeMaintenance",
  "ecoFriendly",
  "resaleValue",
  "warmthComfort",
  "soundAbsorption",
  "easeInstallation",
];

const CATEGORY_LABELS: Record<ComparisonCategory, string> = {
  flooring: "Flooring",
  countertops: "Countertops",
  roofing: "Roofing",
  siding: "Siding",
  decking: "Decking",
};

const CATEGORY_MATERIAL_MAP: Record<ComparisonCategory, ComparisonMaterialData[]> = comparisonData as unknown as Record<ComparisonCategory, ComparisonMaterialData[]>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getDefaultWeights(): ComparisonWeights {
  return {
    cost: 50,
    durability: 50,
    maintenance: 50,
    lifespan: 50,
    ecoFriendly: 50,
    aesthetics: 50,
  };
}

export function getPersonaWeights(persona: Persona): ComparisonWeights {
  switch (persona) {
    case "budget":
      return { cost: 100, durability: 60, maintenance: 40, lifespan: 60, ecoFriendly: 20, aesthetics: 30 };
    case "balanced":
      return getDefaultWeights();
    case "premium":
      return { cost: 20, durability: 80, maintenance: 80, lifespan: 100, ecoFriendly: 60, aesthetics: 80 };
    case "durable":
      return { cost: 40, durability: 100, maintenance: 80, lifespan: 90, ecoFriendly: 30, aesthetics: 40 };
    default:
      assertNever(persona);
  }
}

export function computeWeightedScore(
  scores: MaterialScores,
  weights: ComparisonWeights,
  costPerUnit: number,
  category?: ComparisonCategory
): number {
  const weightSum = weights.cost + weights.durability + weights.maintenance
    + weights.lifespan + weights.ecoFriendly + weights.aesthetics;

  if (weightSum <= 0) {
    return 50;
  }

  let maxCost = 200;
  if (category === "flooring" || category === "siding" || category === "roofing") {
    maxCost = 25;
  } else if (category === "decking") {
    maxCost = 40;
  }

  const normalizedCostScore = clamp(100 - (costPerUnit / maxCost) * 100, 0, 100);
  const durabilityScore = (scores.durability / 10) * 100;
  const maintenanceScore = (scores.easeMaintenance / 10) * 100;
  const lifespanScore = clamp((scores.easeMaintenance + scores.durability) / 2 / 10 * 100, 0, 100);
  const ecoScore = (scores.ecoFriendly / 10) * 100;
  const aestheticsScore = ((scores.warmthComfort + scores.resaleValue + scores.scratchResistance) / 3 / 10) * 100;

  const total = (
    normalizedCostScore * (weights.cost / weightSum)
    + durabilityScore * (weights.durability / weightSum)
    + maintenanceScore * (weights.maintenance / weightSum)
    + lifespanScore * (weights.lifespan / weightSum)
    + ecoScore * (weights.ecoFriendly / weightSum)
    + aestheticsScore * (weights.aesthetics / weightSum)
  );

  return round2(clamp(total, 0, 100));
}

export function computeLifecycleCost(
  material: ComparisonMaterialData,
  sqft: number,
  years: number
): LifecycleCost {
  const area = Math.max(sqft, 1);
  const upfront = area * material.costPerUnit.avg;
  const maintenance = area * material.maintenanceAnnualCostPerUnit * years;
  const replacements = Math.max(0, Math.floor(years / material.lifespanYears));
  const replacement = replacements * area * material.replacementCostPerUnit;

  return {
    total: round2(upfront + maintenance + replacement),
    upfront: round2(upfront),
    maintenance: round2(maintenance),
    replacement: round2(replacement),
  };
}

export function compareMaterials(
  materials: ComparisonMaterialData[],
  weights: ComparisonWeights,
  sqft?: number
): ComparisonResult {
  if (materials.length < 2) {
    const single = materials[0];
    const singleScore = single
      ? computeWeightedScore(single.scores, weights, single.costPerUnit.avg, single.category)
      : 0;
    const singleCost = single ? computeLifecycleCost(single, sqft || 1, 25) : { total: 0, upfront: 0, maintenance: 0, replacement: 0 };
    return {
      materials: single ? [{
        materialId: single.id,
        materialName: single.name,
        totalScore: singleScore,
        dimensionScores: buildDimensionScores(single, weights),
        upfrontCost: singleCost.upfront,
        lifecycleCost: singleCost,
        winner: true,
      }] : [],
      winnerId: single?.id ?? "",
      recommendation: single ? `${single.name} is the only material selected.` : "",
    };
  }

  const scored: ScoreResult[] = materials.map((mat) => {
    const score = computeWeightedScore(mat.scores, weights, mat.costPerUnit.avg, mat.category);
    const cost = computeLifecycleCost(mat, sqft || 1, 25);
    return {
      materialId: mat.id,
      materialName: mat.name,
      totalScore: score,
      dimensionScores: buildDimensionScores(mat, weights),
      upfrontCost: cost.upfront,
      lifecycleCost: cost,
      winner: false,
    };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  scored[0].winner = true;
  const winnerId = scored[0].materialId;
  const runnerUp = scored.length > 1 ? scored[1] : scored[0];

  const recommendation = generateRecommendation(scored[0], runnerUp);

  return { materials: scored, winnerId, recommendation };
}

function buildDimensionScores(
  material: ComparisonMaterialData,
  weights: ComparisonWeights
): Record<string, number> {
  return {
    durability: material.scores.durability,
    waterResistance: material.scores.waterResistance,
    scratchResistance: material.scores.scratchResistance,
    easeMaintenance: material.scores.easeMaintenance,
    ecoFriendly: material.scores.ecoFriendly,
    resaleValue: material.scores.resaleValue,
    warmthComfort: material.scores.warmthComfort,
    soundAbsorption: material.scores.soundAbsorption,
    costPerSqFt: clamp(100 - (material.costPerUnit.avg / 200) * 100, 0, 100),
  };
}

export function generateRecommendation(
  winner: ScoreResult,
  runnerUp: ScoreResult
): string {
  const diff = round2(winner.totalScore - runnerUp.totalScore);
  if (diff <= 0) {
    return `Both ${winner.materialName} and ${runnerUp.materialName} score equally well for your priorities. Try adjusting your weights to find the difference.`;
  }
  if (diff < 5) {
    return `${winner.materialName} slightly edges out ${runnerUp.materialName} by ${diff} points. Either option would work well for your project.`;
  }
  if (diff < 15) {
    return `${winner.materialName} outperforms ${runnerUp.materialName} by ${diff} points based on your priorities. It's a solid choice for your project.`;
  }
  return `${winner.materialName} is the clear winner, scoring ${diff} points higher than ${runnerUp.materialName}. It best matches your priorities.`;
}

export function encodeComparisonState(state: {
  m1: string;
  m2: string;
  m3?: string;
  weights?: Partial<ComparisonWeights>;
  sqft?: number;
}): string {
  const params = new URLSearchParams();
  params.set("m1", state.m1);
  params.set("m2", state.m2);
  if (state.m3) params.set("m3", state.m3);
  if (state.weights) {
    const w = state.weights;
    if (w.cost !== undefined) params.set("wc", String(w.cost));
    if (w.durability !== undefined) params.set("wd", String(w.durability));
    if (w.maintenance !== undefined) params.set("wm", String(w.maintenance));
    if (w.lifespan !== undefined) params.set("wl", String(w.lifespan));
    if (w.ecoFriendly !== undefined) params.set("we", String(w.ecoFriendly));
    if (w.aesthetics !== undefined) params.set("wa", String(w.aesthetics));
  }
  if (state.sqft !== undefined) params.set("s", String(state.sqft));
  return params.toString();
}

export function decodeComparisonState(search: string): {
  m1: string;
  m2: string;
  m3?: string;
  weights: ComparisonWeights;
  sqft?: number;
} | null {
  try {
    const parsed = new URLSearchParams(search);
    const m1 = parsed.get("m1");
    const m2 = parsed.get("m2");
    if (!m1 || !m2) return null;

    const m3 = parsed.get("m3") || undefined;

    const weights: ComparisonWeights = {
      cost: wcParse(parsed.get("wc")),
      durability: wcParse(parsed.get("wd")),
      maintenance: wcParse(parsed.get("wm")),
      lifespan: wcParse(parsed.get("wl")),
      ecoFriendly: wcParse(parsed.get("we")),
      aesthetics: wcParse(parsed.get("wa")),
    };
    const hasAnyWeight = Object.values(weights).some((v) => v !== 50);
    const finalWeights = hasAnyWeight ? weights : getDefaultWeights();

    const sqftRaw = parsed.get("s");
    const sqft = sqftRaw ? parseFloat(sqftRaw) : undefined;

    return { m1, m2, m3, weights: finalWeights, sqft };
  } catch {
    return null;
  }
}

function wcParse(raw: string | null): number {
  if (!raw) return 50;
  const val = parseInt(raw, 10);
  return Number.isNaN(val) ? 50 : clamp(val, 0, 100);
}

export function loadComparisonData(): Record<string, ComparisonMaterialData[]> {
  return CATEGORY_MATERIAL_MAP;
}

export function getMaterialsByCategory(
  category: ComparisonCategory
): ComparisonMaterialData[] {
  const data = CATEGORY_MATERIAL_MAP[category];
  if (!data) return [];
  return data;
}

export function getMaterialById(
  category: ComparisonCategory,
  id: string
): ComparisonMaterialData | undefined {
  const materials = getMaterialsByCategory(category);
  return materials.find((m) => m.id === id);
}

export function formatCategory(category: ComparisonCategory): string {
  return CATEGORY_LABELS[category] || category;
}

export function getPairs(
  materials: ComparisonMaterialData[]
): Array<[ComparisonMaterialData, ComparisonMaterialData]> {
  const pairs: Array<[ComparisonMaterialData, ComparisonMaterialData]> = [];
  for (let i = 0; i < materials.length; i++) {
    for (let j = i + 1; j < materials.length; j++) {
      pairs.push([materials[i], materials[j]]);
    }
  }
  return pairs;
}

export function parsePairSlug(slug: string): [string, string] | null {
  const match = slug.match(/^(.+?)-vs-(.+)$/);
  if (!match) return null;
  return [match[1], match[2]];
}

export function parseSizeSlug(slug: string | undefined): number | undefined {
  if (!slug) return undefined;
  const dimMatch = slug.match(/^(\d+)x(\d+)$/);
  if (dimMatch) {
    return parseInt(dimMatch[1], 10) * parseInt(dimMatch[2], 10);
  }
  const sqftMatch = slug.match(/^(\d+)-sqft$/);
  if (sqftMatch) {
    return parseInt(sqftMatch[1], 10);
  }
  return undefined;
}

export const ALL_CATEGORIES: ComparisonCategory[] = ["flooring", "countertops", "roofing", "siding", "decking"];

export const COMPARISON_SIZES = [
  { slug: "100-sqft", sqft: 100, label: "100 sq ft" },
  { slug: "200-sqft", sqft: 200, label: "200 sq ft" },
  { slug: "300-sqft", sqft: 300, label: "300 sq ft" },
  { slug: "500-sqft", sqft: 500, label: "500 sq ft" },
  { slug: "800-sqft", sqft: 800, label: "800 sq ft" },
  { slug: "10x10", sqft: 100, label: "10×10 room" },
  { slug: "12x12", sqft: 144, label: "12×12 room" },
  { slug: "12x20", sqft: 240, label: "12×20 room" },
  { slug: "15x15", sqft: 225, label: "15×15 room" },
  { slug: "20x20", sqft: 400, label: "20×20 room" },
];
