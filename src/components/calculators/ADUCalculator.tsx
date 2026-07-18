import React, { useState } from 'react';
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { calculateADU, type ADUType, type QualityTier } from '../../lib/aduEngine';

function ADUCalculator() {
  const { t } = useI18n();

  const [aduType, setAduType] = useState<ADUType>('detached');
  const [areaSqFt, setAreaSqFt] = useState<number>(500);
  const [qualityTier, setQualityTier] = useState<QualityTier>('standard');
  const [selfBuild, setSelfBuild] = useState<boolean>(false);
  const [monthlyRentEstimate, setMonthlyRentEstimate] = useState<number>(1500);

  const result = calculateADU({
    aduType,
    areaSqFt,
    qualityTier,
    selfBuild,
    monthlyRentEstimate
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
      {/* Inputs Column */}
      <div className="lg:col-span-7 space-y-6 print:hidden">
        <div className="glass-panel p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-stone-900 dark:text-stone-100">Project Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">ADU Type</label>
              <select 
                value={aduType} 
                onChange={(e) => setAduType(e.target.value as ADUType)}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="detached">Detached ADU</option>
                <option value="attached">Attached ADU</option>
                <option value="garage-conversion">Garage Conversion</option>
                <option value="above-garage">Above Garage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Area (Square Feet): {areaSqFt} sq ft
              </label>
              <input 
                type="range" 
                min="200" 
                max="1200" 
                step="50"
                value={areaSqFt} 
                onChange={(e) => setAreaSqFt(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Quality Tier</label>
              <div className="flex space-x-4">
                {(['economy', 'standard', 'luxury'] as const).map(tier => (
                  <label key={tier} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="quality" 
                      value={tier}
                      checked={qualityTier === tier}
                      onChange={() => setQualityTier(tier)}
                      className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                    <span className="capitalize text-stone-700 dark:text-stone-300">{tier}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selfBuild}
                  onChange={(e) => setSelfBuild(e.target.checked)}
                  className="text-orange-500 focus:ring-orange-500 h-4 w-4 rounded"
                />
                <span className="text-stone-700 dark:text-stone-300 font-medium">Self-Build (Save 20% on Labor)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Estimated Monthly Rent Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-500">$</span>
                <input 
                  type="number" 
                  value={monthlyRentEstimate}
                  onChange={(e) => setMonthlyRentEstimate(Number(e.target.value))}
                  className="w-full p-2 pl-8 border border-stone-300 dark:border-stone-700 rounded bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                  step="50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Safety/Code Warnings */}
        <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-sm">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-stone-800 dark:text-stone-200">
              <strong>Zoning & Safety Warning:</strong>
              {aduType === 'detached' && (
                <p>Detached ADUs typically require minimum property line setbacks (e.g., 4-5 feet) and strict utility trenching permits.</p>
              )}
              {aduType === 'garage-conversion' && (
                <p>Garage conversions must usually meet updated energy codes, include a firewall separation if attached to the main house, and may require replacement parking spots.</p>
              )}
              {aduType === 'attached' && (
                <p>Attached ADUs require firewall separation (usually 1-hour rated) between the main dwelling and the ADU, plus separate egress.</p>
              )}
              {aduType === 'above-garage' && (
                <p>Building above a garage typically requires an engineering review to ensure existing footings and framing can support the second-story load.</p>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.print()}
          className="w-full py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold rounded-lg transition-colors border border-stone-300 dark:border-stone-600"
        >
          Print Estimate
        </button>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5">
        <div className="glass-panel p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm sticky top-8">
          <h2 className="text-xl font-bold mb-6 text-stone-900 dark:text-stone-100">Estimate Summary</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-700">
              <span className="text-stone-600 dark:text-stone-400">Construction Costs</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(result.totalConstructionCost)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-700">
              <span className="text-stone-600 dark:text-stone-400">Utility Connection</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(result.utilityCost)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-stone-700">
              <span className="text-stone-600 dark:text-stone-400">Permits & Fees</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{formatCurrency(result.permitCost)}</span>
            </div>
            
            <div className="pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-stone-900 dark:text-stone-100">Grand Total Project Cost</span>
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{formatCurrency(result.grandTotalProjectCost)}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">ROI & Cash Flow</h3>
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600 dark:text-stone-400">Monthly Rent Income</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(result.monthlyRentIncome)}/mo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600 dark:text-stone-400">Annual Net Cash Flow*</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">{formatCurrency(result.annualNetCashFlow)}/yr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600 dark:text-stone-400">Payback Period</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">{result.paybackPeriodYears > 0 ? `${result.paybackPeriodYears.toFixed(1)} years` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600 dark:text-stone-400">Net ROI</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">{result.netROIPercentage.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-4">*Net cash flow subtracts 2% of the project cost annually for maintenance and insurance reserves.</p>
        </div>
      </div>
    </div>
  );
}

export default withI18n(ADUCalculator);
