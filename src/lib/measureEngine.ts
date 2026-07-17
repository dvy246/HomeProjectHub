export interface Point2D {
  x: number;
  y: number;
}

export function calculateDistance(p1: Point2D, p2: Point2D): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function calculateScale(pixels: number, physicalLength: number, unit: "in" | "ft"): number {
  const inches = unit === "ft" ? physicalLength * 12 : physicalLength;
  if (inches <= 0) return 0;
  return pixels / inches; // pixels per inch
}

export function calculatePolygonArea(points: Point2D[]): number {
  const n = points.length;
  if (n < 3) return 0;

  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area) / 2; // returns area in square pixels
}

export function convertAreaToPhysical(pixelArea: number, scale: number): number {
  if (scale <= 0) return 0;
  const areaSqIn = pixelArea / Math.pow(scale, 2);
  return areaSqIn / 144; // returns area in square feet
}

export function calculatePolygonPerimeter(points: Point2D[], isClosed: boolean = true): number {
  const n = points.length;
  if (n < 2) return 0;

  let perimeter = 0;
  const limit = isClosed ? n : n - 1;
  for (let i = 0; i < limit; i++) {
    const j = (i + 1) % n;
    perimeter += calculateDistance(points[i], points[j]);
  }

  return perimeter; // returns perimeter in pixels
}

export function convertLengthToPhysical(pixelLength: number, scale: number): number {
  if (scale <= 0) return 0;
  const lengthIn = pixelLength / scale;
  return lengthIn / 12; // returns length in feet
}
