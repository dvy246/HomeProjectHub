export interface GeneratorItem {
  id: string;
  name: string;
  category: string;
  runningWatts: number;
  startingWatts: number; // starting surge (NOT total startup watts, just the surge delta)
}

export interface GeneratorResults {
  totalRunningWatts: number;
  maxStartingSurgeWatts: number;
  requiredContinuousWatts: number;
  requiredSurgeWatts: number;
  recommendedContinuousRating: number;
  recommendedSurgeRating: number;
  generatorClass: "inverter" | "medium_portable" | "large_portable" | "standby";
}

export const GENERATOR_ITEMS: GeneratorItem[] = [
  // Heating & Cooling
  { id: "central_ac_3ton", name: "Central AC (3-Ton, High Efficiency)", category: "Heating & Cooling", runningWatts: 3500, startingWatts: 2500 }, // Total startup 6000
  { id: "window_ac", name: "Window AC (10k BTU)", category: "Heating & Cooling", runningWatts: 1200, startingWatts: 600 }, // Total startup 1800
  { id: "furnace_blower", name: "Gas/Oil Furnace Fan Blower", category: "Heating & Cooling", runningWatts: 800, startingWatts: 1550 }, // Total startup 2350
  { id: "space_heater", name: "Portable Space Heater (1500W)", category: "Heating & Cooling", runningWatts: 1500, startingWatts: 0 },
  { id: "heat_pump_split", name: "Mini-Split Heat Pump (1.5-Ton)", category: "Heating & Cooling", runningWatts: 1500, startingWatts: 500 },
  
  // Kitchen
  { id: "refrigerator", name: "Refrigerator / Freezer", category: "Kitchen", runningWatts: 700, startingWatts: 1500 }, // Total startup 2200
  { id: "freezer_chest", name: "Chest Freezer", category: "Kitchen", runningWatts: 500, startingWatts: 1000 },
  { id: "microwave", name: "Microwave Oven (1000W output)", category: "Kitchen", runningWatts: 1200, startingWatts: 0 },
  { id: "coffee_maker", name: "Coffee Drip Machine", category: "Kitchen", runningWatts: 1500, startingWatts: 0 },
  { id: "electric_range", name: "Electric Range Cooktop (1 burner)", category: "Kitchen", runningWatts: 1500, startingWatts: 0 },
  { id: "dishwasher", name: "Dishwasher (Dryer Cycle off)", category: "Kitchen", runningWatts: 1200, startingWatts: 300 },
  
  // Pumps & Water
  { id: "well_pump", name: "Well Pump (1/2 HP, 240V)", category: "Pumps & Water", runningWatts: 1000, startingWatts: 1500 }, // Total startup 2500
  { id: "sump_pump", name: "Sump Pump (1/3 HP)", category: "Pumps & Water", runningWatts: 800, startingWatts: 500 }, // Total startup 1300
  { id: "water_heater_elec", name: "Electric Water Heater (standard)", category: "Pumps & Water", runningWatts: 4500, startingWatts: 0 },
  
  // Laundry & Utility
  { id: "washing_machine", name: "Clothes Washing Machine", category: "Laundry & Utility", runningWatts: 1200, startingWatts: 1050 }, // Total startup 2250
  { id: "dryer_gas", name: "Gas Clothes Dryer (motor only)", category: "Laundry & Utility", runningWatts: 700, startingWatts: 1100 },
  { id: "garage_opener", name: "Garage Door Opener (1/2 HP)", category: "Laundry & Utility", runningWatts: 875, startingWatts: 525 },
  
  // Office & Entertainment
  { id: "tv", name: "Television (LED / LCD)", category: "Office & Entertainment", runningWatts: 250, startingWatts: 0 },
  { id: "computer_desktop", name: "Desktop Workstation & Monitor", category: "Office & Entertainment", runningWatts: 400, startingWatts: 0 },
  { id: "router_modem", name: "Internet Router, Modem & ONT", category: "Office & Entertainment", runningWatts: 30, startingWatts: 0 },
  { id: "lights_led", name: "LED Light Bulbs (x10 standard bulbs)", category: "Office & Entertainment", runningWatts: 100, startingWatts: 0 },
];

/**
 * Sizes the required generator capacity using selected appliances.
 * Continuous watts = sum of running watts.
 * Surge watts = sum of running watts + single largest starting surge wattage.
 * Includes a 15% safety factor to avoid running the generator at full capacity.
 */
export function calculateGeneratorSize(selectedIds: string[]): GeneratorResults {
  const selectedItems = GENERATOR_ITEMS.filter((item) => selectedIds.includes(item.id));

  // 1. Calculate sum of running watts
  const totalRunningWatts = selectedItems.reduce((sum, item) => sum + item.runningWatts, 0);

  // 2. Find the single highest starting surge wattage (to prevent stacking surge peaks)
  const maxStartingSurgeWatts = selectedItems.reduce((max, item) => Math.max(max, item.startingWatts), 0);

  // 3. Compute continuous and peak limits
  const requiredContinuousWatts = totalRunningWatts;
  const requiredSurgeWatts = totalRunningWatts + maxStartingSurgeWatts;

  // 4. Apply 15% safety buffer
  const recommendedContinuousRating = Math.round(requiredContinuousWatts * 1.15);
  const recommendedSurgeRating = Math.round(requiredSurgeWatts * 1.15);

  // 5. Select generator category class
  let generatorClass: "inverter" | "medium_portable" | "large_portable" | "standby" = "inverter";
  if (recommendedContinuousRating >= 8500) {
    generatorClass = "standby";
  } else if (recommendedContinuousRating >= 5000) {
    generatorClass = "large_portable";
  } else if (recommendedContinuousRating >= 2200) {
    generatorClass = "medium_portable";
  }

  return {
    totalRunningWatts,
    maxStartingSurgeWatts,
    requiredContinuousWatts,
    requiredSurgeWatts,
    recommendedContinuousRating,
    recommendedSurgeRating,
    generatorClass,
  };
}
