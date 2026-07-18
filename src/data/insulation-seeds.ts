export interface InsulationSeed {
  slug: string;
  stateCode: string;
  climateZone: number;
  homeType: "ranch" | "colonial" | "split-level" | "townhouse";
  label: string;
  atticArea: number;
  wallArea: number;
  floorArea: number;
}

export const INSULATION_SEEDS: InsulationSeed[] = [
  // Midwest / Cold Zones (Zone 5, 6, 7)
  { slug: "illinois/ranch-house-insulation", stateCode: "IL", climateZone: 5, homeType: "ranch", label: "Ranch House Insulation Planner (Illinois)", atticArea: 1600, wallArea: 1200, floorArea: 1600 },
  { slug: "michigan/2-story-colonial-insulation", stateCode: "MI", climateZone: 5, homeType: "colonial", label: "2-Story Colonial Insulation Planner (Michigan)", atticArea: 1000, wallArea: 1800, floorArea: 1000 },
  { slug: "minnesota/split-level-insulation", stateCode: "MN", climateZone: 6, homeType: "split-level", label: "Split-Level Home Insulation Planner (Minnesota)", atticArea: 1200, wallArea: 1400, floorArea: 1200 },
  { slug: "wisconsin/townhouse-insulation", stateCode: "WI", climateZone: 6, homeType: "townhouse", label: "Townhouse Insulation Planner (Wisconsin)", atticArea: 800, wallArea: 1000, floorArea: 800 },
  
  // South / Hot Zones (Zone 1, 2, 3)
  { slug: "texas/ranch-house-insulation", stateCode: "TX", climateZone: 3, homeType: "ranch", label: "Ranch House Insulation Planner (Texas)", atticArea: 1800, wallArea: 1300, floorArea: 1800 },
  { slug: "florida/ranch-house-insulation", stateCode: "FL", climateZone: 2, homeType: "ranch", label: "Ranch House Insulation Planner (Florida)", atticArea: 1500, wallArea: 1100, floorArea: 1500 },
  { slug: "georgia/2-story-colonial-insulation", stateCode: "GA", climateZone: 3, homeType: "colonial", label: "2-Story Colonial Insulation Planner (Georgia)", atticArea: 1100, wallArea: 1900, floorArea: 1100 },
  { slug: "arizona/ranch-house-insulation", stateCode: "AZ", climateZone: 3, homeType: "ranch", label: "Ranch House Insulation Planner (Arizona)", atticArea: 2000, wallArea: 1500, floorArea: 2000 },

  // Northeast / Variable (Zone 4, 5)
  { slug: "new-york/2-story-colonial-insulation", stateCode: "NY", climateZone: 5, homeType: "colonial", label: "2-Story Colonial Insulation Planner (New York)", atticArea: 1200, wallArea: 2000, floorArea: 1200 },
  { slug: "pennsylvania/ranch-house-insulation", stateCode: "PA", climateZone: 5, homeType: "ranch", label: "Ranch House Insulation Planner (Pennsylvania)", atticArea: 1400, wallArea: 1100, floorArea: 1400 },
  { slug: "massachusetts/townhouse-insulation", stateCode: "MA", climateZone: 5, homeType: "townhouse", label: "Townhouse Insulation Planner (Massachusetts)", atticArea: 750, wallArea: 950, floorArea: 750 },

  // West Coast
  { slug: "california/ranch-house-insulation", stateCode: "CA", climateZone: 3, homeType: "ranch", label: "Ranch House Insulation Planner (California)", atticArea: 1700, wallArea: 1250, floorArea: 1700 },
  { slug: "washington/split-level-insulation", stateCode: "WA", climateZone: 4, homeType: "split-level", label: "Split-Level Home Insulation Planner (Washington)", atticArea: 1300, wallArea: 1500, floorArea: 1300 },
  { slug: "oregon/2-story-colonial-insulation", stateCode: "OR", climateZone: 4, homeType: "colonial", label: "2-Story Colonial Insulation Planner (Oregon)", atticArea: 950, wallArea: 1650, floorArea: 950 },
];
export interface InsulationDimensionSeed {
  slug: string;
  area: number;
  surface: "attic" | "wall";
  material: "blown_in_cellulose" | "blown_in_fiberglass" | "batt_fiberglass";
  label: string;
}

export const INSULATION_DIMENSION_SEEDS: InsulationDimensionSeed[] = [
  // Attic Blown-In Cellulose
  { slug: "1000-sqft-attic-blown-in-cellulose", area: 1000, surface: "attic", material: "blown_in_cellulose", label: "1,000 Sq Ft Attic Blown-In Cellulose Bag Calculator" },
  { slug: "1200-sqft-attic-blown-in-cellulose", area: 1200, surface: "attic", material: "blown_in_cellulose", label: "1,200 Sq Ft Attic Blown-In Cellulose Bag Calculator" },
  { slug: "1500-sqft-attic-blown-in-cellulose", area: 1500, surface: "attic", material: "blown_in_cellulose", label: "1,500 Sq Ft Attic Blown-In Cellulose Bag Calculator" },
  { slug: "1800-sqft-attic-blown-in-cellulose", area: 1800, surface: "attic", material: "blown_in_cellulose", label: "1,800 Sq Ft Attic Blown-In Cellulose Bag Calculator" },
  { slug: "2000-sqft-attic-blown-in-cellulose", area: 2000, surface: "attic", material: "blown_in_cellulose", label: "2,000 Sq Ft Attic Blown-In Cellulose Bag Calculator" },

  // Attic Blown-In Fiberglass
  { slug: "1000-sqft-attic-blown-in-fiberglass", area: 1000, surface: "attic", material: "blown_in_fiberglass", label: "1,000 Sq Ft Attic Blown-In Fiberglass Bag Calculator" },
  { slug: "1200-sqft-attic-blown-in-fiberglass", area: 1200, surface: "attic", material: "blown_in_fiberglass", label: "1,200 Sq Ft Attic Blown-In Fiberglass Bag Calculator" },
  { slug: "1500-sqft-attic-blown-in-fiberglass", area: 1500, surface: "attic", material: "blown_in_fiberglass", label: "1,500 Sq Ft Attic Blown-In Fiberglass Bag Calculator" },
  { slug: "2000-sqft-attic-blown-in-fiberglass", area: 2000, surface: "attic", material: "blown_in_fiberglass", label: "2,000 Sq Ft Attic Blown-In Fiberglass Bag Calculator" },

  // Walls Fiberglass Batts
  { slug: "800-sqft-wall-fiberglass-batts", area: 800, surface: "wall", material: "batt_fiberglass", label: "800 Sq Ft Wall Fiberglass Batt Calculator" },
  { slug: "1000-sqft-wall-fiberglass-batts", area: 1000, surface: "wall", material: "batt_fiberglass", label: "1,000 Sq Ft Wall Fiberglass Batt Calculator" },
  { slug: "1200-sqft-wall-fiberglass-batts", area: 1200, surface: "wall", material: "batt_fiberglass", label: "1,200 Sq Ft Wall Fiberglass Batt Calculator" },
  { slug: "1500-sqft-wall-fiberglass-batts", area: 1500, surface: "wall", material: "batt_fiberglass", label: "1,500 Sq Ft Wall Fiberglass Batt Calculator" },
];
