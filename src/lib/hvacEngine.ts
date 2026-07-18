export type ClimateZone = "cold" | "moderate" | "hot";
export type CurrentSystem = "gas-furnace-ac" | "electric-resistance-ac" | "heat-pump-old";
export type TargetSystem = "standard-ac-gas" | "high-efficiency-heat-pump";

export interface HVACInput {
  homeSqFt: number;
  climateZone: ClimateZone;
  currentSystem: CurrentSystem;
  targetSystem: TargetSystem;
  annualEnergyBill?: number; // fallback to default
}

export interface HVACResults {
  tonnageRequired: number;
  btuRequired: number;
  grossInstallCost: number;
  incentivesApplied: number;
  netInstallCost: number;
  annualUtilitySavings: number;
  paybackYears: number;
}

export function calculateHVACSavings(input: HVACInput): HVACResults {
  const { homeSqFt, climateZone, currentSystem, targetSystem } = input;
  
  // Sizing Rule
  let sqFtPerTon = 550;
  if (climateZone === "moderate") {
    sqFtPerTon = 650;
  }
  
  let tonnageRequired = homeSqFt / sqFtPerTon;
  // Round to nearest 0.5 ton
  tonnageRequired = Math.max(1, Math.round(tonnageRequired * 2) / 2);
  const btuRequired = tonnageRequired * 12000;
  
  // Cost logic
  let grossInstallCost = 0;
  if (targetSystem === "standard-ac-gas") {
    // $7,500 - $12,500 baseline, scale slightly with tonnage
    const baseCost = 6000;
    const perTonCost = 1500;
    grossInstallCost = baseCost + (perTonCost * tonnageRequired);
    // bound between 7500 and 12500 roughly
    if (grossInstallCost < 7500) grossInstallCost = 7500;
    if (grossInstallCost > 12500) grossInstallCost = 12500 + (tonnageRequired - 5) * 1000;
  } else {
    // High-efficiency heat pump: $9,000 - $16,500
    const baseCost = 7500;
    const perTonCost = 1800;
    grossInstallCost = baseCost + (perTonCost * tonnageRequired);
    if (grossInstallCost < 9000) grossInstallCost = 9000;
    if (grossInstallCost > 16500) grossInstallCost = 16500 + (tonnageRequired - 5) * 1500;
  }
  
  // Incentives
  let incentivesApplied = 0;
  if (targetSystem === "high-efficiency-heat-pump") {
    // 30% of cost capped at $2000
    incentivesApplied = Math.min(2000, grossInstallCost * 0.3);
  } else {
    incentivesApplied = 600; // Small standard credit
  }
  
  const netInstallCost = grossInstallCost - incentivesApplied;
  
  // Energy Savings
  // Baseline energy bill assumed if not provided
  const baseAnnualBill = input.annualEnergyBill || (homeSqFt * 1.1); 
  let savingsPercent = 0;
  
  if (targetSystem === "high-efficiency-heat-pump") {
    if (currentSystem === "electric-resistance-ac") {
      savingsPercent = 0.35; // 30-40%
    } else if (currentSystem === "gas-furnace-ac") {
      savingsPercent = 0.125; // 10-15%
    } else if (currentSystem === "heat-pump-old") {
      savingsPercent = 0.20; 
    }
  } else {
    // Standard AC + gas
    if (currentSystem === "electric-resistance-ac") {
      savingsPercent = 0.20; 
    } else if (currentSystem === "gas-furnace-ac") {
      savingsPercent = 0.05; // marginal improvement
    } else if (currentSystem === "heat-pump-old") {
      savingsPercent = 0.02; 
    }
  }
  
  const annualUtilitySavings = baseAnnualBill * savingsPercent;
  const paybackYears = annualUtilitySavings > 0 ? (netInstallCost / annualUtilitySavings) : 999;
  
  return {
    tonnageRequired,
    btuRequired,
    grossInstallCost,
    incentivesApplied,
    netInstallCost,
    annualUtilitySavings,
    paybackYears,
  };
}
