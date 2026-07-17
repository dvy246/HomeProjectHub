import React, { useState } from "react";
import { compareConcreteOptions, compareAggregateOptions, type AggregateType } from "../../lib/logisticsEngine";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

type MaterialId = "concrete" | "gravel" | "sand" | "soil" | "mulch";
type VehiclePayloadId = 800 | 1200 | 1500 | 2500;

function BulkVsBaggedCalc() {
  const { t } = useI18n();

  // State parameters
  const [volume, setVolume] = useState<number>(2.0);
  const [unit, setUnit] = useState<"cuYd" | "cuFt">("cuYd");
  const [material, setMaterial] = useState<MaterialId>("concrete");
  const [payloadLbs, setPayloadLbs] = useState<VehiclePayloadId>(1500);

  // Convert volume to cubic yards
  const volCuYd = unit === "cuFt" ? volume / 27 : volume;

  // Run comparisons
  const isConcrete = material === "concrete";
  const concreteRes = compareConcreteOptions(volCuYd, payloadLbs);
  const aggregateRes = isConcrete ? null : compareAggregateOptions(volCuYd, material as AggregateType, payloadLbs);

  const bulkCost = isConcrete ? concreteRes.readyMix.totalCost : aggregateRes!.bulk.totalCost;
  const baggedCost = isConcrete ? concreteRes.bagged.totalCost : aggregateRes!.bagged.totalCost;
  const recommendation = isConcrete ? concreteRes.recommendation : aggregateRes!.recommendation;

  const bulkWeight = isConcrete ? concreteRes.readyMix.weightLbs : aggregateRes!.bulk.weightLbs;
  const baggedWeight = isConcrete ? concreteRes.bagged.weightLbs : aggregateRes!.bagged.weightLbs;

  const bagsCount = isConcrete ? concreteRes.bagged.bagsNeeded : aggregateRes!.bagged.bagsNeeded;
  const tripsCount = isConcrete ? concreteRes.bagged.tripsCount : aggregateRes!.bagged.tripsCount;
  const laborHours = isConcrete ? concreteRes.bagged.laborHours : aggregateRes!.bagged.laborHours;

  const palletCount = isConcrete ? concreteRes.bagged.palletCount : aggregateRes!.bagged.palletCount;
  const storageSqFt = isConcrete ? concreteRes.bagged.storageSqFt : aggregateRes!.bagged.storageSqFt;
  const cumulativeLiftWeightLbs = isConcrete ? concreteRes.bagged.cumulativeLiftWeightLbs : aggregateRes!.bagged.cumulativeLiftWeightLbs;

  const bulkMaterialCost = isConcrete ? concreteRes.readyMix.materialCost : aggregateRes!.bulk.materialCost;
  const bulkDelivery = isConcrete ? (concreteRes.readyMix.deliveryCharge + concreteRes.readyMix.shortLoadSurcharge) : aggregateRes!.bulk.deliveryCharge;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Configuration Control Panel */}
      <Card className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Material Volume & Transport Vehicle</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Material Select */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Material Type</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as MaterialId)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            >
              <option value="concrete">Concrete Slab Mix</option>
              <option value="gravel">Gravel / Crushed Stone</option>
              <option value="sand">Bedding Sand</option>
              <option value="soil">Topsoil / Garden Soil</option>
              <option value="mulch">Bark Mulch</option>
            </select>
          </div>

          {/* Volume Input */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Required Volume</span>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg p-2 font-semibold"
              >
                <option value="cuYd">cu. yd.</option>
                <option value="cuFt">cu. ft.</option>
              </select>
            </div>
          </div>

          {/* Vehicle Hauling Payload Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Your Hauling Vehicle</span>
            <select
              value={payloadLbs}
              onChange={(e) => setPayloadLbs(parseInt(e.target.value) as any)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            >
              <option value={800}>Sedan (max 800 lbs)</option>
              <option value={1200}>Crossover / Small SUV (max 1,200 lbs)</option>
              <option value={1500}>Half-Ton Truck (max 1,500 lbs)</option>
              <option value={2500}>HD Three-Quarter Ton Truck (max 2,500 lbs)</option>
            </select>
          </div>

          {/* Sizing indicators info */}
          <div className="bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border)] flex flex-col justify-center gap-0.5">
            <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wide">Aggregate Area Weight</span>
            <span className="text-sm font-bold text-[var(--fg)] tabular-nums">{bulkWeight.toLocaleString()} lbs</span>
            <span className="text-[10px] text-[var(--fg-secondary)]">({(bulkWeight / 2000).toFixed(2)} tons)</span>
          </div>
        </div>
      </Card>

      {/* Side-by-Side Cost Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Option Card */}
        <Card className="p-6 border-t-4 border-t-[var(--accent)] flex flex-col justify-between gap-5 relative">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-[var(--fg)]">Bulk / Ready-Mix Delivery</h4>
              <span className="text-[10px] bg-[var(--accent)]/5 text-[var(--accent)] border border-[var(--accent)]/10 font-bold px-2.5 py-0.5 rounded">
                Low Labor Option
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs border-b border-[var(--border)] pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Material Base Cost</span>
                <span className="font-semibold text-[var(--fg)]">${bulkMaterialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Delivery & Surcharges</span>
                <span className="font-semibold text-[var(--fg)]">${bulkDelivery.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Labor Requirement</span>
                <span className="font-bold text-emerald-600">0 Hours (Dump/Pour)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Transport Weight</span>
                <span className="font-semibold text-[var(--fg)]">{bulkWeight.toLocaleString()} lbs</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-baseline mt-2">
            <span className="text-xs text-[var(--fg-muted)]">Total Cost</span>
            <span className="text-2xl font-black text-[var(--fg)]">${bulkCost.toLocaleString()}</span>
          </div>
        </Card>

        {/* Bagged Option Card */}
        <Card className="p-6 border-t-4 border-t-[var(--fg-muted)] flex flex-col justify-between gap-5 relative">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-[var(--fg)]">Manual Bagged Hauling (DIY)</h4>
              <span className="text-[10px] bg-[var(--bg-subtle)] text-[var(--fg-secondary)] border border-[var(--border)] font-bold px-2.5 py-0.5 rounded">
                High Labor Option
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs border-b border-[var(--border)] pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Total Bags Needed</span>
                <span className="font-bold text-[var(--fg)]">{bagsCount} bags</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Required Hauling Trips</span>
                <span className="font-bold text-[var(--accent)] tabular-nums">{tripsCount} trips</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Storage Area Footprint</span>
                <span className="font-semibold text-[var(--fg)]">{palletCount} pallet ({storageSqFt} sq ft)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Cumulative Lifting Load</span>
                <span className="font-bold text-red-600 tabular-nums">{cumulativeLiftWeightLbs.toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Manual Labor Time</span>
                <span className="font-semibold text-[var(--fg)]">~{laborHours} Hours</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-baseline mt-2">
            <span className="text-xs text-[var(--fg-muted)]">Total Cost</span>
            <span className="text-2xl font-black text-[var(--fg)]">${baggedCost.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Decision recommendation verdict */}
      <Card className="p-5 bg-[var(--bg-subtle)] border-l-4 border-l-[var(--accent)] flex flex-col gap-2">
        <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Logistics Recommendation</h4>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed font-medium">
          {recommendation}
        </p>
      </Card>

      {/* Link to Payload safety planner & Print menu */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl p-4 gap-4 text-xs no-print">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[var(--fg)]">Need a PDF Copy or Safety Check?</span>
          <span className="text-[var(--fg-secondary)]">Verify vehicle suspension safety parameters or print a logistics planner.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg)] font-bold px-4 py-2 rounded-lg text-center transition-all cursor-pointer"
          >
            Print Planner
          </button>
          {baggedWeight > 1000 && (
            <a
              href={`/calculators/payload/?weight=${baggedWeight}&material=${material}`}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold px-4 py-2 rounded-lg text-center transition-all cursor-pointer"
            >
              Check Payload Safety
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default withI18n(BulkVsBaggedCalc);
