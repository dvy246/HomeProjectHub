export interface PackageOption {
  name: string;
  unitPerPackage: number;
  unitType: string;
}

export const CONCRETE_BAG_YIELDS = {
  "80lb": 0.6, // cubic feet yield per bag
  "60lb": 0.45,
  "50lb": 0.375,
  "40lb": 0.3,
};

/**
 * Applies a percentage waste factor to a base amount.
 * @param amount Base calculation amount
 * @param wasteFactor Decimal value of waste (e.g. 0.05 for 5%)
 */
export function applyWasteFactor(amount: number, wasteFactor: number): number {
  return amount * (1 + wasteFactor);
}

/**
 * Calculates how many packaging units are required, rounding up to the nearest whole number.
 */
export function calculatePackaging(totalAmount: number, unitPerPackage: number): number {
  if (unitPerPackage <= 0) return 0;
  return Math.ceil(totalAmount / unitPerPackage);
}

/**
 * Calculates concrete bags needed for a given volume in cubic feet.
 */
export function calculateConcreteBags(
  volumeCuFt: number,
  bagSize: "40lb" | "50lb" | "60lb" | "80lb"
): number {
  const yieldPerBag = CONCRETE_BAG_YIELDS[bagSize];
  return calculatePackaging(volumeCuFt, yieldPerBag);
}

/**
 * Estimates concrete weight in pounds.
 * Standard concrete weighs roughly 150 lbs per cubic foot.
 */
export function estimateConcreteWeightLbs(volumeCuFt: number): number {
  return volumeCuFt * 150;
}
