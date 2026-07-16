export interface ConcreteComparison {
  volumeCuYd: number;
  readyMix: {
    materialCost: number;
    deliveryCharge: number;
    shortLoadSurcharge: number;
    totalCost: number;
    weightLbs: number;
    laborHours: number;
  };
  bagged: {
    bagsNeeded: number;
    materialCost: number;
    totalCost: number;
    weightLbs: number;
    tripsCount: number;
    laborHours: number;
    palletCount: number;
    storageSqFt: number;
    cumulativeLiftWeightLbs: number;
  };
  recommendation: string;
}

export type AggregateType = "gravel" | "sand" | "soil" | "mulch";

export interface AggregateComparison {
  volumeCuYd: number;
  aggregateType: AggregateType;
  bulk: {
    materialCost: number;
    deliveryCharge: number;
    totalCost: number;
    weightLbs: number;
    laborHours: number;
  };
  bagged: {
    bagsNeeded: number;
    materialCost: number;
    totalCost: number;
    weightLbs: number;
    tripsCount: number;
    laborHours: number;
    palletCount: number;
    storageSqFt: number;
    cumulativeLiftWeightLbs: number;
  };
  recommendation: string;
}

/**
 * Compares Ready-Mix Concrete vs. Bagged DIY concrete based on volume.
 */
export function compareConcreteOptions(
  volumeCuYd: number,
  vehiclePayloadLbs: number = 1500
): ConcreteComparison {
  // Ready-Mix
  const rmPricePerYard = 155;
  const rmDelivery = 100;
  const rmShortLoad = volumeCuYd < 3 ? 120 : 0;
  const rmMaterialCost = volumeCuYd * rmPricePerYard;
  const rmTotalCost = rmMaterialCost + rmDelivery + rmShortLoad;
  const rmWeightLbs = Math.ceil(volumeCuYd * 27 * 150); // 150 lbs / cu ft, 27 cu ft / yard

  // Bagged Concrete (80-lb bags, yield = 0.6 cu ft)
  // 1 yard = 27 cu ft. 27 / 0.6 = 45 bags.
  const bagsNeeded = Math.ceil(volumeCuYd * 45);
  const bagCost = 6.50;
  const bMaterialCost = bagsNeeded * bagCost;
  const bWeightLbs = bagsNeeded * 80;
  const bTrips = Math.ceil(bWeightLbs / vehiclePayloadLbs);
  // Assumes ~8 minutes to manually open, mix, pour, and finish one 80lb bag
  const bLaborHours = Math.ceil((bagsNeeded * 8) / 60);

  // Pallet and storage calculations (42 bags of 80 lb per standard pallet)
  const palletCount = Math.ceil(bagsNeeded / 42);
  const storageSqFt = palletCount * 13.3; // standard pallet footprint 40" x 48" = 13.3 sq ft
  // User lifts each bag twice: once out of vehicle, once into mixer/hole
  const cumulativeLiftWeightLbs = bWeightLbs * 2;

  let recommendation = "";
  if (volumeCuYd >= 2.0) {
    recommendation = `Ready-mix delivery is highly recommended. Manual mixing would require ${bagsNeeded} bags (${bWeightLbs.toLocaleString()} lbs) and approx. ${bLaborHours} hours of heavy manual labor, exceeding standard pickup payloads and requiring ${bTrips} trips.`;
  } else if (volumeCuYd >= 1.0) {
    recommendation = `Ready-mix is recommended for labor savings, though bagged DIY is financially viable if you have a mixing crew. Mixing 45-90 bags requires considerable effort.`;
  } else {
    recommendation = `Bagged concrete is recommended. For small volumes under 1 cubic yard, ready-mix delivery includes short-load surcharges and minimum delivery fees, making bags significantly cheaper.`;
  }

  return {
    volumeCuYd,
    readyMix: {
      materialCost: Math.ceil(rmMaterialCost),
      deliveryCharge: rmDelivery,
      shortLoadSurcharge: rmShortLoad,
      totalCost: Math.ceil(rmTotalCost),
      weightLbs: rmWeightLbs,
      laborHours: 0
    },
    bagged: {
      bagsNeeded,
      materialCost: Math.ceil(bMaterialCost),
      totalCost: Math.ceil(bMaterialCost),
      weightLbs: bWeightLbs,
      tripsCount: bTrips,
      laborHours: bLaborHours,
      palletCount,
      storageSqFt: Math.round(storageSqFt * 10) / 10,
      cumulativeLiftWeightLbs
    },
    recommendation
  };
}

/**
 * Compares Bulk Delivery vs. Bagged landscaping materials.
 */
export function compareAggregateOptions(
  volumeCuYd: number,
  aggregateType: AggregateType,
  vehiclePayloadLbs: number = 1500
): AggregateComparison {
  // Presets densities, bulk prices, and bag sizes
  const configs: Record<AggregateType, { bulkPrice: number; bagWeight: number; bagPrice: number; bagCuFt: number; densityLbsYd: number; bagsPerPallet: number }> = {
    gravel: { bulkPrice: 45, bagWeight: 50, bagPrice: 5.50, bagCuFt: 0.5, densityLbsYd: 2800, bagsPerPallet: 50 },
    sand: { bulkPrice: 40, bagWeight: 50, bagPrice: 5.00, bagCuFt: 0.5, densityLbsYd: 2700, bagsPerPallet: 50 },
    soil: { bulkPrice: 35, bagWeight: 40, bagPrice: 4.50, bagCuFt: 0.75, densityLbsYd: 2000, bagsPerPallet: 60 },
    mulch: { bulkPrice: 30, bagWeight: 30, bagPrice: 4.00, bagCuFt: 2.0, densityLbsYd: 1000, bagsPerPallet: 60 }
  };

  const config = configs[aggregateType];
  const totalCuFt = volumeCuYd * 27;

  // Bulk Option
  const bulkDelivery = 85;
  const bulkMaterialCost = volumeCuYd * config.bulkPrice;
  const bulkTotalCost = bulkMaterialCost + bulkDelivery;
  const bulkWeightLbs = Math.ceil(volumeCuYd * config.densityLbsYd);

  // Bagged Option
  const bagsNeeded = Math.ceil(totalCuFt / config.bagCuFt);
  const bagMaterialCost = bagsNeeded * config.bagPrice;
  const bagWeightLbs = bagsNeeded * config.bagWeight;
  const bagTrips = Math.ceil(bagWeightLbs / vehiclePayloadLbs);
  // Assumes ~2 minutes to carry, split, and spread each bag
  const bagLaborHours = Math.ceil((bagsNeeded * 2) / 60);

  // Pallet and storage calculations
  const palletCount = Math.ceil(bagsNeeded / config.bagsPerPallet);
  const storageSqFt = palletCount * 13.3; // standard pallet footprint 40" x 48" = 13.3 sq ft
  const cumulativeLiftWeightLbs = bagWeightLbs * 2;

  let recommendation = "";
  if (volumeCuYd >= 3.0) {
    recommendation = `Bulk delivery is recommended. Hauling ${bagsNeeded} bags of ${aggregateType} requires ${bagTrips} vehicle trips and costs more than ordering bulk dump truck delivery.`;
  } else if (bulkTotalCost < bagMaterialCost) {
    recommendation = `Bulk delivery is cheaper overall and saves labor, even with the flat delivery fee included.`;
  } else {
    recommendation = `Bagged ${aggregateType} is recommended. For small quantities under 1.5 cubic yards, the bulk delivery fee ($${bulkDelivery}) outweighs the cost of buying bagged products.`;
  }

  return {
    volumeCuYd,
    aggregateType,
    bulk: {
      materialCost: Math.ceil(bulkMaterialCost),
      deliveryCharge: bulkDelivery,
      totalCost: Math.ceil(bulkTotalCost),
      weightLbs: bulkWeightLbs,
      laborHours: 0
    },
    bagged: {
      bagsNeeded,
      materialCost: Math.ceil(bagMaterialCost),
      totalCost: Math.ceil(bagMaterialCost),
      weightLbs: bagWeightLbs,
      tripsCount: bagTrips,
      laborHours: bagLaborHours,
      palletCount,
      storageSqFt: Math.round(storageSqFt * 10) / 10,
      cumulativeLiftWeightLbs
    },
    recommendation
  };
}
