export interface EstimateLink {
  href: string;
  label: string;
  description: string;
}

const RELATED_ESTIMATES_MAP: Record<string, EstimateLink[]> = {
  "concrete-slab": [
    {
      href: "/estimate/concrete-slab/10x10x4/",
      label: "10×10×4″ Patio Slab Estimate",
      description: "Pre-calculated concrete volume, bags, and weight for a 10×10 patio slab at 4″ thick.",
    },
    {
      href: "/estimate/concrete-slab/12x12x4/",
      label: "12×12×4″ Shed Slab Estimate",
      description: "Pre-calculated materials for a 12×12 shed foundation slab at 4″ thick.",
    },
    {
      href: "/estimate/concrete-slab/20x24x6/",
      label: "20×24×6″ Driveway Estimate",
      description: "Pre-calculated concrete volume and cost for a 20×24 driveway at 6″ thick.",
    },
  ],
  paint: [
    {
      href: "/estimate/paint-room/10x10-room-8ft/",
      label: "10×10 Bedroom (8′ Ceilings) Estimate",
      description: "Pre-calculated paint gallons for a 10×10 bedroom with standard door and window.",
    },
    {
      href: "/estimate/paint-room/12x12-room-8ft/",
      label: "12×12 Bedroom (8′ Ceilings) Estimate",
      description: "Pre-calculated paint gallons for a 12×12 bedroom with 8-foot ceilings.",
    },
    {
      href: "/estimate/paint-room/15x20-room-8ft/",
      label: "15×20 Living Room (8′ Ceilings) Estimate",
      description: "Pre-calculated paint gallons for a 15×20 living room with 3 windows.",
    },
  ],
  tile: [
    {
      href: "/estimate/tile-floor/5x5-bath-12x12/",
      label: "5×5 Bathroom (12×12 Tile Grid) Estimate",
      description: "Pre-calculated tile count for a 5×5 bathroom with 12×12 tiles in a grid layout.",
    },
    {
      href: "/estimate/tile-floor/10x12-room-12x12/",
      label: "10×12 Room (12×12 Tile Grid) Estimate",
      description: "Pre-calculated tile count for a 10×12 room with 12×12 tiles and 10% waste.",
    },
    {
      href: "/estimate/tile-floor/12x12-diagonal/",
      label: "12×12 Room (12×12 Diagonal) Estimate",
      description: "Pre-calculated tile count for a 12×12 room with diagonal layout and 15% waste.",
    },
  ],
  "square-footage": [
    {
      href: "/estimate/square-footage/12x12-room/",
      label: "12×12 Room Square Footage Estimate",
      description: "Pre-calculated area of a 12×12 room in square feet, square yards, and square meters.",
    },
    {
      href: "/estimate/square-footage/10x10-room/",
      label: "10×10 Room Square Footage Estimate",
      description: "Pre-calculated area of a 10×10 room in square feet, square yards, and square meters.",
    },
    {
      href: "/estimate/square-footage/15x20-room/",
      label: "15×20 Room Square Footage Estimate",
      description: "Pre-calculated area of a 15×20 room in square feet, square yards, and square meters.",
    },
  ],
  "roofing-shingles": [
    {
      href: "/estimate/roof-shingles/1200sqft-412/",
      label: "1,200 sq ft Gable Roof (4/12) Estimate",
      description: "Pre-calculated shingle bundles, squares, and nails for a 1,200 sq ft gable roof.",
    },
    {
      href: "/estimate/roof-shingles/1500sqft-612/",
      label: "1,500 sq ft Gable Roof (6/12) Estimate",
      description: "Pre-calculated shingle bundles for a 1,500 sq ft gable roof at 6/12 pitch.",
    },
    {
      href: "/estimate/roof-shingles/2000sqft-412/",
      label: "2,000 sq ft Gable Roof (4/12) Estimate",
      description: "Pre-calculated shingle bundles, underlayment, and cost for a 2,000 sq ft roof.",
    },
  ],
};

const DEFAULT_RELATED_ESTIMATES: EstimateLink[] = [
  {
    href: "/estimate/concrete-slab/10x10x4/",
    label: "10×10 Concrete Slab Estimate",
    description: "Pre-calculated concrete volume and cost for a 10×10 patio slab.",
  },
  {
    href: "/estimate/square-footage/12x12-room/",
    label: "12×12 Room Square Footage",
    description: "Pre-calculated area for a 12×12 room.",
  },
  {
    href: "/estimate/paint-room/12x12-room-8ft/",
    label: "12×12 Room Paint Estimate",
    description: "Pre-calculated paint gallons for a 12×12 bedroom.",
  },
];

export function getRelatedEstimates(slug: string): EstimateLink[] {
  return RELATED_ESTIMATES_MAP[slug] || DEFAULT_RELATED_ESTIMATES;
}
