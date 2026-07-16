export interface DeckDimensions {
  widthFt: number;  // along the house (parallel to beams)
  depthFt: number;  // outward from house (parallel to joists)
  joistSpacingIn: 12 | 16 | 24;
  boardType: "wood" | "composite";
  postHeightFt: number;
}

export interface DeckMaterials {
  footingsCount: number;
  postsCount: number;
  beamsCount: number; // number of beams
  beamLinearFt: number; // total double beam footage
  joistsCount: number;
  joistLinearFt: number; // total joist footage
  deckBoards16Ft: number; // number of 16-ft decking boards
  joistHangers: number;
  postBases: number;
  postCaps: number;
  deckScrewsLbs: number;
  framingNailsLbs: number;
  lumberWeightLbs: number;
  concreteWeightLbs: number;
  totalWeightLbs: number;
}

/**
 * Calculates deck materials and weights based on dimensions and spacing options.
 */
export function calculateDeckMaterials(dims: DeckDimensions): DeckMaterials {
  const { widthFt, depthFt, joistSpacingIn, postHeightFt } = dims;

  if (widthFt <= 0 || depthFt <= 0) {
    return {
      footingsCount: 0,
      postsCount: 0,
      beamsCount: 0,
      beamLinearFt: 0,
      joistsCount: 0,
      joistLinearFt: 0,
      deckBoards16Ft: 0,
      joistHangers: 0,
      postBases: 0,
      postCaps: 0,
      deckScrewsLbs: 0,
      framingNailsLbs: 0,
      lumberWeightLbs: 0,
      concreteWeightLbs: 0,
      totalWeightLbs: 0,
    };
  }

  // 1. Beams and Posts/Footings
  // Max span for double 2x10 beams is typically 8 feet between posts.
  // Beams are placed at the outer rim and intermediate spans (every 10 feet max joist span).
  const beamsCount = Math.max(1, Math.ceil(depthFt / 10)); // intermediate beams required if depth > 10ft
  const postsPerBeam = Math.ceil(widthFt / 8) + 1; // posts spaced max 8ft along each beam
  
  // Assuming a ledger board is attached directly to the house, the house ledger acts as the first beam
  // and does not require footings or support posts.
  const postsCount = postsPerBeam * beamsCount;
  const footingsCount = postsCount;

  // Beams are doubled 2x10s
  const beamLinearFt = widthFt * beamsCount * 2;

  // 2. Joists
  // Run perpendicular to beams (along depthFt direction)
  const joistsCount = Math.ceil((widthFt * 12) / joistSpacingIn) + 1;
  const joistLinearFt = joistsCount * depthFt;

  // 3. Decking Boards (5/4 x 6, actual width 5.5 inches = 0.458 ft)
  // Standard length is 16 ft. Area per board = 16 * 0.458 = 7.33 sq ft.
  // Add 10% waste buffer.
  const deckArea = widthFt * depthFt;
  const boardArea = 16 * (5.5 / 12);
  const deckBoards16Ft = Math.ceil((deckArea * 1.10) / boardArea);

  // 4. Hardware and Fasteners
  const joistHangers = joistsCount; // hangers at the ledger board
  const postBases = postsCount;
  const postCaps = postsCount;

  // 3.5 screws per square foot. 1 box of 350 screws is ~5 lbs (approx. 70 screws/lb)
  const deckScrewsLbs = Math.max(5, Math.ceil((deckArea * 3.5) / 70));
  // Framing nails: ~5 lbs of nails per 100 sq ft of deck framing
  const framingNailsLbs = Math.max(5, Math.ceil((deckArea * 5) / 100));

  // 5. Weight Calculations
  // Wet treated lumber densities:
  // 2x10 (ledger & beams): 3.0 lbs / ft
  // 2x8 (joists): 2.2 lbs / ft
  // 5/4x6 (decking): 1.8 lbs / ft
  // 4x4 (posts): 3.8 lbs / ft
  const beamWeight = beamLinearFt * 3.0;
  const joistWeight = joistLinearFt * 2.2;
  const deckingWeight = deckBoards16Ft * 16 * 1.8;
  const postWeight = postsCount * postHeightFt * 3.8;
  const lumberWeightLbs = Math.ceil(beamWeight + joistWeight + deckingWeight + postWeight);

  // Concrete for footings (assume 12" diameter, 36" deep = 2.3 cu ft)
  // Concrete weighs ~150 lbs / cu ft. So ~345 lbs per footing.
  const concreteWeightLbs = footingsCount * 345;

  const totalWeightLbs = lumberWeightLbs + concreteWeightLbs + deckScrewsLbs + framingNailsLbs;

  return {
    footingsCount,
    postsCount,
    beamsCount,
    beamLinearFt,
    joistsCount,
    joistLinearFt,
    deckBoards16Ft,
    joistHangers,
    postBases,
    postCaps,
    deckScrewsLbs,
    framingNailsLbs,
    lumberWeightLbs,
    concreteWeightLbs,
    totalWeightLbs,
  };
}
