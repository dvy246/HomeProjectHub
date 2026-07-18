import {
  type ClimateZone,
  type InsulationSurface,
  type InsulationMaterial,
  ZONE_REQUIREMENTS,
  MATERIAL_SPECS,
  CELLULOSE_COVERAGE,
  FIBERGLASS_BLOWN_COVERAGE,
  IRA_TAX_CREDIT,
} from "../data/insulation-zones";

// ----------------------------------------------------------------
// Input / Output Types
// ----------------------------------------------------------------

export interface ZoneInput {
  surface: InsulationSurface;
  areaFt2: number;        // square footage of this zone
  currentR: number;       // existing R-value (0 if uninsulated)
  material: InsulationMaterial;
  useEnergyStarTarget: boolean; // false = code minimum target
}

export interface ZoneResult {
  surface: InsulationSurface;
  areaFt2: number;
  currentR: number;
  targetR: number;          // code-min or energy-star per zone requirements
  gapR: number;             // upgrade needed
  installedDepthIn: number; // depth to install in inches
  unitsNeeded: number;      // bags / bundles / sheets (already includes waste + settling)
  unitLabel: string;        // "bags", "bundles", "sheets"
  materialCostEst: number;  // DIY material cost estimate ($)
  annualSavingsEst: number; // rough annual heating/cooling savings ($)
  paybackYears: number;     // simple payback period
  isCompliant: boolean;     // meets code minimum
  meetsEnergyStar: boolean; // meets energy star
  proOnlyWarning: boolean;  // spray foam >500 sq ft
  settlingNote: string | null;
}

export interface InsulationPlanResult {
  zones: ZoneResult[];
  totalMaterialCost: number;
  totalAnnualSavings: number;
  overallPaybackYears: number;
  totalUnits: Record<InsulationMaterial, number>; // aggregate per material
  iraMaxCredit: number;      // estimated IRA §25C credit (30%, max $1200)
  allZonesCompliant: boolean;
  warnings: string[];
  shareUrl: string;
}

// ----------------------------------------------------------------
// Core Engine Functions
// ----------------------------------------------------------------

/**
 * Compute the target R-value for a given climate zone and surface.
 * Returns code minimum or energy star target based on preference.
 */
export function getTargetR(
  zone: ClimateZone,
  surface: InsulationSurface,
  useEnergyStarTarget: boolean
): number {
  const req = ZONE_REQUIREMENTS[zone][surface];
  return useEnergyStarTarget ? req.energy_star : req.code_min;
}

/**
 * Compute installed depth (inches) needed to achieve a target R-value gap
 * for the selected material, using the material's R-per-inch value.
 */
export function computeDepthIn(gapR: number, material: InsulationMaterial): number {
  if (gapR <= 0) return 0;
  const spec = MATERIAL_SPECS[material];
  const rawDepth = gapR / spec.rPerInch;

  // Blown-in cellulose settles ~20% — install 20% deeper to compensate
  if (material === "blown_in_cellulose") {
    return rawDepth * 1.2;
  }
  return rawDepth;
}

/**
 * Compute the number of bags/bundles needed based on area and target R-value.
 * Uses real manufacturer coverage tables for blown-in products,
 * and stud-cavity geometry for batt products.
 * Adds 10% waste factor for all materials.
 */
export function computeUnits(
  areaFt2: number,
  gapR: number,
  material: InsulationMaterial
): { units: number; unitLabel: string; depthIn: number } {
  if (gapR <= 0) return { units: 0, unitLabel: MATERIAL_SPECS[material].unitLabel, depthIn: 0 };

  const spec = MATERIAL_SPECS[material];
  const WASTE_FACTOR = 1.10; // 10% waste

  if (material === "blown_in_cellulose") {
    // Use actual coverage table (GreenFiber 25.6 lb bags)
    // Find the row at or just above the target R — interpolate if needed
    const coverageRow = findCoverageRow(CELLULOSE_COVERAGE, gapR);
    const sqFtPerBag = coverageRow.sqFtPerBag;
    const rawBags = areaFt2 / sqFtPerBag;
    return {
      units: Math.ceil(rawBags * WASTE_FACTOR),
      unitLabel: "bags",
      depthIn: coverageRow.depthIn,
    };
  }

  if (material === "blown_in_fiberglass") {
    const coverageRow = findCoverageRow(FIBERGLASS_BLOWN_COVERAGE, gapR);
    const sqFtPerBag = coverageRow.sqFtPerBag;
    const rawBags = areaFt2 / sqFtPerBag;
    return {
      units: Math.ceil(rawBags * WASTE_FACTOR),
      unitLabel: "bags",
      depthIn: coverageRow.depthIn,
    };
  }

  if (material === "batt_fiberglass" || material === "batt_mineral_wool") {
    // Batts: coverage is sold by sq ft per bundle (typically 40 sq ft/bundle for 2x4 cavities)
    // Common package sizes: R-13 (40 sq ft/bundle), R-19 (40 sq ft/bundle), R-30 (40 sq ft/bundle)
    const SQ_FT_PER_BUNDLE = 40;
    const rawBundles = areaFt2 / SQ_FT_PER_BUNDLE;
    const depthIn = computeDepthIn(gapR, material);
    return {
      units: Math.ceil(rawBundles * WASTE_FACTOR),
      unitLabel: "bundles",
      depthIn,
    };
  }

  if (material === "rigid_foam_eps" || material === "rigid_foam_xps") {
    // Rigid foam: sold as 4x8 sheets (32 sq ft each)
    const SQ_FT_PER_SHEET = 32;
    const rawSheets = areaFt2 / SQ_FT_PER_SHEET;
    const depthIn = computeDepthIn(gapR, material);
    return {
      units: Math.ceil(rawSheets * WASTE_FACTOR),
      unitLabel: "sheets",
      depthIn,
    };
  }

  if (material === "spray_foam_open" || material === "spray_foam_closed") {
    // Spray foam: measured in sq ft at target thickness — output is sq ft of coverage
    const depthIn = computeDepthIn(gapR, material);
    return {
      units: Math.ceil(areaFt2 * WASTE_FACTOR),
      unitLabel: "sq ft",
      depthIn,
    };
  }

  return { units: 0, unitLabel: spec.unitLabel, depthIn: 0 };
}

/**
 * Find the coverage row for a target R-value using interpolation.
 * Returns the first row at or above the target R (conservative).
 */
function findCoverageRow(
  table: { targetR: number; sqFtPerBag: number; depthIn: number }[],
  targetR: number
): { sqFtPerBag: number; depthIn: number } {
  // Find the first row >= targetR
  const row = table.find((r) => r.targetR >= targetR);
  if (row) return row;

  // If target exceeds table max, extrapolate from last two rows
  const last = table[table.length - 1];
  const secondLast = table[table.length - 2];
  const slope = (last.sqFtPerBag - secondLast.sqFtPerBag) / (last.targetR - secondLast.targetR);
  const extrapolatedSqFt = last.sqFtPerBag + slope * (targetR - last.targetR);
  const depthSlope = (last.depthIn - secondLast.depthIn) / (last.targetR - secondLast.targetR);
  const extrapolatedDepth = last.depthIn + depthSlope * (targetR - last.targetR);
  return {
    sqFtPerBag: Math.max(extrapolatedSqFt, 5), // safety floor
    depthIn: extrapolatedDepth,
  };
}

/**
 * Estimate annual heating/cooling cost savings from a given R-value upgrade.
 * Uses simplified ASHRAE heat loss formula:
 *   ΔQ = Area × ΔR-value difference × climate factor × energy rate
 * Climate factor approximation by zone: ~3 (Zone 1) to ~30 (Zone 8) MMBtu/yr per 1000 sq ft per R
 */
const CLIMATE_SAVINGS_FACTOR: Record<ClimateZone, number> = {
  1: 0.025,  // $/sq ft/R-value-point/year (very hot; cooling dominated)
  2: 0.030,
  3: 0.035,
  4: 0.042,
  5: 0.050,
  6: 0.060,
  7: 0.070,
  8: 0.080,
};

export function estimateAnnualSavings(
  zone: ClimateZone,
  surface: InsulationSurface,
  areaFt2: number,
  gapR: number
): number {
  if (gapR <= 0) return 0;
  const factor = CLIMATE_SAVINGS_FACTOR[zone];
  // Surface-specific multipliers: attic contributes more than walls
  const surfaceMultiplier: Record<InsulationSurface, number> = {
    attic: 1.0,
    exterior_wall: 0.7,
    floor_over_unconditioned: 0.6,
    crawl_space_wall: 0.4,
    basement_wall: 0.4,
    rim_joist: 0.3,
  };
  return areaFt2 * gapR * factor * surfaceMultiplier[surface];
}

// ----------------------------------------------------------------
// Main Plan Computation
// ----------------------------------------------------------------

export function computeInsulationPlan(
  zone: ClimateZone,
  inputs: ZoneInput[]
): Omit<InsulationPlanResult, "shareUrl"> {
  const warnings: string[] = [];
  const totalUnits: Record<InsulationMaterial, number> = {} as Record<InsulationMaterial, number>;

  const zones: ZoneResult[] = inputs.map((input) => {
    const targetR = getTargetR(zone, input.surface, input.useEnergyStarTarget);
    const gapR = Math.max(0, targetR - input.currentR);

    const { units, unitLabel, depthIn } = computeUnits(input.areaFt2, gapR, input.material);
    const spec = MATERIAL_SPECS[input.material];

    const materialCostEst = input.areaFt2 * spec.costPerSqFt;
    const annualSavingsEst = estimateAnnualSavings(zone, input.surface, input.areaFt2, gapR);
    const paybackYears = annualSavingsEst > 0 ? materialCostEst / annualSavingsEst : 99;

    const isCompliant =
      input.currentR >= ZONE_REQUIREMENTS[zone][input.surface].code_min;
    const meetsEnergyStar =
      input.currentR >= ZONE_REQUIREMENTS[zone][input.surface].energy_star;

    // Pro-only warning for spray foam over 500 sq ft
    const proOnlyWarning =
      spec.proOnly && input.areaFt2 > 500;
    if (proOnlyWarning) {
      warnings.push(
        `${spec.name} over ${input.areaFt2} sq ft requires professional application. Consider blown-in insulation as a DIY alternative for this zone.`
      );
    }

    // Settling note for blown-in cellulose
    const settlingNote =
      input.material === "blown_in_cellulose" && gapR > 0
        ? "Cellulose settles ~20% over time. The unit count above already includes this factor. Install to 20% deeper than labeled depth."
        : null;

    // Aggregate units by material
    if (units > 0) {
      totalUnits[input.material] = (totalUnits[input.material] ?? 0) + units;
    }

    return {
      surface: input.surface,
      areaFt2: input.areaFt2,
      currentR: input.currentR,
      targetR,
      gapR,
      installedDepthIn: Math.round(depthIn * 10) / 10,
      unitsNeeded: units,
      unitLabel,
      materialCostEst: Math.round(materialCostEst),
      annualSavingsEst: Math.round(annualSavingsEst),
      paybackYears: Math.min(Math.round(paybackYears * 10) / 10, 99),
      isCompliant,
      meetsEnergyStar,
      proOnlyWarning,
      settlingNote,
    };
  });

  const totalMaterialCost = zones.reduce((s, z) => s + z.materialCostEst, 0);
  const totalAnnualSavings = zones.reduce((s, z) => s + z.annualSavingsEst, 0);
  const overallPaybackYears =
    totalAnnualSavings > 0 ? Math.round((totalMaterialCost / totalAnnualSavings) * 10) / 10 : 99;
  const allZonesCompliant = zones.every((z) => z.isCompliant);

  // IRA §25C credit estimate: 30% of qualifying material costs, max $1200
  const qualifyingCost = zones
    .filter((z) => IRA_TAX_CREDIT.qualifyingMaterials.includes(z.surface as InsulationMaterial))
    .reduce((s, z) => s + z.materialCostEst, 0);
  const iraMaxCredit = Math.min(
    Math.round(totalMaterialCost * 0.30),
    IRA_TAX_CREDIT.maxCreditAmount
  );

  return {
    zones,
    totalMaterialCost,
    totalAnnualSavings: Math.round(totalAnnualSavings),
    overallPaybackYears,
    totalUnits,
    iraMaxCredit,
    allZonesCompliant,
    warnings,
  };
}

// ----------------------------------------------------------------
// URL State Encoding / Decoding (for shareable links)
// ----------------------------------------------------------------

export interface InsulationUrlState {
  zone: ClimateZone;
  state: string;
  inputs: ZoneInput[];
  useEnergyStarTarget: boolean;
}

export function encodeInsulationUrl(state: InsulationUrlState): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams();
  params.set("z", String(state.zone));
  params.set("s", state.state);
  params.set("es", state.useEnergyStarTarget ? "1" : "0");
  // Encode zones as compact string: surface:area:currentR:material
  const zonesStr = state.inputs
    .map((i) => `${i.surface}:${i.areaFt2}:${i.currentR}:${i.material}`)
    .join("|");
  params.set("zones", zonesStr);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeInsulationUrl(): InsulationUrlState | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const zoneRaw = params.get("z");
    const stateRaw = params.get("s");
    const zonesRaw = params.get("zones");
    if (!zoneRaw || !stateRaw || !zonesRaw) return null;

    const zone = parseInt(zoneRaw) as ClimateZone;
    if (zone < 1 || zone > 8) return null;

    const inputs: ZoneInput[] = zonesRaw.split("|").map((segment) => {
      const [surface, area, currentR, material] = segment.split(":");
      return {
        surface: surface as InsulationSurface,
        areaFt2: Math.max(0, parseFloat(area) || 0),
        currentR: Math.max(0, parseFloat(currentR) || 0),
        material: material as InsulationMaterial,
        useEnergyStarTarget: params.get("es") === "1",
      };
    });

    return {
      zone,
      state: stateRaw,
      inputs,
      useEnergyStarTarget: params.get("es") === "1",
    };
  } catch {
    return null;
  }
}
