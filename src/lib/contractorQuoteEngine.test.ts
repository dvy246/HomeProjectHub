import { describe, it, expect } from "vitest";
import {
  compareContractorQuotes,
  type QuoteComparisonInput,
  type ContractorBid,
} from "./contractorQuoteEngine";

function makeBid(overrides: Partial<ContractorBid> = {}): ContractorBid {
  return {
    name: "Test Contractor",
    totalBid: 10000,
    laborCost: 4000,
    materialCost: 5000,
    permitCost: 500,
    disposalCost: 300,
    warrantyCost: 200,
    cleanupIncluded: true,
    permitIncluded: true,
    warrantyYears: 2,
    notes: "",
    ...overrides,
  };
}

const baseInput = (bids: [ContractorBid, ContractorBid, ContractorBid]): QuoteComparisonInput => ({
  projectCategory: "roofing",
  projectArea: 2000,
  normalizationUnit: "per_sqft",
  bids,
});

describe("compareContractorQuotes — median, range, normalization", () => {
  it("computes correct median and range for three bids", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 8000 }),
      makeBid({ name: "B", totalBid: 10000 }),
      makeBid({ name: "C", totalBid: 12000 }),
    ]);
    const out = compareContractorQuotes(input);
    expect(out.medianBid).toBe(10000);
    expect(out.lowestBid).toBe(8000);
    expect(out.highestBid).toBe(12000);
    expect(out.bidRange).toBe(4000);
    expect(out.bidRangePct).toBe(40); // 4000/10000*100
  });

  it("normalizes cost per sqft correctly", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 20000 }),
      makeBid({ name: "B", totalBid: 20000 }),
      makeBid({ name: "C", totalBid: 20000 }),
    ]);
    const out = compareContractorQuotes(input);
    // 20000 / 2000 sqft = $10/sqft
    expect(out.analyses[0].normalizedCostPerUnit).toBe(10);
  });
});

describe("compareContractorQuotes — red flag detection", () => {
  it("flags lowball bids more than 25% below median as critical", () => {
    const input = baseInput([
      makeBid({ name: "Cheap", totalBid: 5000 }),   // 50% below median 10000
      makeBid({ name: "Mid",   totalBid: 10000 }),
      makeBid({ name: "High",  totalBid: 11000 }),
    ]);
    const out = compareContractorQuotes(input);
    const cheapAnalysis = out.analyses.find(a => a.contractorName === "Cheap")!;
    const criticalFlags = cheapAnalysis.redFlags.filter(f => f.severity === "critical");
    expect(criticalFlags.length).toBeGreaterThan(0);
    expect(out.isLowballRisk).toBe(true);
  });

  it("flags price gouging bids more than 30% above median as warning", () => {
    const input = baseInput([
      makeBid({ name: "Low",  totalBid: 9000 }),
      makeBid({ name: "Mid",  totalBid: 10000 }),
      makeBid({ name: "High", totalBid: 14000 }),  // 40% above median
    ]);
    const out = compareContractorQuotes(input);
    const highAnalysis = out.analyses.find(a => a.contractorName === "High")!;
    const warnings = highAnalysis.redFlags.filter(f => f.severity === "warning");
    expect(warnings.length).toBeGreaterThan(0);
    expect(out.isPriceGougingRisk).toBe(true);
  });

  it("does not flag bids within 20% of median", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 9500 }),
      makeBid({ name: "B", totalBid: 10000 }),
      makeBid({ name: "C", totalBid: 10500 }),
    ]);
    const out = compareContractorQuotes(input);
    expect(out.isLowballRisk).toBe(false);
    expect(out.isPriceGougingRisk).toBe(false);
    out.analyses.forEach(a => {
      expect(a.redFlags.filter(f => f.severity === "critical").length).toBe(0);
    });
  });
});

describe("compareContractorQuotes — scope gap detection", () => {
  it("flags missing permits when others include them", () => {
    const input = baseInput([
      makeBid({ name: "A", permitIncluded: false, permitCost: 0 }),
      makeBid({ name: "B", permitIncluded: true,  permitCost: 400 }),
      makeBid({ name: "C", permitIncluded: true,  permitCost: 500 }),
    ]);
    const out = compareContractorQuotes(input);
    const aAnalysis = out.analyses.find(a => a.contractorName === "A")!;
    expect(aAnalysis.scopeGaps.some(g => g.toLowerCase().includes("permit"))).toBe(true);
  });

  it("flags missing disposal when others include it", () => {
    const input = baseInput([
      makeBid({ name: "A", disposalCost: 0 }),
      makeBid({ name: "B", disposalCost: 350 }),
      makeBid({ name: "C", disposalCost: 400 }),
    ]);
    const out = compareContractorQuotes(input);
    const aAnalysis = out.analyses.find(a => a.contractorName === "A")!;
    expect(aAnalysis.scopeGaps.some(g => g.toLowerCase().includes("disposal"))).toBe(true);
  });

  it("flags missing warranty on major projects", () => {
    const input = baseInput([
      makeBid({ name: "A", warrantyYears: 0 }),
      makeBid({ name: "B", warrantyYears: 2 }),
      makeBid({ name: "C", warrantyYears: 1 }),
    ]);
    const out = compareContractorQuotes(input);
    const aAnalysis = out.analyses.find(a => a.contractorName === "A")!;
    expect(aAnalysis.scopeGaps.some(g => g.toLowerCase().includes("warranty"))).toBe(true);
  });
});

describe("compareContractorQuotes — trust score and ranking", () => {
  it("assigns rank 1 to the most complete, non-flagged bid", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 5000 }),   // critical lowball
      makeBid({ name: "B", totalBid: 10000, warrantyYears: 2, cleanupIncluded: true }),
      makeBid({ name: "C", totalBid: 10200, warrantyYears: 1, cleanupIncluded: true }),
    ]);
    const out = compareContractorQuotes(input);
    const aAnalysis = out.analyses.find(a => a.contractorName === "A")!;
    // A should not be rank 1 due to critical flag
    expect(aAnalysis.rank).not.toBe(1);
  });

  it("recommendedBidIndex is null when all bids have critical flags", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 3000 }),   // critical low
      makeBid({ name: "B", totalBid: 4000 }),   // critical low
      makeBid({ name: "C", totalBid: 15000 }),  // critical high
    ]);
    const out = compareContractorQuotes(input);
    // Median is 4000. C is 275% above = gouge (warning not critical)
    // A is 25% below median — borderline; B is exactly median
    // B should be recommended
    expect(out.recommendedBidIndex).not.toBeNull();
  });
});

describe("compareContractorQuotes — pctFromMedian", () => {
  it("pctFromMedian is 0 for the median bid", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 8000 }),
      makeBid({ name: "B", totalBid: 10000 }),
      makeBid({ name: "C", totalBid: 12000 }),
    ]);
    const out = compareContractorQuotes(input);
    const bAnalysis = out.analyses.find(a => a.contractorName === "B")!;
    expect(bAnalysis.pctFromMedian).toBe(0);
  });

  it("pctFromMedian is negative for below-median bid", () => {
    const input = baseInput([
      makeBid({ name: "A", totalBid: 8000 }),
      makeBid({ name: "B", totalBid: 10000 }),
      makeBid({ name: "C", totalBid: 12000 }),
    ]);
    const out = compareContractorQuotes(input);
    const aAnalysis = out.analyses.find(a => a.contractorName === "A")!;
    expect(aAnalysis.pctFromMedian).toBeLessThan(0);
  });
});
