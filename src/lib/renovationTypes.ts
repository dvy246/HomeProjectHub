export type RenovationType = "bathroom" | "kitchen";
export type ScopeTierId = "cosmetic" | "mid-range" | "full-gut";
export type QualityTierId = "budget" | "mid-range" | "premium";
export type PriceTier = 1 | 2 | 3;
export type PlanStatus = "draft" | "planning" | "in_progress" | "complete";

export interface DimensionField {
  key: string;
  label: string;
  default: number;
  unit: string;
  optional?: boolean;
  min?: number;
  max?: number;
}

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  unitSystem: "imperial" | "metric";
  [key: string]: number | string;
}

export interface ScopeTierConfig {
  id: ScopeTierId;
  name: string;
  description: string;
  includes: string[];
  costFactor: number;
}

export interface QualityTierConfig {
  id: QualityTierId;
  name: string;
  description: string;
  materialFactor: number;
  fixtureFactor: number;
}

export interface ComparisonData {
  maintenance: "very-low" | "low" | "medium" | "high";
  lifespan: string;
  difficulty: "easy" | "moderate" | "hard";
  waterResistance: "poor" | "good" | "excellent";
  warmth: "cool" | "neutral" | "warm";
  sustainability: "low" | "medium" | "high";
}

export interface FinishOptionConfig {
  id: string;
  name: string;
  description: string;
  priceTier: PriceTier;
  costPerSqFtRange: { low: number; high: number };
  comparison: ComparisonData;
}

export interface FinishCategoryConfig {
  id: string;
  name: string;
  description: string;
  areaSource: string;
  options: FinishOptionConfig[];
}

export interface BudgetCategoryConfig {
  id: string;
  name: string;
  percentage: { low: number; high: number };
  description: string;
}

export interface TimelinePhaseConfig {
  id: string;
  name: string;
  description: string;
  order: number;
  details: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface RelatedCalculator {
  title: string;
  slug: string;
  description: string;
}

export interface StandardMaterial {
  name: string;
  unit: string;
  category: string;
  perUnitArea?: boolean;
  areaSource?: string;
}

export interface RenovationTypeConfig {
  slug: RenovationType;
  name: string;
  shortName: string;
  description: string;
  metaDescription: string;
  icon: string;
  defaultDimensions: RoomDimensions;
  dimensionFields: DimensionField[];
  scopeTiers: ScopeTierConfig[];
  qualityTiers: QualityTierConfig[];
  finishCategories: FinishCategoryConfig[];
  budgetCategories: BudgetCategoryConfig[];
  timelinePhases: TimelinePhaseConfig[];
  faqs: FaqItem[];
  relatedCalculators: RelatedCalculator[];
  standardMaterials: StandardMaterial[];
}

export interface RenovationPlannerState {
  dimensions: RoomDimensions;
  scopeTierId: ScopeTierId;
  qualityTierId: QualityTierId;
  selectedFinishes: Record<string, string>;
  laborPercent: number;
  contingencyPercent: number;
  permitPercent: number;
}

export interface ItemizedCost {
  categoryId: string;
  categoryName: string;
  area: number;
  finishName: string;
  low: number;
  high: number;
}

export interface BudgetEstimate {
  itemized: ItemizedCost[];
  materialLow: number;
  materialHigh: number;
  laborLow: number;
  laborHigh: number;
  contingencyLow: number;
  contingencyHigh: number;
  permitLow: number;
  permitHigh: number;
  totalLow: number;
  totalHigh: number;
}

export interface TimelineItem {
  phaseId: string;
  name: string;
  description: string;
  order: number;
  details: string[];
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface SavedRenovationPlan {
  id: string;
  name: string;
  type: RenovationType;
  createdAt: number;
  updatedAt: number;
  status: PlanStatus;
  state: RenovationPlannerState;
  budget: BudgetEstimate;
  shoppingList: ShoppingListItem[];
  timeline: TimelineItem[];
}
