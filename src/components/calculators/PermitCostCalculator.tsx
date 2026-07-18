import React, { useState } from "react";
import { calculatePermitCost, type ProjectCategory } from "../../lib/permitEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { withI18n } from "../i18n/withI18n";
import { useI18n } from "../i18n/I18nProvider";

function PermitCostCalculator() {
  const { t } = useI18n();
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>("addition");
  const [projectValuation, setProjectValuation] = useState<number>(50000);

  const result = calculatePermitCost({
    projectCategory,
    projectValuation: projectValuation || 0,
  });

  const categories: { value: ProjectCategory; label: string }[] = [
    { value: "addition", label: "Addition (Room, Garage, etc.)" },
    { value: "deck", label: "Deck / Patio Cover" },
    { value: "electrical", label: "Electrical (Panel Upgrade, Rewiring)" },
    { value: "plumbing", label: "Plumbing (Re-pipe, Sewer Line)" },
    { value: "hvac", label: "HVAC (Furnace, AC Replacement)" },
    { value: "remodel", label: "Interior Remodel" },
    { value: "structural", label: "Structural Changes / Foundation" },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Controls */}
      <div className="lg:col-span-5 space-y-6 print:hidden">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-stone-900">Project Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Project Category
              </label>
              <select
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-stone-900"
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value as ProjectCategory)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Estimated Project Valuation ($)"
                type="number"
                min="0"
                step="100"
                value={String(projectValuation)}
                onChange={(e) => setProjectValuation(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-stone-500 mt-1">
                Total estimated cost of labor and materials.
              </p>
            </div>
          </div>
        </Card>

        <div className="glass-panel p-4 rounded-xl border border-stone-200 bg-stone-50/50">
          <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Why Valuation Matters
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Most municipalities calculate building permit fees using the overall project valuation (the fair market value of materials and labor). Underestimating this value may result in the city using their own standard multipliers per square foot to override your estimate.
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-orange-200 bg-white shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
          
          <div className="flex justify-between items-start mb-6 print:hidden">
            <h2 className="text-2xl font-bold text-stone-900">Permit Estimate</h2>
            <button
              onClick={() => window.print()}
              className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2 text-sm font-medium bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Estimate
            </button>
          </div>

          <div className="hidden print:block mb-6">
            <h2 className="text-3xl font-bold text-black mb-2">Permit Cost Estimate</h2>
            <p className="text-stone-600">Generated by HomePlanningHub</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm text-orange-800 font-medium mb-1">Total Estimated Cost</p>
              <p className="text-4xl font-bold text-orange-600">
                {formatCurrency(result.totalPermitCost)}
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-sm text-stone-600 font-medium mb-1">Estimated Review Time</p>
              <p className="text-2xl font-bold text-stone-900 mt-2">
                {result.estimatedReviewDays}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b pb-2">Fee Breakdown</h3>
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-stone-700">
              <span>Base Permit Fee</span>
              <span className="font-medium">{formatCurrency(result.basePermitFee)}</span>
            </div>
            {result.planReviewFee > 0 && (
              <div className="flex justify-between items-center text-stone-700">
                <span>Plan Review Fee (65%)</span>
                <span className="font-medium">{formatCurrency(result.planReviewFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-stone-700">
              <span>State Surcharges (0.05%)</span>
              <span className="font-medium">{formatCurrency(result.surcharges)}</span>
            </div>
            <div className="flex justify-between items-center text-stone-900 font-bold border-t pt-3">
              <span>Total Cost</span>
              <span>{formatCurrency(result.totalPermitCost)}</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b pb-2">Typically Required Documents</h3>
          <ul className="space-y-2">
            {result.requiredDocuments.length > 0 ? (
              result.requiredDocuments.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-stone-700">
                  <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{doc}</span>
                </li>
              ))
            ) : (
              <li className="text-stone-500 italic">No specific documents listed for this category.</li>
            )}
            <li className="flex items-start gap-2 text-stone-700">
              <svg className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Completed Permit Application Form</span>
            </li>
            <li className="flex items-start gap-2 text-stone-700">
              <svg className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Contractor License & Insurance (if applicable)</span>
            </li>
          </ul>

        </Card>
      </div>
    </div>
  );
}

export default withI18n(PermitCostCalculator);
