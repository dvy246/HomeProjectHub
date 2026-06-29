export const STANDARD_OPENINGS = {
  door: 21, // sq ft
  window: 12, // sq ft
};

export type UnitType = "in" | "ft" | "yd" | "cm" | "m" | "sq_ft" | "sq_m" | "cu_ft" | "cu_yd" | "cu_m";

/**
 * Converts length units.
 */
export function convertLength(value: number, from: string, to: string): number {
  // Base unit: feet (ft)
  const toFeetMap: Record<string, number> = {
    in: 1 / 12,
    ft: 1,
    yd: 3,
    cm: 1 / 30.48,
    m: 3.28084,
  };

  const fromFeetMap: Record<string, number> = {
    in: 12,
    ft: 1,
    yd: 1 / 3,
    cm: 30.48,
    m: 1 / 3.28084,
  };

  const feetValue = value * (toFeetMap[from] || 1);
  return feetValue * (fromFeetMap[to] || 1);
}

/**
 * Calculates raw area for a rectangle.
 */
export function calculateRectArea(length: number, width: number): number {
  return length * width;
}

/**
 * Calculates raw area for a circle.
 */
export function calculateCircleArea(radius: number): number {
  return Math.PI * Math.pow(radius, 2);
}

/**
 * Calculates volume given area and depth.
 * depth must be converted to the same unit as area base before calculation.
 */
export function calculateVolume(area: number, depth: number): number {
  return area * depth;
}

/**
 * Subtracts structural openings from total area.
 */
export function subtractOpenings(
  totalArea: number,
  openings: Array<{ type: "door" | "window" | "custom"; count: number; customArea?: number }>
): number {
  let netArea = totalArea;
  for (const opening of openings) {
    const unitArea =
      opening.type === "custom"
        ? opening.customArea || 0
        : STANDARD_OPENINGS[opening.type];
    netArea -= unitArea * opening.count;
  }
  return Math.max(0, netArea);
}

/**
 * Converts cubic feet to cubic yards.
 */
export function cuFeetToCuYards(cuFeet: number): number {
  return cuFeet / 27;
}

/**
 * Converts cubic yards to cubic feet.
 */
export function cuYardsToCuFeet(cuYards: number): number {
  return cuYards * 27;
}
