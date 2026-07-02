export type Point2D = { x: number; y: number };

export function isoProject(x: number, y: number, z: number): Point2D {
  const cx = 0;
  const cy = 0;
  return {
    x: cx + (x - y) * 0.866,
    y: cy + (x + y) * 0.5 - z,
  };
}

export type Box3D = {
  corners: Point2D[];
  topFace: string;
  rightFace: string;
  frontFace: string;
};

export function computeBox(w: number, d: number, h: number, cx: number, cy: number): Box3D {
  const pts = [
    [0, 0, 0],
    [w, 0, 0],
    [w, 0, h],
    [0, 0, h],
    [0, d, 0],
    [w, d, 0],
    [w, d, h],
    [0, d, h],
  ].map(([x, y, z]) => {
    const p = isoProject(x, y, z);
    return { x: p.x + cx, y: p.y + cy };
  });

  const path = (indices: number[]) => indices.map(i => `${pts[i].x},${pts[i].y}`).join(" ");

  return {
    corners: pts,
    topFace: path([3, 2, 6, 7]),
    rightFace: path([1, 5, 6, 2]),
    frontFace: path([0, 1, 2, 3]),
  };
}
