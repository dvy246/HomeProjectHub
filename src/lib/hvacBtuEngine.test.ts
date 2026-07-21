import { describe, expect, it } from "vitest";
import { calculateHVACBtuLoad } from "./hvacBtuEngine";

describe("HVAC BTU load calculations", () => {
  it("calculates baseline load correctly for standard inputs", () => {
    const results = calculateHVACBtuLoad({
      areaSqFt: 1000,
      ceilingHeight: 8,
      climateZone: 4, // 40 BTU/sq ft
      insulationQuality: "average", // x1.0
      windowCount: 0, // 0 added
      sunExposure: "normal", // x1.0
    });

    expect(results.baseBtu).toBe(40000);
    expect(results.finalLoadBtu).toBe(40000);
    expect(results.recommendedTons).toBe(3.5); // 40000/12000 = 3.33 -> 3.5
  });

  it("applies ceiling height multiplier when height exceeds 8ft", () => {
    const results = calculateHVACBtuLoad({
      areaSqFt: 1000,
      ceilingHeight: 12, // 12 / 8 = 1.5 multiplier
      climateZone: 4,
      insulationQuality: "average",
      windowCount: 0,
      sunExposure: "normal",
    });

    expect(results.finalLoadBtu).toBe(60000);
    expect(results.recommendedTons).toBe(5.0); // 60000/12000 = 5.0
  });

  it("applies insulation and sun exposure multipliers correctly", () => {
    const results = calculateHVACBtuLoad({
      areaSqFt: 1000,
      ceilingHeight: 8,
      climateZone: 4,
      insulationQuality: "poor", // x1.20
      windowCount: 0,
      sunExposure: "sunny", // x1.10
    });

    // 40000 * 1.2 * 1.1 = 52800
    expect(results.finalLoadBtu).toBe(52800);
    expect(results.recommendedTons).toBe(5.0); // 52800/12000 = 4.4 -> rounds to 4.5 -> jumps to 5.0 in residential systems
    // Wait, let's verify if recommendedTons for 4.4 rounds to 4.5 and then jumps to 5.0.
    // calculatedTonnage is 52800 / 12000 = 4.4.
    // recommendedTons: Math.round(4.4 * 2) / 2 = 9 / 2 = 4.5.
    // If recommendedTons is 4.5, it jumps to 5.0. Yes, so recommendedTons is 5.0!
  });

  it("adds window load based on count", () => {
    const results = calculateHVACBtuLoad({
      areaSqFt: 1000,
      ceilingHeight: 8,
      climateZone: 4,
      insulationQuality: "average",
      windowCount: 5, // +2500 BTU
      sunExposure: "normal",
    });

    expect(results.finalLoadBtu).toBe(42500); // 40000 + 2500
    expect(results.recommendedTons).toBe(3.5); // 42500/12000 = 3.54 -> rounds to 3.5
  });

  it("triggers split system warning when tonnage is above 5 tons", () => {
    const results = calculateHVACBtuLoad({
      areaSqFt: 3000,
      ceilingHeight: 10,
      climateZone: 6, // 50 BTU/sq ft
      insulationQuality: "poor", // x1.20
      windowCount: 10,
      sunExposure: "sunny", // x1.10
    });

    expect(results.recommendedTons).toBeGreaterThan(5.0);
    expect(results.splitSystemWarning).toBe(true);
  });
});
