import React, { useState } from "react";
import { withI18n } from "../i18n/withI18n";
import { inspectionChecklist, calculateRepairEstimate } from "../../lib/inspectionEngine";

function InspectionChecklist() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const { lowTotal, highTotal } = calculateRepairEstimate(selectedItems);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-xl font-semibold text-stone-800">Inspection Checklist</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {inspectionChecklist.map((category) => (
            <div key={category.id} className="@utility glass-panel p-6 rounded-xl border border-stone-200 break-inside-avoid bg-white/50 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-stone-800 mb-4 border-b border-stone-100 pb-2">{category.name}</h3>
              <div className="space-y-3">
                {category.items.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <label 
                      key={item.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                        isSelected 
                          ? item.isHighRisk ? 'bg-orange-50/50 border-orange-200' : 'bg-stone-50 border-stone-200' 
                          : 'bg-white border-transparent hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex-shrink-0 pt-0.5 print:hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(item.id)}
                          className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <div className="hidden print:block flex-shrink-0 pt-0.5">
                        <div className={`w-5 h-5 border rounded ${isSelected ? 'bg-stone-800 border-stone-800' : 'border-stone-300'}`}></div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start gap-4">
                          <span className={`font-medium ${item.isHighRisk ? 'text-orange-700' : 'text-stone-800'}`}>
                            {item.name}
                            {item.isHighRisk && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 print:border print:border-orange-300">
                                High Risk
                              </span>
                            )}
                          </span>
                          <span className="text-stone-500 whitespace-nowrap text-sm font-medium">
                            ${item.lowCost.toLocaleString()} - ${item.highCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="@utility glass-panel p-6 rounded-xl border border-stone-200 sticky top-6 bg-white/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Estimated Repair Cost</h3>
            
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                <p className="text-sm font-medium text-stone-500 mb-1">Total Estimated Range</p>
                <div className="text-3xl font-bold text-stone-800">
                  ${lowTotal.toLocaleString()} - ${highTotal.toLocaleString()}
                </div>
              </div>

              <div className="text-sm text-stone-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Note:</strong> These are rough estimates based on national averages. Actual costs will vary by location, materials, and labor rates.
                </p>
                <p>
                  Use this as a baseline for negotiating repair credits or planning your renovation budget.
                </p>
              </div>

              {selectedItems.length > 0 && (
                <div className="pt-4 border-t border-stone-200 print:hidden mt-4">
                  <p className="text-sm font-medium text-stone-800 mb-3">Selected Items ({selectedItems.length})</p>
                  <ul className="text-sm text-stone-600 space-y-2">
                    {inspectionChecklist.flatMap(c => c.items).filter(i => selectedItems.includes(i.id)).map(item => (
                      <li key={item.id} className="flex justify-between items-start gap-2">
                        <span className="truncate">{item.name}</span>
                        <span className="whitespace-nowrap font-medium">${item.lowCost}+</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(InspectionChecklist);
