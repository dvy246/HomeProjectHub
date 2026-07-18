import React, { useState, useMemo } from "react";
import { calculateHVACSavings, type HVACInput, type ClimateZone, type CurrentSystem, type TargetSystem } from "../../lib/hvacEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function HVACCalculator() {
  const { t } = useI18n();

  const [input, setInput] = useState<HVACInput>({
    homeSqFt: 2000,
    climateZone: "moderate",
    currentSystem: "gas-furnace-ac",
    targetSystem: "high-efficiency-heat-pump",
    annualEnergyBill: 2000,
  });

  const results = useMemo(() => calculateHVACSavings(input), [input]);

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
          <h2 className="text-xl font-bold text-stone-900 mb-6">Home Details & Current System</h2>
          
          <div className="space-y-4">
            <div>
              <Input
                label="Home Square Footage"
                type="number"
                min="500"
                max="10000"
                value={String(input.homeSqFt)}
                onChange={(e) => setInput({ ...input, homeSqFt: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Climate Zone
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                value={input.climateZone}
                onChange={(e) => setInput({ ...input, climateZone: e.target.value as ClimateZone })}
              >
                <option value="cold">Cold (North/Midwest)</option>
                <option value="moderate">Moderate (Mid-Atlantic/Pacific)</option>
                <option value="hot">Hot (South/Southwest)</option>
              </select>
            </div>

            <div>
              <Input
                label="Current Annual Energy Bill ($)"
                type="number"
                min="500"
                value={String(input.annualEnergyBill || "")}
                onChange={(e) => setInput({ ...input, annualEnergyBill: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Current System Type
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                value={input.currentSystem}
                onChange={(e) => setInput({ ...input, currentSystem: e.target.value as CurrentSystem })}
              >
                <option value="gas-furnace-ac">Gas Furnace & Central AC</option>
                <option value="electric-resistance-ac">Electric Baseboard & Window AC</option>
                <option value="heat-pump-old">Older Heat Pump (10+ years)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-stone-900 mb-6">Target Upgrade System</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Replacement Choice
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                value={input.targetSystem}
                onChange={(e) => setInput({ ...input, targetSystem: e.target.value as TargetSystem })}
              >
                <option value="high-efficiency-heat-pump">High-Efficiency Heat Pump (Dual Fuel/All Electric)</option>
                <option value="standard-ac-gas">Standard Central AC + New Gas Furnace</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-7 space-y-6 print:col-span-12">
        <Card className="p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-stone-900 mb-6">HVAC Replacement Estimate</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <p className="text-sm text-stone-500 mb-1">Required System Size</p>
              <p className="text-2xl font-bold text-stone-900">
                {results.tonnageRequired.toFixed(1)} <span className="text-base font-normal">Tons</span>
              </p>
              <p className="text-xs text-stone-400 mt-1">{results.btuRequired.toLocaleString()} BTU/hr</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-sm text-orange-600 mb-1">Estimated Net Cost</p>
              <p className="text-2xl font-bold text-orange-700">
                ${Math.round(results.netInstallCost).toLocaleString()}
              </p>
              <p className="text-xs text-orange-500 mt-1">After tax credits/rebates</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-stone-600">Gross Installation Cost</span>
              <span className="font-semibold text-stone-900">${Math.round(results.grossInstallCost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-stone-600 flex items-center gap-2">
                Eligible Tax Credits (Section 25C)
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-700 text-xs" title="Federal Tax Credit">i</span>
              </span>
              <span className="font-semibold text-green-600">-${Math.round(results.incentivesApplied).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-stone-600">Estimated Annual Utility Savings</span>
              <span className="font-semibold text-blue-600">${Math.round(results.annualUtilitySavings).toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-stone-100">
              <span className="text-stone-600">Investment Payback Period</span>
              <span className="font-semibold text-stone-900">
                {results.paybackYears > 50 ? "N/A" : `${results.paybackYears.toFixed(1)} years`}
              </span>
            </div>
          </div>

          <div className="flex gap-4 print:hidden">
            <Button onClick={handlePrint} variant="secondary" className="flex-1 flex justify-center items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Estimate
            </Button>
          </div>
        </Card>

        {input.targetSystem === "high-efficiency-heat-pump" && (
          <Card className="p-6 border-green-200 bg-green-50/50">
            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Tax Credit Eligibility
            </h3>
            <p className="text-sm text-green-700">
              Your selected high-efficiency heat pump qualifies for the Federal Section 25C tax credit, covering 30% of project costs up to $2,000. Depending on your state, additional point-of-sale rebates through the HEEHRA program may apply.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withI18n(HVACCalculator);
