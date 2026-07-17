export interface RelatedLink {
  href: string;
  label: string;
  description: string;
}

const RELATED_MAP: Record<string, RelatedLink[]> = {
  "concrete-slab": [
    { href: "/calculators/concrete/rebar/", label: "Rebar Calculator", description: "Calculate rebar needed for slab reinforcement." },
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Estimate concrete for footings and foundations." },
    { href: "/compare/concrete-vs-pavers/", label: "Concrete vs Pavers", description: "Compare cost, durability, and difficulty." },
    { href: "/calculators/gravel/", label: "Gravel Base Calculator", description: "Calculate gravel base layer for your slab." },
    { href: "/calculators/concrete/mix-ratio/", label: "Mix Ratio Calculator", description: "Get the right cement, sand, and gravel ratios." },
  ],
  "concrete-footing": [
    { href: "/calculators/concrete/slab/", label: "Slab Calculator", description: "Calculate concrete for attached slabs." },
    { href: "/calculators/concrete/column/", label: "Column Calculator", description: "Estimate concrete for support columns." },
    { href: "/calculators/concrete/rebar/", label: "Rebar Calculator", description: "Calculate footing reinforcement." },
  ],
  "concrete-column": [
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Calculate the base footing for your column." },
    { href: "/calculators/concrete/tube/", label: "Sonotube Calculator", description: "Calculate concrete for cylindrical forms." },
  ],
  "concrete-wall": [
    { href: "/calculators/concrete/slab/", label: "Slab Calculator", description: "Calculate concrete for attached slab." },
    { href: "/calculators/concrete/block-fill/", label: "Block Fill Calculator", description: "Estimate fill for concrete block walls." },
    { href: "/calculators/framing/", label: "Framing Calculator", description: "Calculate wall framing materials." },
  ],
  "concrete-tube": [
    { href: "/calculators/concrete/column/", label: "Column Calculator", description: "Calculate concrete for square columns." },
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Calculate footing for tube foundations." },
  ],
  "concrete-steps": [
    { href: "/calculators/concrete/slab/", label: "Slab Calculator", description: "Calculate concrete for landings." },
    { href: "/calculators/concrete/mix-ratio/", label: "Mix Ratio Calculator", description: "Get the right mix for structural pours." },
  ],
  "concrete-block-fill": [
    { href: "/calculators/concrete/wall/", label: "Wall Calculator", description: "Calculate concrete for poured walls." },
    { href: "/calculators/concrete/mix-ratio/", label: "Mix Ratio Calculator", description: "Get the right mortar mix ratio." },
  ],
  "concrete-curb-gutter": [
    { href: "/calculators/concrete/slab/", label: "Slab Calculator", description: "Calculate concrete for adjacent slabs." },
    { href: "/calculators/concrete/mix-ratio/", label: "Mix Ratio Calculator", description: "Get the right mix for curbs." },
  ],
  "concrete-mix-ratio": [
    { href: "/calculators/concrete/slab/", label: "Slab Calculator", description: "Apply your mix to a slab pour." },
    { href: "/calculators/concrete/block-fill/", label: "Block Fill Calculator", description: "Calculate mortar for block walls." },
  ],
  "concrete-rebar": [
    { href: "/calculators/concrete/slab/", label: "Slab Calculator", description: "Calculate concrete volume for your pour." },
    { href: "/compare/concrete-vs-pavers/", label: "Concrete vs Pavers", description: "Compare reinforced concrete to pavers." },
  ],
  "roofing-shingles": [
    { href: "/calculators/roofing/metal/", label: "Metal Roofing Calculator", description: "Compare metal vs shingle costs." },
    { href: "/calculators/roofing/pitch/", label: "Roof Pitch Calculator", description: "Determine your roof slope first." },
    { href: "/calculators/roofing/plywood/", label: "Plywood Deck Calculator", description: "Calculate sheathing for your roof." },
    { href: "/compare/shingles-vs-metal-roof/", label: "Shingles vs Metal", description: "Compare shingles and metal roofing." },
  ],
  "roofing-metal": [
    { href: "/calculators/roofing/shingles/", label: "Shingle Calculator", description: "Compare metal vs shingle costs." },
    { href: "/calculators/roofing/pitch/", label: "Roof Pitch Calculator", description: "Determine your roof slope." },
    { href: "/compare/shingles-vs-metal-roof/", label: "Shingles vs Metal", description: "Compare metal and shingle roofing." },
  ],
  "roofing-plywood": [
    { href: "/calculators/roofing/shingles/", label: "Shingle Calculator", description: "Calculate shingles after sheathing." },
    { href: "/calculators/roofing/ice-water-shield/", label: "Ice & Water Shield", description: "Protect your roof deck." },
  ],
  "roofing-pitch": [
    { href: "/calculators/roofing/shingles/", label: "Shingle Calculator", description: "Calculate materials using your pitch." },
    { href: "/calculators/roofing/snow-load/", label: "Snow Load Calculator", description: "Check if your roof supports snow loads." },
  ],
  "roofing-snow-load": [
    { href: "/calculators/roofing/pitch/", label: "Roof Pitch Calculator", description: "Determine your roof slope." },
    { href: "/calculators/roofing/shingles/", label: "Shingle Calculator", description: "Calculate materials for your roof." },
  ],
  "roofing-ice-water-shield": [
    { href: "/calculators/roofing/shingles/", label: "Shingle Calculator", description: "Install shingles over the shield." },
    { href: "/calculators/roofing/plywood/", label: "Plywood Deck Calculator", description: "Replace damaged sheathing first." },
  ],
  paint: [
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your room dimensions first." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Plan tile alongside paint." },
    { href: "/calculators/drywall/", label: "Drywall Calculator", description: "Calculate drywall before painting." },
  ],
  tile: [
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your floor area first." },
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Plan paint alongside tile." },
  ],
  drywall: [
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint after hanging drywall." },
    { href: "/calculators/framing/", label: "Framing Calculator", description: "Calculate studs for your walls." },
  ],
  framing: [
    { href: "/calculators/drywall/", label: "Drywall Calculator", description: "Calculate drywall for your framed walls." },
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint for finished walls." },
    { href: "/calculators/lumber/", label: "Lumber Calculator", description: "Calculate total board feet." },
    { href: "/calculators/board-foot/", label: "Board Foot Calculator", description: "Convert lumber to board feet." },
  ],
  decking: [
    { href: "/calculators/baluster/", label: "Baluster Calculator", description: "Calculate railing baluster spacing." },
    { href: "/calculators/spindle-spacing/", label: "Spindle Spacing Calculator", description: "Plan deck railing spindles." },
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Calculate deck foundation footings." },
  ],
  "diy-vs-pro": [
    { href: "/calculators/concrete/slab/", label: "Concrete Calculator", description: "Calculate material costs for your DIY slab project." },
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Estimate paint costs for your DIY room project." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Calculate tile material costs for DIY flooring." },
    { href: "/calculators/roofing/shingles/", label: "Roofing Calculator", description: "Estimate shingle costs for DIY roof replacement." },
    { href: "/calculators/decking/", label: "Decking Calculator", description: "Calculate deck board costs for your DIY deck." },
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your project area first." },
  ],
  "vinyl-siding": [
    { href: "/calculators/board-batten/", label: "Board & Batten Calculator", description: "Compare siding styles." },
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint for accent trim." },
  ],
  "vinyl-fence": [
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Calculate concrete for fence posts." },
    { href: "/calculators/framing/", label: "Framing Calculator", description: "Compare with wood fence framing." },
  ],
  brick: [
    { href: "/calculators/concrete/block-fill/", label: "Block Fill Calculator", description: "Calculate mortar for brickwork." },
    { href: "/calculators/concrete/wall/", label: "Wall Calculator", description: "Compare brick with poured walls." },
  ],
  "retaining-wall": [
    { href: "/calculators/french-drain/", label: "French Drain Calculator", description: "Plan drainage behind your wall." },
    { href: "/calculators/gravel/", label: "Gravel Calculator", description: "Calculate backfill gravel." },
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Calculate wall foundation." },
  ],
  "closet-designer": [
    { href: "/calculators/wainscoting-designer/", label: "Wainscoting Designer", description: "Design board and batten accent walls to match your closet project." },
    { href: "/calculators/framing/", label: "Framing Calculator", description: "Calculate studs and plates for closet walls." },
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint for your closet walls and shelving." },
    { href: "/calculators/payload/", label: "Payload Safety Calculator", description: "Check if your vehicle can haul closet materials." },
    { href: "/calculators/drywall/", label: "Drywall Calculator", description: "Calculate drywall for enclosing a closet space." },
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your room dimensions before designing the closet." },
  ],
  "hardscape-designer": [
    { href: "/calculators/gravel/", label: "Gravel Calculator", description: "Calculate base gravel and drainage aggregate volumes." },
    { href: "/calculators/sand/", label: "Sand Calculator", description: "Calculate sand setting bed material." },
    { href: "/calculators/payload/", label: "Payload Safety Calculator", description: "Check if your vehicle can haul your material weight." },
    { href: "/calculators/retaining-wall/", label: "Retaining Wall Calculator", description: "Calculate retaining wall block and drainage materials." },
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Calculate concrete for fire pit footings." },
    { href: "/calculators/french-drain/", label: "French Drain Calculator", description: "Plan drainage for retaining walls." },
    { href: "/compare/concrete-vs-pavers/", label: "Concrete vs Pavers", description: "Compare paver costs with poured concrete alternatives." },
  ],
  gravel: [
    { href: "/calculators/sand/", label: "Sand Calculator", description: "Calculate sand base layer." },
    { href: "/calculators/tonnage/", label: "Tonnage Calculator", description: "Convert volume to tons." },
    { href: "/compare/concrete-vs-gravel/", label: "Concrete vs Gravel", description: "Compare gravel with concrete." },
  ],
  mulch: [
    { href: "/calculators/gravel/", label: "Gravel Calculator", description: "Compare mulch with decorative gravel." },
    { href: "/calculators/limestone/", label: "Limestone Calculator", description: "Calculate limestone for pathways." },
  ],
  "french-drain": [
    { href: "/calculators/gravel/", label: "Gravel Calculator", description: "Calculate drain gravel." },
    { href: "/calculators/retaining-wall/", label: "Retaining Wall Calculator", description: "Plan drainage for retaining walls." },
  ],
  lumber: [
    { href: "/calculators/board-foot/", label: "Board Foot Calculator", description: "Convert lumber to board feet." },
    { href: "/calculators/framing/", label: "Framing Calculator", description: "Calculate studs and plates." },
  ],
  "square-footage": [
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint from your measurements." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Calculate tile from your measurements." },
    { href: "/calculators/drywall/", label: "Drywall Calculator", description: "Calculate drywall from your measurements." },
  ],
  "cubic-yard": [
    { href: "/calculators/concrete/slab/", label: "Concrete Calculator", description: "Convert cubic yards to concrete needs." },
    { href: "/calculators/tonnage/", label: "Tonnage Calculator", description: "Convert cubic yards to tons." },
  ],
  "concrete-slab-designer": [
    { href: "/calculators/concrete/slab/", label: "Concrete Slab Calculator", description: "Quick volume and bag count for standard rectangular slabs." },
    { href: "/calculators/concrete/rebar/", label: "Rebar Calculator", description: "Calculate rebar needed for slab reinforcement." },
    { href: "/calculators/concrete/footing/", label: "Footing Calculator", description: "Estimate concrete for footings and foundations." },
    { href: "/calculators/gravel/", label: "Gravel Base Calculator", description: "Calculate gravel base layer for your slab." },
    { href: "/calculators/payload/", label: "Payload Safety Calculator", description: "Check if your vehicle can haul concrete materials." },
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your patio or slab area before designing." },
  ],
  "measure-from-photo": [
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint requirements using your photo measurements." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Estimate flooring tile counts from traced areas." },
    { href: "/calculators/concrete/slab/", label: "Concrete Slab Calculator", description: "Calculate concrete slab volumes from traced areas." },
    { href: "/calculators/tile-designer/", label: "Tile Layout Designer", description: "Plan tiling layout patterns for traced boundaries." },
    { href: "/calculators/hardscape-designer/", label: "Hardscape Designer", description: "Layout patio pavers on your traced blueprints." },
  ],
  "stair-stringer-designer": [
    { href: "/calculators/lumber/", label: "Lumber Calculator", description: "Calculate board feet and lumber materials." },
    { href: "/calculators/deck-designer/", label: "Deck Layout Designer", description: "Design a deck layout to connect with your stairs." },
    { href: "/calculators/baluster/", label: "Baluster Calculator", description: "Calculate stair railing baluster spacing." },
    { href: "/calculators/spindle-spacing/", label: "Spindle Spacing Calculator", description: "Plan spindle gaps along stair handrails." },
    { href: "/calculators/spiral-staircase/", label: "Spiral Staircase Calculator", description: "Compare straight stairs with space-saving spiral stairs." },
  ],
  "compare-countertops": [
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your countertop area." },
    { href: "/calculators/payload/", label: "Payload Safety Calculator", description: "Check vehicle capacity for slab weight." },
    { href: "/compare/countertops/", label: "All Countertop Comparisons", description: "Compare more countertop materials." },
  ],
  "compare-decking": [
    { href: "/calculators/decking/", label: "Decking Calculator", description: "Calculate deck board quantities." },
    { href: "/calculators/deck-designer/", label: "Deck Layout Designer", description: "Visualize your deck plan." },
    { href: "/calculators/baluster/", label: "Baluster Calculator", description: "Plan your deck railing." },
  ],
  "compare-flooring": [
    { href: "/calculators/flooring/", label: "Flooring Calculator", description: "Calculate boxes and rolls." },
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your room first." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Calculate tile quantities." },
    { href: "/compare/flooring/", label: "All Flooring Comparisons", description: "Compare flooring specs side-by-side." },
  ],
  "flooring": [
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure your room dimensions." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Calculate tile quantities." },
    { href: "/compare/flooring/", label: "Compare Flooring Materials", description: "Compare wood, LVP, laminate, and carpet." },
    { href: "/calculators/renovation/flooring/", label: "Flooring Cost Estimator", description: "Estimate total project costs and contractor rates." },
  ],
  "compare-roofing": [
    { href: "/calculators/roofing/shingles/", label: "Shingle Calculator", description: "Calculate roof shingles." },
    { href: "/calculators/roofing/pitch/", label: "Roof Pitch Calculator", description: "Measure your roof slope." },
    { href: "/calculators/roofing/snow-load/", label: "Snow Load Calculator", description: "Check roof weight capacity." },
  ],
  "compare-siding": [
    { href: "/calculators/vinyl-siding/", label: "Vinyl Siding Calculator", description: "Calculate siding material." },
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Check paint for accent trim." },
    { href: "/calculators/board-batten/", label: "Board & Batten Calculator", description: "Compare siding styles." },
  ],
  "plan": [
    { href: "/calculators/paint/", label: "Paint Calculator", description: "Calculate paint gallons for your room." },
    { href: "/calculators/drywall/", label: "Drywall Calculator", description: "Estimate drywall sheets needed." },
    { href: "/calculators/square-footage/", label: "Square Footage Calculator", description: "Measure any room or space." },
    { href: "/calculators/diy-vs-pro/", label: "DIY vs Contractor Cost", description: "Compare DIY vs hiring a pro for your project." },
    { href: "/calculators/tile/", label: "Tile Calculator", description: "Estimate tile quantities for floors." },
  ],
};

const DEFAULT_RELATED: RelatedLink[] = [
  { href: "/calculators/concrete/slab/", label: "Concrete Calculator", description: "Calculate concrete for your next project." },
  { href: "/calculators/roofing/shingles/", label: "Roofing Calculator", description: "Estimate roofing materials." },
  { href: "/calculators/paint/", label: "Paint Calculator", description: "Estimate paint quantities." },
  { href: "/compare/", label: "Compare Materials", description: "Compare concrete, pavers, and gravel." },
];

export function getRelatedCalculators(slug: string): RelatedLink[] {
  return RELATED_MAP[slug] || DEFAULT_RELATED;
}
