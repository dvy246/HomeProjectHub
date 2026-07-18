// src/lib/renovationLoanEngine.ts

export type LoanType = "203k-standard" | "203k-limited" | "homestyle";

export interface RenovationLoanInput {
  purchasePrice: number;
  renovationBudget: number;
  loanType: LoanType;
  interestRate: number; // annual percentage e.g. 6.5
  termYears: number; // e.g. 30
  downPaymentPercent: number; // e.g. 3.5
}

export interface RenovationLoanOutput {
  totalLoanAmount: number;
  baseMonthlyPayment: number;
  pmiEstimate: number;
  monthlyPITI: number;
  breakdown: {
    basePurchasePrice: number;
    renoCost: number;
    contingencyReserve: number;
    fees: number;
    totalCost: number;
  };
  warnings: string[];
}

export function calculateRenovationLoan(input: RenovationLoanInput): RenovationLoanOutput {
  const { purchasePrice, renovationBudget, loanType, interestRate, termYears, downPaymentPercent } = input;
  
  let contingencyReserve = 0;
  let fees = 0;
  const warnings: string[] = [];
  
  if (loanType === "203k-limited") {
    contingencyReserve = renovationBudget * 0.15; // 15% safety
    if (renovationBudget > 35000) {
      warnings.push("Limited 203k renovation budget is capped at $35,000. Your budget exceeds this limit.");
    }
  } else if (loanType === "203k-standard") {
    contingencyReserve = renovationBudget * 0.15;
    // Standard requires HUD consultant
    if (renovationBudget < 7500) fees += 400;
    else if (renovationBudget < 15000) fees += 500;
    else if (renovationBudget < 30000) fees += 600;
    else if (renovationBudget < 50000) fees += 700;
    else if (renovationBudget < 75000) fees += 800;
    else if (renovationBudget < 100000) fees += 900;
    else fees += 1000;
  } else if (loanType === "homestyle") {
    contingencyReserve = renovationBudget * 0.10; // usually 10%
  }
  
  const totalCost = purchasePrice + renovationBudget + contingencyReserve + fees;
  const downPaymentAmount = totalCost * (downPaymentPercent / 100);
  const totalLoanAmount = totalCost - downPaymentAmount;
  
  const monthlyInterest = (interestRate / 100) / 12;
  const numPayments = termYears * 12;
  
  let baseMonthlyPayment = 0;
  if (monthlyInterest === 0) {
    if (numPayments > 0) baseMonthlyPayment = totalLoanAmount / numPayments;
  } else {
    baseMonthlyPayment = totalLoanAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, numPayments)) / (Math.pow(1 + monthlyInterest, numPayments) - 1);
  }
  
  // Rough PMI estimate
  let pmiEstimate = 0;
  if (downPaymentPercent < 20) {
    pmiEstimate = (totalLoanAmount * 0.0085) / 12; // average 0.85% annual PMI
  }
  
  // Rough Taxes/Insurance estimate (assume 1.2% tax, 0.5% insurance annually on purchase price)
  const estimatedTaxes = (purchasePrice * 0.012) / 12;
  const estimatedInsurance = (purchasePrice * 0.005) / 12;
  const monthlyPITI = baseMonthlyPayment + pmiEstimate + estimatedTaxes + estimatedInsurance;
  
  return {
    totalLoanAmount,
    baseMonthlyPayment,
    pmiEstimate,
    monthlyPITI,
    breakdown: {
      basePurchasePrice: purchasePrice,
      renoCost: renovationBudget,
      contingencyReserve,
      fees,
      totalCost,
    },
    warnings
  };
}
