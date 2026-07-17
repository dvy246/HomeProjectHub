import { describe, it, expect } from "vitest";
import { calculateFraming, decimalToFraction, getHeaderHeight } from "./framingEngine";

describe("framingEngine tests", () => {
  describe("decimalToFraction", () => {
    it("should convert clean decimals to fractions", () => {
      expect(decimalToFraction(12.5)).toBe('12 1/2"');
      expect(decimalToFraction(8.25)).toBe('8 1/4"');
      expect(decimalToFraction(10.75)).toBe('10 3/4"');
      expect(decimalToFraction(5.125)).toBe('5 1/8"');
      expect(decimalToFraction(14.0)).toBe('14"');
      expect(decimalToFraction(0)).toBe('0"');
    });
  });

  describe("getHeaderHeight", () => {
    it("should return the exact height for standard header dimensions", () => {
      expect(getHeaderHeight("2x6")).toBe(5.5);
      expect(getHeaderHeight("2x8")).toBe(7.25);
      expect(getHeaderHeight("2x10")).toBe(9.25);
      expect(getHeaderHeight("2x12")).toBe(11.25);
    });
  });

  describe("calculateFraming", () => {
    it("should calculate studs for a standard 10ft wall with no openings", () => {
      const res = calculateFraming({
        wallLengthFt: 10,
        wallHeightFt: 8,
        studSpacingIn: 16,
        studSize: "2x4",
        headerSize: "2x10",
        wastePercent: 0,
        openings: []
      });

      // 10ft = 120" -> 120 / 16 = 7.5 (8 spaces, so 9 studs O.C. including end)
      // Since it includes the last end stud, it should have exactly 9 studs.
      const standardStuds = res.visualElements.studs.filter(s => s.type === "standard");
      expect(standardStuds.length).toBe(9);
      expect(res.warnings.length).toBe(0);
    });

    it("should calculate and insert king/jack studs around a door opening", () => {
      const res = calculateFraming({
        wallLengthFt: 12,
        wallHeightFt: 8,
        studSpacingIn: 16,
        studSize: "2x4",
        headerSize: "2x10",
        wastePercent: 10,
        openings: [
          { id: "op-1", name: "Door 1", type: "door", width: 32, height: 80, x: 48, y: 0 }
        ]
      });

      // Left king at 45", left jack at 46.5"
      // Right jack at 80", right king at 81.5"
      const kings = res.visualElements.studs.filter(s => s.type === "king");
      const jacks = res.visualElements.studs.filter(s => s.type === "jack");
      const header = res.visualElements.headers[0];

      expect(kings.length).toBe(2);
      expect(jacks.length).toBe(2);
      expect(header).toBeDefined();
      expect(header.width).toBe(35); // 32" door + 3" for 2 jacks (1.5" each side)
      expect(res.warnings.length).toBe(0);
    });

    it("should flag a warning if openings are too close to wall edges", () => {
      const res = calculateFraming({
        wallLengthFt: 8,
        wallHeightFt: 8,
        studSpacingIn: 16,
        studSize: "2x4",
        headerSize: "2x10",
        wastePercent: 10,
        // Door is placed at x=1, leaving only 1 inch on the left (which is less than the required 3.0" for King + Jack)
        openings: [
          { id: "op-1", name: "Door 1", type: "door", width: 32, height: 80, x: 1, y: 0 }
        ]
      });

      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.warnings[0]).toContain("is too close to the left wall edge");
    });
  });
});
