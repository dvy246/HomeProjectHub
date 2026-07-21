export type ClimateZoneGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type InsulationLevel = "poor" | "average" | "excellent";
export type SunExposure = "shaded" | "normal" | "sunny";

export interface HVACBtuInput {
  areaSqFt: number;
  ceilingHeight: number; // default 8
  climateZone: ClimateZoneGroup;
  insulationQuality: InsulationLevel;
  windowCount: number;
  sunExposure: SunExposure;
}

export interface HVACBtuResults {
  baseBtu: number;
  heightAdjustedBtu: number;
  insulationAdjustedBtu: number;
  exposureAdjustedBtu: number;
  windowAddedBtu: number;
  finalLoadBtu: number;
  calculatedTonnage: number;
  recommendedTons: number;
  recommendedBtu: number;
  splitSystemWarning: boolean;
}

/**
 * Calculates the recommended HVAC thermal heating/cooling load (BTU/hr and Tonnage).
 * Matches ACCA Manual J rules of thumb with adjustments for local IECC climate zones.
 */
export function calculateHVACBtuLoad(input: HVACBtuInput): HVACBtuResults {
  const { areaSqFt, ceilingHeight, climateZone, insulationQuality, windowCount, sunExposure } = input;

  // 1. Sizing factor by Climate Zone (BTU per sq ft)
  let btuPerSqFt = 40;
  if (climateZone === 1) {
    btuPerSqFt = 30;
  } else if (climateZone === 2 || climateZone === 3) {
    btuPerSqFt = 35;
  } else if (climateZone === 4) {
    btuPerSqFt = 40;
  } else if (climateZone === 5) {
    btuPerSqFt = 45;
  } else if (climateZone === 6 || climateZone === 7) {
    btuPerSqFt = 50;
  } else if (climateZone === 8) {
    btuPerSqFt = 55;
  }

  const baseBtu = areaSqFt * btuPerSqFt;

  // 2. Ceiling height adjustment (Volume factor relative to standard 8ft ceiling)
  const heightMultiplier = Math.max(1, ceilingHeight / 8);
  const heightAdjustedBtu = baseBtu * heightMultiplier;

  // 3. Insulation adjustment
  let insulationMultiplier = 1.0;
  if (insulationQuality === "poor") {
    insulationMultiplier = 1.20; // +20% for drafty/uninsulated
  } else if (insulationQuality === "excellent") {
    insulationMultiplier = 0.85; // -15% for high R-value and sealing
  }
  const insulationAdjustedBtu = heightAdjustedBtu * insulationMultiplier;

  // 4. Sun exposure adjustment
  let exposureMultiplier = 1.0;
  if (sunExposure === "shaded") {
    exposureMultiplier = 0.90; // -10% for high shade
  } else if (sunExposure === "sunny") {
    exposureMultiplier = 1.10; // +10% for high sun exposure
  }
  const exposureAdjustedBtu = insulationAdjustedBtu * exposureMultiplier;

  // 5. Window added heat load (500 BTU per window)
  const windowAddedBtu = Math.max(0, windowCount * 500);

  // 6. Total calculated load
  const finalLoadBtu = Math.round(exposureAdjustedBtu + windowAddedBtu);

  // 7. Calculate tonnage (12,000 BTU = 1 Ton)
  const calculatedTonnage = finalLoadBtu / 12000;

  // Round recommended tonnage to nearest 0.5 ton
  // Standard system sizing is 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0 tons.
  // We round to nearest 0.5 ton.
  let recommendedTons = Math.round(calculatedTonnage * 2) / 2;
  recommendedTons = Math.max(1.0, recommendedTons);

  // 4.5 tons is extremely rare in residential systems, typical jump is 4.0 -> 5.0 tons.
  if (recommendedTons === 4.5) {
    recommendedTons = 5.0;
  }

  const recommendedBtu = recommendedTons * 12000;
  const splitSystemWarning = recommendedTons > 5.0;

  return {
    baseBtu: Math.round(baseBtu),
    heightAdjustedBtu: Math.round(heightAdjustedBtu),
    insulationAdjustedBtu: Math.round(insulationAdjustedBtu),
    exposureAdjustedBtu: Math.round(exposureAdjustedBtu),
    windowAddedBtu,
    finalLoadBtu,
    calculatedTonnage,
    recommendedTons,
    recommendedBtu,
    splitSystemWarning,
  };
}
