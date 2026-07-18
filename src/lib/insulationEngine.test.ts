import { describe, it, expect } from "vitest";
import {
  getTargetR,
  computeUnits,
  computeDepthIn,
  estimateAnnualSavings,
  computeInsulationPlan,
  encodeInsulationUrl,
  decodeInsulationUrl,
} from "./insulationEngine";

// ----------------------------------------------------------------
// getTargetR
// ----------------------------------------------------------------
describe("getTargetR", () => {
  it("returns code minimum for Zone 5 attic", () => {
    expect(getTargetR(5, "attic", false)).toBe(49);
  });

  it("returns energy star for Zone 5 attic", () => {
    expect(getTargetR(5, "attic", true)).toBe(60);
  });

  it("returns code minimum for Zone 1 attic", () => {
    expect(getTargetR(1, "attic", false)).toBe(30);
  });

  it("returns code minimum for Zone 8 attic", () => {
    expect(getTargetR(8, "attic", false)).toBe(49);
  });

  it("returns code minimum for Zone 3 exterior wall", () => {
    expect(getTargetR(3, "exterior_wall", false)).toBe(20);
  });

  it("returns energy star for Zone 6 exterior wall", () => {
    expect(getTargetR(6, "exterior_wall", true)).toBe(30);
  });

  it("returns code minimum for Zone 2 basement wall", () => {
    expect(getTargetR(2, "basement_wall", false)).toBe(5);
  });

  it("returns code minimum for Zone 5 rim joist", () => {
    expect(getTargetR(5, "rim_joist", false)).toBe(30);
  });
});

// ----------------------------------------------------------------
// computeDepthIn
// ----------------------------------------------------------------
describe("computeDepthIn", () => {
  it("returns 0 for gapR of 0", () => {
    expect(computeDepthIn(0, "blown_in_cellulose")).toBe(0);
  });

  it("adds 20% depth for cellulose settling", () => {
    // R-49 cellulose at 3.7 R/inch = 49/3.7 * 1.2 = ~15.9"
    const depth = computeDepthIn(49, "blown_in_cellulose");
    expect(depth).toBeCloseTo(15.9, 0);
  });

  it("does not add settling for fiberglass batts", () => {
    // R-13 at 3.14 R/inch = ~4.1"
    const depth = computeDepthIn(13, "batt_fiberglass");
    expect(depth).toBeCloseTo(4.1, 0);
  });
});

// ----------------------------------------------------------------
// computeUnits
// ----------------------------------------------------------------
describe("computeUnits", () => {
  it("returns 0 units for gapR of 0", () => {
    const result = computeUnits(1200, 0, "blown_in_cellulose");
    expect(result.units).toBe(0);
  });

  it("computes blown-in cellulose bags for 1200 sq ft at R-49 gap", () => {
    const result = computeUnits(1200, 49, "blown_in_cellulose");
    // GreenFiber coverage for R-49: 18.4 sq ft/bag
    // bags = ceil(1200 / 18.4 * 1.10) = ceil(71.7) = 72
    expect(result.units).toBeGreaterThan(60);
    expect(result.units).toBeLessThan(90);
    expect(result.unitLabel).toBe("bags");
  });

  it("computes blown-in fiberglass bags for 1200 sq ft at R-49 gap", () => {
    const result = computeUnits(1200, 49, "blown_in_fiberglass");
    // OC AttiCat for R-49: 11.9 sq ft/bag
    // bags = ceil(1200 / 11.9 * 1.10) = ceil(110.9) = 111
    expect(result.units).toBeGreaterThan(90);
    expect(result.units).toBeLessThan(140);
    expect(result.unitLabel).toBe("bags");
  });

  it("computes fiberglass batt bundles for 800 sq ft at R-13 gap", () => {
    const result = computeUnits(800, 13, "batt_fiberglass");
    // 800 / 40 * 1.10 = 22 bundles
    expect(result.units).toBe(22);
    expect(result.unitLabel).toBe("bundles");
  });

  it("computes rigid foam sheets for 500 sq ft basement at R-10 gap", () => {
    const result = computeUnits(500, 10, "rigid_foam_xps");
    // 500 / 32 * 1.10 = ceil(17.2) = 18 sheets
    expect(result.units).toBe(18);
    expect(result.unitLabel).toBe("sheets");
  });

  it("returns sq ft for spray foam", () => {
    const result = computeUnits(400, 20, "spray_foam_closed");
    expect(result.units).toBe(Math.ceil(400 * 1.10));
    expect(result.unitLabel).toBe("sq ft");
  });
});

// ----------------------------------------------------------------
// estimateAnnualSavings
// ----------------------------------------------------------------
describe("estimateAnnualSavings", () => {
  it("returns 0 for gapR of 0", () => {
    expect(estimateAnnualSavings(5, "attic", 1200, 0)).toBe(0);
  });

  it("returns higher savings for colder zones", () => {
    const zone5Savings = estimateAnnualSavings(5, "attic", 1200, 30);
    const zone2Savings = estimateAnnualSavings(2, "attic", 1200, 30);
    expect(zone5Savings).toBeGreaterThan(zone2Savings);
  });

  it("returns higher savings for attic vs rim joist (surface multiplier)", () => {
    const atticSavings = estimateAnnualSavings(5, "attic", 100, 20);
    const rimSavings = estimateAnnualSavings(5, "rim_joist", 100, 20);
    expect(atticSavings).toBeGreaterThan(rimSavings);
  });

  it("returns a positive number for reasonable inputs", () => {
    const savings = estimateAnnualSavings(5, "attic", 1200, 49);
    expect(savings).toBeGreaterThan(0);
  });
});

// ----------------------------------------------------------------
// computeInsulationPlan
// ----------------------------------------------------------------
describe("computeInsulationPlan", () => {
  const singleAtticInput = [
    {
      surface: "attic" as const,
      areaFt2: 1200,
      currentR: 0,
      material: "blown_in_cellulose" as const,
      useEnergyStarTarget: false,
    },
  ];

  it("computes a plan with correct target R for Zone 5 attic", () => {
    const plan = computeInsulationPlan(5, singleAtticInput);
    expect(plan.zones[0].targetR).toBe(49);
  });

  it("computes gapR as targetR - currentR", () => {
    const plan = computeInsulationPlan(5, singleAtticInput);
    expect(plan.zones[0].gapR).toBe(49);
  });

  it("marks zone as non-compliant when current R is 0", () => {
    const plan = computeInsulationPlan(5, singleAtticInput);
    expect(plan.zones[0].isCompliant).toBe(false);
  });

  it("marks zone as compliant when current R meets code minimum", () => {
    const compliantInput = [{ ...singleAtticInput[0], currentR: 49 }];
    const plan = computeInsulationPlan(5, compliantInput);
    expect(plan.zones[0].isCompliant).toBe(true);
    expect(plan.zones[0].gapR).toBe(0);
    expect(plan.zones[0].unitsNeeded).toBe(0);
  });

  it("computes IRA tax credit (30% of material cost, max $1200)", () => {
    const plan = computeInsulationPlan(5, singleAtticInput);
    const expectedCredit = Math.min(Math.round(plan.totalMaterialCost * 0.30), 1200);
    expect(plan.iraMaxCredit).toBe(expectedCredit);
  });

  it("warns when spray foam used over 500 sq ft", () => {
    const sprayFoamInput = [
      {
        surface: "exterior_wall" as const,
        areaFt2: 800,
        currentR: 0,
        material: "spray_foam_closed" as const,
        useEnergyStarTarget: false,
      },
    ];
    const plan = computeInsulationPlan(5, sprayFoamInput);
    expect(plan.warnings.length).toBeGreaterThan(0);
    expect(plan.warnings[0]).toContain("professional");
  });

  it("handles multi-zone plan with different materials", () => {
    const multiInput = [
      singleAtticInput[0],
      {
        surface: "exterior_wall" as const,
        areaFt2: 800,
        currentR: 0,
        material: "batt_fiberglass" as const,
        useEnergyStarTarget: false,
      },
      {
        surface: "rim_joist" as const,
        areaFt2: 80,
        currentR: 0,
        material: "spray_foam_closed" as const,
        useEnergyStarTarget: false,
      },
    ];
    const plan = computeInsulationPlan(5, multiInput);
    expect(plan.zones.length).toBe(3);
    expect(plan.totalMaterialCost).toBeGreaterThan(0);
    expect(plan.totalAnnualSavings).toBeGreaterThan(0);
  });

  it("computes higher savings for energy star target", () => {
    const stdInput = [{ ...singleAtticInput[0], useEnergyStarTarget: false }];
    const esInput = [{ ...singleAtticInput[0], useEnergyStarTarget: true }];
    const stdPlan = computeInsulationPlan(5, stdInput);
    const esPlan = computeInsulationPlan(5, esInput);
    // R-60 target gives higher gap than R-49, so higher savings
    expect(esPlan.totalAnnualSavings).toBeGreaterThan(stdPlan.totalAnnualSavings);
  });

  it("Zone 8 produces higher annual savings than Zone 1 for same area and gapR", () => {
    const z8Plan = computeInsulationPlan(8, singleAtticInput);
    const z1Plan = computeInsulationPlan(1, singleAtticInput);
    // Zone 8 has higher climate factor, so should show higher savings
    expect(z8Plan.totalAnnualSavings).toBeGreaterThan(z1Plan.totalAnnualSavings);
  });
});
