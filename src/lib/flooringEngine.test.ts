import { describe, it, expect } from "vitest";
import { calculateFlooringMaterials } from "./flooringEngine";

describe("flooringEngine tests", () => {
  it("should return zero values for zero dimensions", () => {
    const res = calculateFlooringMaterials({
      lengthFt: 0,
      widthFt: 0,
      materialType: "lvp",
      wastePercent: 10,
    });
    expect(res.areaSqFt).toBe(0);
    expect(res.totalAreaWithWasteSqFt).toBe(0);
    expect(res.materialList.length).toBe(0);
  });

  it("should calculate correct boxes and underlayment rolls for plank type LVP", () => {
    const res = calculateFlooringMaterials({
      lengthFt: 15,
      widthFt: 12,
      materialType: "lvp",
      wastePercent: 10,
      boxSizeSqFt: 24,
    });
    // areaSqFt = 15 * 12 = 180
    expect(res.areaSqFt).toBe(180);
    // totalAreaWithWasteSqFt = 180 * 1.1 = 198
    expect(res.totalAreaWithWasteSqFt).toBe(198);
    // boxesNeeded = Math.ceil(198 / 24) = 9
    expect(res.boxesNeeded).toBe(9);
    // underlaymentRolls = Math.ceil(198 / 100) = 2
    expect(res.underlaymentRolls).toBe(2);
    expect(res.weightLbs).toBe(Math.ceil(198 * 1.4));
  });

  it("should calculate correct linear yards and padding for carpet rolls", () => {
    const res = calculateFlooringMaterials({
      lengthFt: 15,
      widthFt: 12,
      materialType: "carpet",
      wastePercent: 10,
      rollWidthFt: 12,
    });
    // widthFt = 12, rollWidthFt = 12 -> 1 run
    // runs = 1
    // linearFtNeeded = 1 * 15 * 1.1 = 16.5 -> round up to 17
    expect(res.linearFtNeeded).toBe(17);
    // linearYdNeeded = Math.ceil(16.5 / 3) = 6
    expect(res.linearYdNeeded).toBe(6);
    // sqYdNeeded = Math.ceil((1 * 15 * 12 * 1.1) / 9) = Math.ceil(198 / 9) = 22
    expect(res.sqYdNeeded).toBe(22);
  });
});
