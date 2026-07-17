import { describe, it, expect } from "vitest";
import { compareConcreteOptions, compareAggregateOptions } from "./logisticsEngine";

describe("logisticsEngine tests", () => {
  it("should calculate ready-mix vs bagged for 1.0 cubic yard of concrete", () => {
    const res = compareConcreteOptions(1.0, 1500);
    // Ready mix has surcharge since 1 < 3
    expect(res.readyMix.shortLoadSurcharge).toBe(120);
    expect(res.readyMix.totalCost).toBe(155 + 100 + 120); // 375
    // Bagged has 45 bags
    expect(res.bagged.bagsNeeded).toBe(45);
    expect(res.bagged.totalCost).toBe(293); // Math.ceil(45 * 6.50)
    // Hauling: 45 bags * 80 lbs = 3600 lbs. Payload 1500 -> 3 trips.
    expect(res.bagged.tripsCount).toBe(3);
    // Storage: 45 bags / 42 bags/pallet = 2 pallets (rounded up)
    expect(res.bagged.palletCount).toBe(2);
    expect(res.bagged.storageSqFt).toBe(26.6); // 2 * 13.3
    // Cumulative: 3600 * 2 = 7200 lbs
    expect(res.bagged.cumulativeLiftWeightLbs).toBe(7200);
  });

  it("should remove ready-mix surcharge for volumes >= 3 yards", () => {
    const res = compareConcreteOptions(4.0, 1500);
    expect(res.readyMix.shortLoadSurcharge).toBe(0);
    expect(res.readyMix.totalCost).toBe(4.0 * 155 + 100); // 720
    expect(res.bagged.bagsNeeded).toBe(180);
    expect(res.bagged.totalCost).toBe(180 * 6.50); // 1170
  });

  it("should compare aggregate options for mulch", () => {
    const res = compareAggregateOptions(5.0, "mulch", 1500);
    // volume = 5 yards. Mulch density = 1000 lbs/yd. Bulk weight = 5000 lbs.
    expect(res.bulk.weightLbs).toBe(5000);
    // Bagged mulch: 5 yards * 27 = 135 cu ft. 135 / 2.0 = 68 bags.
    expect(res.bagged.bagsNeeded).toBe(68);
    // Mulch bags per pallet is 60. So 68 bags = 2 pallets.
    expect(res.bagged.palletCount).toBe(2);
    expect(res.bagged.storageSqFt).toBe(26.6);
  });
});
