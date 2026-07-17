import { describe, it, expect } from "vitest";
import { calculateDistance, calculateScale, calculatePolygonArea, calculatePolygonPerimeter, convertAreaToPhysical, convertLengthToPhysical } from "./measureEngine";

describe("measureEngine tests", () => {
  describe("calculateDistance", () => {
    it("should calculate exact Euclidean distance between two points", () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(calculateDistance(p1, p2)).toBe(5);
    });
  });

  describe("calculateScale", () => {
    it("should compute pixels per inch correctly", () => {
      // 100 pixels representing 10 feet (120 inches)
      expect(calculateScale(100, 10, "ft")).toBeCloseTo(100 / 120, 4);

      // 50 pixels representing 20 inches
      expect(calculateScale(50, 20, "in")).toBe(2.5);
    });
  });

  describe("calculatePolygonArea", () => {
    it("should calculate correct area of a simple square using the Shoelace formula", () => {
      // 100 x 100 pixel square
      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];
      expect(calculatePolygonArea(points)).toBe(10000);
    });

    it("should return 0 for less than 3 points", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 10 }
      ];
      expect(calculatePolygonArea(points)).toBe(0);
    });
  });

  describe("convertAreaToPhysical", () => {
    it("should map square pixels to physical square feet correctly", () => {
      // 10 pixels per inch scale -> 100 pixels = 10 inches -> Area of 100x100 pixels = 100 sq inches
      // 100 sq inches = 100 / 144 = 0.6944 sq feet
      const pixelArea = 10000; // 100x100
      const scale = 10; // 10 pixels per inch
      expect(convertAreaToPhysical(pixelArea, scale)).toBeCloseTo(100 / 144, 4);
    });
  });

  describe("calculatePolygonPerimeter", () => {
    it("should calculate correct perimeter length of a closed shape", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 40 }
      ];
      // Triangle sides: 30, 40, and hypotenuse 50 -> Perimeter = 120
      expect(calculatePolygonPerimeter(points, true)).toBe(120);
    });

    it("should calculate correct open path length if isClosed is false", () => {
      const points = [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 40 }
      ];
      // Sides: 30, 40 -> Perimeter = 70
      expect(calculatePolygonPerimeter(points, false)).toBe(70);
    });
  });

  describe("convertLengthToPhysical", () => {
    it("should map pixel lengths to physical feet correctly", () => {
      // 2 pixels per inch -> 48 pixels = 24 inches = 2 feet
      expect(convertLengthToPhysical(48, 2)).toBe(2);
    });
  });
});
