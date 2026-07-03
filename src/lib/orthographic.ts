export type Point2D = { x: number; y: number };

export function rectPoints(
  x: number, y: number,
  w: number, h: number
): Point2D[] {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

export function pathString(pts: Point2D[]): string {
  return pts.map(p => `${p.x},${p.y}`).join(" ");
}

export function dimLine(
  x1: number, y1: number,
  x2: number, y2: number,
  offset: number
): { line: Point2D[]; labelPos: Point2D } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;

  return {
    line: [
      { x: x1, y: y1 },
      { x: x2, y: x2 },
    ],
    labelPos: {
      x: (x1 + x2) / 2 + ny * offset,
      y: (y1 + y2) / 2 - nx * offset,
    },
  };
}

export function arrowMarker(id: string): string {
  return `<marker id="${id}" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
    <polygon points="0 0, 7 2.5, 0 5" fill="var(--fg-muted)" />
  </marker>`;
}
