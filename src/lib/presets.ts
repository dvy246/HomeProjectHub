export interface InputPreset {
  name: string;
  length: string;
  width: string;
  height?: string;
  thickness?: string;
  depth?: string;
}

export const PRESETS = {
  concrete: [
    { name: "— Select Preset Size —", length: "", width: "", thickness: "" },
    { name: "Sidewalk Slab (4' x 10', 4\" thick)", length: "10", width: "4", thickness: "4" },
    { name: "Backyard Patio (12' x 12', 4\" thick)", length: "12", width: "12", thickness: "4" },
    { name: "Single Car Driveway (10' x 20', 6\" thick)", length: "20", width: "10", thickness: "6" },
    { name: "Double Garage Floor (24' x 24', 6\" thick)", length: "24", width: "24", thickness: "6" },
  ],
  rooms: [
    { name: "— Select Preset Room —", length: "", width: "", height: "" },
    { name: "Small Powder Room (5' x 8')", length: "8", width: "5", height: "8" },
    { name: "Standard Bedroom (10' x 12')", length: "12", width: "10", height: "8" },
    { name: "Large Master Suite (15' x 20')", length: "20", width: "15", height: "9" },
    { name: "Double Garage (24' x 24')", length: "24", width: "24", height: "10" },
  ],
  landscaping: [
    { name: "— Select Preset Bed —", length: "", width: "", depth: "" },
    { name: "Garden Border (2\" depth)", length: "20", width: "3", depth: "2" },
    { name: "Flower Bed (3\" depth)", length: "10", width: "6", depth: "3" },
    { name: "Gravel Walkway Base (4\" depth)", length: "30", width: "4", depth: "4" },
    { name: "Slab Subgrade Base (6\" depth)", length: "20", width: "20", depth: "6" },
  ],
  deck: [
    { name: "— Select Deck Size —", length: "", width: "" },
    { name: "Small Balcony Deck (8' x 10')", length: "10", width: "8" },
    { name: "Standard Patio Deck (12' x 16')", length: "16", width: "12" },
    { name: "Spacious Entertaining Deck (16' x 20')", length: "20", width: "16" },
    { name: "Large Wrap-Around Deck (20' x 24')", length: "24", width: "20" },
  ]
};
