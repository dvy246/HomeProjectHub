import { describe, it, expect } from "vitest";
import { calculateCloset, decimalToFraction, MODE_CONFIGS } from "./closetEngine";

describe("closetEngine tests", () => {
  describe("decimalToFraction", () => {
    it("should convert clean decimals to fractions", () => {
      expect(decimalToFraction(12.5)).toBe('12 1/2"');
      expect(decimalToFraction(8.25)).toBe('8 1/4"');
      expect(decimalToFraction(10.75)).toBe('10 3/4"');
      expect(decimalToFraction(5.125)).toBe('5 1/8"');
      expect(decimalToFraction(6.0625)).toBe('6 1/16"');
      expect(decimalToFraction(14)).toBe('14"');
      expect(decimalToFraction(0)).toBe('0"');
    });

    it("should round to nearest 1/16", () => {
      expect(decimalToFraction(5.1875)).toBe('5 3/16"');
    });

    it("should handle negative values", () => {
      expect(decimalToFraction(-5)).toBe('0"');
    });

    it("should handle pure fractions less than 1", () => {
      expect(decimalToFraction(0.5)).toBe('1/2"');
      expect(decimalToFraction(0.25)).toBe('1/4"');
    });
  });

  describe("mode configs", () => {
    it("should have all modes defined", () => {
      expect(MODE_CONFIGS["reach-in"]).toBeDefined();
      expect(MODE_CONFIGS["walk-in-l"]).toBeDefined();
      expect(MODE_CONFIGS["walk-in-u"]).toBeDefined();
      expect(MODE_CONFIGS.pantry).toBeDefined();
      expect(MODE_CONFIGS.mudroom).toBeDefined();
      expect(MODE_CONFIGS.garage).toBeDefined();
    });

    it("should have default walls for each mode", () => {
      for (const mode of Object.keys(MODE_CONFIGS)) {
        expect(MODE_CONFIGS[mode as keyof typeof MODE_CONFIGS].defaultWalls.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("should have unique section types per mode", () => {
      expect(MODE_CONFIGS.pantry.availableSectionTypes).not.toContain("single-hang");
      expect(MODE_CONFIGS.mudroom.availableSectionTypes).not.toContain("double-hang");
      expect(MODE_CONFIGS["reach-in"].availableSectionTypes).not.toContain("hooks");
    });
  });

  describe("calculateCloset with multi-wall layout", () => {
    it("should calculate single-wall reach-in closet", () => {
      const result = calculateCloset({
        mode: "reach-in",
        wallHeight: 96,
        depth: 24,
        walls: [
          {
            id: "w1", label: "Main", width: 48,
            sections: [{ id: "s1", label: "Hang", width: 48, type: "single-hang" }],
          },
        ],
      });

      expect(result.hangingSpaceIn).toBe(48);
      expect(result.items.filter(i => i.type === "rod")).toHaveLength(1);
      expect(result.items.filter(i => i.type === "shelf")).toHaveLength(1);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should calculate multi-wall walk-in L-shape closet", () => {
      const result = calculateCloset({
        mode: "walk-in-l",
        wallHeight: 96,
        depth: 24,
        walls: [
          {
            id: "w1", label: "Long Wall", width: 72,
            sections: [{ id: "s1", label: "Double Hang", width: 72, type: "double-hang" }],
          },
          {
            id: "w2", label: "Short Wall", width: 48,
            sections: [{ id: "s2", label: "Single Hang", width: 48, type: "single-hang" }],
          },
        ],
      });

      // Double-hang: 72 * 2 = 144, Single-hang: 48
      expect(result.hangingSpaceIn).toBe(192);
      expect(result.items.filter(i => i.type === "rod")).toHaveLength(3);
      expect(result.materialList.some(m => m.name === "Closet Rod & Flanges")).toBe(true);
    });

    it("should calculate pantry mode", () => {
      const result = calculateCloset({
        mode: "pantry",
        wallHeight: 84,
        depth: 20,
        walls: [
          {
            id: "w1", label: "Main", width: 48,
            sections: [{ id: "s1", label: "Pantry Shelves", width: 48, type: "shelf" }],
          },
        ],
      });

      expect(result.hangingSpaceIn).toBe(0);
      expect(result.items.filter(i => i.type === "shelf").length).toBeGreaterThanOrEqual(5);
      expect(result.materialList.some(m => m.name === "Shelving Board")).toBe(true);
    });

    it("should calculate mudroom mode with hooks and cubbies", () => {
      const result = calculateCloset({
        mode: "mudroom",
        wallHeight: 84,
        depth: 18,
        walls: [
          {
            id: "w1", label: "Main", width: 72,
            sections: [
              { id: "s1", label: "Cubbies", width: 36, type: "cubby" },
              { id: "s2", label: "Hooks", width: 36, type: "hooks" },
            ],
          },
        ],
      });

      expect(result.items.filter(i => i.type === "cubby").length).toBeGreaterThanOrEqual(6);
      expect(result.items.filter(i => i.type === "hook").length).toBeGreaterThanOrEqual(5);
      expect(result.materialList.some(m => m.name === "Wall Hooks / Coat Hooks")).toBe(true);
    });

    it("should calculate garage mode with pegboard", () => {
      const result = calculateCloset({
        mode: "garage",
        wallHeight: 96,
        depth: 24,
        walls: [
          {
            id: "w1", label: "Main", width: 48,
            sections: [{ id: "s1", label: "Pegboard", width: 48, type: "pegboard" }],
          },
        ],
      });

      expect(result.items.filter(i => i.type === "pegboard")).toHaveLength(1);
      expect(result.materialList.some(m => m.name === "Pegboard Panels")).toBe(true);
    });
  });

  describe("section type rendering", () => {
    it("should render single-hang section with top shelf and rod", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 48, sections: [
          { id: "s1", label: "Hang", width: 48, type: "single-hang" },
        ]}],
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].type).toBe("shelf");
      expect(result.items[1].type).toBe("rod");
    });

    it("should render double-hang section with 2 rods and 2 shelves", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 36, sections: [
          { id: "s1", label: "Double", width: 36, type: "double-hang" },
        ]}],
      });

      expect(result.items.filter(i => i.type === "rod")).toHaveLength(2);
      expect(result.items.filter(i => i.type === "shelf")).toHaveLength(2);
    });

    it("should omit mid shelf on short walls in double-hang", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 50, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 36, sections: [
          { id: "s1", label: "Double", width: 36, type: "double-hang" },
        ]}],
      });

      expect(result.items.filter(i => i.type === "shelf")).toHaveLength(1);
    });

    it("should render drawer section with drawer units capped at 42 inches and shelves above", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 84, depth: 20,
        walls: [{ id: "w1", label: "Main", width: 36, sections: [
          { id: "s1", label: "Drawers", width: 36, type: "drawer" },
        ]}],
      });

      expect(result.drawerCount).toBe(2);
      const shelvesAbove = result.items.filter(i => i.type === "shelf" && i.y >= 36);
      expect(shelvesAbove.length).toBeGreaterThan(0);
    });

    it("should render heavy-shelf sections", () => {
      const result = calculateCloset({
        mode: "garage", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 48, sections: [
          { id: "s1", label: "Heavy", width: 48, type: "heavy-shelf" },
        ]}],
      });

      const shelves = result.items.filter(i => i.type === "shelf");
      expect(shelves.length).toBeGreaterThanOrEqual(5);
      expect(shelves[0].height).toBe(1.5);
    });
  });

  describe("clamping behavior", () => {
    it("should clamp wall height between 48 and 120", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 200, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 48, sections: [
          { id: "s1", label: "Hang", width: 48, type: "single-hang" },
        ]}],
      });
      expect(result.items.length).toBeGreaterThan(0);
    });

    it("should clamp depth between 12 and 30", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 6,
        walls: [{ id: "w1", label: "Main", width: 48, sections: [
          { id: "s1", label: "Shelf", width: 48, type: "shelf" },
        ]}],
      });
      expect(result.shelfAreaSqFt).toBeGreaterThan(0);
    });
  });

  describe("material list", () => {
    it("should include rods for hanging sections", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 48, sections: [
          { id: "s1", label: "Hang", width: 48, type: "single-hang" },
        ]}],
      });
      expect(result.materialList.some(m => m.name === "Closet Rod & Flanges")).toBe(true);
    });

    it("should include hangers with cap at 100", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 120, sections: [
          { id: "s1", label: "Hang", width: 120, type: "single-hang" },
        ]}],
      });
      const hangers = result.materialList.find(m => m.name === "Wood / Velvet Hangers");
      expect(hangers).toBeDefined();
      expect(hangers!.quantity).toBe(100);
    });

    it("should compute total cost correctly", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 48, sections: [
          { id: "s1", label: "Hang", width: 48, type: "single-hang" },
        ]}],
      });
      const expected = result.materialList.reduce((s, m) => s + m.quantity * m.pricePerUnit, 0);
      expect(result.totalCost).toBe(Math.round(expected));
    });
  });

  describe("edge cases", () => {
    it("should handle empty walls gracefully", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [],
      });
      expect(result.items).toHaveLength(0);
      expect(result.totalCost).toBe(0);
    });

    it("should handle walls with no sections", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Empty", width: 48, sections: [] }],
      });
      expect(result.items).toHaveLength(0);
    });

    it("should handle empty sections array", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [],
      });
      expect(result.items).toHaveLength(0);
      expect(result.hangingSpaceIn).toBe(0);
      expect(result.drawerCount).toBe(0);
      expect(result.materialList).toHaveLength(0);
      expect(result.totalCost).toBe(0);
    });
  });

  describe("hanger capacity", () => {
    it("should compute thin and thick capacities", () => {
      const result = calculateCloset({
        mode: "reach-in", wallHeight: 96, depth: 24,
        walls: [{ id: "w1", label: "Main", width: 60, sections: [
          { id: "s1", label: "Hang", width: 60, type: "single-hang" },
        ]}],
      });
      expect(result.hangerCapacity).toBe(60);
      expect(result.hangerCapacityThick).toBe(40);
    });
  });
});
