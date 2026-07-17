export interface WainscotingObstacle {
  id: string;
  name: string;
  type: "window" | "door" | "outlet" | "switch" | "custom";
  x: number;      // Distance from left wall in inches
  y: number;      // Height from floor in inches
  width: number;  // Width in inches
  height: number; // Height in inches
}

export interface WainscotingDimensions {
  wallWidth: number;   // inches
  wallHeight: number;  // inches
  style: "board-batten" | "picture-frame" | "shaker" | "wood-slat";
  boardWidth: number;  // stile width in inches
  boardThickness: number; // inches
  topRailWidth: number; // inches
  bottomRailWidth: number; // inches
  midRailWidth: number; // intermediate rail width
  panelCount: number;  // number of panel columns
  rowCount: number;    // number of horizontal rows (for Shaker/Grid)
  gapWidth: number;    // default spacing (for picture-frame / slat-wall)
  topGap: number;      // top margin for picture frame
  bottomGap: number;   // bottom margin for picture frame
  lumberLengthFt: 8 | 10 | 12 | 16; // raw board purchase lengths
  wastePercent: number; // e.g. 10 for 10%
  obstacles: WainscotingObstacle[];
}

export interface BoardCut {
  lengthIn: number;
  type: "stile" | "rail" | "frame-vertical" | "frame-horizontal" | "slat" | "top-rail" | "bottom-rail" | "mid-rail";
  count: number;
  label: string;
}

export interface StilePosition {
  x: number; // left edge coordinate
  width: number;
  height: number;
  y: number;
  index: number;
  hasClash: boolean;
  clashingWith: string[];
}

export interface RailPosition {
  y: number; // top edge coordinate
  width: number;
  height: number;
  x: number;
  type: "top" | "bottom" | "mid";
  index: number;
  hasClash: boolean;
  clashingWith: string[];
}

export interface PictureFramePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  colIndex: number;
  rowIndex: number;
  hasClash: boolean;
  clashingWith: string[];
}

export interface SlatPosition {
  x: number;
  width: number;
  height: number;
  index: number;
  hasClash: boolean;
  clashingWith: string[];
}

export interface WainscotingResults {
  style: string;
  exactSpacingIn: number;
  exactSpacingFraction: string;
  stilesCount: number;
  railsCount: number;
  topRailLengthIn: number;
  bottomRailLengthIn: number;
  midRailLengthIn: number;
  totalLinearFt: number;
  totalLinearFtWaste: number;
  boardsToBuy: number;
  stilePositions: StilePosition[];
  railPositions: RailPosition[];
  framePositions: PictureFramePosition[];
  slatPositions: SlatPosition[];
  clashesDetected: boolean;
  clashingObstacleIds: string[];
  cutList: BoardCut[];
}

// Convert decimal to fractions for carpentry (down to 1/16")
export function decimalToFraction(val: number): string {
  if (isNaN(val) || val <= 0) return "0\"";
  const whole = Math.floor(val);
  const remainder = val - whole;
  if (remainder < 0.03125) return whole > 0 ? `${whole}"` : `0"`;
  
  // Find nearest 1/16
  const sixteenths = Math.round(remainder * 16);
  if (sixteenths === 0) return whole > 0 ? `${whole}"` : `0"`;
  if (sixteenths === 16) return `${whole + 1}"`;
  
  // Simplify fraction
  let num = sixteenths;
  let den = 16;
  if (num % 8 === 0) { num /= 8; den /= 8; }
  else if (num % 4 === 0) { num /= 4; den /= 4; }
  else if (num % 2 === 0) { num /= 2; den /= 2; }
  
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

// Check 2D intersection
function checkCollision(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

// Simple bin-packing (cutting stock) optimizer to calculate boards to buy
export function optimizeCutList(cuts: { lengthIn: number; count: number }[], boardLengthFt: number): number {
  const boardLengthIn = boardLengthFt * 12;
  // Flatten cuts into a single list of sorted lengths (largest first)
  const pieces: number[] = [];
  for (const cut of cuts) {
    for (let i = 0; i < cut.count; i++) {
      let remaining = cut.lengthIn;
      while (remaining > boardLengthIn) {
        pieces.push(boardLengthIn);
        remaining -= boardLengthIn;
      }
      if (remaining > 0) {
        pieces.push(remaining);
      }
    }
  }
  pieces.sort((a, b) => b - a);

  const boards: number[][] = [];

  for (const piece of pieces) {
    // Try to pack into an existing board
    let placed = false;
    for (const board of boards) {
      const used = board.reduce((sum, p) => sum + p, 0);
      if (used + piece <= boardLengthIn) {
        board.push(piece);
        placed = true;
        break;
      }
    }
    // Create a new board if it doesn't fit in any existing one
    if (!placed) {
      boards.push([piece]);
    }
  }

  return boards.length;
}

export function calculateWainscoting(dims: WainscotingDimensions): WainscotingResults {
  const {
    wallWidth,
    wallHeight,
    style,
    boardWidth,
    topRailWidth,
    bottomRailWidth,
    midRailWidth,
    panelCount,
    rowCount,
    gapWidth,
    topGap,
    bottomGap,
    lumberLengthFt,
    wastePercent,
    obstacles
  } = dims;

  const safePanelCount = Math.max(1, panelCount);
  const safeRowCount = Math.max(1, rowCount);
  const safeBoardWidth = Math.max(0.1, boardWidth);

  let stilesCount = 0;
  let railsCount = 0;
  let exactSpacingIn = 0;
  let exactSpacingFraction = "";
  
  const stilePositions: StilePosition[] = [];
  const railPositions: RailPosition[] = [];
  const framePositions: PictureFramePosition[] = [];
  const slatPositions: SlatPosition[] = [];
  const rawCuts: BoardCut[] = [];

  let clashesDetected = false;
  const clashingObstacleIds: string[] = [];

  // Helper to trace clashes
  const findClashesForBox = (x: number, y: number, w: number, h: number): string[] => {
    const list: string[] = [];
    for (const obs of obstacles) {
      if (checkCollision(x, y, w, h, obs.x, obs.y, obs.width, obs.height)) {
        list.push(obs.name);
        if (!clashingObstacleIds.includes(obs.id)) {
          clashingObstacleIds.push(obs.id);
        }
        clashesDetected = true;
      }
    }
    return list;
  };

  if (style === "board-batten" || style === "shaker") {
    // Top & Bottom rails run continuously horizontally
    const actualStileHeight = Math.max(0, wallHeight - topRailWidth - bottomRailWidth);

    // Top rail
    if (topRailWidth > 0) {
      const clashes = findClashesForBox(0, wallHeight - topRailWidth, wallWidth, topRailWidth);
      railPositions.push({
        y: wallHeight - topRailWidth,
        width: wallWidth,
        height: topRailWidth,
        x: 0,
        type: "top",
        index: 0,
        hasClash: clashes.length > 0,
        clashingWith: clashes
      });
      rawCuts.push({ lengthIn: wallWidth, type: "top-rail", count: 1, label: `Top Rail (${decimalToFraction(wallWidth)})` });
      railsCount++;
    }

    // Bottom rail
    if (bottomRailWidth > 0) {
      const clashes = findClashesForBox(0, 0, wallWidth, bottomRailWidth);
      railPositions.push({
        y: 0,
        width: wallWidth,
        height: bottomRailWidth,
        x: 0,
        type: "bottom",
        index: 0,
        hasClash: clashes.length > 0,
        clashingWith: clashes
      });
      rawCuts.push({ lengthIn: wallWidth, type: "bottom-rail", count: 1, label: `Bottom Rail (${decimalToFraction(wallWidth)})` });
      railsCount++;
    }

    // Stiles count: N panels -> N + 1 stiles
    stilesCount = safePanelCount + 1;
    const totalStileWidth = stilesCount * safeBoardWidth;
    const remainingWidth = Math.max(0, wallWidth - totalStileWidth);
    exactSpacingIn = remainingWidth / safePanelCount;
    exactSpacingFraction = decimalToFraction(exactSpacingIn);

    // Calculate vertical stiles positions
    for (let i = 0; i < stilesCount; i++) {
      const x = i * (safeBoardWidth + exactSpacingIn);
      const clashes = findClashesForBox(x, bottomRailWidth, safeBoardWidth, actualStileHeight);
      stilePositions.push({
        x,
        width: safeBoardWidth,
        height: actualStileHeight,
        y: bottomRailWidth,
        index: i,
        hasClash: clashes.length > 0,
        clashingWith: clashes
      });
    }

    // Shaker style: horizontal mid-rails segment between stiles
    if (style === "shaker" && safeRowCount > 1 && midRailWidth > 0) {
      const rowHeight = actualStileHeight / safeRowCount;
      // Mid-rails count = (rowCount - 1) * panelCount
      const midRailLength = exactSpacingIn;
      
      let midRailCutCount = 0;
      for (let r = 1; r < safeRowCount; r++) {
        const y = bottomRailWidth + r * rowHeight - midRailWidth / 2;
        
        for (let c = 0; c < safePanelCount; c++) {
          const x = c * (safeBoardWidth + exactSpacingIn) + safeBoardWidth;
          const clashes = findClashesForBox(x, y, midRailLength, midRailWidth);
          railPositions.push({
            y,
            width: midRailLength,
            height: midRailWidth,
            x,
            type: "mid",
            index: r,
            hasClash: clashes.length > 0,
            clashingWith: clashes
          });
          midRailCutCount++;
        }
      }
      if (midRailCutCount > 0) {
        rawCuts.push({
          lengthIn: midRailLength,
          type: "mid-rail",
          count: midRailCutCount,
          label: `Mid Rail Segments (${decimalToFraction(midRailLength)})`
        });
        railsCount += midRailCutCount;
      }
    }

    // Add vertical stiles to cut list
    rawCuts.push({
      lengthIn: actualStileHeight,
      type: "stile",
      count: stilesCount,
      label: `Vertical Stiles (${decimalToFraction(actualStileHeight)})`
    });

  } else if (style === "picture-frame") {
    // Picture frames are individual molding boxes hung on the wall.
    // N boxes horizontally, R rows vertically.
    // We have topGap, bottomGap, and side/horizontal gaps.
    // Horizontally, for N boxes, we have N + 1 gaps.
    const totalGapWidth = (safePanelCount + 1) * gapWidth;
    const remainingWidth = Math.max(0, wallWidth - totalGapWidth);
    const boxWidth = remainingWidth / safePanelCount;
    exactSpacingIn = boxWidth; // box width itself is the primary calculated metric
    exactSpacingFraction = decimalToFraction(boxWidth);

    // Vertically, R rows of boxes. Vertical gap spacing is gapWidth.
    // Total vertical gap space = (rowCount - 1) * gapWidth + topGap + bottomGap.
    const totalVerticalGapHeight = (safeRowCount - 1) * gapWidth + topGap + bottomGap;
    const remainingHeight = Math.max(0, wallHeight - totalVerticalGapHeight);
    const boxHeight = remainingHeight / safeRowCount;

    let totalBoxCutsH = 0;
    let totalBoxCutsV = 0;

    for (let r = 0; r < safeRowCount; r++) {
      // Row starts from bottom (y=0 is floor)
      const y = bottomGap + r * (boxHeight + gapWidth);
      
      for (let c = 0; c < safePanelCount; c++) {
        const x = gapWidth + c * (boxWidth + gapWidth);
        const clashes = findClashesForBox(x, y, boxWidth, boxHeight);
        framePositions.push({
          x,
          y,
          width: boxWidth,
          height: boxHeight,
          colIndex: c,
          rowIndex: r,
          hasClash: clashes.length > 0,
          clashingWith: clashes
        });
        totalBoxCutsH += 2; // 2 horizontal parts per frame
        totalBoxCutsV += 2; // 2 vertical parts per frame
      }
    }

    if (totalBoxCutsH > 0 && totalBoxCutsV > 0) {
      rawCuts.push({
        lengthIn: boxWidth,
        type: "frame-horizontal",
        count: totalBoxCutsH,
        label: `Mitered Frame Horizontals (${decimalToFraction(boxWidth)})`
      });
      rawCuts.push({
        lengthIn: boxHeight,
        type: "frame-vertical",
        count: totalBoxCutsV,
        label: `Mitered Frame Verticals (${decimalToFraction(boxHeight)})`
      });
    }

  } else if (style === "wood-slat") {
    // Repeating vertical wood slats.
    // Slat width is boardWidth. Slat spacing is gapWidth.
    // We start and end with a slat, or fit as many as possible.
    // Standard: Slat count = Math.floor((wallWidth - gapWidth) / (boardWidth + gapWidth)) + 1
    // We adjust the gap slightly to fit the wall perfectly.
    const tempCount = Math.max(1, Math.floor((wallWidth - gapWidth) / (safeBoardWidth + gapWidth)));
    stilesCount = tempCount + 1;
    
    // Recalculate exact gap
    const totalSlatWidth = stilesCount * safeBoardWidth;
    exactSpacingIn = Math.max(0, (wallWidth - totalSlatWidth) / tempCount);
    exactSpacingFraction = decimalToFraction(exactSpacingIn);

    for (let i = 0; i < stilesCount; i++) {
      const x = i * (safeBoardWidth + exactSpacingIn);
      const clashes = findClashesForBox(x, 0, safeBoardWidth, wallHeight);
      slatPositions.push({
        x,
        width: safeBoardWidth,
        height: wallHeight,
        index: i,
        hasClash: clashes.length > 0,
        clashingWith: clashes
      });
    }

    rawCuts.push({
      lengthIn: wallHeight,
      type: "slat",
      count: stilesCount,
      label: `Vertical Slats (${decimalToFraction(wallHeight)})`
    });
  }

  // Calculate Linear Feet
  let sumInches = 0;
  for (const cut of rawCuts) {
    sumInches += cut.lengthIn * cut.count;
  }
  const totalLinearFt = sumInches / 12;
  const totalLinearFtWaste = totalLinearFt * (1 + wastePercent / 100);

  // Group similar cut lengths for board packing optimization
  const optimizedCutsForPack: { lengthIn: number; count: number }[] = [];
  for (const cut of rawCuts) {
    const existing = optimizedCutsForPack.find(c => c.lengthIn === cut.lengthIn);
    if (existing) {
      existing.count += cut.count;
    } else {
      optimizedCutsForPack.push({ lengthIn: cut.lengthIn, count: cut.count });
    }
  }

  const boardsToBuy = optimizeCutList(optimizedCutsForPack, lumberLengthFt);

  return {
    style,
    exactSpacingIn,
    exactSpacingFraction,
    stilesCount,
    railsCount,
    topRailLengthIn: style === "board-batten" || style === "shaker" ? wallWidth : 0,
    bottomRailLengthIn: style === "board-batten" || style === "shaker" ? wallWidth : 0,
    midRailLengthIn: style === "shaker" ? exactSpacingIn : 0,
    totalLinearFt,
    totalLinearFtWaste,
    boardsToBuy,
    stilePositions,
    railPositions,
    framePositions,
    slatPositions,
    clashesDetected,
    clashingObstacleIds,
    cutList: rawCuts
  };
}
