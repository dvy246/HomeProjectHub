import { describe, it, expect } from "vitest";
import {
  computeSlabArea, computeSlabVolume, computeRebarGrid, computeControlJoints,
  computeSubBase, computeMaterialList, computeSlab,
  type SlabDesignInput,
} from "./concreteSlabEngine";

function makeInput(overrides?: Partial<SlabDesignInput>): SlabDesignInput {
  return {
    shape: "rect",
    lengthA: 10,
    widthA: 12,
    thickness: 4,
    subBaseMaterial: "gravel",
    subBaseDepth: 4,
    reinforcement: "none",
    finish: "broom",
    vaporBarrier: false,
    wasteFactor: 10,
    bagSize: "80lb",
    ...overrides,
  };
}

describe("computeSlabArea", () => {
  it("computes rectangular area", () => {
    const r = computeSlabArea(makeInput({ shape: "rect", lengthA: 10, widthA: 12 }));
    expect(r).toBe(120);
  });

  it("computes L-shape area", () => {
    const r = computeSlabArea(makeInput({ shape: "l-shape", lengthA: 10, widthA: 8, lengthB: 6, widthB: 4 }));
    expect(r).toBe(80 + 24);
  });

  it("computes circular area", () => {
    const r = computeSlabArea(makeInput({ shape: "circle", diameter: 10 }));
    expect(r).toBeCloseTo(78.54, 1);
  });

  it("handles zero dimensions gracefully", () => {
    const r = computeSlabArea(makeInput({ shape: "rect", lengthA: 0, widthA: 0 }));
    expect(r).toBe(0);
  });
});

describe("computeSlabVolume", () => {
  it("computes volume for 10x12x4 slab with 10% waste", () => {
    const r = computeSlabVolume(120, 4, 0.1);
    expect(r.volumeCuFt).toBeCloseTo(44, 0);
    expect(r.volumeCuYd).toBeCloseTo(1.63, 1);
  });

  it("returns raw volume with 0% waste", () => {
    const r = computeSlabVolume(100, 4, 0);
    expect(r.volumeCuFt).toBeCloseTo(33.33, 1);
    expect(r.volumeCuYd).toBeCloseTo(1.23, 1);
  });
});

describe("computeRebarGrid", () => {
  it("computes grid for 10x12 slab with #4 at 18in OC", () => {
    const r = computeRebarGrid(10, 12, "#4", 18);
    expect(r.barsAlongLength).toBe(8);
    expect(r.barsAlongWidth).toBe(9);
    expect(r.totalLinearFt).toBe(8 * 12 + 9 * 10);
    expect(r.totalWeightLbs).toBeCloseTo(r.totalLinearFt * 0.668, 1);
    expect(r.sticksCount).toBeGreaterThan(0);
  });

  it("uses #3 bar weight", () => {
    const r = computeRebarGrid(10, 12, "#3", 18);
    expect(r.barSize).toBe("#3");
  });

  it("computes grid for 24x24 garage slab with #4 at 12in OC", () => {
    const r = computeRebarGrid(24, 24, "#4", 12);
    expect(r.barsAlongLength).toBe(25);
    expect(r.barsAlongWidth).toBe(25);
    expect(r.totalLinearFt).toBe(25 * 24 + 25 * 24);
  });

  it("handles minimum spacing clamp", () => {
    const r = computeRebarGrid(10, 12, "#4", 2);
    expect(r.spacing).toBe(6);
  });
});

describe("computeControlJoints", () => {
  it("places joints for 4in slab every 10ft", () => {
    const r = computeControlJoints(20, 20, 4);
    expect(r.spacingX).toBe(10);
    expect(r.jointsAlongLength).toBe(1);
    expect(r.jointsAlongWidth).toBe(1);
    expect(r.totalLinearFt).toBe(20 + 20);
  });

  it("places joints for 6in slab every 15ft", () => {
    const r = computeControlJoints(30, 30, 6);
    expect(r.spacingX).toBe(15);
    expect(r.jointsAlongLength).toBe(1);
  });

  it("returns zero joints for slab smaller than spacing", () => {
    const r = computeControlJoints(8, 8, 4);
    expect(r.jointsAlongLength).toBe(0);
    expect(r.totalLinearFt).toBe(0);
  });
});

describe("computeSubBase", () => {
  it("computes volume for 120sqft at 4in depth", () => {
    const r = computeSubBase(120, 4, "gravel");
    expect(r.volumeCuFt).toBe(40);
    expect(r.tons).toBeCloseTo(1.4 * (40 / 27), 1);
  });

  it("computes sand with different density", () => {
    const r = computeSubBase(120, 4, "sand");
    expect(r.tons).toBeLessThan(computeSubBase(120, 4, "gravel").tons);
  });
});

describe("computeMaterialList", () => {
  it("includes concrete bags, rebar, sub-base, and sealer", () => {
    const input = makeInput({ reinforcement: "rebar", rebarSize: "#4", rebarSpacing: 18, vaporBarrier: true, bagSize: "80lb" });
    const results = computeSlab(input);
    const items = computeMaterialList(results, input);
    const names = items.map(i => i.category);
    expect(names).toContain("Concrete");
    expect(names).toContain("Rebar");
    expect(names).toContain("Sub-base");
    expect(names).toContain("Vapor Barrier");
    expect(names).toContain("Sealer");
  });

  it("includes mesh when reinforcement is mesh", () => {
    const input = makeInput({ reinforcement: "mesh" });
    const results = computeSlab(input);
    const items = computeMaterialList(results, input);
    expect(items.some(i => i.category === "Reinforcement")).toBe(true);
  });
});

describe("computeSlab (integration)", () => {
  it("computes a full 10x12 patio slab", () => {
    const input = makeInput({ shape: "rect", lengthA: 10, widthA: 12, thickness: 4, wasteFactor: 10, bagSize: "80lb" });
    const r = computeSlab(input);
    expect(r.area).toBe(120);
    expect(r.volumeCuYd).toBeGreaterThan(0);
    expect(r.volumeCuFt).toBeGreaterThan(0);
    expect(r.bagCount).toBeGreaterThan(0);
    expect(r.weightLbs).toBeGreaterThan(0);
    expect(r.totalCost).toBeGreaterThan(0);
    expect(r.materialList.length).toBeGreaterThan(0);
  });

  it("computes a full 20x24 driveway slab with rebar", () => {
    const input = makeInput({ shape: "rect", lengthA: 20, widthA: 24, thickness: 6, reinforcement: "rebar", rebarSize: "#4", rebarSpacing: 18, wasteFactor: 10, bagSize: "80lb", vaporBarrier: true });
    const r = computeSlab(input);
    expect(r.area).toBe(480);
    expect(r.volumeCuFt).toBeGreaterThan(200);
    expect(r.rebarGrid).not.toBeNull();
    expect(r.rebarGrid!.totalLinearFt).toBeGreaterThan(0);
    expect(r.materialList.length).toBeGreaterThan(3);
    expect(r.controlJoints.totalLinearFt).toBeGreaterThan(0);
  });

  it("computes L-shape slab", () => {
    const input = makeInput({ shape: "l-shape", lengthA: 10, widthA: 8, lengthB: 6, widthB: 4, thickness: 4 });
    const r = computeSlab(input);
    expect(r.area).toBe(104);
    expect(r.volumeCuYd).toBeGreaterThan(0);
  });

  it("computes circular slab", () => {
    const input = makeInput({ shape: "circle", diameter: 10, thickness: 4 });
    const r = computeSlab(input);
    expect(r.area).toBeCloseTo(78.54, 1);
    expect(r.volumeCuYd).toBeGreaterThan(0);
  });

  it("computes bag counts for all sizes", () => {
    const input = makeInput({ shape: "rect", lengthA: 10, widthA: 12, thickness: 4 });
    const r = computeSlab(input);
    expect(r.bags).toHaveLength(4);
    expect(r.bags[0].size).toBe("80lb");
    expect(r.bags[0].count).toBeGreaterThan(0);
  });

  it("computes ready-mix cost with delivery fee for small pours", () => {
    const input = makeInput({ shape: "rect", lengthA: 6, widthA: 6, thickness: 4 });
    const r = computeSlab(input);
    expect(r.readyMixCost).toBeGreaterThan(0);
  });
});
