import { describe, it, expect } from "vitest";
import { calculateStairLayout, generateStringerCoordinates, type StairInputs } from "./stairEngine";

describe("stairEngine tests", () => {
  describe("calculateStairLayout", () => {
    it("should calculate correct steps and riser heights for standard 95 inch rise", () => {
      const inputs: StairInputs = {
        totalRise: 95.0,
        treadThickness: 1.0,
        riserThickness: 0.75,
        targetRun: 10.5,
        customStairCount: null,
        unitSystem: "imperial"
      };

      const results = calculateStairLayout(inputs);
      
      // optimal counts: 95 / 7.5 = 12.6 -> rounds to 13 steps
      expect(results.stairCount).toBe(13);
      expect(results.riserHeight).toBeCloseTo(95 / 13, 4); // ~7.30 inches
      expect(results.bottomRiserHeight).toBeCloseTo((95 / 13) - 1.0, 4); // ~6.30 inches
      expect(results.topRiserHeight).toBe(results.riserHeight);
      expect(results.angle).toBeCloseTo(Math.atan2(95 / 13, 10.5) * (180 / Math.PI), 2);
    });

    it("should allow step count override", () => {
      const inputs: StairInputs = {
        totalRise: 95.0,
        treadThickness: 1.0,
        riserThickness: 0.75,
        targetRun: 10.5,
        customStairCount: 10, // override to 10 step counts
        unitSystem: "imperial"
      };

      const results = calculateStairLayout(inputs);
      expect(results.stairCount).toBe(10);
      expect(results.riserHeight).toBe(9.5); // 95 / 10
      // 9.5" rise exceeds IRC limit of 7.75"
      expect(results.warnings.some(w => w.includes("exceeds the IRC maximum limit"))).toBe(true);
    });

    it("should validate and flag IRC warnings under non-compliant dimensions", () => {
      const inputs: StairInputs = {
        totalRise: 36.0,
        treadThickness: 1.0,
        riserThickness: 0.75,
        targetRun: 9.0, // run < 10.0
        customStairCount: 4, // riser height = 9.0 > 7.75
        unitSystem: "imperial"
      };

      const results = calculateStairLayout(inputs);
      expect(results.warnings.some(w => w.includes("run of 9.00\" is below the IRC minimum"))).toBe(true);
      expect(results.warnings.some(w => w.includes("exceeds the IRC maximum limit"))).toBe(true);
    });
  });

  describe("generateStringerCoordinates", () => {
    it("should generate coordinate points including top, bottom, steps, and throat corners", () => {
      const stairCount = 3;
      const riserHeight = 7.5;
      const treadRun = 10.0;
      const throatDepth = 5.0;

      const points = generateStringerCoordinates(stairCount, riserHeight, treadRun, throatDepth);

      // Points structure:
      // 1. Top Attachment: (0, 0)
      // 2. Step 1: (0, 7.5) -> (10, 7.5)
      // 3. Step 2: (10, 15.0) -> (20, 15.0)
      // 4. Step 3: (20, 22.5)
      // 5. Bottom back flat floor: shifted dx, dy from last point
      // 6. Top back: shifted from (0,0)
      expect(points.length).toBe(stairCount * 2 + 2); // 0,0 + 3 risers + 2 runs + 2 throat corners = 8 points
      expect(points[0]).toEqual({ x: 0, y: 0 });
      expect(points[1]).toEqual({ x: 0, y: 7.5 });
      expect(points[2]).toEqual({ x: 10, y: 7.5 });
      expect(points[3]).toEqual({ x: 10, y: 15 });
      expect(points[4]).toEqual({ x: 20, y: 15 });
      expect(points[5]).toEqual({ x: 20, y: 22.5 });
    });
  });
});
