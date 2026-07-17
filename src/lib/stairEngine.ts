export interface StairInputs {
  totalRise: number; // in inches
  treadThickness: number; // in inches
  riserThickness: number; // in inches
  targetRun: number; // in inches
  customStairCount: number | null;
  unitSystem: "imperial" | "metric";
}

export interface StairResults {
  stairCount: number;
  riserHeight: number;
  treadRun: number;
  stringerLength: number;
  recommendedStockLength: string;
  angle: number;
  throatDepth: number; // thickness of remaining solid board, usually 5 inches
  bottomRiserHeight: number;
  topRiserHeight: number;
  warnings: string[];
  comfortScore: number; // comfort coefficient: 2 * riser + run
}

export function calculateStairLayout(inputs: StairInputs): StairResults {
  const { totalRise, treadThickness, targetRun, customStairCount } = inputs;

  // Determine stair count (risers count)
  let stairCount = customStairCount;
  if (!stairCount || stairCount <= 0) {
    // Comfort rise target is 7.5 inches
    stairCount = Math.max(1, Math.round(totalRise / 7.5));
  }

  const riserHeight = totalRise / stairCount;
  const treadRun = targetRun;

  // Stair angle in degrees
  const angle = Math.atan2(riserHeight, treadRun) * (180 / Math.PI);

  // Raw stringer diagonal length using Pythagoras
  // Horizontal span is (stairCount - 1) * run
  const horizontalSpan = (stairCount - 1) * treadRun;
  const rawStringerLength = Math.sqrt(Math.pow(horizontalSpan, 2) + Math.pow(totalRise, 2));

  // Determine standard stock board size needed (in feet)
  let recommendedStockLength = "16 ft";
  if (rawStringerLength <= 96) {
    recommendedStockLength = "8 ft";
  } else if (rawStringerLength <= 120) {
    recommendedStockLength = "10 ft";
  } else if (rawStringerLength <= 144) {
    recommendedStockLength = "12 ft";
  }

  // Adjust bottom riser for tread thickness (riser height - tread thickness)
  // This ensures that after placing the tread, the top of the first step is exactly riserHeight above the floor.
  const bottomRiserHeight = Math.max(0.5, riserHeight - treadThickness);

  // Adjust top riser (typically equal to riserHeight unless special top-ledger configuration is selected)
  const topRiserHeight = riserHeight;

  // IRC Code Warnings (Standard IRC R311.7)
  const warnings: string[] = [];
  if (riserHeight > 7.75) {
    warnings.push(`Riser height of ${riserHeight.toFixed(2)}" exceeds the IRC maximum limit of 7.75".`);
  }
  if (riserHeight < 4.0) {
    warnings.push(`Riser height of ${riserHeight.toFixed(2)}" is below the building comfort minimum of 4.0".`);
  }
  if (treadRun < 10.0) {
    warnings.push(`Tread run of ${treadRun.toFixed(2)}" is below the IRC minimum requirement of 10.0".`);
  }
  if (angle > 50 || angle < 20) {
    warnings.push(`Stair angle of ${angle.toFixed(1)}° is outside the recommended safe slope of 20° to 50°.`);
  }

  const comfortScore = 2 * riserHeight + treadRun;
  if (comfortScore < 24.0 || comfortScore > 25.0) {
    warnings.push(`Rise-run Comfort Score of ${comfortScore.toFixed(2)}" is outside the optimal comfortable range of 24.0" to 25.0".`);
  }

  // Minimum throat depth for a 2x12 cut stringer is 5 inches for structural integrity
  const throatDepth = 5.0;

  return {
    stairCount,
    riserHeight,
    treadRun,
    stringerLength: rawStringerLength,
    recommendedStockLength,
    angle,
    throatDepth,
    bottomRiserHeight,
    topRiserHeight,
    warnings,
    comfortScore
  };
}

export interface Coordinates {
  x: number;
  y: number;
}

/**
 * Generate coordinates representing the cut stringer profile polygon.
 * Fits within an SVG canvas scaled for visualization.
 */
export function generateStringerCoordinates(
  stairCount: number,
  riserHeight: number,
  treadRun: number,
  throatDepth: number
): Coordinates[] {
  const points: Coordinates[] = [];
  
  // 1. Top Attachment point
  // We start at the top back of the stringer board.
  // Let's lay it out horizontally.
  
  // We will trace the steps descending:
  // Step 0 starts at (0, 0)
  let curX = 0;
  let curY = 0;
  
  points.push({ x: curX, y: curY });
  
  // Descend each step:
  // Draw down riserHeight, draw right treadRun
  for (let i = 0; i < stairCount; i++) {
    curY += riserHeight;
    points.push({ x: curX, y: curY });
    
    // Don't draw the last tread run beyond the last riser on the floor
    if (i < stairCount - 1) {
      curX += treadRun;
      points.push({ x: curX, y: curY });
    }
  }

  // At the floor level, let's offset parallel to the slope to represent the solid throat.
  const theta = Math.atan2(riserHeight, treadRun);
  
  // Perpendicular offset vector pointing down-left (negative x, positive y since y is positive downwards)
  const dx = -throatDepth * Math.sin(theta);
  const dy = throatDepth * Math.cos(theta);
  
  const floorX = curX;
  const floorY = curY;
  
  // Top throat corner: offset from (0, riserHeight) perpendicular to slope
  const topBackX = dx;
  const topBackY = riserHeight + dy;

  // Bottom throat corner: intersection of the parallel back line and the floor level
  const backFloorX = topBackX + (floorY - topBackY) * (treadRun / riserHeight);
  const backFloorY = floorY; // rests flat on floor

  points.push({ x: backFloorX, y: backFloorY });
  points.push({ x: topBackX, y: topBackY });
  
  return points;
}
