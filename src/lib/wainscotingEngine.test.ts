import { describe, it, expect } from "vitest";
import { calculateWainscoting, decimalToFraction, optimizeCutList } from "./wainscotingEngine";

describe("wainscotingEngine tests", () => {
  describe("decimalToFraction", () => {
    it("should convert clean decimals to fractions", () => {
      expect(decimalToFraction(12.5)).toBe('12 1/2"');
      expect(decimalToFraction(8.25)).toBe('8 1/4"');
      expect(decimalToFraction(10.75)).toBe('10 3/4"');
      expect(decimalToFraction(5.125)).toBe('5 1/8"');
      expect(decimalToFraction(6.0625)).toBe('6 1/16"');
      expect(decimalToFraction(14.0)).toBe('14"');
      expect(decimalToFraction(0)).toBe('0"');
    });

    it("should round to the nearest 1/16\"", () => {
      expect(decimalToFraction(5.129)).toBe('5 1/8"'); // 0.129 is close to 0.125 (2/16)
      expect(decimalToFraction(5.1875)).toBe('5 3/16"'); // 0.1875 is exactly 3/16
    });
  });

  describe("optimizeCutList", () => {
    it("should pack cuts efficiently", () => {
      // 4 cuts of 30 inches each on 8-foot (96 inch) boards
      // Board 1: 30 + 30 + 30 = 90 (fits 3 cuts)
      // Board 2: 30 (fits 1 cut)
      // Total boards: 2
      const cuts = [{ lengthIn: 30, count: 4 }];
      expect(optimizeCutList(cuts, 8)).toBe(2);
    });

    it("should handle large cuts that exceed standard boards by splicing them", () => {
      // 1 cut of 100 inches on 8-foot (96 inch) boards is split into 96" + 4" (requires 2 boards)
      const cuts = [{ lengthIn: 100, count: 1 }];
      expect(optimizeCutList(cuts, 8)).toBe(2);
    });
  });

  describe("calculateWainscoting", () => {
    it("should calculate correct spacing for board-batten", () => {
      const res = calculateWainscoting({
        wallWidth: 144, // 12 ft
        wallHeight: 96, // 8 ft
        style: "board-batten",
        boardWidth: 3.5,
        boardThickness: 0.75,
        topRailWidth: 3.5,
        bottomRailWidth: 5.5,
        midRailWidth: 0,
        panelCount: 6,
        rowCount: 1,
        gapWidth: 4,
        topGap: 4,
        bottomGap: 4,
        lumberLengthFt: 8,
        wastePercent: 10,
        obstacles: []
      });

      // stiles = 7. Total stiles width = 7 * 3.5 = 24.5
      // remaining space = 144 - 24.5 = 119.5
      // exact spacing = 119.5 / 6 = 19.9167
      expect(res.stilesCount).toBe(7);
      expect(res.exactSpacingIn).toBeCloseTo(19.9167, 3);
      expect(res.exactSpacingFraction).toBe('19 15/16"');
      expect(res.clashesDetected).toBe(false);
    });

    it("should detect clashes with obstacles", () => {
      const res = calculateWainscoting({
        wallWidth: 144,
        wallHeight: 96,
        style: "board-batten",
        boardWidth: 3.5,
        boardThickness: 0.75,
        topRailWidth: 3.5,
        bottomRailWidth: 5.5,
        midRailWidth: 0,
        panelCount: 6,
        rowCount: 1,
        gapWidth: 4,
        topGap: 4,
        bottomGap: 4,
        lumberLengthFt: 8,
        wastePercent: 10,
        // Place obstacle exactly where stile index 1 lands:
        // stile 0 at x=0
        // stile 1 at x = 3.5 + 19.9167 = 23.4167. stile width is 3.5. So stile 1 spans [23.41, 26.91]
        obstacles: [
          { id: "1", name: "Test Outlet", type: "outlet", x: 24, y: 12, width: 2, height: 4 }
        ]
      });

      expect(res.clashesDetected).toBe(true);
      expect(res.clashingObstacleIds).toContain("1");
    });
  });
});
