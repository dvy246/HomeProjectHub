export interface BlueprintSlabSeed {
  slug: string;
  length: number;
  width: number;
  thickness: number;
  shape: "rect" | "circle" | "l-shape";
  diameter?: number;
  label: string;
}

export interface BlueprintDeckSeed {
  slug: string;
  width: number;
  depth: number;
  joistSpacing: 12 | 16 | 24;
  boardType: "wood" | "composite";
  postHeight: number;
  label: string;
}

export interface BlueprintFramingSeed {
  slug: string;
  length: number;
  height: number;
  studSpacing: number;
  studSize: "2x4" | "2x6";
  headerSize: "2x6" | "2x8" | "2x10" | "2x12";
  label: string;
}

export const BLUEPRINT_SLAB_SEEDS: BlueprintSlabSeed[] = [
  // Rectangular Slabs
  { slug: "8x8x4-slab", length: 8, width: 8, thickness: 4, shape: "rect", label: "8×8 Patio & Shed Slab (4″ Thick)" },
  { slug: "8x10x4-slab", length: 8, width: 10, thickness: 4, shape: "rect", label: "8×10 Shed Foundation (4″ Thick)" },
  { slug: "8x12x4-slab", length: 8, width: 12, thickness: 4, shape: "rect", label: "8×12 Shed Foundation (4″ Thick)" },
  { slug: "10x10x4-slab", length: 10, width: 10, thickness: 4, shape: "rect", label: "10×10 Patio Slab (4″ Thick)" },
  { slug: "10x12x4-slab", length: 10, width: 12, thickness: 4, shape: "rect", label: "10×12 Backyard Patio (4″ Thick)" },
  { slug: "10x16x4-slab", length: 10, width: 16, thickness: 4, shape: "rect", label: "10×16 Patio Slab (4″ Thick)" },
  { slug: "12x12x4-slab", length: 12, width: 12, thickness: 4, shape: "rect", label: "12×12 Shed Base (4″ Thick)" },
  { slug: "12x16x4-slab", length: 12, width: 16, thickness: 4, shape: "rect", label: "12×16 Patio Slab (4″ Thick)" },
  { slug: "12x20x4-slab", length: 12, width: 20, thickness: 4, shape: "rect", label: "12×20 Patio & Walkway (4″ Thick)" },
  { slug: "12x24x4-slab", length: 12, width: 24, thickness: 4, shape: "rect", label: "12×24 Patio Slab (4″ Thick)" },
  { slug: "14x14x4-slab", length: 14, width: 14, thickness: 4, shape: "rect", label: "14×14 Patio Slab (4″ Thick)" },
  { slug: "15x15x4-slab", length: 15, width: 15, thickness: 4, shape: "rect", label: "15×15 Patio Slab (4″ Thick)" },
  { slug: "16x16x4-slab", length: 16, width: 16, thickness: 4, shape: "rect", label: "16×16 Garage Slab (4″ Thick)" },
  { slug: "16x20x4-slab", length: 16, width: 20, thickness: 4, shape: "rect", label: "16×20 Patio Slab (4″ Thick)" },
  { slug: "20x20x4-slab", length: 20, width: 20, thickness: 4, shape: "rect", label: "20×20 Garage Slab (4″ Thick)" },
  
  // 6" Heavy Duty Slabs
  { slug: "10x10x6-slab", length: 10, width: 10, thickness: 6, shape: "rect", label: "10×10 Hot Tub Pad (6″ Thick)" },
  { slug: "12x12x6-slab", length: 12, width: 12, thickness: 6, shape: "rect", label: "12×12 Heavy Shed Slab (6″ Thick)" },
  { slug: "12x16x6-slab", length: 12, width: 16, thickness: 6, shape: "rect", label: "12×16 Heavy Utility Slab (6″ Thick)" },
  { slug: "16x24x6-slab", length: 16, width: 24, thickness: 6, shape: "rect", label: "16×24 Driveway Slab (6″ Thick)" },
  { slug: "20x20x6-slab", length: 20, width: 20, thickness: 6, shape: "rect", label: "20×20 Heavy Garage Slab (6″ Thick)" },
  { slug: "24x24x6-slab", length: 24, width: 24, thickness: 6, shape: "rect", label: "24×24 Double Car Driveway (6″ Thick)" },
  { slug: "30x30x6-slab", length: 30, width: 30, thickness: 6, shape: "rect", label: "30×30 Shop Foundation (6″ Thick)" },

  // Circular Slabs (Diameter is stored in length/width as well)
  { slug: "10ft-round-slab", length: 10, width: 10, diameter: 10, thickness: 4, shape: "circle", label: "10ft Round Patio Slab (4″ Thick)" },
  { slug: "12ft-round-slab", length: 12, width: 12, diameter: 12, thickness: 4, shape: "circle", label: "12ft Round Gazebo Slab (4″ Thick)" },
  { slug: "15ft-round-slab", length: 15, width: 15, diameter: 15, thickness: 4, shape: "circle", label: "15ft Round Fire Pit Patio (4″ Thick)" }
];

export const BLUEPRINT_DECK_SEEDS: BlueprintDeckSeed[] = [
  { slug: "8x8-deck", width: 8, depth: 8, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "8×8 Square Deck" },
  { slug: "8x10-deck", width: 8, depth: 10, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "8×10 Platform Deck" },
  { slug: "10x10-deck", width: 10, depth: 10, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "10×10 Backyard Deck" },
  { slug: "10x12-deck", width: 10, depth: 12, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "10×12 Attached Deck" },
  { slug: "10x14-deck", width: 10, depth: 14, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "10×14 Patio Deck" },
  { slug: "12x12-deck", width: 12, depth: 12, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "12×12 Free Standing Deck" },
  { slug: "12x14-deck", width: 12, depth: 14, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "12×14 Attached Deck" },
  { slug: "12x16-deck", width: 12, depth: 16, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "12×16 Backyard Patio Deck" },
  { slug: "12x20-deck", width: 12, depth: 20, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "12×20 Large Entertainment Deck" },
  { slug: "14x14-deck", width: 14, depth: 14, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "14×14 Square Deck" },
  { slug: "14x16-deck", width: 14, depth: 16, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "14×16 Premium Attached Deck" },
  { slug: "14x20-deck", width: 14, depth: 20, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "14×20 Platform Deck" },
  { slug: "16x16-deck", width: 16, depth: 16, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "16×16 Double Joist Deck" },
  { slug: "16x20-deck", width: 16, depth: 20, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "16×20 Large Backyard Deck" },
  { slug: "16x24-deck", width: 16, depth: 24, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "16×24 Two-Level Entertainment Deck" },
  { slug: "20x20-deck", width: 20, depth: 20, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "20×20 Large Square Deck" },
  { slug: "20x24-deck", width: 20, depth: 24, joistSpacing: 16, boardType: "wood", postHeight: 3, label: "20×24 Multi-Zone Deck" },
  
  // Composite Board Variations
  { slug: "12x12-composite-deck", width: 12, depth: 12, joistSpacing: 16, boardType: "composite", postHeight: 3, label: "12×12 Composite Deck" },
  { slug: "12x16-composite-deck", width: 12, depth: 16, joistSpacing: 16, boardType: "composite", postHeight: 3, label: "12×16 Composite Deck" },
  { slug: "16x20-composite-deck", width: 16, depth: 20, joistSpacing: 16, boardType: "composite", postHeight: 3, label: "16×20 Composite Deck" }
];

export const BLUEPRINT_FRAMING_SEEDS: BlueprintFramingSeed[] = [
  { slug: "8ft-wall", length: 8, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "8-Foot Stud Wall (2x4 Construction)" },
  { slug: "10ft-wall", length: 10, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "10-Foot Stud Wall (2x4 Construction)" },
  { slug: "12ft-wall", length: 12, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "12-Foot Framing Wall (2x4 Construction)" },
  { slug: "14ft-wall", length: 14, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "14-Foot Framing Wall (2x4 Construction)" },
  { slug: "16ft-wall", length: 16, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "16-Foot Framing Wall (2x4 Construction)" },
  { slug: "20ft-wall", length: 20, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "20-Foot Exterior Wall (2x4 Construction)" },
  { slug: "24ft-wall", length: 24, height: 8, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "24-Foot Exterior Wall (2x4 Construction)" },
  
  // 9ft and 10ft heights (Common standard ceiling heights)
  { slug: "10ft-wall-9ft-high", length: 10, height: 9, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "10-Foot Wall (9′ Ceilings)" },
  { slug: "12ft-wall-9ft-high", length: 12, height: 9, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "12-Foot Wall (9′ Ceilings)" },
  { slug: "16ft-wall-9ft-high", length: 16, height: 9, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "16-Foot Wall (9′ Ceilings)" },
  { slug: "12ft-wall-10ft-high", length: 12, height: 10, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "12-Foot Wall (10′ Ceilings)" },
  { slug: "16ft-wall-10ft-high", length: 16, height: 10, studSpacing: 16, studSize: "2x4", headerSize: "2x10", label: "16-Foot Wall (10′ Ceilings)" },
  
  // 2x6 Heavy Duty Framing
  { slug: "12ft-2x6-wall", length: 12, height: 8, studSpacing: 16, studSize: "2x6", headerSize: "2x10", label: "12-Foot Structural Wall (2x6 Construction)" },
  { slug: "16ft-2x6-wall", length: 16, height: 8, studSpacing: 16, studSize: "2x6", headerSize: "2x10", label: "16-Foot Structural Wall (2x6 Construction)" },
  { slug: "20ft-2x6-wall", length: 20, height: 8, studSpacing: 16, studSize: "2x6", headerSize: "2x10", label: "20-Foot Load-Bearing Wall (2x6 Construction)" }
];
