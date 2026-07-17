import { calculateRectArea, subtractOpenings } from "./geometry";
import { applyWasteFactor, calculatePackaging } from "./materialEngine";

export interface ScopeRoom {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  openings: ScopeOpening[];
}

export interface ScopeOpening {
  type: "door" | "window" | "custom";
  count: number;
  customAreaSqFt?: number;
}

export interface ScopeFinish {
  surface: "floor" | "walls" | "ceiling";
  label: string;
  materialType: string;
  unitPrice: number;
  coverageSqFt: number;
  unitLabel: string;
  wastePercent: number;
}

export interface SurfaceResult {
  surface: "floor" | "walls" | "ceiling";
  label: string;
  grossArea: number;
  netArea: number;
  materialQuantity: number;
  materialCost: number;
  wasteAmount: number;
  packagingCount: number;
}

export interface ScopeResult {
  room: ScopeRoom;
  finishes: ScopeFinish[];
  surfaceResults: SurfaceResult[];
  totalGrossArea: number;
  totalNetArea: number;
  totalMaterialCost: number;
}

const SURFACE_LABELS: Record<string, string> = {
  floor: "Floor",
  walls: "Walls",
  ceiling: "Ceiling",
};

export function computeRoomSurfaces(room: ScopeRoom): {
  floorArea: number;
  wallArea: number;
  ceilingArea: number;
} {
  const floorArea = calculateRectArea(room.lengthFt, room.widthFt);
  const ceilingArea = floorArea;
  const perimeter = 2 * (room.lengthFt + room.widthFt);
  const wallArea = perimeter * room.heightFt;
  return { floorArea, wallArea, ceilingArea };
}

export function computeNetSurfaceArea(
  grossArea: number,
  openings: ScopeOpening[]
): number {
  if (openings.length === 0) return grossArea;
  const mapped = openings.map((o) => ({
    type: o.type as "door" | "window" | "custom",
    count: o.count,
    customArea: o.customAreaSqFt,
  }));
  return subtractOpenings(grossArea, mapped);
}

export function computeFinish(
  finish: ScopeFinish,
  netArea: number
): {
  materialQuantity: number;
  materialCost: number;
  wasteAmount: number;
  packagingCount: number;
} {
  const appliedWaste = applyWasteFactor(netArea, finish.wastePercent);
  const wasteAmount = appliedWaste - netArea;
  const materialQuantity = finish.coverageSqFt > 0
    ? appliedWaste / finish.coverageSqFt
    : 0;
  const packagingCount = finish.coverageSqFt > 0
    ? calculatePackaging(appliedWaste, finish.coverageSqFt)
    : 0;
  const materialCost = materialQuantity * finish.unitPrice;
  return {
    materialQuantity: Math.round(materialQuantity * 100) / 100,
    materialCost: Math.round(materialCost),
    wasteAmount: Math.round(wasteAmount * 100) / 100,
    packagingCount,
  };
}

export function computeScope(
  room: ScopeRoom,
  finishes: ScopeFinish[]
): ScopeResult {
  const surfaces = computeRoomSurfaces(room);

  const surfaceAreaMap: Record<string, number> = {
    floor: surfaces.floorArea,
    walls: surfaces.wallArea,
    ceiling: surfaces.ceilingArea,
  };

  const surfaceResults: SurfaceResult[] = finishes.map((finish) => {
    const grossArea = surfaceAreaMap[finish.surface] || 0;
    const areaOpenings = finish.surface === "walls" ? room.openings : [];
    const netArea = computeNetSurfaceArea(grossArea, areaOpenings);
    const computed = computeFinish(finish, netArea);

    return {
      surface: finish.surface,
      label: finish.label || SURFACE_LABELS[finish.surface] || finish.surface,
      grossArea: Math.round(grossArea * 100) / 100,
      netArea: Math.round(netArea * 100) / 100,
      materialQuantity: computed.materialQuantity,
      materialCost: computed.materialCost,
      wasteAmount: computed.wasteAmount,
      packagingCount: computed.packagingCount,
    };
  });

  const totalGrossArea = surfaceResults.reduce((s, r) => s + r.grossArea, 0);
  const totalNetArea = surfaceResults.reduce((s, r) => s + r.netArea, 0);
  const totalMaterialCost = surfaceResults.reduce((s, r) => s + r.materialCost, 0);

  return {
    room,
    finishes,
    surfaceResults,
    totalGrossArea: Math.round(totalGrossArea * 100) / 100,
    totalNetArea: Math.round(totalNetArea * 100) / 100,
    totalMaterialCost,
  };
}

export function scopeRoomToParams(room: ScopeRoom): string {
  const params = new URLSearchParams();
  params.set("l", String(room.lengthFt));
  params.set("w", String(room.widthFt));
  params.set("h", String(room.heightFt));
  if (room.openings.length > 0) {
    const encoded = room.openings
      .map((o) => `${o.type}:${o.count}` + (o.customAreaSqFt ? `:${o.customAreaSqFt}` : ""))
      .join(",");
    params.set("o", encoded);
  }
  return params.toString();
}

export function scopeRoomFromParams(params: string): ScopeRoom | null {
  try {
    const parsed = new URLSearchParams(params);
    const lengthFt = parseFloat(parsed.get("l") || "");
    const widthFt = parseFloat(parsed.get("w") || "");
    const heightFt = parseFloat(parsed.get("h") || "");
    if (!lengthFt || !widthFt || !heightFt) return null;
    const openings: ScopeOpening[] = [];
    const raw = parsed.get("o");
    if (raw) {
      for (const part of raw.split(",")) {
        const [type, countStr, customAreaStr] = part.split(":");
        if (type && countStr) {
          openings.push({
            type: type as "door" | "window" | "custom",
            count: parseInt(countStr, 10) || 1,
            customAreaSqFt: customAreaStr ? parseFloat(customAreaStr) : undefined,
          });
        }
      }
    }
    return { lengthFt, widthFt, heightFt, openings };
  } catch {
    return null;
  }
}


