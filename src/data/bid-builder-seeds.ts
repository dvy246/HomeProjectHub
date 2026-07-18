export const BID_BUILDER_SEEDS = [
  {
    slug: "deck-build",
    label: "Deck Build",
    description: "Calculate the line-by-line cost of building a deck, including lumber, footings, and hardware.",
    sqftDefault: 144,
    items: [
      { key: "bb_deck_boards", name: "Deck Boards", quantity: 50, unit: "boards", defaultPrice: 15 },
      { key: "bb_deck_rim_joists", name: "Rim Joists", quantity: 4, unit: "boards", defaultPrice: 20 },
      { key: "bb_deck_joists", name: "Joists", quantity: 12, unit: "boards", defaultPrice: 15 },
      { key: "bb_deck_beams", name: "Beams", quantity: 2, unit: "boards", defaultPrice: 30 },
      { key: "bb_deck_posts", name: "Posts", quantity: 6, unit: "posts", defaultPrice: 15 },
      { key: "bb_deck_concrete", name: "Concrete Footings", quantity: 12, unit: "bags", defaultPrice: 6 },
      { key: "bb_deck_ledger", name: "Ledger Board", quantity: 1, unit: "boards", defaultPrice: 15 },
      { key: "bb_deck_hangers", name: "Joist Hangers", quantity: 24, unit: "hangers", defaultPrice: 2 }
    ]
  },
  {
    slug: "bathroom-remodel",
    label: "Bathroom Remodel",
    description: "Estimate your bathroom renovation cost line-by-line for tile, fixtures, drywall, and more.",
    sqftDefault: 40,
    items: [
      { key: "bb_bath_tile", name: "Tile", quantity: 120, unit: "sqft", defaultPrice: 4 },
      { key: "bb_bath_mortar", name: "Mortar", quantity: 3, unit: "bags", defaultPrice: 20 },
      { key: "bb_bath_grout", name: "Grout", quantity: 2, unit: "bags", defaultPrice: 18 },
      { key: "bb_bath_drywall", name: "Drywall", quantity: 4, unit: "sheets", defaultPrice: 16 },
      { key: "bb_bath_paint", name: "Paint", quantity: 1, unit: "gallons", defaultPrice: 40 },
      { key: "bb_bath_vanity", name: "Vanity", quantity: 1, unit: "units", defaultPrice: 400 },
      { key: "bb_bath_toilet", name: "Toilet", quantity: 1, unit: "units", defaultPrice: 200 },
      { key: "bb_bath_fixtures", name: "Fixtures", quantity: 1, unit: "set", defaultPrice: 150 },
      { key: "bb_bath_cement_board", name: "Cement Board", quantity: 4, unit: "sheets", defaultPrice: 15 }
    ]
  },
  {
    slug: "kitchen-remodel",
    label: "Kitchen Remodel",
    description: "Line-by-line estimate for a kitchen remodel including cabinets, countertops, and appliances.",
    sqftDefault: 120,
    items: [
      { key: "bb_kitch_cabinets", name: "Cabinets", quantity: 20, unit: "lf", defaultPrice: 150 },
      { key: "bb_kitch_countertop", name: "Countertop", quantity: 30, unit: "sqft", defaultPrice: 60 },
      { key: "bb_kitch_backsplash", name: "Tile Backsplash", quantity: 25, unit: "sqft", defaultPrice: 8 },
      { key: "bb_kitch_drywall", name: "Drywall", quantity: 6, unit: "sheets", defaultPrice: 16 },
      { key: "bb_kitch_paint", name: "Paint", quantity: 2, unit: "gallons", defaultPrice: 40 },
      { key: "bb_kitch_appliances", name: "Appliances Rough-in", quantity: 1, unit: "set", defaultPrice: 2500 }
    ]
  },
  {
    slug: "basement-finishing",
    label: "Basement Finishing",
    description: "Detailed breakdown of basement finishing costs from framing and drywall to flooring.",
    sqftDefault: 600,
    items: [
      { key: "bb_base_studs", name: "Framing Studs", quantity: 150, unit: "studs", defaultPrice: 4 },
      { key: "bb_base_drywall", name: "Drywall Sheets", quantity: 45, unit: "sheets", defaultPrice: 16 },
      { key: "bb_base_insulation", name: "Insulation Batts", quantity: 20, unit: "rolls", defaultPrice: 25 },
      { key: "bb_base_flooring", name: "Flooring", quantity: 650, unit: "sqft", defaultPrice: 3 },
      { key: "bb_base_paint", name: "Paint", quantity: 6, unit: "gallons", defaultPrice: 40 },
      { key: "bb_base_elec", name: "Electrical Boxes", quantity: 15, unit: "boxes", defaultPrice: 3 }
    ]
  },
  {
    slug: "flooring-installation",
    label: "Flooring Installation",
    description: "Estimate flooring cost with transparent pricing for planks, underlayment, and trim.",
    sqftDefault: 300,
    items: [
      { key: "bb_floor_sqft", name: "Flooring", quantity: 330, unit: "sqft", defaultPrice: 3.5 },
      { key: "bb_floor_underlay", name: "Underlayment", quantity: 330, unit: "sqft", defaultPrice: 0.5 },
      { key: "bb_floor_trans", name: "Transition Strips", quantity: 3, unit: "strips", defaultPrice: 15 },
      { key: "bb_floor_adh", name: "Adhesive / Nails", quantity: 1, unit: "box/bucket", defaultPrice: 50 },
      { key: "bb_floor_trim", name: "Door Trim", quantity: 40, unit: "lf", defaultPrice: 1.5 }
    ]
  },
  {
    slug: "fence-installation",
    label: "Fence Installation",
    description: "Transparent cost estimator for fences: posts, pickets, concrete, and hardware.",
    sqftDefault: 100,
    items: [
      { key: "bb_fence_posts", name: "Posts", quantity: 14, unit: "posts", defaultPrice: 20 },
      { key: "bb_fence_rails", name: "Rails", quantity: 28, unit: "rails", defaultPrice: 10 },
      { key: "bb_fence_pickets", name: "Pickets", quantity: 200, unit: "pickets", defaultPrice: 3 },
      { key: "bb_fence_concrete", name: "Concrete Bags", quantity: 21, unit: "bags", defaultPrice: 6 },
      { key: "bb_fence_caps", name: "Post Caps", quantity: 14, unit: "caps", defaultPrice: 2 },
      { key: "bb_fence_gate", name: "Gate Hardware", quantity: 1, unit: "kit", defaultPrice: 40 }
    ]
  },
  {
    slug: "concrete-patio",
    label: "Concrete Patio",
    description: "Line-by-line pricing for your concrete patio including bags, rebar, and form boards.",
    sqftDefault: 144,
    items: [
      { key: "bb_conc_bags", name: "Concrete Bags 80lb", quantity: 75, unit: "bags", defaultPrice: 6 },
      { key: "bb_conc_rebar", name: "Rebar 10ft Sticks", quantity: 15, unit: "sticks", defaultPrice: 8 },
      { key: "bb_conc_stakes", name: "Stakes", quantity: 12, unit: "stakes", defaultPrice: 2 },
      { key: "bb_conc_gravel", name: "Gravel Base", quantity: 144, unit: "sqft", defaultPrice: 0.5 },
      { key: "bb_conc_forms", name: "Form Boards", quantity: 6, unit: "boards", defaultPrice: 10 }
    ]
  },
  {
    slug: "roof-replacement",
    label: "Roof Replacement",
    description: "Calculate your new roof's cost clearly: shingles, underlayment, drip edge, and nails.",
    sqftDefault: 2000,
    items: [
      { key: "bb_roof_shingles", name: "Shingle Bundles", quantity: 66, unit: "bundles", defaultPrice: 35 },
      { key: "bb_roof_underlay", name: "Underlayment Rolls", quantity: 5, unit: "rolls", defaultPrice: 50 },
      { key: "bb_roof_ridge", name: "Ridge Cap", quantity: 4, unit: "bundles", defaultPrice: 45 },
      { key: "bb_roof_drip", name: "Drip Edge", quantity: 250, unit: "lf", defaultPrice: 1.5 },
      { key: "bb_roof_nails", name: "Roofing Nails", quantity: 2, unit: "boxes", defaultPrice: 40 },
      { key: "bb_roof_ice", name: "Ice-Water Shield", quantity: 2, unit: "rolls", defaultPrice: 60 }
    ]
  },
  {
    slug: "drywall-installation",
    label: "Drywall Installation",
    description: "Estimate drywall costs transparently with sheets, tape, mud, and corner beads.",
    sqftDefault: 400,
    items: [
      { key: "bb_dryw_sheets", name: "Drywall Sheets", quantity: 13, unit: "sheets", defaultPrice: 16 },
      { key: "bb_dryw_mud", name: "Joint Compound 5gal", quantity: 1, unit: "bucket", defaultPrice: 20 },
      { key: "bb_dryw_tape", name: "Tape Rolls", quantity: 1, unit: "rolls", defaultPrice: 6 },
      { key: "bb_dryw_corner", name: "Corner Bead", quantity: 50, unit: "lf", defaultPrice: 0.5 },
      { key: "bb_dryw_screws", name: "Screws", quantity: 1, unit: "box", defaultPrice: 25 },
      { key: "bb_dryw_primer", name: "Primer", quantity: 2, unit: "gallons", defaultPrice: 25 }
    ]
  },
  {
    slug: "painting",
    label: "Painting",
    description: "Interior or exterior painting cost estimator covering paint, primer, tape, and materials.",
    sqftDefault: 400,
    items: [
      { key: "bb_paint_int", name: "Interior Paint", quantity: 2, unit: "gallons", defaultPrice: 45 },
      { key: "bb_paint_primer", name: "Primer", quantity: 1, unit: "gallons", defaultPrice: 25 },
      { key: "bb_paint_brushes", name: "Brushes", quantity: 3, unit: "brushes", defaultPrice: 12 },
      { key: "bb_paint_rollers", name: "Rollers", quantity: 4, unit: "rollers", defaultPrice: 6 },
      { key: "bb_paint_tape", name: "Painter's Tape", quantity: 2, unit: "rolls", defaultPrice: 8 },
      { key: "bb_paint_drop", name: "Drop Cloths", quantity: 2, unit: "cloths", defaultPrice: 15 }
    ]
  }
];
