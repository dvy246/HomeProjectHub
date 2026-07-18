export type ProjectCategory =
  | "addition"
  | "deck"
  | "electrical"
  | "plumbing"
  | "hvac"
  | "remodel"
  | "structural";

export interface PermitEstimateParams {
  projectCategory: ProjectCategory;
  projectValuation: number;
}

export interface PermitEstimateResult {
  basePermitFee: number;
  planReviewFee: number;
  surcharges: number;
  totalPermitCost: number;
  estimatedReviewDays: string;
  requiredDocuments: string[];
}

export function calculatePermitCost(
  params: PermitEstimateParams
): PermitEstimateResult {
  const { projectCategory, projectValuation } = params;

  let basePermitFee = 0;
  let hasPlanReview = true;
  let estimatedReviewDays = "";
  let requiredDocuments: string[] = [];

  switch (projectCategory) {
    case "addition":
      basePermitFee = 400 + 0.0075 * projectValuation;
      estimatedReviewDays = "15-30 days";
      requiredDocuments = [
        "Architectural drawings",
        "Site layout",
        "Engineering specs for structural additions",
        "Zoning approval",
      ];
      break;
    case "deck":
      basePermitFee = 150 + 0.005 * projectValuation;
      estimatedReviewDays = "10-20 days";
      requiredDocuments = [
        "Site layout",
        "Deck framing plan",
        "Footing details",
      ];
      break;
    case "electrical":
      basePermitFee = 100;
      hasPlanReview = false;
      estimatedReviewDays = "1-3 days";
      requiredDocuments = ["Electrical panel load calculations (if upgrading)"];
      break;
    case "plumbing":
      basePermitFee = 100;
      hasPlanReview = false;
      estimatedReviewDays = "1-3 days";
      requiredDocuments = ["Plumbing isometric (if major changes)"];
      break;
    case "hvac":
      basePermitFee = 120;
      hasPlanReview = false;
      estimatedReviewDays = "1-3 days";
      requiredDocuments = ["HVAC load calcs", "Equipment specifications"];
      break;
    case "remodel":
      basePermitFee = 250 + 0.006 * projectValuation;
      estimatedReviewDays = "10-21 days";
      requiredDocuments = ["Architectural drawings", "Floor plan"];
      break;
    case "structural":
      basePermitFee = 350 + 0.008 * projectValuation;
      estimatedReviewDays = "14-28 days";
      requiredDocuments = ["Engineering specs", "Architectural drawings"];
      break;
    default:
      break;
  }

  const planReviewFee = hasPlanReview ? 0.65 * basePermitFee : 0;
  const surcharges = 0.0005 * projectValuation; // 0.05% of valuation

  const totalPermitCost = basePermitFee + planReviewFee + surcharges;

  return {
    basePermitFee,
    planReviewFee,
    surcharges,
    totalPermitCost,
    estimatedReviewDays,
    requiredDocuments,
  };
}
