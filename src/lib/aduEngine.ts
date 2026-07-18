export type ADUType = "detached" | "attached" | "garage-conversion" | "above-garage";
export type QualityTier = "economy" | "standard" | "luxury";

export interface ADUInput {
  aduType: ADUType;
  areaSqFt: number;
  qualityTier: QualityTier;
  selfBuild: boolean;
  monthlyRentEstimate: number;
}

export interface ADUResult {
  totalConstructionCost: number;
  utilityCost: number;
  permitCost: number;
  grandTotalProjectCost: number;
  monthlyRentIncome: number;
  annualNetCashFlow: number;
  paybackPeriodYears: number;
  netROIPercentage: number;
}

export function calculateADU(input: ADUInput): ADUResult {
  const { aduType, areaSqFt, qualityTier, selfBuild, monthlyRentEstimate } = input;

  let baseCostPerSqFt = 0;
  let utilityCost = 0;
  let permitCost = 0;

  switch (aduType) {
    case "detached":
      baseCostPerSqFt = 350; // Average of $250 - $450
      utilityCost = 10000;
      permitCost = 5000;
      break;
    case "attached":
      baseCostPerSqFt = 275; // Average of $200 - $350
      utilityCost = 7500;
      permitCost = 4000;
      break;
    case "garage-conversion":
      baseCostPerSqFt = 170; // Average of $120 - $220
      utilityCost = 5000;
      permitCost = 2500;
      break;
    case "above-garage":
      baseCostPerSqFt = 300; // Average of $220 - $380
      utilityCost = 8000;
      permitCost = 4500;
      break;
    default:
      baseCostPerSqFt = 300;
      utilityCost = 7500;
      permitCost = 4000;
  }

  let qualityFactor = 1.0;
  if (qualityTier === "economy") qualityFactor = 0.85;
  if (qualityTier === "luxury") qualityFactor = 1.3;

  const baseConstructionCost = areaSqFt * baseCostPerSqFt * qualityFactor;
  
  // Assume labor is 50% of construction cost. Self-build saves 20% on labor.
  const laborCost = baseConstructionCost * 0.5;
  const materialsCost = baseConstructionCost * 0.5;
  const finalLaborCost = selfBuild ? laborCost * 0.8 : laborCost;

  const totalConstructionCost = materialsCost + finalLaborCost;
  const grandTotalProjectCost = totalConstructionCost + utilityCost + permitCost;

  const monthlyRentIncome = monthlyRentEstimate;
  const annualRentIncome = monthlyRentEstimate * 12;
  
  // 2% estimated annual maintenance/insurance reserves of property cost
  const annualMaintenance = grandTotalProjectCost * 0.02;
  const annualNetCashFlow = annualRentIncome - annualMaintenance;

  const paybackPeriodYears = annualNetCashFlow > 0 ? grandTotalProjectCost / annualNetCashFlow : 0;
  const netROIPercentage = grandTotalProjectCost > 0 ? (annualNetCashFlow / grandTotalProjectCost) * 100 : 0;

  return {
    totalConstructionCost,
    utilityCost,
    permitCost,
    grandTotalProjectCost,
    monthlyRentIncome,
    annualNetCashFlow,
    paybackPeriodYears,
    netROIPercentage
  };
}
