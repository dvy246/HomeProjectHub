import {
  calculateRectArea,
  cuFeetToCuYards,
  sqftToSqYd,
  subtractOpenings,
} from "./geometry";
import {
  applyWasteFactor,
  calculateConcreteBags,
  estimateConcreteWeightLbs,
} from "./materialEngine";

export interface ConcreteSlabInput {
  length: number;
  width: number;
  thickness: number;
  waste: number;
}

export interface ConcreteSlabOutput {
  areaSqFt: number;
  volumeCuFt: number;
  volumeCuYd: number;
  totalVolumeCuFt: number;
  totalVolumeCuYd: number;
  bags80: number;
  bags60: number;
  bags50: number;
  bags40: number;
  weightLbs: number;
}

export function computeConcreteSlab(input: ConcreteSlabInput): ConcreteSlabOutput {
  const areaSqFt = calculateRectArea(input.length, input.width);
  const depthFt = input.thickness / 12;
  const volumeCuFt = areaSqFt * depthFt;
  const volumeCuYd = cuFeetToCuYards(volumeCuFt);
  const wasteDecimal = input.waste / 100;
  const totalVolumeCuFt = applyWasteFactor(volumeCuFt, wasteDecimal);
  const totalVolumeCuYd = cuFeetToCuYards(totalVolumeCuFt);

  return {
    areaSqFt: parseFloat(areaSqFt.toFixed(2)),
    volumeCuFt: parseFloat(volumeCuFt.toFixed(2)),
    volumeCuYd: parseFloat(volumeCuYd.toFixed(2)),
    totalVolumeCuFt: parseFloat(totalVolumeCuFt.toFixed(2)),
    totalVolumeCuYd: parseFloat(totalVolumeCuYd.toFixed(2)),
    bags80: calculateConcreteBags(totalVolumeCuFt, "80lb"),
    bags60: calculateConcreteBags(totalVolumeCuFt, "60lb"),
    bags50: calculateConcreteBags(totalVolumeCuFt, "50lb"),
    bags40: calculateConcreteBags(totalVolumeCuFt, "40lb"),
    weightLbs: Math.round(estimateConcreteWeightLbs(totalVolumeCuFt)),
  };
}

export interface PaintInput {
  length: number;
  width: number;
  height: number;
  doors: number;
  windows: number;
  coats: number;
}

export interface PaintOutput {
  perimeter: number;
  grossWallArea: number;
  doorsArea: number;
  windowsArea: number;
  netWallArea: number;
  totalNetArea: number;
  totalWithCoats: number;
  gallonsPerCoat: number;
  totalGallons: number;
}

export function computePaint(input: PaintInput): PaintOutput {
  const perimeter = 2 * (input.length + input.width);
  const grossWallArea = perimeter * input.height;
  const doorsArea = input.doors * 21;
  const windowsArea = input.windows * 12;
  const netWallArea = subtractOpenings(grossWallArea, [
    { type: "door", count: input.doors },
    { type: "window", count: input.windows },
  ]);
  const totalNetArea = netWallArea;
  const totalWithCoats = totalNetArea * input.coats;
  const gallonsPerCoat = Math.ceil(totalNetArea / 350);
  const totalGallons = Math.ceil(totalWithCoats / 350);

  return {
    perimeter,
    grossWallArea: parseFloat(grossWallArea.toFixed(2)),
    doorsArea,
    windowsArea,
    netWallArea: parseFloat(netWallArea.toFixed(2)),
    totalNetArea: parseFloat(totalNetArea.toFixed(2)),
    totalWithCoats: parseFloat(totalWithCoats.toFixed(2)),
    gallonsPerCoat,
    totalGallons,
  };
}

export interface SqFtInput {
  length: number;
  width: number;
}

export interface SqFtOutput {
  areaSqFt: number;
  areaSqYd: number;
  areaSqM: number;
}

export function computeSquareFootage(input: SqFtInput): SqFtOutput {
  const areaSqFt = calculateRectArea(input.length, input.width);
  const areaSqYd = sqftToSqYd(areaSqFt);
  const areaSqM = areaSqFt * 0.092903;

  return {
    areaSqFt: parseFloat(areaSqFt.toFixed(2)),
    areaSqYd: parseFloat(areaSqYd.toFixed(2)),
    areaSqM: parseFloat(areaSqM.toFixed(2)),
  };
}

export interface TileFloorInput {
  length: number;
  width: number;
  tileWidth: number;
  tileLength: number;
  layout: "grid" | "diagonal" | "herringbone";
}

export interface TileFloorOutput {
  areaSqFt: number;
  areaSqIn: number;
  tileAreaSqIn: number;
  baseTileCount: number;
  effectiveWaste: number;
  tilesWithWaste: number;
}

export function computeTileFloor(input: TileFloorInput): TileFloorOutput {
  const areaSqFt = calculateRectArea(input.length, input.width);
  const areaSqIn = areaSqFt * 144;
  const tileAreaSqIn = input.tileWidth * input.tileLength;
  const baseTileCount = Math.ceil(areaSqIn / tileAreaSqIn);

  let layoutWaste: number;
  if (input.layout === "diagonal") {
    layoutWaste = 0.15;
  } else if (input.layout === "herringbone") {
    layoutWaste = 0.20;
  } else {
    layoutWaste = 0.10;
  }

  const areaWithWasteSqIn = areaSqIn * (1 + layoutWaste);
  const tilesWithWaste = Math.ceil(areaWithWasteSqIn / tileAreaSqIn);

  return {
    areaSqFt: parseFloat(areaSqFt.toFixed(2)),
    areaSqIn: Math.round(areaSqIn),
    tileAreaSqIn: Math.round(tileAreaSqIn),
    baseTileCount,
    effectiveWaste: layoutWaste,
    tilesWithWaste,
  };
}

export interface RoofShingleInput {
  length: number;
  width: number;
  pitch: number;
  roofShape: "gable" | "hip";
}

export interface RoofShingleOutput {
  pitchMultiplier: number;
  roofAreaSqFt: number;
  squares: number;
  bundles: number;
  nailsLbBoxes: number;
  underlaymentRolls: number;
}

export function computeRoofShingles(input: RoofShingleInput): RoofShingleOutput {
  const pitchMultiplier = Math.sqrt(1 + Math.pow(input.pitch / 12, 2));

  let roofAreaSqFt: number;
  if (input.roofShape === "hip") {
    roofAreaSqFt = input.length * input.width * pitchMultiplier * 1.06;
  } else {
    roofAreaSqFt = (input.length * (input.width / 2) * pitchMultiplier) * 2;
  }

  const squares = parseFloat((roofAreaSqFt / 100).toFixed(2));
  const bundles = Math.ceil(roofAreaSqFt / 33.33);
  const nailsLbBoxes = Math.ceil(squares * 4);
  const underlaymentRolls = Math.ceil(roofAreaSqFt / 400);

  return {
    pitchMultiplier: parseFloat(pitchMultiplier.toFixed(4)),
    roofAreaSqFt: parseFloat(roofAreaSqFt.toFixed(2)),
    squares,
    bundles,
    nailsLbBoxes,
    underlaymentRolls,
  };
}
