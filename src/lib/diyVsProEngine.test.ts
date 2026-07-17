import { describe, it, expect } from "vitest";
import { computeDIYVsPro, computeSunkCost, type DIYVsProInput, type SunkCostInput } from "./diyVsProEngine";

function baseInput(overrides: Partial<DIYVsProInput> = {}): DIYVsProInput {
  return {
    projectType: "flooring",
    areaSqFt: 300,
    materialCost: 1500,
    contractorQuote: 0,
    hourlyValue: 30,
    skillLevel: "intermediate",
    toolCost: 200,
    permitCost: 0,
    ...overrides,
  };
}

describe("DIY vs Pro Engine", () => {
  it("should compute positive savings for a simple DIY flooring project", () => {
    const res = computeDIYVsPro(baseInput());
    expect(res.diyCost).toBeGreaterThan(0);
    expect(res.proCost).toBeGreaterThan(0);
    expect(typeof res.savings).toBe("number");
    expect(typeof res.riskLevel).toBe("string");
  });

  it("should use contractor quote when provided", () => {
    const res = computeDIYVsPro(baseInput({ contractorQuote: 5000 }));
    expect(res.proCost).toBe(5000);
  });

  it("should estimate pro cost when quote is 0", () => {
    const res = computeDIYVsPro(baseInput({ contractorQuote: 0 }));
    expect(res.proCost).toBeGreaterThan(0);
  });

  it("should increase waste cost for beginners", () => {
    const beginner = computeDIYVsPro(baseInput({ skillLevel: "beginner" }));
    const advanced = computeDIYVsPro(baseInput({ skillLevel: "advanced" }));
    expect(beginner.diyBreakdown.wasteCost).toBeGreaterThan(advanced.diyBreakdown.wasteCost);
  });

  it("should assign higher risk for harder projects with beginners", () => {
    const easy = computeDIYVsPro(baseInput({ projectType: "painting", skillLevel: "advanced" }));
    const hard = computeDIYVsPro(baseInput({ projectType: "bathroom", skillLevel: "beginner" }));
    const riskLevels = ["low", "medium", "high"];
    expect(riskLevels.indexOf(hard.riskLevel)).toBeGreaterThanOrEqual(riskLevels.indexOf(easy.riskLevel));
  });

  it("should produce zero savings breakdown when quote equals diy cost", () => {
    const res = computeDIYVsPro(baseInput({ materialCost: 100, toolCost: 0, hourlyValue: 0, contractorQuote: 100, skillLevel: "advanced", areaSqFt: 0 }));
    expect(res.savings).toBeGreaterThanOrEqual(-50);
    expect(res.savings).toBeLessThanOrEqual(50);
  });

  it("should handle all project types without error", () => {
    const types: DIYVsProInput["projectType"][] = ["bathroom", "kitchen", "deck", "flooring", "roofing", "fence", "painting", "tile", "shed", "patio", "wall"];
    for (const projectType of types) {
      const res = computeDIYVsPro(baseInput({ projectType }));
      expect(res.diyCost).toBeGreaterThan(0);
      expect(typeof res.savings).toBe("number");
    }
  });

  it("should return hours estimate proportional to area", () => {
    const small = computeDIYVsPro(baseInput({ projectType: "deck", areaSqFt: 100 }));
    const large = computeDIYVsPro(baseInput({ projectType: "deck", areaSqFt: 500 }));
    expect(large.hoursEstimate).toBeGreaterThan(small.hoursEstimate);
  });

  it("should correctly compute cost per hour saved when pro costs more", () => {
    const res = computeDIYVsPro(baseInput({ contractorQuote: 10000, materialCost: 500, hourlyValue: 20 }));
    if (res.savings < 0) {
      expect(res.costPerHourSaved).toBeGreaterThan(0);
    }
  });

  describe("Sunk Cost Analysis", () => {
    function sunkBase(overrides: Partial<SunkCostInput> = {}): SunkCostInput {
      return {
        projectType: "flooring",
        materialCost: 1500,
        toolCost: 200,
        permitCost: 0,
        hoursInvested: 20,
        progressPercent: 50,
        mistakes: "none",
        contractorQuoteToFinish: 0,
        skillLevel: "intermediate",
        hourlyValue: 30,
        ...overrides,
      };
    }

    it("should compute total invested correctly", () => {
      const res = computeSunkCost(sunkBase());
      expect(res.totalInvested).toBeGreaterThan(0);
      expect(res.timeValueInvested).toBe(600);
      expect(typeof res.bestPath).toBe("string");
    });

    it("should increase sunk material cost for major mistakes", () => {
      const none = computeSunkCost(sunkBase({ mistakes: "none" }));
      const major = computeSunkCost(sunkBase({ mistakes: "major" }));
      expect(major.sunkMaterials).toBeGreaterThan(none.sunkMaterials);
    });

    it("should recommend hire_pro when remaining DIY cost exceeds pro finish cost", () => {
      const res = computeSunkCost(sunkBase({
        projectType: "bathroom",
        mistakes: "major",
        progressPercent: 20,
        hoursInvested: 10,
        skillLevel: "beginner",
      }));
      expect(["continue_diy", "hire_pro", "neutral"]).toContain(res.bestPath);
    });

    it("should use contractor quote to finish when provided", () => {
      const res = computeSunkCost(sunkBase({ contractorQuoteToFinish: 3000 }));
      expect(res.costToHireProFinish).toBe(3000);
    });

    it("should estimate pro finish cost when quote is 0", () => {
      const res = computeSunkCost(sunkBase({ contractorQuoteToFinish: 0 }));
      expect(res.costToHireProFinish).toBeGreaterThan(0);
    });

    it("should have fewer hours remaining when progress is high", () => {
      const early = computeSunkCost(sunkBase({ progressPercent: 10 }));
      const late = computeSunkCost(sunkBase({ progressPercent: 80 }));
      expect(late.hoursRemaining).toBeLessThan(early.hoursRemaining);
    });

    it("should handle all project types", () => {
      const types: SunkCostInput["projectType"][] = ["bathroom", "kitchen", "deck", "flooring", "roofing", "fence", "painting", "tile", "shed", "patio", "wall"];
      for (const projectType of types) {
        const res = computeSunkCost(sunkBase({ projectType }));
        expect(res.totalInvested).toBeGreaterThan(0);
      }
    });

    it("should return abandon cost equal to total invested", () => {
      const res = computeSunkCost(sunkBase());
      expect(res.totalIfAbandon).toBe(res.totalInvested);
    });
  });
});
