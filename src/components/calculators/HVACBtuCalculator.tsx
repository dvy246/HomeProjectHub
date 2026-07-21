import React, { useState, useMemo } from "react";
import { calculateHVACBtuLoad, type HVACBtuInput, type ClimateZoneGroup, type InsulationLevel, type SunExposure } from "../../lib/hvacBtuEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function HVACBtuCalculator() {
  const { t } = useI18n();

  const [input, setInput] = useState<HVACBtuInput>({
    areaSqFt: 1500,
    ceilingHeight: 8,
    climateZone: 4,
    insulationQuality: "average",
    windowCount: 6,
    sunExposure: "normal",
  });

  const results = useMemo(() => calculateHVACBtuLoad(input), [input]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto">
      {/* Left Column - Inputs */}
      <div className="lg:col-span-5 space-y-6 print:col-span-12">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">Room / Home Dimensions</h2>
          
          <div className="space-y-4">
            <div>
              <Input
                label="Conditioned Floor Area (Sq Ft)"
                type="number"
                min="100"
                max="10000"
                value={String(input.areaSqFt)}
                onChange={(e) => setInput({ ...input, areaSqFt: Number(e.target.value) })}
              />
            </div>

            <div>
              <Input
                label="Average Ceiling Height (Feet)"
                type="number"
                min="7"
                max="20"
                value={String(input.ceilingHeight)}
                onChange={(e) => setInput({ ...input, ceilingHeight: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                IECC Climate Zone
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                value={input.climateZone}
                onChange={(e) => setInput({ ...input, climateZone: Number(e.target.value) as ClimateZoneGroup })}
              >
                <option value="1">Zone 1: Very Hot (Miami, Hawaii)</option>
                <option value="2">Zone 2: Hot (Houston, Phoenix)</option>
                <option value="3">Zone 3: Warm (Atlanta, LA, El Paso)</option>
                <option value="4">Zone 4: Mixed (New York, St. Louis, Seattle)</option>
                <option value="5">Zone 5: Cool (Chicago, Boston, Denver)</option>
                <option value="6">Zone 6: Cold (Minneapolis, Burlington)</option>
                <option value="7">Zone 7: Very Cold (Fargo, Anchorage)</option>
                <option value="8">Zone 8: Subarctic (Interior Alaska)</option>
              </select>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Sized per standard International Energy Conservation Code climate maps.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">Thermal & Window Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Envelope Insulation Quality
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                value={input.insulationQuality}
                onChange={(e) => setInput({ ...input, insulationQuality: e.target.value as InsulationLevel })}
              >
                <option value="poor">Poor (R-11 or less, drafty walls, single-pane windows)</option>
                <option value="average">Average (R-19 walls / R-30 attic, double-pane windows)</option>
                <option value="excellent">Excellent (R-21+ walls / R-49+ attic, sealed envelopes)</option>
              </select>
            </div>

            <div>
              <Input
                label="Number of Windows"
                type="number"
                min="0"
                max="50"
                value={String(input.windowCount)}
                onChange={(e) => setInput({ ...input, windowCount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Sun Exposure
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                value={input.sunExposure}
                onChange={(e) => setInput({ ...input, sunExposure: e.target.value as SunExposure })}
              >
                <option value="shaded">Heavily Shaded (Mostly blocked by trees/buildings)</option>
                <option value="normal">Normal Exposure (Average daily sun and shadow)</option>
                <option value="sunny">High Sun Exposure (South-facing, no shade cover)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Results & YMYL Warnings */}
      <div className="lg:col-span-7 space-y-6 print:col-span-12">
        <Card className="p-6 overflow-hidden relative border-orange-200 dark:border-orange-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 10V7h-2v5H8l4 4 4-4h-3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Estimated Thermal Load</h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-6 font-medium">Sized using ACCA Manual J rules of thumb</p>

          {/* YMYL Safety Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 dark:border-amber-600/70 p-4 rounded-r-lg mb-6">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">YMYL Sizing Advisory</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed mt-1">
                  This calculator provides a thermal estimation for informational planning purposes. Before purchasing or installing equipment, a licensed HVAC professional must perform a certified **ACCA Manual J Load Calculation** to account for building materials, exact ductwork pressure, air leakage, and occupancy.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">Recommended Capacity</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {results.recommendedTons.toFixed(1)} <span className="text-base font-normal text-stone-500 dark:text-stone-400">Tons</span>
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">{results.recommendedBtu.toLocaleString()} BTU/hr</p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/40">
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">Calculated Heat Load</p>
              <p className="text-2xl font-bold text-orange-850 dark:text-orange-200">
                {results.finalLoadBtu.toLocaleString()}
              </p>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-1">BTU/hr thermal demand</p>
            </div>
          </div>

          {results.splitSystemWarning && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Large Capacity Sizing Note
              </h3>
              <p className="text-[11px] text-red-700 dark:text-red-450 leading-relaxed">
                A required size of <strong>{results.recommendedTons} Tons</strong> exceeds standard single-system residential capacities (which typically max out at 5.0 Tons). We recommend splitting this zone into multiple separate HVAC systems or zones (e.g., dual heat pumps or multi-split mini-splits) to maintain proper airflow and indoor temperature balance.
              </p>
            </div>
          )}

          <h3 className="font-bold text-stone-850 dark:text-stone-250 text-sm mb-3 uppercase tracking-wider">Load Calculation Breakdown</h3>
          <div className="space-y-3 mb-8 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Base Sizing (Sq Ft × Climate Zone)</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{results.baseBtu.toLocaleString()} BTU/hr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Ceiling Height Adjustment (Volume multiplier)</span>
              <span className={`font-semibold ${input.ceilingHeight > 8 ? "text-amber-600 dark:text-amber-400" : "text-stone-800 dark:text-stone-200"}`}>
                {results.heightAdjustedBtu.toLocaleString()} BTU/hr
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Envelope Insulation Adjustment</span>
              <span className={`font-semibold ${input.insulationQuality === "poor" ? "text-red-500 dark:text-red-400" : input.insulationQuality === "excellent" ? "text-emerald-600 dark:text-emerald-450" : "text-stone-800 dark:text-stone-200"}`}>
                {results.insulationAdjustedBtu.toLocaleString()} BTU/hr
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Solar Exposure Adjustment</span>
              <span className={`font-semibold ${input.sunExposure === "sunny" ? "text-amber-600 dark:text-amber-400" : input.sunExposure === "shaded" ? "text-emerald-600 dark:text-emerald-450" : "text-stone-800 dark:text-stone-200"}`}>
                {results.exposureAdjustedBtu.toLocaleString()} BTU/hr
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Window Count Offset (+500 BTU each)</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">+{results.windowAddedBtu.toLocaleString()} BTU/hr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 font-medium">
              <span className="text-stone-700 dark:text-stone-300">Calculated Required Tons</span>
              <span className="text-stone-800 dark:text-stone-200">{results.calculatedTonnage.toFixed(2)} Tons</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button onClick={handlePrint} variant="secondary" className="flex-1 flex justify-center items-center gap-2 h-11">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Load Sheet
            </Button>
            
            <a 
              href={`/energy/hvac-replacement-calculator/?tonnage=${results.recommendedTons}`}
              className="flex-1 inline-flex justify-center items-center bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-sm px-4 h-11 transition-colors text-center"
            >
              Estimate Heat Pump Savings →
            </a>
          </div>
        </Card>

        {/* Cross-link cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
          <Card className="p-5 border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-colors">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1.5">Attic & Wall Insulation</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
              Upgrading your attic insulation directly reduces your required HVAC unit sizing. Calculate bags and target R-values.
            </p>
            <a href="/calculators/insulation/" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1">
              Open Insulation Planner
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </Card>
          
          <Card className="p-5 border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-colors">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1.5">HVAC Breaker & Wire Sizing</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
              Running a new circuit for your air conditioner or heat pump? Sizing wires and breakers is critical for fire safety.
            </p>
            <a href="/calculators/wire-sizing/" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1">
              Open Wire Sizer
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withI18n(HVACBtuCalculator);
