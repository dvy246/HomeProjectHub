export interface TileDimensions {
  widthFt: number;
  heightFt: number;
  tileWidthIn: number;
  tileHeightIn: number;
  groutWidthIn: number;
  pattern: "straight" | "brick" | "herringbone" | "french";
  tileThicknessIn: number; // default 0.375" (3/8)
}

export interface TileMaterials {
  areaSqFt: number;
  baseTilesCount: number;
  totalTilesCount: number;
  wastePercent: number;
  estimatedBoxes: number;
  groutWeightLbs: number;
  thinsetBags: number;
  tileWeightLbs: number;
  totalWeightLbs: number;
}

/**
 * Calculates tile quantities, grout weights, thinset bags, and total load weights.
 */
export function calculateTileMaterials(dims: TileDimensions): TileMaterials {
  const { widthFt, heightFt, tileWidthIn, tileHeightIn, groutWidthIn, pattern, tileThicknessIn = 0.375 } = dims;

  if (widthFt <= 0 || heightFt <= 0 || tileWidthIn <= 0 || tileHeightIn <= 0) {
    return {
      areaSqFt: 0,
      baseTilesCount: 0,
      totalTilesCount: 0,
      wastePercent: 0,
      estimatedBoxes: 0,
      groutWeightLbs: 0,
      thinsetBags: 0,
      tileWeightLbs: 0,
      totalWeightLbs: 0,
    };
  }

  const areaSqFt = widthFt * heightFt;
  const areaSqIn = areaSqFt * 144;

  // 1. Effective coverage per tile (adding grout line offsets)
  const effTileWidth = tileWidthIn + groutWidthIn;
  const effTileHeight = tileHeightIn + groutWidthIn;
  const effTileArea = effTileWidth * effTileHeight;

  // Base tile counts without waste
  const baseTilesCount = Math.ceil(areaSqIn / effTileArea);

  // 2. Waste Factor depending on layout pattern complexity
  let wastePercent = 10; // Straight grid default
  if (pattern === "brick") {
    wastePercent = 12; // brick offsets have higher border cuts
  } else if (pattern === "herringbone" || pattern === "french") {
    wastePercent = 15; // Herringbone & French patterns have many diagonal border trims
  }

  const totalTilesCount = Math.ceil(baseTilesCount * (1 + wastePercent / 100));

  // 3. Boxes allocation
  // Approximate square footage per box based on tile sizing configurations:
  let boxSqFt = 15; // default for 12x12 or similar
  const tileAreaSqIn = tileWidthIn * tileHeightIn;
  if (tileAreaSqIn <= 24) {
    boxSqFt = 10; // subway tiles
  } else if (tileAreaSqIn >= 200) {
    boxSqFt = 16; // large format (12x24, 24x48)
  }

  const estimatedBoxes = Math.ceil((totalTilesCount * tileAreaSqIn) / 144 / boxSqFt);

  // 4. Grout joint volume and weight estimation
  // Civil formula: Grout (lbs) = Area (sq ft) * ((W + H) / (W * H)) * GroutWidth * Thickness * DensityCoefficient
  const groutWeightLbs = Math.ceil(
    areaSqFt * ((tileWidthIn + tileHeightIn) / (tileAreaSqIn)) * groutWidthIn * tileThicknessIn * 10.5
  );

  // 5. Thinset Mortar bags (standard 50lb bag covers ~50 sq ft)
  const thinsetBags = Math.max(1, Math.ceil(areaSqFt / 50));

  // 6. Weight parameters
  // Ceramic/porcelain tiles weigh ~4.5 lbs per square foot on average.
  const tileWeightLbs = Math.ceil(areaSqFt * 4.5 * (1 + wastePercent / 100));
  const totalWeightLbs = tileWeightLbs + groutWeightLbs + thinsetBags * 50;

  return {
    areaSqFt,
    baseTilesCount,
    totalTilesCount,
    wastePercent,
    estimatedBoxes,
    groutWeightLbs,
    thinsetBags,
    tileWeightLbs,
    totalWeightLbs,
  };
}
