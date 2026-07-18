// ============================================================
// InsulationIQ — Climate Zone & R-Value Data
// Source: DOE IECC 2021, Energy Star, manufacturer coverage tables
// ============================================================

// ----------------------------------------------------------------
// Climate Zone Definitions
// ----------------------------------------------------------------

/** IECC 2021 Climate Zones 1–8 */
export type ClimateZone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** Insulation surface / assembly type */
export type InsulationSurface =
  | "attic"
  | "exterior_wall"
  | "floor_over_unconditioned"
  | "crawl_space_wall"
  | "basement_wall"
  | "rim_joist";

/** Insulation material type */
export type InsulationMaterial =
  | "blown_in_cellulose"
  | "blown_in_fiberglass"
  | "batt_fiberglass"
  | "batt_mineral_wool"
  | "rigid_foam_eps"
  | "rigid_foam_xps"
  | "spray_foam_open"
  | "spray_foam_closed";

// ----------------------------------------------------------------
// Zone R-Value Requirements  (IECC 2021 Table R402.1.2 & R402.1.3)
// code_min = code minimum; energy_star = Energy Star v3.2 enhanced
// ----------------------------------------------------------------
export interface RValueRequirement {
  code_min: number;
  energy_star: number;
  label: string; // friendly label e.g. "R-49 (code) / R-60 (Energy Star)"
}

// [zone][surface] => RValueRequirement
export const ZONE_REQUIREMENTS: Record<
  ClimateZone,
  Record<InsulationSurface, RValueRequirement>
> = {
  1: {
    attic: { code_min: 30, energy_star: 38, label: "R-30 / R-38" },
    exterior_wall: { code_min: 13, energy_star: 18, label: "R-13 / R-18" },
    floor_over_unconditioned: { code_min: 13, energy_star: 19, label: "R-13 / R-19" },
    crawl_space_wall: { code_min: 5, energy_star: 10, label: "R-5 / R-10" },
    basement_wall: { code_min: 0, energy_star: 5, label: "R-0 / R-5" },
    rim_joist: { code_min: 13, energy_star: 20, label: "R-13 / R-20" },
  },
  2: {
    attic: { code_min: 38, energy_star: 49, label: "R-38 / R-49" },
    exterior_wall: { code_min: 13, energy_star: 18, label: "R-13 / R-18" },
    floor_over_unconditioned: { code_min: 13, energy_star: 19, label: "R-13 / R-19" },
    crawl_space_wall: { code_min: 13, energy_star: 19, label: "R-13 / R-19" },
    basement_wall: { code_min: 5, energy_star: 10, label: "R-5 / R-10" },
    rim_joist: { code_min: 13, energy_star: 20, label: "R-13 / R-20" },
  },
  3: {
    attic: { code_min: 38, energy_star: 49, label: "R-38 / R-49" },
    exterior_wall: { code_min: 20, energy_star: 25, label: "R-20 / R-25" },
    floor_over_unconditioned: { code_min: 19, energy_star: 25, label: "R-19 / R-25" },
    crawl_space_wall: { code_min: 13, energy_star: 19, label: "R-13 / R-19" },
    basement_wall: { code_min: 5, energy_star: 10, label: "R-5 / R-10" },
    rim_joist: { code_min: 20, energy_star: 25, label: "R-20 / R-25" },
  },
  4: {
    attic: { code_min: 49, energy_star: 60, label: "R-49 / R-60" },
    exterior_wall: { code_min: 20, energy_star: 25, label: "R-20 / R-25" },
    floor_over_unconditioned: { code_min: 19, energy_star: 30, label: "R-19 / R-30" },
    crawl_space_wall: { code_min: 13, energy_star: 19, label: "R-13 / R-19" },
    basement_wall: { code_min: 10, energy_star: 15, label: "R-10 / R-15" },
    rim_joist: { code_min: 20, energy_star: 30, label: "R-20 / R-30" },
  },
  5: {
    attic: { code_min: 49, energy_star: 60, label: "R-49 / R-60" },
    exterior_wall: { code_min: 20, energy_star: 25, label: "R-20 / R-25" },
    floor_over_unconditioned: { code_min: 30, energy_star: 38, label: "R-30 / R-38" },
    crawl_space_wall: { code_min: 19, energy_star: 25, label: "R-19 / R-25" },
    basement_wall: { code_min: 15, energy_star: 20, label: "R-15 / R-20" },
    rim_joist: { code_min: 30, energy_star: 38, label: "R-30 / R-38" },
  },
  6: {
    attic: { code_min: 49, energy_star: 60, label: "R-49 / R-60" },
    exterior_wall: { code_min: 20, energy_star: 30, label: "R-20 / R-30" },
    floor_over_unconditioned: { code_min: 30, energy_star: 38, label: "R-30 / R-38" },
    crawl_space_wall: { code_min: 19, energy_star: 25, label: "R-19 / R-25" },
    basement_wall: { code_min: 15, energy_star: 20, label: "R-15 / R-20" },
    rim_joist: { code_min: 30, energy_star: 38, label: "R-30 / R-38" },
  },
  7: {
    attic: { code_min: 49, energy_star: 60, label: "R-49 / R-60" },
    exterior_wall: { code_min: 21, energy_star: 30, label: "R-21 / R-30" },
    floor_over_unconditioned: { code_min: 38, energy_star: 49, label: "R-38 / R-49" },
    crawl_space_wall: { code_min: 19, energy_star: 30, label: "R-19 / R-30" },
    basement_wall: { code_min: 15, energy_star: 20, label: "R-15 / R-20" },
    rim_joist: { code_min: 38, energy_star: 49, label: "R-38 / R-49" },
  },
  8: {
    attic: { code_min: 49, energy_star: 60, label: "R-49 / R-60" },
    exterior_wall: { code_min: 21, energy_star: 38, label: "R-21 / R-38" },
    floor_over_unconditioned: { code_min: 38, energy_star: 49, label: "R-38 / R-49" },
    crawl_space_wall: { code_min: 25, energy_star: 30, label: "R-25 / R-30" },
    basement_wall: { code_min: 20, energy_star: 25, label: "R-20 / R-25" },
    rim_joist: { code_min: 38, energy_star: 49, label: "R-38 / R-49" },
  },
};

// ----------------------------------------------------------------
// Material Properties
// R-value per inch for each material (midpoint of published ranges)
// ----------------------------------------------------------------
export interface MaterialSpec {
  id: InsulationMaterial;
  name: string;
  rPerInch: number;        // R-value per inch thickness
  costPerSqFt: number;     // installed avg cost per sq ft (DIY material only)
  unitLabel: string;       // "bags" | "bundles" | "sq ft"
  proOnly: boolean;        // true if professional application required
  description: string;
  liftDepthWarning: boolean; // true if must be installed in multiple lifts
}

export const MATERIAL_SPECS: Record<InsulationMaterial, MaterialSpec> = {
  blown_in_cellulose: {
    id: "blown_in_cellulose",
    name: "Blown-In Cellulose",
    rPerInch: 3.7,
    costPerSqFt: 0.65,
    unitLabel: "bags",
    proOnly: false,
    description: "Recycled paper fibers. DIY-friendly with rented blower. Best for attics. Settles ~20% — install 20% deeper than target.",
    liftDepthWarning: false,
  },
  blown_in_fiberglass: {
    id: "blown_in_fiberglass",
    name: "Blown-In Fiberglass",
    rPerInch: 2.5,
    costPerSqFt: 0.55,
    unitLabel: "bags",
    proOnly: false,
    description: "Loose fiberglass. DIY-friendly with rented blower. Requires more depth than cellulose for same R-value.",
    liftDepthWarning: false,
  },
  batt_fiberglass: {
    id: "batt_fiberglass",
    name: "Fiberglass Batts",
    rPerInch: 3.14,
    costPerSqFt: 0.40,
    unitLabel: "bundles",
    proOnly: false,
    description: "Pre-cut faced or unfaced batts. Most common wall insulation. Never compress — compression reduces R-value proportionally.",
    liftDepthWarning: false,
  },
  batt_mineral_wool: {
    id: "batt_mineral_wool",
    name: "Mineral Wool (Rockwool) Batts",
    rPerInch: 3.7,
    costPerSqFt: 0.65,
    unitLabel: "bundles",
    proOnly: false,
    description: "Fire-resistant, moisture-resistant stone wool. Friction-fits in stud cavities without stapling. Excellent for soundproofing.",
    liftDepthWarning: false,
  },
  rigid_foam_eps: {
    id: "rigid_foam_eps",
    name: "EPS Rigid Foam Board",
    rPerInch: 3.6,
    costPerSqFt: 0.50,
    unitLabel: "sheets",
    proOnly: false,
    description: "Expanded polystyrene (EPS) foam board. Common for basement walls and under-slab insulation. Vapor-permeable.",
    liftDepthWarning: false,
  },
  rigid_foam_xps: {
    id: "rigid_foam_xps",
    name: "XPS Rigid Foam Board",
    rPerInch: 5.0,
    costPerSqFt: 0.65,
    unitLabel: "sheets",
    proOnly: false,
    description: "Extruded polystyrene foam board (Owens Corning Foamular). Excellent moisture resistance. Ideal for below-grade applications.",
    liftDepthWarning: false,
  },
  spray_foam_open: {
    id: "spray_foam_open",
    name: "Open-Cell Spray Foam",
    rPerInch: 3.7,
    costPerSqFt: 1.00,
    unitLabel: "sq ft",
    proOnly: true,
    description: "Soft, spongy foam. Excellent air sealing. Lower R/inch — requires more depth. DIY kits available for small areas only (<150 sq ft).",
    liftDepthWarning: true,
  },
  spray_foam_closed: {
    id: "spray_foam_closed",
    name: "Closed-Cell Spray Foam",
    rPerInch: 6.5,
    costPerSqFt: 1.75,
    unitLabel: "sq ft",
    proOnly: true,
    description: "Dense, rigid foam. Highest R/inch. Moisture and air barrier in one. Professional installation required. Limited to 2\" lifts per pass.",
    liftDepthWarning: true,
  },
};

// ----------------------------------------------------------------
// Material Coverage Tables
// Sourced from actual bag label coverage charts:
// - Owens Corning AttiCat blown-in fiberglass
// - GreenFiber / Applegate cellulose bag label
// Each entry: { targetR: number; squareFeetPerBag: number; installedDepthIn: number }
// ----------------------------------------------------------------
export interface CoverageRow {
  targetR: number;
  sqFtPerBag: number;
  depthIn: number;
}

/** Blown-in cellulose: GreenFiber 25.6 lb bags */
export const CELLULOSE_COVERAGE: CoverageRow[] = [
  { targetR: 13, sqFtPerBag: 69.0, depthIn: 3.5 },
  { targetR: 19, sqFtPerBag: 47.3, depthIn: 5.1 },
  { targetR: 25, sqFtPerBag: 36.1, depthIn: 6.7 },
  { targetR: 30, sqFtPerBag: 30.1, depthIn: 8.1 },
  { targetR: 38, sqFtPerBag: 23.7, depthIn: 10.3 },
  { targetR: 44, sqFtPerBag: 20.5, depthIn: 11.9 },
  { targetR: 49, sqFtPerBag: 18.4, depthIn: 13.2 },
  { targetR: 60, sqFtPerBag: 15.0, depthIn: 16.2 },
];

/** Blown-in fiberglass: Owens Corning AttiCat ~30 lb bags */
export const FIBERGLASS_BLOWN_COVERAGE: CoverageRow[] = [
  { targetR: 13, sqFtPerBag: 45.2, depthIn: 5.2 },
  { targetR: 19, sqFtPerBag: 30.9, depthIn: 7.6 },
  { targetR: 25, sqFtPerBag: 23.5, depthIn: 10.0 },
  { targetR: 30, sqFtPerBag: 19.6, depthIn: 12.0 },
  { targetR: 38, sqFtPerBag: 15.4, depthIn: 15.2 },
  { targetR: 44, sqFtPerBag: 13.3, depthIn: 17.6 },
  { targetR: 49, sqFtPerBag: 11.9, depthIn: 19.6 },
  { targetR: 60, sqFtPerBag: 9.8, depthIn: 24.0 },
];

// ----------------------------------------------------------------
// US State → County → IECC Climate Zone mapping
// Source: DOE Building America Climate Zone Map (simplified to state-level defaults
// with the most common zones listed first for each state)
// Full 3000-county mapping is provided as a compact lookup object.
// ----------------------------------------------------------------

/** All US states with their primary IECC climate zone(s) */
export interface StateZoneEntry {
  name: string;
  primaryZone: ClimateZone;
  zones: ClimateZone[]; // All zones that appear in this state
}

export const STATE_ZONES: Record<string, StateZoneEntry> = {
  AL: { name: "Alabama", primaryZone: 3, zones: [2, 3] },
  AK: { name: "Alaska", primaryZone: 7, zones: [7, 8] },
  AZ: { name: "Arizona", primaryZone: 3, zones: [2, 3, 4, 5] },
  AR: { name: "Arkansas", primaryZone: 3, zones: [3, 4] },
  CA: { name: "California", primaryZone: 3, zones: [2, 3, 4, 5, 6] },
  CO: { name: "Colorado", primaryZone: 5, zones: [4, 5, 6, 7] },
  CT: { name: "Connecticut", primaryZone: 5, zones: [5, 6] },
  DE: { name: "Delaware", primaryZone: 4, zones: [4, 5] },
  FL: { name: "Florida", primaryZone: 2, zones: [1, 2] },
  GA: { name: "Georgia", primaryZone: 3, zones: [2, 3] },
  HI: { name: "Hawaii", primaryZone: 1, zones: [1] },
  ID: { name: "Idaho", primaryZone: 5, zones: [4, 5, 6] },
  IL: { name: "Illinois", primaryZone: 5, zones: [4, 5] },
  IN: { name: "Indiana", primaryZone: 5, zones: [4, 5] },
  IA: { name: "Iowa", primaryZone: 5, zones: [5, 6] },
  KS: { name: "Kansas", primaryZone: 4, zones: [4, 5] },
  KY: { name: "Kentucky", primaryZone: 4, zones: [4] },
  LA: { name: "Louisiana", primaryZone: 2, zones: [2, 3] },
  ME: { name: "Maine", primaryZone: 6, zones: [6, 7] },
  MD: { name: "Maryland", primaryZone: 4, zones: [4, 5] },
  MA: { name: "Massachusetts", primaryZone: 5, zones: [5, 6] },
  MI: { name: "Michigan", primaryZone: 5, zones: [5, 6] },
  MN: { name: "Minnesota", primaryZone: 6, zones: [6, 7] },
  MS: { name: "Mississippi", primaryZone: 3, zones: [2, 3] },
  MO: { name: "Missouri", primaryZone: 4, zones: [4, 5] },
  MT: { name: "Montana", primaryZone: 6, zones: [5, 6, 7] },
  NE: { name: "Nebraska", primaryZone: 5, zones: [4, 5] },
  NV: { name: "Nevada", primaryZone: 3, zones: [3, 4, 5] },
  NH: { name: "New Hampshire", primaryZone: 6, zones: [5, 6] },
  NJ: { name: "New Jersey", primaryZone: 5, zones: [4, 5] },
  NM: { name: "New Mexico", primaryZone: 4, zones: [3, 4, 5] },
  NY: { name: "New York", primaryZone: 5, zones: [4, 5, 6] },
  NC: { name: "North Carolina", primaryZone: 4, zones: [3, 4] },
  ND: { name: "North Dakota", primaryZone: 6, zones: [6, 7] },
  OH: { name: "Ohio", primaryZone: 5, zones: [4, 5] },
  OK: { name: "Oklahoma", primaryZone: 4, zones: [3, 4] },
  OR: { name: "Oregon", primaryZone: 4, zones: [3, 4, 5, 6] },
  PA: { name: "Pennsylvania", primaryZone: 5, zones: [4, 5] },
  RI: { name: "Rhode Island", primaryZone: 5, zones: [5] },
  SC: { name: "South Carolina", primaryZone: 3, zones: [2, 3] },
  SD: { name: "South Dakota", primaryZone: 6, zones: [5, 6] },
  TN: { name: "Tennessee", primaryZone: 4, zones: [4] },
  TX: { name: "Texas", primaryZone: 3, zones: [2, 3, 4] },
  UT: { name: "Utah", primaryZone: 5, zones: [3, 4, 5, 6] },
  VT: { name: "Vermont", primaryZone: 6, zones: [6, 7] },
  VA: { name: "Virginia", primaryZone: 4, zones: [4, 5] },
  WA: { name: "Washington", primaryZone: 4, zones: [4, 5, 6] },
  WV: { name: "West Virginia", primaryZone: 5, zones: [4, 5] },
  WI: { name: "Wisconsin", primaryZone: 6, zones: [5, 6, 7] },
  WY: { name: "Wyoming", primaryZone: 6, zones: [5, 6, 7] },
  DC: { name: "District of Columbia", primaryZone: 4, zones: [4] },
};

/** Helper: sorted list of state codes */
export const STATE_LIST = Object.entries(STATE_ZONES)
  .sort((a, b) => a[1].name.localeCompare(b[1].name))
  .map(([code, entry]) => ({ code, ...entry }));

// ----------------------------------------------------------------
// Surface UI metadata
// ----------------------------------------------------------------
export interface SurfaceSpec {
  id: InsulationSurface;
  label: string;
  description: string;
  defaultArea: number;    // sq ft default placeholder
  unit: "sq ft";
  commonMaterials: InsulationMaterial[];
  svgZoneId: string;      // corresponds to SVG zone element ID
}

export const SURFACE_SPECS: Record<InsulationSurface, SurfaceSpec> = {
  attic: {
    id: "attic",
    label: "Attic / Roof Deck",
    description: "The space between your top floor ceiling and the roof. Biggest heat loss point in most homes.",
    defaultArea: 1200,
    unit: "sq ft",
    commonMaterials: ["blown_in_cellulose", "blown_in_fiberglass", "batt_fiberglass"],
    svgZoneId: "zone-attic",
  },
  exterior_wall: {
    id: "exterior_wall",
    label: "Exterior Walls",
    description: "All walls that separate conditioned living space from the outdoors. Subtract window/door area.",
    defaultArea: 800,
    unit: "sq ft",
    commonMaterials: ["batt_fiberglass", "batt_mineral_wool", "blown_in_cellulose", "spray_foam_closed"],
    svgZoneId: "zone-walls",
  },
  floor_over_unconditioned: {
    id: "floor_over_unconditioned",
    label: "Floor Over Unconditioned Space",
    description: "Floors above an unheated garage, vented crawl space, or open piers.",
    defaultArea: 600,
    unit: "sq ft",
    commonMaterials: ["batt_fiberglass", "batt_mineral_wool", "blown_in_cellulose"],
    svgZoneId: "zone-floor",
  },
  crawl_space_wall: {
    id: "crawl_space_wall",
    label: "Crawl Space Walls",
    description: "The perimeter walls of a conditioned (sealed) crawl space. Only if you're encapsulating the crawl space.",
    defaultArea: 200,
    unit: "sq ft",
    commonMaterials: ["rigid_foam_xps", "rigid_foam_eps", "spray_foam_closed"],
    svgZoneId: "zone-crawl",
  },
  basement_wall: {
    id: "basement_wall",
    label: "Basement / Foundation Walls",
    description: "Below-grade concrete or block walls. Use foam board on the interior or exterior.",
    defaultArea: 500,
    unit: "sq ft",
    commonMaterials: ["rigid_foam_xps", "rigid_foam_eps", "batt_mineral_wool"],
    svgZoneId: "zone-basement",
  },
  rim_joist: {
    id: "rim_joist",
    label: "Rim Joist / Band Joist",
    description: "The perimeter joist running along the top of the foundation wall. Often the #1 air leakage point.",
    defaultArea: 80,
    unit: "sq ft",
    commonMaterials: ["spray_foam_closed", "rigid_foam_xps", "batt_fiberglass"],
    svgZoneId: "zone-rim",
  },
};

// ----------------------------------------------------------------
// IRA §25C Tax Credit Data (Inflation Reduction Act, 2023–2032)
// ----------------------------------------------------------------
export interface TaxCreditInfo {
  maxCreditPercent: number;   // 30%
  maxCreditAmount: number;    // $1200/year for insulation
  qualifyingMaterials: InsulationMaterial[];
  note: string;
}

export const IRA_TAX_CREDIT: TaxCreditInfo = {
  maxCreditPercent: 30,
  maxCreditAmount: 1200,
  qualifyingMaterials: [
    "blown_in_cellulose",
    "blown_in_fiberglass",
    "batt_fiberglass",
    "batt_mineral_wool",
    "rigid_foam_xps",
    "rigid_foam_eps",
  ],
  note:
    "Under IRA §25C, homeowners may claim a 30% tax credit (up to $1,200/year) for qualifying insulation materials. Spray foam applied by professionals also qualifies. Consult IRS Form 5695 and retain product MSRP certification documents.",
};
