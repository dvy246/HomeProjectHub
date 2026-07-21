// ─── Contractor Quote Comparison Engine ─────────────────────────────────────
// Pure functions only. No React, no DOM. Fully deterministic.
// All monetary values are in USD. No data is sent to any server.
// This tool is for planning purposes only — see disclaimer.

export type ProjectCategory =
  | "roofing"
  | "hvac"
  | "bathroom"
  | "kitchen"
  | "flooring"
  | "windows_doors"
  | "siding"
  | "deck_patio"
  | "fence"
  | "painting"
  | "electrical"
  | "plumbing"
  | "foundation"
  | "landscaping"
  | "other";

export type NormalizationUnit = "per_sqft" | "per_linear_ft" | "lump_sum";

export interface LineItem {
  key: string;
  label: string;
  required: boolean; // whether omitting this is a red flag
}

export interface ContractorBid {
  name: string;             // e.g. "ABC Roofing"
  totalBid: number;         // total quoted price in USD
  laborCost: number;
  materialCost: number;
  permitCost: number;
  disposalCost: number;
  warrantyCost: number;     // 0 if no warranty included
  cleanupIncluded: boolean;
  permitIncluded: boolean;
  warrantyYears: number;    // 0 = no warranty
  notes: string;
}

export interface QuoteComparisonInput {
  projectCategory: ProjectCategory;
  projectArea: number;        // sq ft (or linear ft for fence) — 0 if not applicable
  normalizationUnit: NormalizationUnit;
  bids: [ContractorBid, ContractorBid, ContractorBid];
}

export interface BidAnalysis {
  bidIndex: number;            // 0, 1, 2
  contractorName: string;
  totalBid: number;
  normalizedCostPerUnit: number;  // per sqft/lf or lump sum
  scopeGaps: string[];            // missing line items others included
  redFlags: RedFlag[];
  trustScore: number;             // 0–100
  rank: 1 | 2 | 3;
  pctFromMedian: number;          // positive = above median, negative = below
  savings: number;                // vs most expensive bid
}

export interface RedFlag {
  severity: "warning" | "critical";
  message: string;
}

export interface QuoteComparisonOutput {
  medianBid: number;
  lowestBid: number;
  highestBid: number;
  bidRange: number;
  bidRangePct: number;           // range as % of median
  analyses: [BidAnalysis, BidAnalysis, BidAnalysis];
  recommendedBidIndex: number | null;  // null if no clear winner
  summaryVerdict: string;
  isLowballRisk: boolean;        // any bid > LOW_BALL_THRESHOLD below median
  isPriceGougingRisk: boolean;   // any bid > PRICE_GOUGE_THRESHOLD above median
}

// ─── Thresholds (industry-standard heuristics) ────────────────────────────
const LOWBALL_THRESHOLD = 0.25;    // > 25% below median = lowball risk
const GOUGE_THRESHOLD   = 0.30;    // > 30% above median = overpriced risk
const MIN_WARRANTY_YEARS_MATERIAL = 1; // flag if no material warranty on major jobs

const MAJOR_PROJECT_CATEGORIES: Set<ProjectCategory> = new Set([
  "roofing", "hvac", "bathroom", "kitchen", "foundation", "electrical", "plumbing"
]);

// ─── Required line items per category ──────────────────────────────────────
const REQUIRED_LINE_ITEMS: Record<ProjectCategory, string[]> = {
  roofing:        ["labor", "materials", "disposal", "permits"],
  hvac:           ["labor", "materials", "permits"],
  bathroom:       ["labor", "materials", "permits", "disposal"],
  kitchen:        ["labor", "materials", "permits", "disposal"],
  flooring:       ["labor", "materials"],
  windows_doors:  ["labor", "materials"],
  siding:         ["labor", "materials", "disposal"],
  deck_patio:     ["labor", "materials", "permits"],
  fence:          ["labor", "materials"],
  painting:       ["labor", "materials"],
  electrical:     ["labor", "materials", "permits"],
  plumbing:       ["labor", "materials", "permits"],
  foundation:     ["labor", "materials", "permits", "disposal"],
  landscaping:    ["labor", "materials"],
  other:          ["labor", "materials"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function median(a: number, b: number, c: number): number {
  return [a, b, c].sort((x, y) => x - y)[1];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Detect scope gaps in a bid by comparing what other bids included.
 * Returns human-readable descriptions of missing items.
 */
function detectScopeGaps(
  bid: ContractorBid,
  others: ContractorBid[],
  category: ProjectCategory
): string[] {
  const gaps: string[] = [];

  // Permit: others included it but this bid has no permitCost and permitIncluded=false
  const otherPermitAvg = others.reduce((s, b) => s + b.permitCost, 0) / others.length;
  if (!bid.permitIncluded && bid.permitCost === 0 && otherPermitAvg > 50) {
    gaps.push("Permit costs not included — verify who pulls the permit and who pays");
  }

  // Disposal: others included disposal cost
  const otherDisposalAvg = others.reduce((s, b) => s + b.disposalCost, 0) / others.length;
  if (bid.disposalCost === 0 && otherDisposalAvg > 100) {
    gaps.push("Disposal / debris removal not included — ask who hauls away old materials");
  }

  // Cleanup
  const othersIncludeCleanup = others.filter(b => b.cleanupIncluded).length;
  if (!bid.cleanupIncluded && othersIncludeCleanup >= 1) {
    gaps.push("Site cleanup not included — confirm post-project cleanup responsibility");
  }

  // Warranty: major project and no warranty
  if (MAJOR_PROJECT_CATEGORIES.has(category)) {
    if (bid.warrantyYears < MIN_WARRANTY_YEARS_MATERIAL) {
      const otherWarrantyAvg = others.reduce((s, b) => s + b.warrantyYears, 0) / others.length;
      if (otherWarrantyAvg >= 1) {
        gaps.push(`No workmanship warranty included — others offer ${Math.round(otherWarrantyAvg)} yr avg`);
      }
    }
  }

  return gaps;
}

/**
 * Detect red flags specific to a bid: extreme pricing, missing critical scope.
 */
function detectRedFlags(
  bid: ContractorBid,
  medianPrice: number,
  category: ProjectCategory,
  allBids: ContractorBid[]
): RedFlag[] {
  const flags: RedFlag[] = [];

  const pctFromMedian = medianPrice > 0 ? (bid.totalBid - medianPrice) / medianPrice : 0;

  // Lowball risk
  if (pctFromMedian < -LOWBALL_THRESHOLD) {
    flags.push({
      severity: "critical",
      message: `Bid is ${Math.abs(Math.round(pctFromMedian * 100))}% below median — very low bids may indicate missing scope, cut-rate materials, or unlicensed work`,
    });
  }

  // Price gouging risk
  if (pctFromMedian > GOUGE_THRESHOLD) {
    flags.push({
      severity: "warning",
      message: `Bid is ${Math.round(pctFromMedian * 100)}% above median — ask for itemized breakdown to justify premium pricing`,
    });
  }

  // Zero labor (unusual — materials-only quote may hide sub-contractor costs)
  if (bid.laborCost === 0 && bid.totalBid > 500) {
    flags.push({
      severity: "warning",
      message: "No labor cost listed — confirm labor is included or quoted separately",
    });
  }

  // Zero materials on a major project
  if (bid.materialCost === 0 && MAJOR_PROJECT_CATEGORIES.has(category) && bid.totalBid > 500) {
    flags.push({
      severity: "warning",
      message: "No material cost listed — confirm materials are included or if this is labor-only",
    });
  }

  // Missing permits on a required-permit project
  const permitRequiredCategories: Set<ProjectCategory> = new Set([
    "roofing", "hvac", "bathroom", "kitchen", "electrical", "plumbing", "foundation", "deck_patio"
  ]);
  if (permitRequiredCategories.has(category) && !bid.permitIncluded && bid.permitCost === 0) {
    flags.push({
      severity: "warning",
      message: "Permits likely required for this project type — confirm who pulls permits and who pays fees",
    });
  }

  return flags;
}

/**
 * Compute a 0–100 trust score based on transparency and completeness.
 * Higher = more trustworthy bid (NOT a price endorsement).
 */
function computeTrustScore(
  bid: ContractorBid,
  scopeGaps: string[],
  redFlags: RedFlag[],
  medianPrice: number
): number {
  let score = 100;

  // Deduct for each scope gap
  score -= scopeGaps.length * 12;

  // Deduct for red flags
  for (const flag of redFlags) {
    score -= flag.severity === "critical" ? 25 : 12;
  }

  // Deduct for missing itemization (labor=0 AND materials=0)
  const hasItemization = bid.laborCost > 0 || bid.materialCost > 0;
  if (!hasItemization) score -= 20;

  // Reward warranty
  if (bid.warrantyYears >= 2) score += 10;
  else if (bid.warrantyYears >= 1) score += 5;

  // Reward cleanup
  if (bid.cleanupIncluded) score += 5;

  // Reward permit inclusion
  if (bid.permitIncluded) score += 5;

  return clamp(Math.round(score), 0, 100);
}

// ─── Main comparison function ──────────────────────────────────────────────
export function compareContractorQuotes(input: QuoteComparisonInput): QuoteComparisonOutput {
  const [b0, b1, b2] = input.bids;
  const totals = [b0.totalBid, b1.totalBid, b2.totalBid];
  const allNonZero = totals.every(t => t > 0);

  const lowestBid  = Math.min(...totals);
  const highestBid = Math.max(...totals);
  const medianBid  = median(totals[0], totals[1], totals[2]);
  const bidRange   = highestBid - lowestBid;
  const bidRangePct = medianBid > 0 ? round2((bidRange / medianBid) * 100) : 0;

  const analyses: BidAnalysis[] = input.bids.map((bid, i) => {
    const others = input.bids.filter((_, j) => j !== i);
    const scopeGaps = detectScopeGaps(bid, others, input.projectCategory);
    const redFlags  = detectRedFlags(bid, medianBid, input.projectCategory, [...input.bids]);
    const trustScore = computeTrustScore(bid, scopeGaps, redFlags, medianBid);

    const pctFromMedian = medianBid > 0 ? round2(((bid.totalBid - medianBid) / medianBid) * 100) : 0;

    const area = input.projectArea > 0 ? input.projectArea : 1;
    const normalizedCostPerUnit = input.normalizationUnit !== "lump_sum" && area > 0
      ? round2(bid.totalBid / area)
      : bid.totalBid;

    const savings = round2(highestBid - bid.totalBid);

    return {
      bidIndex: i,
      contractorName: bid.name || `Contractor ${i + 1}`,
      totalBid: bid.totalBid,
      normalizedCostPerUnit,
      scopeGaps,
      redFlags,
      trustScore,
      rank: 1 as 1 | 2 | 3, // placeholder — computed below
      pctFromMedian,
      savings,
    };
  });

  // Rank: 1 = best trust score (ties broken by closer to median)
  const sorted = [...analyses].sort((a, b) => {
    if (b.trustScore !== a.trustScore) return b.trustScore - a.trustScore;
    return Math.abs(a.pctFromMedian) - Math.abs(b.pctFromMedian);
  });
  sorted.forEach((a, rank) => { a.rank = (rank + 1) as 1 | 2 | 3; });

  const isLowballRisk  = analyses.some(a => a.pctFromMedian < -(LOWBALL_THRESHOLD * 100));
  const isPriceGougingRisk = analyses.some(a => a.pctFromMedian > (GOUGE_THRESHOLD * 100));

  // Recommended bid: highest trust score with no critical flags and close to median
  const eligible = [...analyses]
    .filter(a => !a.redFlags.some(f => f.severity === "critical"))
    .sort((a, b) => {
      if (b.trustScore !== a.trustScore) return b.trustScore - a.trustScore;
      return Math.abs(a.pctFromMedian) - Math.abs(b.pctFromMedian);
    });

  const recommendedBidIndex = eligible.length > 0 ? eligible[0].bidIndex : null;

  // Summary verdict
  let summaryVerdict: string;
  if (!allNonZero) {
    summaryVerdict = "Enter all three bid totals to see the full comparison.";
  } else if (bidRangePct > 60) {
    summaryVerdict = `Bids vary by ${bidRangePct}% — very high spread suggests scopes differ significantly. Request itemized breakdowns from all contractors before deciding.`;
  } else if (bidRangePct > 30) {
    summaryVerdict = `Bids vary by ${bidRangePct}% — moderate spread is normal. Review scope gaps flagged below to confirm you're comparing equal scopes.`;
  } else {
    summaryVerdict = `Bids are within ${bidRangePct}% of each other — competitive pricing. Focus on contractor reputation, warranty, and permit inclusion.`;
  }

  return {
    medianBid: round2(medianBid),
    lowestBid: round2(lowestBid),
    highestBid: round2(highestBid),
    bidRange: round2(bidRange),
    bidRangePct,
    analyses: analyses as [BidAnalysis, BidAnalysis, BidAnalysis],
    recommendedBidIndex,
    summaryVerdict,
    isLowballRisk,
    isPriceGougingRisk,
  };
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  roofing:       "Roofing",
  hvac:          "HVAC / Heat Pump",
  bathroom:      "Bathroom Remodel",
  kitchen:       "Kitchen Remodel",
  flooring:      "Flooring Installation",
  windows_doors: "Windows & Doors",
  siding:        "Siding / Exterior",
  deck_patio:    "Deck / Patio",
  fence:         "Fence Installation",
  painting:      "Interior / Exterior Paint",
  electrical:    "Electrical",
  plumbing:      "Plumbing",
  foundation:    "Foundation / Structural",
  landscaping:   "Landscaping / Hardscape",
  other:         "Other Home Project",
};

export const PROJECT_CATEGORIES: ProjectCategory[] = Object.keys(PROJECT_CATEGORY_LABELS) as ProjectCategory[];

export const NORMALIZATION_UNIT_LABELS: Record<NormalizationUnit, string> = {
  per_sqft:      "per sq ft",
  per_linear_ft: "per linear ft",
  lump_sum:      "lump sum",
};
