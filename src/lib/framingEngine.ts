export interface FramingOpening {
  id: string;
  name: string;
  type: "window" | "door";
  width: number;  // in inches
  height: number; // in inches
  x: number;      // offset from left in inches
  y: number;      // offset from floor in inches (always 0 for doors)
}

export interface FramingDimensions {
  wallLengthFt: number;
  wallHeightFt: number;
  studSpacingIn: number; // 12, 16, 24
  studSize: "2x4" | "2x6";
  headerSize: "2x6" | "2x8" | "2x10" | "2x12";
  wastePercent: number;
  openings: FramingOpening[];
}

export interface FramingCutItem {
  name: string;
  lengthIn: number;
  quantity: number;
  purpose: string;
}

export interface FramingResult {
  studsCount: number;
  platesCount: number;
  headersCount: number;
  sillsCount: number;
  nailsCount: number;
  totalLumberCount: number;
  cutList: FramingCutItem[];
  warnings: string[];
  visualElements: {
    studs: { x: number; y: number; width: number; height: number; type: "standard" | "king" | "jack" | "cripple-top" | "cripple-bottom" }[];
    headers: { x: number; y: number; width: number; height: number }[];
    sills: { x: number; y: number; width: number; height: number }[];
    plates: { x: number; y: number; width: number; height: number; type: "top" | "double-top" | "bottom" }[];
  };
}

export function getHeaderHeight(size: string): number {
  switch (size) {
    case "2x6": return 5.5;
    case "2x8": return 7.25;
    case "2x10": return 9.25;
    case "2x12": return 11.25;
    default: return 7.25;
  }
}

export function calculateFraming(dims: FramingDimensions): FramingResult {
  const wallLength = dims.wallLengthFt * 12;
  const wallHeight = dims.wallHeightFt * 12;
  const spacing = dims.studSpacingIn;
  const headerH = getHeaderHeight(dims.headerSize);
  const studW = 1.5; // 2x4 and 2x6 are both 1.5" thick on the face
  const plateH = 1.5;

  const warnings: string[] = [];
  const cutList: FramingCutItem[] = [];

  // 1. Validate Openings
  const sortedOpenings = [...dims.openings].sort((a, b) => a.x - b.x);
  for (let i = 0; i < sortedOpenings.length; i++) {
    const op = sortedOpenings[i];
    const isDoubleJack = op.width > 72;
    const requiredMargin = isDoubleJack ? 4.5 : 3.0; // King + Jack(s) width

    // Check wall boundaries
    if (op.x - requiredMargin < 0) {
      warnings.push(`Opening "${op.name}" is too close to the left wall edge. Minimum space required: ${requiredMargin}".`);
    }
    if (op.x + op.width + requiredMargin > wallLength) {
      warnings.push(`Opening "${op.name}" is too close to the right wall edge. Minimum space required: ${requiredMargin}".`);
    }
    if (op.y + op.height + headerH > wallHeight - (plateH * 2)) {
      warnings.push(`Opening "${op.name}" header exceeds wall height. Increase wall height or reduce opening height.`);
    }

    // Check overlaps with other openings
    if (i < sortedOpenings.length - 1) {
      const nextOp = sortedOpenings[i + 1];
      const nextIsDoubleJack = nextOp.width > 72;
      const nextRequiredMargin = nextIsDoubleJack ? 4.5 : 3.0;
      const gap = nextOp.x - (op.x + op.width);
      const minGap = requiredMargin + nextRequiredMargin;
      if (gap < minGap) {
        warnings.push(`Openings "${op.name}" and "${nextOp.name}" are too close. Minimum framing gap required: ${minGap}".`);
      }
    }
  }

  // 2. Structural Elements Storage
  const studs: { x: number; y: number; width: number; height: number; type: "standard" | "king" | "jack" | "cripple-top" | "cripple-bottom" }[] = [];
  const headers: { x: number; y: number; width: number; height: number }[] = [];
  const sills: { x: number; y: number; width: number; height: number }[] = [];
  const plates: { x: number; y: number; width: number; height: number; type: "top" | "double-top" | "bottom" }[] = [];

  // 3. Add Plates
  // Bottom plate (Sole plate)
  plates.push({ x: 0, y: 0, width: wallLength, height: plateH, type: "bottom" });
  // Top plate
  plates.push({ x: 0, y: wallHeight - (plateH * 2), width: wallLength, height: plateH, type: "top" });
  // Double top plate
  plates.push({ x: 0, y: wallHeight - plateH, width: wallLength, height: plateH, type: "double-top" });

  const studLength = wallHeight - (plateH * 3); // standard full stud length

  // 4. Generate King & Jack Studs, Headers, and Sills for Openings
  const openingFramingRanges: { start: number; end: number }[] = [];

  sortedOpenings.forEach(op => {
    const isDoubleJack = op.width > 72;
    const jackCount = isDoubleJack ? 2 : 1;
    const totalSideFramingW = studW * (1 + jackCount); // King (1) + Jacks (1 or 2)

    // Left framing coordinates
    const leftKingX = op.x - totalSideFramingW;
    const leftJackX = op.x - (studW * jackCount);

    // Right framing coordinates
    const rightJackX = op.x + op.width;
    const rightKingX = op.x + op.width + (studW * jackCount);

    // Track standard stud exclusions
    openingFramingRanges.push({ start: leftKingX, end: rightKingX + studW });

    // Add King Studs (full height)
    studs.push({ x: leftKingX, y: plateH, width: studW, height: studLength, type: "king" });
    studs.push({ x: rightKingX, y: plateH, width: studW, height: studLength, type: "king" });

    // Add Jack Studs (support the header)
    const jackH = op.y + op.height - plateH;
    for (let j = 0; j < jackCount; j++) {
      studs.push({ x: leftJackX + (j * studW), y: plateH, width: studW, height: jackH, type: "jack" });
      studs.push({ x: rightJackX + (j * studW), y: plateH, width: studW, height: jackH, type: "jack" });
    }

    // Add Header (sits on Jack studs, spans opening + jacks)
    const headerW = op.width + (studW * jackCount * 2);
    const headerX = leftJackX;
    const headerY = op.y + op.height;
    headers.push({ x: headerX, y: headerY, width: headerW, height: headerH });

    // Add Sill (for Windows)
    if (op.type === "window") {
      const sillW = op.width;
      const sillX = op.x;
      const sillY = op.y - plateH; // window sill plate thickness
      sills.push({ x: sillX, y: sillY, width: sillW, height: plateH });
    }
  });

  // 5. Generate O.C. Stud Grid (and Cripples)
  const maxOCStuds = Math.ceil(wallLength / spacing);
  for (let i = 0; i <= maxOCStuds; i++) {
    let studX = i * spacing;
    if (studX + studW > wallLength) {
      break;
    }

    // Check if this standard stud falls within any opening's structural framing
    let isInsideOpening = false;
    let activeOpening: FramingOpening | null = null;

    for (const op of sortedOpenings) {
      const isDoubleJack = op.width > 72;
      const jackCount = isDoubleJack ? 2 : 1;
      const leftFramingBoundary = op.x - (studW * (1 + jackCount));
      const rightFramingBoundary = op.x + op.width + (studW * (1 + jackCount));

      if (studX + studW > leftFramingBoundary && studX < rightFramingBoundary) {
        isInsideOpening = true;
        // Check if it falls specifically in the cripple zone (the rough opening itself)
        if (studX + studW > op.x && studX < op.x + op.width) {
          activeOpening = op;
        }
        break;
      }
    }

    if (!isInsideOpening) {
      // Add regular standard stud
      studs.push({ x: studX, y: plateH, width: studW, height: studLength, type: "standard" });
    } else if (activeOpening) {
      // Add Cripple Studs
      // Top Cripple: from top of header to bottom of top plates
      const headerY = activeOpening.y + activeOpening.height;
      const crippleTopY = headerY + headerH;
      const crippleTopH = (wallHeight - (plateH * 2)) - crippleTopY;
      if (crippleTopH > 0) {
        studs.push({ x: studX, y: crippleTopY, width: studW, height: crippleTopH, type: "cripple-top" });
      }

      // Bottom Cripple (only for Windows): from bottom plate to sill
      if (activeOpening.type === "window") {
        const crippleBottomH = activeOpening.y - plateH - plateH;
        if (crippleBottomH > 0) {
          studs.push({ x: studX, y: plateH, width: studW, height: crippleBottomH, type: "cripple-bottom" });
        }
      }
    }
  }

  // Ensure an end stud exists if the last O.C. stud isn't exactly at the end
  const lastStudX = wallLength - studW;
  const hasEndStud = studs.some(s => s.x >= lastStudX - 1 && s.y === plateH && s.height === studLength);
  if (!hasEndStud) {
    // Check if end stud would clash with an opening
    let isEndClash = false;
    for (const op of sortedOpenings) {
      const isDoubleJack = op.width > 72;
      const jackCount = isDoubleJack ? 2 : 1;
      const leftBoundary = op.x - (studW * (1 + jackCount));
      if (lastStudX + studW > leftBoundary) {
        isEndClash = true;
        break;
      }
    }
    if (!isEndClash) {
      studs.push({ x: lastStudX, y: plateH, width: studW, height: studLength, type: "standard" });
    }
  }

  // 6. Generate Cut List & Materials Calculations
  const counts = {
    standard: 0,
    king: 0,
    jack: 0,
    crippleTop: 0,
    crippleBottom: 0
  };

  studs.forEach(s => {
    if (s.type === "standard") counts.standard++;
    else if (s.type === "king") counts.king++;
    else if (s.type === "jack") counts.jack++;
    else if (s.type === "cripple-top") counts.crippleTop++;
    else if (s.type === "cripple-bottom") counts.crippleBottom++;
  });

  // Group cuts
  if (counts.standard + counts.king > 0) {
    cutList.push({
      name: `Full Studs (${dims.studSize})`,
      lengthIn: studLength,
      quantity: counts.standard + counts.king,
      purpose: "Standard framing and king studs"
    });
  }

  // Group jack studs by length (in case openings have different heights)
  const jackHeightsMap = new Map<number, number>();
  studs.filter(s => s.type === "jack").forEach(s => {
    jackHeightsMap.set(s.height, (jackHeightsMap.get(s.height) || 0) + 1);
  });
  jackHeightsMap.forEach((qty, len) => {
    cutList.push({
      name: `Jack Studs (${dims.studSize})`,
      lengthIn: len,
      quantity: qty,
      purpose: "Opening vertical header support"
    });
  });

  // Group top cripples
  const topCrippleHeightsMap = new Map<number, number>();
  studs.filter(s => s.type === "cripple-top").forEach(s => {
    topCrippleHeightsMap.set(s.height, (topCrippleHeightsMap.get(s.height) || 0) + 1);
  });
  topCrippleHeightsMap.forEach((qty, len) => {
    cutList.push({
      name: `Top Cripple Studs (${dims.studSize})`,
      lengthIn: len,
      quantity: qty,
      purpose: "Above header support"
    });
  });

  // Group bottom cripples
  const bottomCrippleHeightsMap = new Map<number, number>();
  studs.filter(s => s.type === "cripple-bottom").forEach(s => {
    bottomCrippleHeightsMap.set(s.height, (bottomCrippleHeightsMap.get(s.height) || 0) + 1);
  });
  bottomCrippleHeightsMap.forEach((qty, len) => {
    cutList.push({
      name: `Bottom Cripple Studs (${dims.studSize})`,
      lengthIn: len,
      quantity: qty,
      purpose: "Below window sill support"
    });
  });

  // Header cuts (Headers are doubled, so 2 pieces per header)
  headers.forEach((h, index) => {
    cutList.push({
      name: `Header Lumber (${dims.headerSize})`,
      lengthIn: h.width,
      quantity: 2,
      purpose: `Double header for Opening ${index + 1}`
    });
  });

  // Window sills
  sills.forEach((s, index) => {
    cutList.push({
      name: `Sill Lumber (${dims.studSize})`,
      lengthIn: s.width,
      quantity: 1,
      purpose: `Window sill plate for Window ${index + 1}`
    });
  });

  // Plates cuts (Bottom & double top plates = 3 rows)
  cutList.push({
    name: `Wall Plates (${dims.studSize})`,
    lengthIn: wallLength,
    quantity: 3,
    purpose: "Bottom sole plate & double top plates"
  });

  // 7. Calculate Total Lumber Pieces to Buy (8ft, 10ft, 12ft, 16ft standard lengths)
  // Let's calculate total linear feet needed for studs/plates and convert it to total boards to purchase.
  let totalStudLinearFt = 0;
  studs.forEach(s => {
    totalStudLinearFt += s.height / 12;
  });
  sills.forEach(s => {
    totalStudLinearFt += s.width / 12;
  });
  // Plates linear feet
  totalStudLinearFt += (wallLength * 3) / 12;

  // Apply waste factor
  const wasteMult = 1 + (dims.wastePercent / 100);
  const totalStudLinearFtWithWaste = totalStudLinearFt * wasteMult;

  // Choose standard board length based on wall height
  let boardLengthFt = 8;
  if (dims.wallHeightFt > 12) {
    boardLengthFt = 16;
  } else if (dims.wallHeightFt > 10) {
    boardLengthFt = 12;
  } else if (dims.wallHeightFt > 8) {
    boardLengthFt = 10;
  }

  const studsCount = Math.ceil(totalStudLinearFtWithWaste / boardLengthFt);

  // Headers total lumber (usually separate because they are larger e.g. 2x8 or 2x10)
  let totalHeaderLinearFt = 0;
  headers.forEach(h => {
    totalHeaderLinearFt += (h.width * 2) / 12; // doubled header
  });
  const totalHeaderLinearFtWithWaste = totalHeaderLinearFt * wasteMult;
  const headersCount = Math.ceil(totalHeaderLinearFtWithWaste / 8);

  // Total nails needed (approx 6 nails per stud connection)
  const totalPieces = studs.length + 3; // studs + plates
  const nailsCount = Math.ceil(totalPieces * 6 * 1.05); // 5% extra

  return {
    studsCount,
    platesCount: 3,
    headersCount,
    sillsCount: sills.length,
    nailsCount,
    totalLumberCount: studsCount + headersCount,
    cutList,
    warnings,
    visualElements: {
      studs,
      headers,
      sills,
      plates
    }
  };
}

export function decimalToFraction(val: number): string {
  if (Number.isInteger(val)) return `${val}"`;
  const intPart = Math.floor(val);
  const decPart = val - intPart;

  const tolerances = [
    { dec: 0.125, frac: "1/8" },
    { dec: 0.25, frac: "1/4" },
    { dec: 0.375, frac: "3/8" },
    { dec: 0.5, frac: "1/2" },
    { dec: 0.625, frac: "5/8" },
    { dec: 0.75, frac: "3/4" },
    { dec: 0.875, frac: "7/8" }
  ];

  let bestFrac = "";
  let minDiff = 1;
  for (const t of tolerances) {
    const diff = Math.abs(decPart - t.dec);
    if (diff < minDiff && diff < 0.0625) {
      minDiff = diff;
      bestFrac = t.frac;
    }
  }

  if (bestFrac) {
    return intPart > 0 ? `${intPart} ${bestFrac}"` : `${bestFrac}"`;
  }
  return `${val.toFixed(3)}"`;
}
