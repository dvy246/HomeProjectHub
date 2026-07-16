export interface ConcreteSlabSeed {
  slug: string;
  length: number;
  width: number;
  thickness: number;
  label: string;
}

export interface PaintRoomSeed {
  slug: string;
  length: number;
  width: number;
  height: number;
  doors: number;
  windows: number;
  coats: number;
  label: string;
}

export interface SqFtSeed {
  slug: string;
  length: number;
  width: number;
  label: string;
}

export interface TileFloorSeed {
  slug: string;
  length: number;
  width: number;
  tileWidth: number;
  tileLength: number;
  layout: "grid" | "diagonal" | "herringbone";
  label: string;
}

export interface RoofShingleSeed {
  slug: string;
  length: number;
  width: number;
  pitch: number;
  roofShape: "gable" | "hip";
  label: string;
}

export const CONCRETE_SLAB_SEEDS: ConcreteSlabSeed[] = [
  { slug: "4x4x4", length: 4, width: 4, thickness: 4, label: "4×4×4″ Post Footing" },
  { slug: "6x6x4", length: 6, width: 6, thickness: 4, label: "6×6×4″ Pad" },
  { slug: "8x10x4", length: 8, width: 10, thickness: 4, label: "8×10×4″ Shed Base" },
  { slug: "8x12x4", length: 8, width: 12, thickness: 4, label: "8×12×4″ Shed Base" },
  { slug: "10x10x4", length: 10, width: 10, thickness: 4, label: "10×10×4″ Patio Slab" },
  { slug: "10x12x4", length: 10, width: 12, thickness: 4, label: "10×12×4″ Patio Slab" },
  { slug: "10x14x4", length: 10, width: 14, thickness: 4, label: "10×14×4″ Patio Slab" },
  { slug: "10x20x4", length: 10, width: 20, thickness: 4, label: "10×20×4″ Walkway" },
  { slug: "12x12x4", length: 12, width: 12, thickness: 4, label: "12×12×4″ Shed Slab" },
  { slug: "12x14x4", length: 12, width: 14, thickness: 4, label: "12×14×4″ Patio Slab" },
  { slug: "12x16x4", length: 12, width: 16, thickness: 4, label: "12×16×4″ Patio Slab" },
  { slug: "12x20x4", length: 12, width: 20, thickness: 4, label: "12×20×4″ Patio Slab" },
  { slug: "12x24x4", length: 12, width: 24, thickness: 4, label: "12×24×4″ Patio Slab" },
  { slug: "16x16x4", length: 16, width: 16, thickness: 4, label: "16×16×4″ Garage Slab" },
  { slug: "20x20x4", length: 20, width: 20, thickness: 4, label: "20×20×4″ Garage Slab" },
  { slug: "20x24x6", length: 20, width: 24, thickness: 6, label: "20×24×6″ Driveway" },
  { slug: "20x30x6", length: 20, width: 30, thickness: 6, label: "20×30×6″ Driveway" },
  { slug: "24x24x6", length: 24, width: 24, thickness: 6, label: "24×24×6″ Driveway" },
  { slug: "24x30x6", length: 24, width: 30, thickness: 6, label: "24×30×6″ Driveway" },
  { slug: "30x30x6", length: 30, width: 30, thickness: 6, label: "30×30×6″ Garage Floor" },
  { slug: "30x40x6", length: 30, width: 40, thickness: 6, label: "30×40×6″ Shop Floor" },
  { slug: "40x60x6", length: 40, width: 60, thickness: 6, label: "40×60×6″ Shop Floor" },
  { slug: "10x10x5", length: 10, width: 10, thickness: 5, label: "10×10×5″ Heavy Patio" },
  { slug: "10x10x6", length: 10, width: 10, thickness: 6, label: "10×10×6″ Heavy Pad" },
  { slug: "5x10x4", length: 5, width: 10, thickness: 4, label: "5×10×4″ Walkway" },
  { slug: "3x20x4", length: 3, width: 20, thickness: 4, label: "3×20×4″ Sidewalk" },
  { slug: "4x40x4", length: 4, width: 40, thickness: 4, label: "4×40×4″ Sidewalk" },
  { slug: "8x20x4", length: 8, width: 20, thickness: 4, label: "8×20×4″ Shed Base" },
  { slug: "12x18x4", length: 12, width: 18, thickness: 4, label: "12×18×4″ Deck Pad" },
  { slug: "15x15x4", length: 15, width: 15, thickness: 4, label: "15×15×4″ Patio" },
  { slug: "15x20x4", length: 15, width: 20, thickness: 4, label: "15×20×4″ Patio" },
  { slug: "18x18x4", length: 18, width: 18, thickness: 4, label: "18×18×4″ Garage Slab" },
  { slug: "20x24x4", length: 20, width: 24, thickness: 4, label: "20×24×4″ Garage Slab" },
  { slug: "20x30x4", length: 20, width: 30, thickness: 4, label: "20×30×4″ Garage Slab" },
  { slug: "24x36x6", length: 24, width: 36, thickness: 6, label: "24×36×6″ Driveway" },
  { slug: "30x40x4", length: 30, width: 40, thickness: 4, label: "30×40×4″ Barn Slab" },
  { slug: "36x48x6", length: 36, width: 48, thickness: 6, label: "36×48×6″ Shop Floor" },
  { slug: "40x60x4", length: 40, width: 60, thickness: 4, label: "40×60×4″ Barn Slab" },
  { slug: "50x50x6", length: 50, width: 50, thickness: 6, label: "50×50×6″ Warehouse Slab" },
];

export const PAINT_ROOM_SEEDS: PaintRoomSeed[] = [
  { slug: "10x10-room-8ft", length: 10, width: 10, height: 8, doors: 1, windows: 1, coats: 2, label: "10×10 Bedroom (8′ Ceilings)" },
  { slug: "10x12-room-8ft", length: 10, width: 12, height: 8, doors: 1, windows: 1, coats: 2, label: "10×12 Nursery (8′ Ceilings)" },
  { slug: "11x11-room-8ft", length: 11, width: 11, height: 8, doors: 1, windows: 1, coats: 2, label: "11×11 Bedroom (8′ Ceilings)" },
  { slug: "11x12-room-8ft", length: 11, width: 12, height: 8, doors: 1, windows: 1, coats: 2, label: "11×12 Bedroom (8′ Ceilings)" },
  { slug: "12x12-room-8ft", length: 12, width: 12, height: 8, doors: 1, windows: 1, coats: 2, label: "12×12 Bedroom (8′ Ceilings)" },
  { slug: "12x14-room-8ft", length: 12, width: 14, height: 8, doors: 1, windows: 2, coats: 2, label: "12×14 Master Bedroom (8′ Ceilings)" },
  { slug: "12x16-room-8ft", length: 12, width: 16, height: 8, doors: 1, windows: 2, coats: 2, label: "12×16 Living Room (8′ Ceilings)" },
  { slug: "12x18-room-8ft", length: 12, width: 18, height: 8, doors: 2, windows: 2, coats: 2, label: "12×18 Family Room (8′ Ceilings)" },
  { slug: "12x20-room-8ft", length: 12, width: 20, height: 8, doors: 2, windows: 2, coats: 2, label: "12×20 Great Room (8′ Ceilings)" },
  { slug: "14x14-room-8ft", length: 14, width: 14, height: 8, doors: 1, windows: 2, coats: 2, label: "14×14 Bedroom (8′ Ceilings)" },
  { slug: "14x18-room-8ft", length: 14, width: 18, height: 8, doors: 2, windows: 2, coats: 2, label: "14×18 Living Room (8′ Ceilings)" },
  { slug: "14x20-room-8ft", length: 14, width: 20, height: 8, doors: 2, windows: 2, coats: 2, label: "14×20 Great Room (8′ Ceilings)" },
  { slug: "15x15-room-8ft", length: 15, width: 15, height: 8, doors: 1, windows: 2, coats: 2, label: "15×15 Bedroom (8′ Ceilings)" },
  { slug: "15x20-room-8ft", length: 15, width: 20, height: 8, doors: 2, windows: 3, coats: 2, label: "15×20 Living Room (8′ Ceilings)" },
  { slug: "16x16-room-8ft", length: 16, width: 16, height: 8, doors: 2, windows: 2, coats: 2, label: "16×16 Game Room (8′ Ceilings)" },
  { slug: "16x20-room-8ft", length: 16, width: 20, height: 8, doors: 2, windows: 3, coats: 2, label: "16×20 Family Room (8′ Ceilings)" },
  { slug: "20x20-room-8ft", length: 20, width: 20, height: 8, doors: 2, windows: 3, coats: 2, label: "20×20 Great Room (8′ Ceilings)" },
  { slug: "20x30-room-8ft", length: 20, width: 30, height: 8, doors: 2, windows: 4, coats: 2, label: "20×30 Basement Rec Room (8′ Ceilings)" },
  { slug: "12x12-room-9ft", length: 12, width: 12, height: 9, doors: 1, windows: 1, coats: 2, label: "12×12 Bedroom (9′ Ceilings)" },
  { slug: "12x14-room-9ft", length: 12, width: 14, height: 9, doors: 1, windows: 2, coats: 2, label: "12×14 Master Bedroom (9′ Ceilings)" },
  { slug: "12x16-room-9ft", length: 12, width: 16, height: 9, doors: 1, windows: 2, coats: 2, label: "12×16 Living Room (9′ Ceilings)" },
  { slug: "14x18-room-9ft", length: 14, width: 18, height: 9, doors: 2, windows: 2, coats: 2, label: "14×18 Living Room (9′ Ceilings)" },
  { slug: "16x20-room-9ft", length: 16, width: 20, height: 9, doors: 2, windows: 3, coats: 2, label: "16×20 Family Room (9′ Ceilings)" },
  { slug: "10x10-room-8ft-1coat", length: 10, width: 10, height: 8, doors: 1, windows: 1, coats: 1, label: "10×10 Room (1 Coat Touch-Up)" },
  { slug: "10x10-room-8ft-3coats", length: 10, width: 10, height: 8, doors: 1, windows: 1, coats: 3, label: "10×10 Room (3 Coats, Dark Color)" },
];

export const SQFT_SEEDS: SqFtSeed[] = [
  { slug: "8x10-room", length: 8, width: 10, label: "8×10 Room" },
  { slug: "8x12-room", length: 8, width: 12, label: "8×12 Room" },
  { slug: "10x10-room", length: 10, width: 10, label: "10×10 Room" },
  { slug: "10x12-room", length: 10, width: 12, label: "10×12 Room" },
  { slug: "10x14-room", length: 10, width: 14, label: "10×14 Room" },
  { slug: "10x20-room", length: 10, width: 20, label: "10×20 Room" },
  { slug: "11x11-room", length: 11, width: 11, label: "11×11 Room" },
  { slug: "12x10-room", length: 12, width: 10, label: "12×10 Room" },
  { slug: "12x12-room", length: 12, width: 12, label: "12×12 Room" },
  { slug: "12x14-room", length: 12, width: 14, label: "12×14 Room" },
  { slug: "12x16-room", length: 12, width: 16, label: "12×16 Room" },
  { slug: "12x18-room", length: 12, width: 18, label: "12×18 Room" },
  { slug: "12x20-room", length: 12, width: 20, label: "12×20 Room" },
  { slug: "14x14-room", length: 14, width: 14, label: "14×14 Room" },
  { slug: "14x18-room", length: 14, width: 18, label: "14×18 Room" },
  { slug: "14x20-room", length: 14, width: 20, label: "14×20 Room" },
  { slug: "15x15-room", length: 15, width: 15, label: "15×15 Room" },
  { slug: "15x20-room", length: 15, width: 20, label: "15×20 Room" },
  { slug: "16x16-room", length: 16, width: 16, label: "16×16 Room" },
  { slug: "16x20-room", length: 16, width: 20, label: "16×20 Room" },
  { slug: "18x18-room", length: 18, width: 18, label: "18×18 Room" },
  { slug: "20x20-room", length: 20, width: 20, label: "20×20 Room" },
  { slug: "20x24-room", length: 20, width: 24, label: "20×24 Room" },
  { slug: "20x30-room", length: 20, width: 30, label: "20×30 Room" },
  { slug: "24x24-room", length: 24, width: 24, label: "24×24 Room" },
  { slug: "24x30-room", length: 24, width: 30, label: "24×30 Room" },
  { slug: "30x30-room", length: 30, width: 30, label: "30×30 Room" },
  { slug: "30x40-room", length: 30, width: 40, label: "30×40 Room" },
  { slug: "40x60-room", length: 40, width: 60, label: "40×60 Room" },
  { slug: "50x100-plot", length: 50, width: 100, label: "50×100 Plot (5,000 sq ft)" },
];

export const TILE_FLOOR_SEEDS: TileFloorSeed[] = [
  { slug: "5x5-bath-12x12", length: 5, width: 5, tileWidth: 12, tileLength: 12, layout: "grid", label: "5×5 Bathroom (12×12 Tile Grid)" },
  { slug: "5x8-bath-12x24", length: 5, width: 8, tileWidth: 12, tileLength: 24, layout: "grid", label: "5×8 Bathroom (12×24 Tile Grid)" },
  { slug: "6x8-bath-12x12", length: 6, width: 8, tileWidth: 12, tileLength: 12, layout: "grid", label: "6×8 Bathroom (12×12 Tile Grid)" },
  { slug: "8x10-kitchen-12x12", length: 8, width: 10, tileWidth: 12, tileLength: 12, layout: "grid", label: "8×10 Kitchen (12×12 Tile Grid)" },
  { slug: "8x10-kitchen-12x24", length: 8, width: 10, tileWidth: 12, tileLength: 24, layout: "grid", label: "8×10 Kitchen (12×24 Tile Grid)" },
  { slug: "8x10-kitchen-diagonal", length: 8, width: 10, tileWidth: 12, tileLength: 12, layout: "diagonal", label: "8×10 Kitchen (12×12 Diagonal)" },
  { slug: "10x10-room-12x12", length: 10, width: 10, tileWidth: 12, tileLength: 12, layout: "grid", label: "10×10 Room (12×12 Tile Grid)" },
  { slug: "10x10-room-12x24", length: 10, width: 10, tileWidth: 12, tileLength: 24, layout: "grid", label: "10×10 Room (12×24 Tile Grid)" },
  { slug: "10x12-room-12x12", length: 10, width: 12, tileWidth: 12, tileLength: 12, layout: "grid", label: "10×12 Room (12×12 Tile Grid)" },
  { slug: "10x12-room-18x18", length: 10, width: 12, tileWidth: 18, tileLength: 18, layout: "grid", label: "10×12 Room (18×18 Tile Grid)" },
  { slug: "10x12-herringbone", length: 10, width: 12, tileWidth: 6, tileLength: 24, layout: "herringbone", label: "10×12 Room (6×24 Herringbone)" },
  { slug: "12x12-room-12x12", length: 12, width: 12, tileWidth: 12, tileLength: 12, layout: "grid", label: "12×12 Room (12×12 Tile Grid)" },
  { slug: "12x12-room-12x24", length: 12, width: 12, tileWidth: 12, tileLength: 24, layout: "grid", label: "12×12 Room (12×24 Tile Grid)" },
  { slug: "12x12-diagonal", length: 12, width: 12, tileWidth: 12, tileLength: 12, layout: "diagonal", label: "12×12 Room (12×12 Diagonal)" },
  { slug: "12x14-master-12x24", length: 12, width: 14, tileWidth: 12, tileLength: 24, layout: "grid", label: "12×14 Master Bath (12×24)" },
  { slug: "12x16-living-18x18", length: 12, width: 16, tileWidth: 18, tileLength: 18, layout: "grid", label: "12×16 Living Room (18×18)" },
  { slug: "12x20-great-24x24", length: 12, width: 20, tileWidth: 24, tileLength: 24, layout: "grid", label: "12×20 Great Room (24×24)" },
  { slug: "15x15-foyer-12x24", length: 15, width: 15, tileWidth: 12, tileLength: 24, layout: "grid", label: "15×15 Foyer (12×24)" },
  { slug: "16x20-kitchen-18x18", length: 16, width: 20, tileWidth: 18, tileLength: 18, layout: "grid", label: "16×20 Kitchen (18×18)" },
  { slug: "20x20-great-24x24", length: 20, width: 20, tileWidth: 24, tileLength: 24, layout: "grid", label: "20×20 Great Room (24×24)" },
  { slug: "4x4-bath-6x6", length: 4, width: 4, tileWidth: 6, tileLength: 6, layout: "grid", label: "4×4 Bathroom (6×6 Mosaic)" },
  { slug: "3x5-shower-12x12", length: 3, width: 5, tileWidth: 12, tileLength: 12, layout: "grid", label: "3×5 Shower (12×12 Tile)" },
  { slug: "5x7-bath-8x8", length: 5, width: 7, tileWidth: 8, tileLength: 8, layout: "grid", label: "5×7 Bathroom (8×8 Tile)" },
];

export const ROOF_SHINGLE_SEEDS: RoofShingleSeed[] = [
  { slug: "1200sqft-412", length: 40, width: 30, pitch: 4, roofShape: "gable", label: "1,200 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "1200sqft-612", length: 40, width: 30, pitch: 6, roofShape: "gable", label: "1,200 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "1500sqft-412", length: 50, width: 30, pitch: 4, roofShape: "gable", label: "1,500 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "1500sqft-612", length: 50, width: 30, pitch: 6, roofShape: "gable", label: "1,500 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "1500sqft-812", length: 50, width: 30, pitch: 8, roofShape: "gable", label: "1,500 sq ft Gable Roof (8/12 Pitch)" },
  { slug: "1800sqft-412", length: 60, width: 30, pitch: 4, roofShape: "gable", label: "1,800 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "1800sqft-612", length: 60, width: 30, pitch: 6, roofShape: "gable", label: "1,800 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "2000sqft-412", length: 50, width: 40, pitch: 4, roofShape: "gable", label: "2,000 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "2000sqft-612", length: 50, width: 40, pitch: 6, roofShape: "gable", label: "2,000 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "2000sqft-812", length: 50, width: 40, pitch: 8, roofShape: "gable", label: "2,000 sq ft Gable Roof (8/12 Pitch)" },
  { slug: "2000sqft-1012", length: 50, width: 40, pitch: 10, roofShape: "gable", label: "2,000 sq ft Gable Roof (10/12 Pitch)" },
  { slug: "2400sqft-612", length: 60, width: 40, pitch: 6, roofShape: "gable", label: "2,400 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "2400sqft-812", length: 60, width: 40, pitch: 8, roofShape: "gable", label: "2,400 sq ft Gable Roof (8/12 Pitch)" },
  { slug: "2500sqft-412", length: 50, width: 50, pitch: 4, roofShape: "gable", label: "2,500 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "2500sqft-612", length: 50, width: 50, pitch: 6, roofShape: "gable", label: "2,500 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "3000sqft-612", length: 60, width: 50, pitch: 6, roofShape: "gable", label: "3,000 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "3000sqft-812", length: 60, width: 50, pitch: 8, roofShape: "gable", label: "3,000 sq ft Gable Roof (8/12 Pitch)" },
  { slug: "1200sqft-412-hip", length: 40, width: 30, pitch: 4, roofShape: "hip", label: "1,200 sq ft Hip Roof (4/12 Pitch)" },
  { slug: "1500sqft-612-hip", length: 50, width: 30, pitch: 6, roofShape: "hip", label: "1,500 sq ft Hip Roof (6/12 Pitch)" },
  { slug: "2000sqft-612-hip", length: 50, width: 40, pitch: 6, roofShape: "hip", label: "2,000 sq ft Hip Roof (6/12 Pitch)" },
  { slug: "2400sqft-812-hip", length: 60, width: 40, pitch: 8, roofShape: "hip", label: "2,400 sq ft Hip Roof (8/12 Pitch)" },
  { slug: "3000sqft-612-hip", length: 60, width: 50, pitch: 6, roofShape: "hip", label: "3,000 sq ft Hip Roof (6/12 Pitch)" },
  { slug: "800sqft-312", length: 40, width: 20, pitch: 3, roofShape: "gable", label: "800 sq ft Gable Roof (3/12 Pitch)" },
  { slug: "1000sqft-412", length: 40, width: 25, pitch: 4, roofShape: "gable", label: "1,000 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "2200sqft-712", length: 55, width: 40, pitch: 7, roofShape: "gable", label: "2,200 sq ft Gable Roof (7/12 Pitch)" },
  { slug: "2600sqft-912", length: 65, width: 40, pitch: 9, roofShape: "gable", label: "2,600 sq ft Gable Roof (9/12 Pitch)" },
  { slug: "3500sqft-612", length: 70, width: 50, pitch: 6, roofShape: "gable", label: "3,500 sq ft Gable Roof (6/12 Pitch)" },
  { slug: "4000sqft-812", length: 80, width: 50, pitch: 8, roofShape: "gable", label: "4,000 sq ft Gable Roof (8/12 Pitch)" },
  { slug: "4500sqft-412", length: 90, width: 50, pitch: 4, roofShape: "gable", label: "4,500 sq ft Gable Roof (4/12 Pitch)" },
  { slug: "5000sqft-612", length: 100, width: 50, pitch: 6, roofShape: "gable", label: "5,000 sq ft Gable Roof (6/12 Pitch)" },
];
