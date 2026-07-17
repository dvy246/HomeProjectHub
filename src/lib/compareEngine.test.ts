import { describe, it, expect } from "vitest";
import {
  getDefaultWeights,
  getPersonaWeights,
  computeWeightedScore,
  computeLifecycleCost,
  compareMaterials,
  encodeComparisonState,
  decodeComparisonState,
  getMaterialsByCategory,
  getPairs,
  parsePairSlug,
  parseSizeSlug,
  type ComparisonMaterialData,
  type ComparisonWeights,
} from "./compareEngine";

function makeMaterial(overrides: Partial<ComparisonMaterialData> = {}): ComparisonMaterialData {
  return {
    id: "test-mat",
    name: "Test Material",
    category: "flooring",
    description: "A test material for unit testing",
    unit: "sq ft",
    costPerUnit: { min: 5, max: 10, avg: 7.5 },
    lifespanYears: 20,
    maintenanceAnnualCostPerUnit: 0.15,
    replacementCostPerUnit: 7.5,
    scores: {
      durability: 6,
      waterResistance: 5,
      scratchResistance: 5,
      easeMaintenance: 6,
      ecoFriendly: 5,
      resaleValue: 6,
      warmthComfort: 6,
      soundAbsorption: 5,
      easeInstallation: 6,
    },
    pros: ["Durable", "Attractive"],
    cons: ["Expensive"],
    installationDifficulty: 3,
    affiliateLinks: { lowes: "/flooring/test" },
    svgColors: ["#C4956A", "#B8835A"],
    ...overrides,
  };
}

function makeWeights(overrides: Partial<ComparisonWeights> = {}): ComparisonWeights {
  return {
    cost: 50,
    durability: 50,
    maintenance: 50,
    lifespan: 50,
    ecoFriendly: 50,
    aesthetics: 50,
    ...overrides,
  };
}

describe("getDefaultWeights", () => {
  it("returns equal 50s for all dimensions", () => {
    const w = getDefaultWeights();
    expect(w.cost).toBe(50);
    expect(w.durability).toBe(50);
    expect(w.maintenance).toBe(50);
    expect(w.lifespan).toBe(50);
    expect(w.ecoFriendly).toBe(50);
    expect(w.aesthetics).toBe(50);
  });
});

describe("getPersonaWeights", () => {
  it("budget persona favors cost over aesthetics", () => {
    const w = getPersonaWeights("budget");
    expect(w.cost).toBeGreaterThan(w.aesthetics);
    expect(w.cost).toBe(100);
  });

  it("premium persona favors lifespan and aesthetics", () => {
    const w = getPersonaWeights("premium");
    expect(w.lifespan).toBe(100);
    expect(w.aesthetics).toBeGreaterThan(w.cost);
  });

  it("durable persona favors durability and lifespan", () => {
    const w = getPersonaWeights("durable");
    expect(w.durability).toBe(100);
    expect(w.lifespan).toBeGreaterThanOrEqual(90);
  });

  it("balanced persona equals default weights", () => {
    const w = getPersonaWeights("balanced");
    expect(w).toEqual(getDefaultWeights());
  });
});

describe("computeWeightedScore", () => {
  it("returns perfect score for max cost and perfect material", () => {
    const perfect = makeMaterial({
      scores: {
        durability: 10,
        waterResistance: 10,
        scratchResistance: 10,
        easeMaintenance: 10,
        ecoFriendly: 10,
        resaleValue: 10,
        warmthComfort: 10,
        soundAbsorption: 10,
        easeInstallation: 10,
      },
      costPerUnit: { min: 1, max: 1, avg: 1 },
    });
    const score = computeWeightedScore(perfect.scores, getDefaultWeights(), perfect.costPerUnit.avg);
    expect(score).toBeGreaterThanOrEqual(95);
  });

  it("returns lower score for expensive material with cost-heavy weights", () => {
    const expensive = makeMaterial({ costPerUnit: { min: 100, max: 200, avg: 150 } });
    const cheap = makeMaterial({ id: "cheap", costPerUnit: { min: 1, max: 3, avg: 2 } });
    const costWeights = makeWeights({ cost: 100, durability: 0, maintenance: 0, lifespan: 0, ecoFriendly: 0, aesthetics: 0 });

    const expensiveScore = computeWeightedScore(expensive.scores, costWeights, expensive.costPerUnit.avg);
    const cheapScore = computeWeightedScore(cheap.scores, costWeights, cheap.costPerUnit.avg);
    expect(cheapScore).toBeGreaterThan(expensiveScore);
  });

  it("handles all-zero weights gracefully", () => {
    const mat = makeMaterial();
    const zeroWeights = makeWeights({ cost: 0, durability: 0, maintenance: 0, lifespan: 0, ecoFriendly: 0, aesthetics: 0 });
    const score = computeWeightedScore(mat.scores, zeroWeights, mat.costPerUnit.avg);
    expect(score).toBe(50);
  });

  it("increases durability dimension score when durability weight is raised", () => {
    const mat = makeMaterial();
    const baseScore = computeWeightedScore(mat.scores, getDefaultWeights(), mat.costPerUnit.avg);
    const durWeights = makeWeights({ durability: 100, cost: 0, maintenance: 0, lifespan: 0, ecoFriendly: 0, aesthetics: 0 });
    const durScore = computeWeightedScore(mat.scores, durWeights, mat.costPerUnit.avg);
    expect(durScore).toBe(mat.scores.durability / 10 * 100);
  });

  it("returns deterministic results for same inputs", () => {
    const mat = makeMaterial();
    const a = computeWeightedScore(mat.scores, getDefaultWeights(), mat.costPerUnit.avg);
    const b = computeWeightedScore(mat.scores, getDefaultWeights(), mat.costPerUnit.avg);
    expect(a).toBe(b);
  });
});

describe("computeLifecycleCost", () => {
  it("computes correct upfront cost", () => {
    const mat = makeMaterial({ costPerUnit: { min: 5, max: 15, avg: 10 } });
    const cost = computeLifecycleCost(mat, 200, 25);
    expect(cost.upfront).toBe(2000);
  });

  it("computes 25-year maintenance cost correctly", () => {
    const mat = makeMaterial({ maintenanceAnnualCostPerUnit: 0.10 });
    const cost = computeLifecycleCost(mat, 100, 25);
    expect(cost.maintenance).toBe(250);
  });

  it("computes replacement cost when lifespan < years", () => {
    const mat = makeMaterial({ lifespanYears: 10, replacementCostPerUnit: 8 });
    const cost = computeLifecycleCost(mat, 100, 25);
    expect(cost.replacement).toBe(1600);
  });

  it("handles lifespan > years (no replacement)", () => {
    const mat = makeMaterial({ lifespanYears: 50, replacementCostPerUnit: 100 });
    const cost = computeLifecycleCost(mat, 100, 25);
    expect(cost.replacement).toBe(0);
  });

  it("handles single sqft (minimum floor)", () => {
    const mat = makeMaterial({ costPerUnit: { min: 5, max: 15, avg: 10 } });
    const cost = computeLifecycleCost(mat, 0, 1);
    expect(cost.upfront).toBe(10);
  });

  it("total equals sum of upfront + maintenance + replacement", () => {
    const mat = makeMaterial({ lifespanYears: 10, maintenanceAnnualCostPerUnit: 0.20, costPerUnit: { min: 5, max: 15, avg: 10 }, replacementCostPerUnit: 10 });
    const cost = computeLifecycleCost(mat, 200, 25);
    expect(cost.total).toBeCloseTo(cost.upfront + cost.maintenance + cost.replacement, 2);
  });
});

describe("compareMaterials", () => {
  it("selects correct winner based on weighted scores", () => {
    const mat1 = makeMaterial({ id: "premium", scores: { durability: 10, waterResistance: 10, scratchResistance: 10, easeMaintenance: 10, ecoFriendly: 10, resaleValue: 10, warmthComfort: 10, soundAbsorption: 10, easeInstallation: 10 }, costPerUnit: { min: 5, max: 15, avg: 10 } });
    const mat2 = makeMaterial({ id: "budget", scores: { durability: 1, waterResistance: 1, scratchResistance: 1, easeMaintenance: 1, ecoFriendly: 1, resaleValue: 1, warmthComfort: 1, soundAbsorption: 1, easeInstallation: 1 }, costPerUnit: { min: 5, max: 15, avg: 10 } });
    const result = compareMaterials([mat1, mat2], getDefaultWeights(), 200);
    expect(result.winnerId).toBe("premium");
    expect(result.materials[0].winner).toBe(true);
  });

  it("changes winner when weights shift to cost", () => {
    const cheap = makeMaterial({ id: "cheap", costPerUnit: { min: 1, max: 3, avg: 2 }, scores: { durability: 3, waterResistance: 3, scratchResistance: 3, easeMaintenance: 3, ecoFriendly: 3, resaleValue: 3, warmthComfort: 3, soundAbsorption: 3, easeInstallation: 3 } });
    const expensive = makeMaterial({ id: "expensive", costPerUnit: { min: 50, max: 100, avg: 75 }, scores: { durability: 10, waterResistance: 10, scratchResistance: 10, easeMaintenance: 10, ecoFriendly: 10, resaleValue: 10, warmthComfort: 10, soundAbsorption: 10, easeInstallation: 10 } });
    const costWeights = makeWeights({ cost: 100, durability: 0, maintenance: 0, lifespan: 0, ecoFriendly: 0, aesthetics: 0 });
    const result = compareMaterials([cheap, expensive], costWeights, 200);
    expect(result.winnerId).toBe("cheap");
  });

  it("handles 3-material comparison", () => {
    const a = makeMaterial({ id: "a" });
    const b = makeMaterial({ id: "b" });
    const c = makeMaterial({ id: "c" });
    const result = compareMaterials([a, b, c], getDefaultWeights(), 200);
    expect(result.materials.length).toBe(3);
    expect(result.winnerId).toBeTruthy();
  });

  it("returns deterministic results for same inputs", () => {
    const a = makeMaterial({ id: "a" });
    const b = makeMaterial({ id: "b" });
    const r1 = compareMaterials([a, b], getDefaultWeights(), 200);
    const r2 = compareMaterials([a, b], getDefaultWeights(), 200);
    expect(r1.winnerId).toBe(r2.winnerId);
    expect(r1.recommendation).toBe(r2.recommendation);
  });

  it("handles single material gracefully", () => {
    const mat = makeMaterial();
    const result = compareMaterials([mat], getDefaultWeights(), 200);
    expect(result.materials.length).toBe(1);
    expect(result.materials[0].winner).toBe(true);
  });

  it("handles empty material array", () => {
    const result = compareMaterials([], getDefaultWeights(), 200);
    expect(result.materials.length).toBe(0);
    expect(result.winnerId).toBe("");
  });

  it("generates recommendation text with winner name", () => {
    const a = makeMaterial({ id: "alpha", name: "Alpha Material" });
    const b = makeMaterial({ id: "beta", name: "Beta Material" });
    const result = compareMaterials([a, b], getDefaultWeights(), 200);
    expect(result.recommendation).toContain(result.materials[0].materialName);
    expect(result.recommendation).toContain(result.materials[1].materialName);
  });
});

describe("URL encode/decode roundtrip", () => {
  it("roundtrips a full comparison state", () => {
    const state = { m1: "hardwood", m2: "laminate", sqft: 200 };
    const encoded = encodeComparisonState(state);
    const decoded = decodeComparisonState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.m1).toBe("hardwood");
    expect(decoded!.m2).toBe("laminate");
    expect(decoded!.sqft).toBe(200);
  });

  it("roundtrips with custom weights", () => {
    const state = { m1: "hardwood", m2: "vinyl", weights: { cost: 80, durability: 60 }, sqft: 300 };
    const encoded = encodeComparisonState(state);
    const decoded = decodeComparisonState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.weights.cost).toBe(80);
    expect(decoded!.weights.durability).toBe(60);
    expect(decoded!.sqft).toBe(300);
  });

  it("roundtrips without sqft", () => {
    const state = { m1: "quartz", m2: "granite" };
    const encoded = encodeComparisonState(state);
    const decoded = decodeComparisonState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.m1).toBe("quartz");
    expect(decoded!.m2).toBe("granite");
    expect(decoded!.sqft).toBeUndefined();
  });

  it("handles three materials", () => {
    const state = { m1: "a", m2: "b", m3: "c", sqft: 150 };
    const encoded = encodeComparisonState(state);
    const decoded = decodeComparisonState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.m3).toBe("c");
  });

  it("returns null for empty search string", () => {
    const decoded = decodeComparisonState("");
    expect(decoded).toBeNull();
  });

  it("returns null for missing m1", () => {
    const decoded = decodeComparisonState("m2=laminate");
    expect(decoded).toBeNull();
  });

  it("handles special characters in material IDs", () => {
    const state = { m1: "fiber-cement", m2: "metal-siding" };
    const encoded = encodeComparisonState(state);
    const decoded = decodeComparisonState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.m1).toBe("fiber-cement");
    expect(decoded!.m2).toBe("metal-siding");
  });

  it("returns default weights when no weights provided", () => {
    const state = { m1: "a", m2: "b" };
    const encoded = encodeComparisonState(state);
    const decoded = decodeComparisonState(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.weights).toEqual(getDefaultWeights());
  });
});

describe("loadComparisonData", () => {
  it("loads all 5 categories", () => {
    const data = getMaterialsByCategory("flooring");
    expect(data.length).toBeGreaterThanOrEqual(5);
  });

  it("flooring has hardwood", () => {
    const mats = getMaterialsByCategory("flooring");
    const found = mats.find((m) => m.id === "hardwood");
    expect(found).toBeDefined();
    expect(found!.name).toBe("Solid Hardwood");
  });

  it("countertops has quartz", () => {
    const mats = getMaterialsByCategory("countertops");
    const found = mats.find((m) => m.id === "quartz");
    expect(found).toBeDefined();
    expect(found!.costPerUnit.avg).toBe(75);
  });

  it("returns empty array for invalid category", () => {
    const mats = getMaterialsByCategory("invalid" as any);
    expect(mats).toEqual([]);
  });
});

describe("getPairs", () => {
  it("generates C(3,2) = 3 pairs for 3 materials", () => {
    const mats = [
      makeMaterial({ id: "a" }),
      makeMaterial({ id: "b" }),
      makeMaterial({ id: "c" }),
    ];
    const pairs = getPairs(mats);
    expect(pairs.length).toBe(3);
  });

  it("generates C(7,2) = 21 pairs for 7 materials", () => {
    const mats = getMaterialsByCategory("flooring");
    const pairs = getPairs(mats);
    expect(pairs.length).toBe(21);
  });

  it("each pair contains two distinct materials", () => {
    const mats = [makeMaterial({ id: "a" }), makeMaterial({ id: "b" }), makeMaterial({ id: "c" })];
    const pairs = getPairs(mats);
    for (const [a, b] of pairs) {
      expect(a.id).not.toBe(b.id);
    }
  });
});

describe("parsePairSlug", () => {
  it("parses hardwood-vs-laminate", () => {
    const result = parsePairSlug("hardwood-vs-laminate");
    expect(result).not.toBeNull();
    expect(result![0]).toBe("hardwood");
    expect(result![1]).toBe("laminate");
  });

  it("parses fiber-cement-vs-metal-siding", () => {
    const result = parsePairSlug("fiber-cement-vs-metal-siding");
    expect(result).not.toBeNull();
    expect(result![0]).toBe("fiber-cement");
    expect(result![1]).toBe("metal-siding");
  });

  it("returns null for invalid slug", () => {
    expect(parsePairSlug("notavalidslug")).toBeNull();
    expect(parsePairSlug("justordinarytext")).toBeNull();
  });
});

describe("parseSizeSlug", () => {
  it("parses 200-sqft", () => {
    expect(parseSizeSlug("200-sqft")).toBe(200);
  });

  it("parses 12x12 dimension", () => {
    expect(parseSizeSlug("12x12")).toBe(144);
  });

  it("returns undefined for missing slug", () => {
    expect(parseSizeSlug(undefined)).toBeUndefined();
  });

  it("returns undefined for invalid slug", () => {
    expect(parseSizeSlug("big-room")).toBeUndefined();
  });
});

describe("Real data integration: flooring comparison", () => {
  it("luxury vinyl beats hardwood on cost-heavy weights", () => {
    const mats = getMaterialsByCategory("flooring");
    const hardwood = mats.find((m) => m.id === "hardwood")!;
    const lvp = mats.find((m) => m.id === "luxury-vinyl")!;
    const weights = makeWeights({ cost: 80, durability: 60, maintenance: 50, lifespan: 40, ecoFriendly: 20, aesthetics: 30 });
    const result = compareMaterials([hardwood, lvp], weights, 200);
    expect(result.materials.length).toBe(2);
    expect(result.materials[0].totalScore).toBeGreaterThanOrEqual(0);
  });

  it("hardwood beats laminate on resale-heavy weights", () => {
    const mats = getMaterialsByCategory("flooring");
    const hardwood = mats.find((m) => m.id === "hardwood")!;
    const laminate = mats.find((m) => m.id === "laminate")!;
    const weights = makeWeights({ aesthetics: 100, cost: 0, durability: 0, maintenance: 0, lifespan: 0, ecoFriendly: 0 });
    const result = compareMaterials([hardwood, laminate], weights, 200);
    expect(result.materials[0].materialId).toBe("hardwood");
  });
});
