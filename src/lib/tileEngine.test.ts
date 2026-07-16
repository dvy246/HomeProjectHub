import { describe, it, expect } from "vitest";
import { calculateTileMaterials } from "./tileEngine";

describe("tileEngine tests", () => {
  it("should return zero values for zero dimensions", () => {
    const res = calculateTileMaterials({
      widthFt: 0,
      heightFt: 0,
      tileWidthIn: 12,
      tileHeightIn: 12,
      groutWidthIn: 0.125,
      pattern: "straight",
      tileThicknessIn: 0.375,
    });
    expect(res.areaSqFt).toBe(0);
    expect(res.totalTilesCount).toBe(0);
    expect(res.totalWeightLbs).toBe(0);
  });

  it("should calculate correct counts for a standard 10x10 area with 12x12 tiles", () => {
    const res = calculateTileMaterials({
      widthFt: 10,
      heightFt: 10,
      tileWidthIn: 12,
      tileHeightIn: 12,
      groutWidthIn: 0.125,
      pattern: "straight",
      tileThicknessIn: 0.375,
    });
    // areaSqFt = 100
    expect(res.areaSqFt).toBe(100);
    // base tiles = Math.ceil(14400 / (12.125 * 12.125)) = Math.ceil(14400 / 147.0156) = 98
    expect(res.baseTilesCount).toBe(98);
    // waste = 10%
    expect(res.wastePercent).toBe(10);
    // total tiles = Math.ceil(98 * 1.1) = 108
    expect(res.totalTilesCount).toBe(108);
    expect(res.thinsetBags).toBe(2);
  });

  it("should increase waste factor for herringbone pattern", () => {
    const res = calculateTileMaterials({
      widthFt: 10,
      heightFt: 10,
      tileWidthIn: 3,
      tileHeightIn: 6,
      groutWidthIn: 0.125,
      pattern: "herringbone",
      tileThicknessIn: 0.375,
    });
    expect(res.wastePercent).toBe(15);
  });
});
