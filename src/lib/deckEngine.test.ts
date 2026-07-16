import { describe, it, expect } from "vitest";
import { calculateDeckMaterials } from "./deckEngine";

describe("deckEngine tests", () => {
  it("should return zero values for zero dimensions", () => {
    const res = calculateDeckMaterials({
      widthFt: 0,
      depthFt: 0,
      joistSpacingIn: 16,
      boardType: "wood",
      postHeightFt: 3,
    });
    expect(res.joistsCount).toBe(0);
    expect(res.footingsCount).toBe(0);
    expect(res.totalWeightLbs).toBe(0);
  });

  it("should calculate correct counts for a standard 12x12 deck", () => {
    const res = calculateDeckMaterials({
      widthFt: 12,
      depthFt: 12,
      joistSpacingIn: 16,
      boardType: "wood",
      postHeightFt: 3,
    });
    // joists = Math.ceil((12 * 12) / 16) + 1 = 10 joists
    expect(res.joistsCount).toBe(10);
    // beams count = Math.ceil(12/10) = 2 beams.
    // posts per beam = Math.ceil(12/8) + 1 = 3 posts.
    // total posts = 3 * 2 = 6 posts.
    expect(res.postsCount).toBe(6);
    expect(res.footingsCount).toBe(6);
    expect(res.joistHangers).toBe(10);
    expect(res.postBases).toBe(6);
    expect(res.postCaps).toBe(6);
    expect(res.concreteWeightLbs).toBe(6 * 345);
    expect(res.totalWeightLbs).toBeGreaterThan(res.concreteWeightLbs);
  });

  it("should adjust joists count for 12-inch spacing", () => {
    const res = calculateDeckMaterials({
      widthFt: 12,
      depthFt: 12,
      joistSpacingIn: 12,
      boardType: "composite",
      postHeightFt: 3,
    });
    // joists = Math.ceil((12 * 12) / 12) + 1 = 13 joists
    expect(res.joistsCount).toBe(13);
  });
});
