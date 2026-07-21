export type ConductorMaterial = "copper" | "aluminum";
export type WiringMethod = "romex" | "conduit_thhn" | "uf_burial";

export interface ElectricalInput {
  applianceKey: string;
  loadAmps: number;
  volts: 120 | 240;
  isContinuous: boolean;
  distanceFt: number;
  material: ConductorMaterial;
  wiringMethod: WiringMethod;
}

export interface ElectricalResults {
  continuousLoadAmps: number;
  minBreakerSize: number;
  baseWireSizeAWG: string;
  recommendedWireSizeAWG: string;
  voltageDropVolts: number;
  voltageDropPercent: number;
  upsizedForDistance: boolean;
  resistancePer1000Ft: number;
  necCitation: string;
}

export interface AppliancePreset {
  name: string;
  defaultAmps: number;
  defaultVolts: 120 | 240;
  isContinuous: boolean;
}

export const APPLIANCE_PRESETS: Record<string, AppliancePreset> = {
  custom: { name: "Custom Load", defaultAmps: 15, defaultVolts: 120, isContinuous: false },
  dryer: { name: "Clothes Dryer", defaultAmps: 24, defaultVolts: 240, isContinuous: false },
  water_heater: { name: "Water Heater (4.5kW)", defaultAmps: 18.75, defaultVolts: 240, isContinuous: true },
  ev_charger_32: { name: "Level 2 EV Charger (32A)", defaultAmps: 32, defaultVolts: 240, isContinuous: true },
  ev_charger_40: { name: "Level 2 EV Charger (40A)", defaultAmps: 40, defaultVolts: 240, isContinuous: true },
  ev_charger_48: { name: "Level 2 EV Charger (48A)", defaultAmps: 48, defaultVolts: 240, isContinuous: true },
  range_oven: { name: "Electric Range / Oven", defaultAmps: 40, defaultVolts: 240, isContinuous: false },
  cooktop: { name: "Electric Cooktop", defaultAmps: 30, defaultVolts: 240, isContinuous: false },
  heat_pump_ac: { name: "Central Heat Pump / AC (3-Ton)", defaultAmps: 20, defaultVolts: 240, isContinuous: true },
  mini_split: { name: "Mini-Split AC (1.5-Ton)", defaultAmps: 10, defaultVolts: 240, isContinuous: true },
  hot_tub: { name: "Hot Tub / Spa", defaultAmps: 40, defaultVolts: 240, isContinuous: true },
  well_pump: { name: "Well Pump (1.5 HP)", defaultAmps: 10, defaultVolts: 240, isContinuous: true },
  sump_pump: { name: "Sump Pump (1/2 HP)", defaultAmps: 9.8, defaultVolts: 120, isContinuous: false },
  dishwasher: { name: "Dishwasher", defaultAmps: 12, defaultVolts: 120, isContinuous: false },
  microwave: { name: "Microwave Oven", defaultAmps: 12, defaultVolts: 120, isContinuous: false },
  space_heater: { name: "Space Heater (1500W)", defaultAmps: 12.5, defaultVolts: 120, isContinuous: true },
  refrigerator: { name: "Refrigerator", defaultAmps: 6, defaultVolts: 120, isContinuous: false },
};

// Conductor gauge order from smallest to largest
const GAUGE_ORDER = [
  "14",
  "12",
  "10",
  "8",
  "6",
  "4",
  "2",
  "1/0",
  "2/0",
  "3/0",
  "4/0"
];

// Conductor specifications (Resistance per 1000 ft, NEC Chapter 9 Table 8)
const CONDUCTOR_SPECS: Record<ConductorMaterial, Record<string, number>> = {
  copper: {
    "14": 3.07,
    "12": 1.93,
    "10": 1.21,
    "8": 0.78,
    "6": 0.49,
    "4": 0.31,
    "2": 0.19,
    "1/0": 0.12,
    "2/0": 0.10,
    "3/0": 0.08,
    "4/0": 0.06,
  },
  aluminum: {
    "14": 5.06, // Note: Rarely allowed in residential, included for completeness
    "12": 3.18,
    "10": 2.00,
    "8": 1.28,
    "6": 0.81,
    "4": 0.51,
    "2": 0.32,
    "1/0": 0.20,
    "2/0": 0.16,
    "3/0": 0.13,
    "4/0": 0.10,
  }
};

// Ampacities by wiring method (temperature column rating) and material (NEC Table 310.16)
// Romex (NM-B) and UF-B are limited to the 60°C column. Conduit (THHN/THWN-2) is rated at 75°C for residential terminal connections.
const AMPACITY_TABLE: Record<
  ConductorMaterial,
  Record<WiringMethod, Record<string, number>>
> = {
  copper: {
    romex: {
      "14": 15, "12": 20, "10": 30, "8": 40, "6": 55, "4": 70, "2": 85, "1/0": 125, "2/0": 145, "3/0": 165, "4/0": 195
    },
    uf_burial: {
      "14": 15, "12": 20, "10": 30, "8": 40, "6": 55, "4": 70, "2": 85, "1/0": 125, "2/0": 145, "3/0": 165, "4/0": 195
    },
    conduit_thhn: {
      "14": 15, "12": 20, "10": 30, "8": 50, "6": 65, "4": 85, "2": 115, "1/0": 150, "2/0": 175, "3/0": 200, "4/0": 230
    }
  },
  aluminum: {
    // Note: Aluminum is generally restricted for branches <8 AWG, so ampacities are kept low or restricted.
    romex: {
      "14": 0, "12": 15, "10": 25, "8": 30, "6": 40, "4": 55, "2": 75, "1/0": 100, "2/0": 115, "3/0": 130, "4/0": 155
    },
    uf_burial: {
      "14": 0, "12": 15, "10": 25, "8": 30, "6": 40, "4": 55, "2": 75, "1/0": 100, "2/0": 115, "3/0": 130, "4/0": 155
    },
    conduit_thhn: {
      "14": 0, "12": 15, "10": 25, "8": 40, "6": 50, "4": 65, "2": 90, "1/0": 120, "2/0": 135, "3/0": 155, "4/0": 180
    }
  }
};

// Standard circuit breaker sizes (Amps, NEC 240.6)
const STANDARD_BREAKERS = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200];

/**
 * Finds the minimum standard circuit breaker size required for a given current.
 */
export function getStandardBreaker(amps: number): number {
  const size = STANDARD_BREAKERS.find((b) => b >= amps);
  return size || 200; // default cap
}

/**
 * Sizes the electrical circuit wire and breaker based on NEC requirements and voltage drop safety.
 */
export function calculateElectricalSizing(input: ElectricalInput): ElectricalResults {
  const { loadAmps, volts, isContinuous, distanceFt, material, wiringMethod } = input;

  // 1. Calculate Continuous Load demand (125% factor per NEC 210.20)
  const continuousLoadAmps = isContinuous ? loadAmps * 1.25 : loadAmps;

  // 2. Select circuit breaker size (round continuous amps UP to standard breaker)
  const minBreakerSize = getStandardBreaker(continuousLoadAmps);

  // 3. Find base wire size (first wire in GAUGE_ORDER that has ampacity >= continuousLoadAmps AND >= breaker rating)
  const ampTable = AMPACITY_TABLE[material][wiringMethod];
  let baseWireIdx = -1;

  for (let i = 0; i < GAUGE_ORDER.length; i++) {
    const gauge = GAUGE_ORDER[i];
    const wireAmpacity = ampTable[gauge];
    
    // Ignore invalid wire configurations (like small aluminum sizes)
    if (wireAmpacity === 0) continue;

    if (wireAmpacity >= continuousLoadAmps && wireAmpacity >= minBreakerSize) {
      baseWireIdx = i;
      break;
    }
  }

  if (baseWireIdx === -1) {
    throw new Error("Load exceeds typical residential conductor capacities (200A max).");
  }

  const baseWireSizeAWG = GAUGE_ORDER[baseWireIdx];
  let recommendedWireIdx = baseWireIdx;
  let currentDropPercent = 100;
  let voltageDropVolts = 0;
  let resistancePer1000Ft = 0;

  // 4. Check and adjust for voltage drop over distance
  // Iterate through larger wire sizes if the voltage drop is > 3%
  for (let i = baseWireIdx; i < GAUGE_ORDER.length; i++) {
    const gauge = GAUGE_ORDER[i];
    const resistance = CONDUCTOR_SPECS[material][gauge];
    
    // Single-phase voltage drop formula: V_drop = (2 * L * R * I) / 1000
    const dropVolts = (2 * distanceFt * resistance * loadAmps) / 1000;
    const dropPercent = (dropVolts / volts) * 100;

    if (i === baseWireIdx || dropPercent > 3.0) {
      recommendedWireIdx = i;
      voltageDropVolts = dropVolts;
      currentDropPercent = dropPercent;
      resistancePer1000Ft = resistance;
    }

    if (dropPercent <= 3.0) {
      recommendedWireIdx = i;
      voltageDropVolts = dropVolts;
      currentDropPercent = dropPercent;
      resistancePer1000Ft = resistance;
      break;
    }
  }

  const recommendedWireSizeAWG = GAUGE_ORDER[recommendedWireIdx];
  const upsizedForDistance = recommendedWireIdx > baseWireIdx;

  // NEC citation determination based on variables
  let necCitation = "NEC Table 310.16 & Art. 240.4";
  if (isContinuous) {
    necCitation = "NEC Art. 210.20 (Continuous Load) & Table 310.16";
  }
  if (upsizedForDistance) {
    necCitation += " & Art. 210.19(A) FPN 4 (Voltage Drop)";
  }

  return {
    continuousLoadAmps,
    minBreakerSize,
    baseWireSizeAWG,
    recommendedWireSizeAWG,
    voltageDropVolts,
    voltageDropPercent: currentDropPercent,
    upsizedForDistance,
    resistancePer1000Ft,
    necCitation,
  };
}
