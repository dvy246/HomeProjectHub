import type { ComparisonCategory, ComparisonWeights, MaterialScores } from './compareEngine';
import { getDefaultWeights } from './compareEngine';

export type ClimateCondition =
  | "freezing-winters"
  | "coastal-salt-air"
  | "high-humidity"
  | "extreme-heat"
  | "high-wind"
  | "freeze-thaw-cycles"
  | "heavy-rainfall"
  | "wildfire-zone";

export interface ClimateProfile {
  id: ClimateCondition;
  label: string;
  description: string;
  icon: string;
  weightAdjustments: {
    cost?: number;
    durability?: number;
    maintenance?: number;
    lifespan?: number;
    ecoFriendly?: number;
    aesthetics?: number;
  };
  keyScores: (keyof MaterialScores)[];
}

export const CLIMATE_PROFILES: Record<ClimateCondition, ClimateProfile> = {
  "freezing-winters": {
    id: "freezing-winters",
    label: "Cold & Freezing Winters",
    description: "Requires materials that can withstand sub-zero temperatures and resist cracking from cold.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-snowflake"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>',
    weightAdjustments: { durability: 90, maintenance: 70, lifespan: 80, aesthetics: 30 },
    keyScores: ["durability", "waterResistance"],
  },
  "coastal-salt-air": {
    id: "coastal-salt-air",
    label: "Coastal & Salt Air",
    description: "Corrosion resistance and humidity tolerance are paramount for coastal environments.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
    weightAdjustments: { durability: 100, maintenance: 80, lifespan: 90 },
    keyScores: ["waterResistance", "durability"],
  },
  "high-humidity": {
    id: "high-humidity",
    label: "Hot & Humid",
    description: "Mold, mildew, and warping are major risks. Breathability and moisture resistance are key.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-droplets"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7 6.3 7 6.3s-2.29 2.76-3.29 3.76C2.57 11.02 2 12.12 2 13.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>',
    weightAdjustments: { durability: 80, maintenance: 90, lifespan: 70 },
    keyScores: ["waterResistance", "easeMaintenance"],
  },
  "extreme-heat": {
    id: "extreme-heat",
    label: "Extreme Heat / Arid",
    description: "UV degradation and heat warping require materials with high thermal stability.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    weightAdjustments: { durability: 90, maintenance: 60, lifespan: 90 },
    keyScores: ["durability"],
  },
  "high-wind": {
    id: "high-wind",
    label: "High Wind / Prairie",
    description: "Impact resistance and structural integrity to prevent wind uplift and debris damage.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wind"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    weightAdjustments: { durability: 100, lifespan: 80 },
    keyScores: ["durability", "scratchResistance"],
  },
  "freeze-thaw-cycles": {
    id: "freeze-thaw-cycles",
    label: "Frequent Freeze-Thaw",
    description: "Rapid temperature changes cause expansion and contraction, stressing rigid materials.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thermometer-snow"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/><path d="M12 6a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4V6Z"/></svg>',
    weightAdjustments: { durability: 90, maintenance: 80, lifespan: 90 },
    keyScores: ["waterResistance", "durability"],
  },
  "heavy-rainfall": {
    id: "heavy-rainfall",
    label: "Heavy Rainfall",
    description: "Constant water exposure requires supreme rot resistance and drainage capabilities.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>',
    weightAdjustments: { durability: 80, maintenance: 80, lifespan: 80 },
    keyScores: ["waterResistance"],
  },
  "wildfire-zone": {
    id: "wildfire-zone",
    label: "Wildfire Zone",
    description: "Non-combustible or highly fire-resistant materials are mandatory for safety and code compliance.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    weightAdjustments: { durability: 100, lifespan: 90, aesthetics: 40 },
    keyScores: ["durability"],
  },
};

export function getClimateWeights(climate: ClimateCondition): ComparisonWeights {
  const profile = CLIMATE_PROFILES[climate];
  const defaults = getDefaultWeights();
  return {
    ...defaults,
    ...profile.weightAdjustments,
  };
}

export function getCompatibleCategories(climate: ClimateCondition): ComparisonCategory[] {
  const allExterior: ComparisonCategory[] = ["decking", "roofing", "siding"];
  const all: ComparisonCategory[] = ["flooring", "countertops", "decking", "roofing", "siding"];

  switch (climate) {
    case "freezing-winters":
    case "coastal-salt-air":
    case "extreme-heat":
    case "high-wind":
    case "freeze-thaw-cycles":
    case "heavy-rainfall":
    case "wildfire-zone":
      return allExterior;
    case "high-humidity":
      return ["flooring", "siding", "decking", "roofing"];
    default:
      return all;
  }
}

export const CLIMATE_CATEGORY_SEEDS: Array<{ climate: ClimateCondition; category: ComparisonCategory; slug: string }> = [];

for (const climate of Object.keys(CLIMATE_PROFILES) as ClimateCondition[]) {
  const categories = getCompatibleCategories(climate);
  for (const category of categories) {
    CLIMATE_CATEGORY_SEEDS.push({
      climate,
      category,
      slug: `${category}/for/${climate}`
    });
  }
}
