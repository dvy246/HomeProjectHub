export type ClimateRegion = "cold" | "hot-humid" | "hot-dry" | "temperate" | "west-coast";
export type PropertyType = "single-family" | "townhouse" | "condo" | "duplex";
export type AgeRange = "under-5" | "5-15" | "15-30" | "over-30";

export interface CostInputs {
  homeSizeSqft: number;
  age: AgeRange;
  region: ClimateRegion;
  propertyType: PropertyType;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  items: string[];
}

export interface CostResult {
  yearlyLow: number;
  yearlyMid: number;
  yearlyHigh: number;
  monthlyMid: number;
  breakdown: CostBreakdown[];
  explanation: string;
}

const AGE_MULTIPLIERS: Record<AgeRange, number> = {
  "under-5": 0.7,
  "5-15": 0.9,
  "15-30": 1.1,
  "over-30": 1.4,
};

const REGION_MULTIPLIERS: Record<ClimateRegion, number> = {
  cold: 1.3,
  "hot-humid": 1.15,
  "hot-dry": 1.0,
  temperate: 0.9,
  "west-coast": 1.1,
};

const PROPERTY_MULTIPLIERS: Record<PropertyType, number> = {
  "single-family": 1.0,
  townhouse: 0.85,
  condo: 0.6,
  duplex: 1.15,
};

const BASE_RATE_PER_SQFT = 1.2;

const CATEGORY_BREAKDOWN: { category: string; percentage: number; items: string[] }[] = [
  { category: "HVAC", percentage: 25, items: ["Filter replacements", "Tune-ups and inspections", "Repairs", "Refrigerant recharge"] },
  { category: "Plumbing", percentage: 15, items: ["Water heater maintenance", "Drain cleaning", "Faucet/ toilet repairs", "Septic or well service"] },
  { category: "Electrical", percentage: 10, items: ["Fixture replacements", "Outlet/switch repairs", "Panel maintenance", "Smoke/CO detector batteries"] },
  { category: "Exterior", percentage: 30, items: ["Roof repairs and inspection", "Gutter cleaning", "Paint and caulking", "Driveway sealcoat", "Deck treatment"] },
  { category: "Interior", percentage: 15, items: ["Appliance maintenance", "Floor care", "Caulking and sealing", "HVAC filter changes"] },
  { category: "Safety & Misc", percentage: 5, items: ["Fire extinguisher", "Chimney cleaning", "Pest prevention", "Garage door service"] },
];

export function estimateCosts(inputs: CostInputs): CostResult {
  const baseCost = inputs.homeSizeSqft * BASE_RATE_PER_SQFT;
  const ageMult = AGE_MULTIPLIERS[inputs.age];
  const regionMult = REGION_MULTIPLIERS[inputs.region];
  const propertyMult = PROPERTY_MULTIPLIERS[inputs.propertyType];

  const yearlyMid = Math.round(baseCost * ageMult * regionMult * propertyMult);
  const yearlyLow = Math.round(yearlyMid * 0.7);
  const yearlyHigh = Math.round(yearlyMid * 1.4);
  const monthlyMid = Math.round(yearlyMid / 12);

  const breakdown = CATEGORY_BREAKDOWN.map((cat) => ({
    category: cat.category,
    amount: Math.round(yearlyMid * (cat.percentage / 100)),
    percentage: cat.percentage,
    items: cat.items,
  }));

  const explanation = `This estimate uses the industry-standard "1% rule" adjusted for your home's age, region, and property type. The baseline assumes $${BASE_RATE_PER_SQFT} per square foot before adjustments.`;

  return { yearlyLow, yearlyMid, yearlyHigh, monthlyMid, breakdown, explanation };
}

export const REGION_LABELS: Record<ClimateRegion, string> = {
  cold: "Cold / Northeast — heavy snow, freeze-thaw cycles",
  "hot-humid": "Hot-Humid / Southeast — AC-heavy, moisture concerns",
  "hot-dry": "Hot-Dry / Southwest — arid, dust, minimal freeze",
  temperate: "Temperate / Midwest — seasonal extremes, moderate",
  "west-coast": "West Coast — mild, seismic considerations",
};

export const AGE_LABELS: Record<AgeRange, string> = {
  "under-5": "Under 5 years — new construction, under warranty",
  "5-15": "5–15 years — established systems, routine maintenance",
  "15-30": "15–30 years — aging systems, replacement planning",
  "over-30": "Over 30 years — older home, frequent repairs",
};

export const PROPERTY_LABELS: Record<PropertyType, string> = {
  "single-family": "Single Family Home — all maintenance is your responsibility",
  townhouse: "Townhouse — some exterior may be HOA-covered",
  condo: "Condo — interior only, HOA covers exterior and common areas",
  duplex: "Duplex / Multi-Unit — shared systems, higher per-unit cost",
};
