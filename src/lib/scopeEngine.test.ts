import { describe, it, expect } from "vitest";
import {
  computeRoomSurfaces,
  computeNetSurfaceArea,
  computeFinish,
  computeScope,
  scopeRoomToParams,
  scopeRoomFromParams,
  type ScopeRoom,
  type ScopeFinish,
  type ScopeOpening,
} from "./scopeEngine";

function testRoom(overrides: Partial<ScopeRoom> = {}): ScopeRoom {
  return {
    lengthFt: 12,
    widthFt: 10,
    heightFt: 8,
    openings: [],
    ...overrides,
  };
}

function testFinish(overrides: Partial<ScopeFinish> = {}): ScopeFinish {
  return {
    surface: "walls",
    label: "Paint",
    materialType: "paint",
    unitPrice: 40,
    coverageSqFt: 350,
    unitLabel: "gallons",
    wastePercent: 0.1,
    ...overrides,
  };
}

describe("Scope Engine", () => {
  describe("computeRoomSurfaces", () => {
    it("computes floor, wall, and ceiling areas for a rectangular room", () => {
      const room = testRoom({ lengthFt: 12, widthFt: 10, heightFt: 8 });
      const surfaces = computeRoomSurfaces(room);
      expect(surfaces.floorArea).toBe(120);
      expect(surfaces.ceilingArea).toBe(120);
      expect(surfaces.wallArea).toBe(352); // 2 * (12 + 10) * 8
    });

    it("handles a square room", () => {
      const room = testRoom({ lengthFt: 10, widthFt: 10, heightFt: 8 });
      const surfaces = computeRoomSurfaces(room);
      expect(surfaces.floorArea).toBe(100);
      expect(surfaces.wallArea).toBe(320);
    });
  });

  describe("computeNetSurfaceArea", () => {
    it("returns gross area when no openings", () => {
      const net = computeNetSurfaceArea(352, []);
      expect(net).toBe(352);
    });

    it("subtracts standard door area for walls", () => {
      const openings: ScopeOpening[] = [{ type: "door", count: 1 }];
      const net = computeNetSurfaceArea(352, openings);
      expect(net).toBe(331); // 352 - 21
    });

    it("subtracts standard window area for walls", () => {
      const openings: ScopeOpening[] = [{ type: "window", count: 2 }];
      const net = computeNetSurfaceArea(352, openings);
      expect(net).toBe(328); // 352 - 24
    });

    it("handles custom opening area", () => {
      const openings: ScopeOpening[] = [{ type: "custom", count: 1, customAreaSqFt: 30 }];
      const net = computeNetSurfaceArea(352, openings);
      expect(net).toBe(322);
    });

    it("does not return negative area", () => {
      const openings: ScopeOpening[] = [{ type: "door", count: 100 }];
      const net = computeNetSurfaceArea(50, openings);
      expect(net).toBe(0);
    });
  });

  describe("computeFinish", () => {
    it("computes gallons of paint for a wall area", () => {
      const finish = testFinish({ surface: "walls", coverageSqFt: 350, unitPrice: 40, wastePercent: 0.1 });
      const result = computeFinish(finish, 331);
      // 331 * 1.1 = 364.1 / 350 = 1.04 gallons
      expect(result.materialQuantity).toBeCloseTo(1.04, 1);
      expect(result.materialCost).toBeGreaterThan(0);
      expect(result.packagingCount).toBe(2); // ceil(364.1 / 350)
    });

    it("computes drywall sheets for ceiling", () => {
      const finish = testFinish({
        surface: "ceiling",
        coverageSqFt: 32,
        unitPrice: 18,
        unitLabel: "sheets",
        wastePercent: 0.1,
      });
      const result = computeFinish(finish, 120);
      // 120 * 1.1 = 132 / 32 = 4.125 sheets
      expect(result.materialQuantity).toBeCloseTo(4.125, 2);
      expect(result.packagingCount).toBe(5); // ceil(132 / 32)
    });

    it("handles zero waste", () => {
      const finish = testFinish({ wastePercent: 0, coverageSqFt: 100 });
      const result = computeFinish(finish, 200);
      expect(result.wasteAmount).toBe(0);
      expect(result.materialQuantity).toBe(2);
    });
  });

  describe("computeScope", () => {
    it("computes a full room scope with floor, walls, and ceiling", () => {
      const room = testRoom({ lengthFt: 12, widthFt: 10, heightFt: 8, openings: [{ type: "door", count: 1 }, { type: "window", count: 2 }] });
      const finishes: ScopeFinish[] = [
        testFinish({ surface: "floor", label: "Flooring", materialType: "laminate", unitPrice: 3, coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.1 }),
        testFinish({ surface: "walls", label: "Paint", unitPrice: 40, coverageSqFt: 350, unitLabel: "gallons", wastePercent: 0.1 }),
        testFinish({ surface: "ceiling", label: "Paint", unitPrice: 40, coverageSqFt: 350, unitLabel: "gallons", wastePercent: 0.1 }),
      ];
      const result = computeScope(room, finishes);

      expect(result.totalGrossArea).toBe(592); // 120 (floor) + 352 (walls) + 120 (ceiling)
      // net: floor 120 + walls 307 (352-21-24) + ceiling 120 = 547
      expect(result.totalNetArea).toBe(547);
      expect(result.totalMaterialCost).toBeGreaterThan(0);
      expect(result.surfaceResults).toHaveLength(3);
    });

    it("handles a room with no openings", () => {
      const room = testRoom({ lengthFt: 10, widthFt: 10, heightFt: 8 });
      const finishes: ScopeFinish[] = [
        testFinish({ surface: "floor", label: "Flooring", materialType: "laminate", unitPrice: 3, coverageSqFt: 1, unitLabel: "sq ft", wastePercent: 0.1 }),
      ];
      const result = computeScope(room, finishes);
      expect(result.surfaceResults).toHaveLength(1);
      expect(result.surfaceResults[0].grossArea).toBe(100);
      expect(result.surfaceResults[0].netArea).toBe(100);
    });
  });

  describe("scopeRoomToParams / scopeRoomFromParams", () => {
    it("serializes and deserializes a basic room", () => {
      const room: ScopeRoom = { lengthFt: 12, widthFt: 10, heightFt: 8, openings: [] };
      const params = scopeRoomToParams(room);
      const restored = scopeRoomFromParams(params);
      expect(restored).not.toBeNull();
      expect(restored!.lengthFt).toBe(12);
      expect(restored!.widthFt).toBe(10);
      expect(restored!.heightFt).toBe(8);
    });

    it("serializes and deserializes openings", () => {
      const room: ScopeRoom = {
        lengthFt: 12,
        widthFt: 10,
        heightFt: 8,
        openings: [{ type: "door", count: 1 }, { type: "window", count: 2 }],
      };
      const params = scopeRoomToParams(room);
      const restored = scopeRoomFromParams(params);
      expect(restored!.openings).toHaveLength(2);
      expect(restored!.openings[0].type).toBe("door");
      expect(restored!.openings[0].count).toBe(1);
    });

    it("returns null for invalid params", () => {
      expect(scopeRoomFromParams("invalid")).toBeNull();
      expect(scopeRoomFromParams("")).toBeNull();
    });
  });
});
