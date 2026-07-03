export const STANDARD_OPENINGS = {
  door: 21,
  window: 12,
};

export type UnitType = "in" | "ft" | "yd" | "cm" | "m" | "sq_ft" | "sq_m" | "cu_ft" | "cu_yd" | "cu_m";

export function convertLength(value: number, from: string, to: string): number {
  const toFeetMap: Record<string, number> = {
    in: 1 / 12,
    ft: 1,
    yd: 3,
    cm: 1 / 30.48,
    m: 3.28084,
  };
  const feetValue = value * (toFeetMap[from] || 1);
  const fromFeetMap: Record<string, number> = {
    in: 12,
    ft: 1,
    yd: 1 / 3,
    cm: 30.48,
    m: 1 / 3.28084,
  };
  return feetValue * (fromFeetMap[to] || 1);
}

export function calculateRectArea(length: number, width: number): number {
  return length * width;
}

export function calculateCircleArea(radius: number): number {
  return Math.PI * radius ** 2;
}

export function calculateCircleAreaFromDiameter(diameter: number): number {
  return Math.PI * (diameter / 2) ** 2;
}

export function calculateTriangleArea(base: number, height: number): number {
  return (base * height) / 2;
}

export function calculateLShapeArea(
  lengthA: number,
  widthA: number,
  lengthB: number,
  widthB: number
): number {
  return calculateRectArea(lengthA, widthA) + calculateRectArea(lengthB, widthB);
}

export function calculateVolume(area: number, depth: number): number {
  return area * depth;
}

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

export function cuFeetToCuYards(cuFeet: number): number {
  return cuFeet / 27;
}

export function cuYardsToCuFeet(cuYards: number): number {
  return cuYards * 27;
}

export function calculateBoardFeet(lengthInches: number, widthInches: number, thicknessInches: number, boardCount: number = 1): number {
  return (lengthInches * widthInches * thicknessInches / 144) * boardCount;
}

export function calculateTriangleHypotenuse(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

export function calculateStairParams(totalRise: number, desiredRiser: number, treadDepth: number = 10): {
  stepCount: number;
  actualRiser: number;
  totalRun: number;
  stringerLength: number;
  ircCompliant: boolean;
} {
  const stepCount = Math.round(totalRise / desiredRiser);
  const actualRiser = totalRise / stepCount;
  const totalRun = (stepCount - 1) * treadDepth;
  const stringerLength = calculateTriangleHypotenuse(totalRun, totalRise);
  const ircCompliant = actualRiser <= 7.75 && treadDepth >= 10;
  return { stepCount, actualRiser, totalRun, stringerLength, ircCompliant };
}

export function calculateBTULoad(
  area: number,
  ceilingHeight: number,
  insulationFactor: number,
  climateFactor: number,
  windowArea: number
): number {
  const baseLoad = area * ceilingHeight * insulationFactor * climateFactor;
  const windowLoad = windowArea * 3;
  return Math.round(baseLoad + windowLoad);
}

export function calculateCubicYards(lengthFt: number, widthFt: number, depthIn: number): number {
  const depthFt = depthIn / 12;
  const cubicFeet = lengthFt * widthFt * depthFt;
  return cubicFeet / 27;
}

export function sqftToCuYd(sqft: number, depthIn: number): number {
  return (sqft * (depthIn / 12)) / 27;
}

export function sqftToSqYd(sqft: number): number {
  return sqft / 9;
}
