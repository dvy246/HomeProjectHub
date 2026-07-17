export interface ReportInputItem {
  value: number;
  unit: string;
  label: string;
}

export interface ReportMaterialItem {
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

export interface ReportMetrics {
  weightLbs?: number;
  volumeCuYd?: number;
  volumeCuM?: number;
  bagsCount?: number;
  bagSize?: string;
  wasteFactorPercent?: number;
  laborType?: "diy" | "contractor";
  laborCost?: number;
  materialCost?: number;
  customContext?: Record<string, any>;
}

// Configurable thresholds for engineering rules
export const REPORT_THRESHOLDS = {
  highWastePercent: 15,
  lowWastePercent: 5,
  readyMixVolumeCuYd: 1.5,
  heavyDeliveryWeightLbs: 3000,
  heavyMixingBagsCount: 60,
  lightMixingBagsCount: 20,
};

/**
 * Returns the translation key suffix for waste explanation based on waste factor.
 */
export function getWasteExplanationKey(wasteFactorPercent: number): "high" | "low" | "normal" {
  const wastePercent = wasteFactorPercent * 100;
  if (wastePercent > REPORT_THRESHOLDS.highWastePercent) return "high";
  if (wastePercent <= REPORT_THRESHOLDS.lowWastePercent) return "low";
  return "normal";
}

/**
 * Returns the translation key suffix for delivery recommendations based on weight and volume.
 */
export function getDeliveryKey(
  calculatorId: string,
  weightLbs: number,
  volumeCuYd?: number
): "truck" | "heavy" | "pickup" {
  if (calculatorId === "concrete-slab" && volumeCuYd && volumeCuYd > REPORT_THRESHOLDS.readyMixVolumeCuYd) {
    return "truck";
  }
  if (weightLbs > REPORT_THRESHOLDS.heavyDeliveryWeightLbs) {
    return "heavy";
  }
  return "pickup";
}

/**
 * Returns the translation key suffix for concrete mixing recommendations.
 */
export function getMixingKey(
  calculatorId: string,
  bagsCount: number
): "concrete_heavy" | "concrete_medium" | "concrete_light" | "fallback" {
  if (calculatorId === "concrete-slab") {
    if (bagsCount > REPORT_THRESHOLDS.heavyMixingBagsCount) return "concrete_heavy";
    if (bagsCount > REPORT_THRESHOLDS.lightMixingBagsCount) return "concrete_medium";
    return "concrete_light";
  }
  return "fallback";
}
