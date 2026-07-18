export interface InspectionItem {
  id: string;
  name: string;
  lowCost: number;
  highCost: number;
  isHighRisk: boolean;
}

export interface InspectionCategory {
  id: string;
  name: string;
  items: InspectionItem[];
}

export const inspectionChecklist: InspectionCategory[] = [
  {
    id: "roof",
    name: "Roof & Gutters",
    items: [
      { id: "roof_shingles", name: "Missing or damaged shingles", lowCost: 150, highCost: 400, isHighRisk: false },
      { id: "roof_gutter", name: "Sagging or clogged gutters", lowCost: 200, highCost: 500, isHighRisk: false },
      { id: "roof_flashing", name: "Flashing leak", lowCost: 300, highCost: 800, isHighRisk: true },
    ]
  },
  {
    id: "exterior",
    name: "Exterior & Grading",
    items: [
      { id: "ext_grading", name: "Poor grading (water drains towards house)", lowCost: 500, highCost: 2000, isHighRisk: true },
      { id: "ext_siding", name: "Damaged siding/trim", lowCost: 300, highCost: 1500, isHighRisk: false },
    ]
  },
  {
    id: "structure",
    name: "Foundation & Structure",
    items: [
      { id: "struct_crack", name: "Foundation settlement crack", lowCost: 1500, highCost: 6000, isHighRisk: true },
      { id: "struct_rot", name: "Support column rot", lowCost: 800, highCost: 2500, isHighRisk: true },
    ]
  },
  {
    id: "electrical",
    name: "Electrical & Panel",
    items: [
      { id: "elec_double_tap", name: "Double-tapped breakers", lowCost: 150, highCost: 300, isHighRisk: true },
      { id: "elec_ungrounded", name: "Ungrounded outlets (per outlet)", lowCost: 100, highCost: 250, isHighRisk: false },
      { id: "elec_panel", name: "Electrical panel upgrade required", lowCost: 1800, highCost: 4500, isHighRisk: true },
    ]
  },
  {
    id: "plumbing",
    name: "Plumbing & Water Heater",
    items: [
      { id: "plumb_drain", name: "Slow sink drain", lowCost: 100, highCost: 250, isHighRisk: false },
      { id: "plumb_heater", name: "Water heater leak/rust", lowCost: 1200, highCost: 2500, isHighRisk: true },
      { id: "plumb_main", name: "Main sewer line clog", lowCost: 400, highCost: 1200, isHighRisk: true },
    ]
  },
  {
    id: "hvac",
    name: "HVAC & Ventilation",
    items: [
      { id: "hvac_duct", name: "Duct leak", lowCost: 500, highCost: 1500, isHighRisk: false },
      { id: "hvac_fan", name: "Condenser fan replacement", lowCost: 400, highCost: 900, isHighRisk: true },
      { id: "hvac_compressor", name: "Compressor failure", lowCost: 1500, highCost: 3000, isHighRisk: true },
    ]
  }
];

export function calculateRepairEstimate(selectedItemIds: string[]): { lowTotal: number; highTotal: number; selectedItems: InspectionItem[] } {
  let lowTotal = 0;
  let highTotal = 0;
  const selectedItems: InspectionItem[] = [];

  for (const category of inspectionChecklist) {
    for (const item of category.items) {
      if (selectedItemIds.includes(item.id)) {
        lowTotal += item.lowCost;
        highTotal += item.highCost;
        selectedItems.push(item);
      }
    }
  }

  return { lowTotal, highTotal, selectedItems };
}
