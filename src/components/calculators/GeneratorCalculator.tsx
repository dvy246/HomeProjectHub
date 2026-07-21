import React, { useState, useMemo } from "react";
import { calculateGeneratorSize, GENERATOR_ITEMS, type GeneratorItem } from "../../lib/generatorEngine";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function GeneratorCalculator() {
  const { t } = useI18n();

  const [selectedIds, setSelectedIds] = useState<string[]>([
    "refrigerator",
    "lights_led",
    "router_modem",
  ]);

  const results = useMemo(() => calculateGeneratorSize(selectedIds), [selectedIds]);

  const categories = useMemo(() => {
    const cats = new Set(GENERATOR_ITEMS.map((item) => item.category));
    return Array.from(cats);
  }, []);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSelectEssentials = () => {
    setSelectedIds(["refrigerator", "lights_led", "router_modem", "sump_pump", "furnace_blower"]);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto">
      {/* Left Column - Appliance Selection */}
      <div className="lg:col-span-7 space-y-6 print:col-span-12">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Select Backup Appliances</h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Toggle devices you want to run during a power outage</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handleSelectEssentials}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 transition-colors"
              >
                Essentials Preset
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {categories.map((cat) => {
              const catItems = GENERATOR_ITEMS.filter((item) => item.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <h3 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider border-b border-stone-100 dark:border-stone-850 pb-1.5">{cat}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {catItems.map((item) => {
                      const isChecked = selectedIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40 text-stone-900 dark:text-stone-100"
                              : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-orange-600 border-stone-300 rounded focus:ring-orange-500"
                            checked={isChecked}
                            onChange={() => handleToggle(item.id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{item.name}</p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                              {item.runningWatts}W run
                              {item.startingWatts > 0 ? ` + ${item.startingWatts}W surge` : ""}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-5 space-y-6 print:col-span-12">
        <Card className="p-6 overflow-hidden relative border-orange-200 dark:border-orange-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Required Generator Size</h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-6 font-medium">Calculations include a 15% safety operating margin</p>

          {/* DANGER BACKFEED WARNING */}
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 p-4 rounded-r-lg mb-6">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
              <div>
                <p className="text-xs font-bold text-red-900 dark:text-red-300">BACKFEEDING SAFETY WARNING</p>
                <p className="text-[11px] text-red-700 dark:text-red-400 leading-relaxed mt-1">
                  **Never connect a generator directly to a dryer or wall outlet (backfeeding).** This feeds high-voltage power backward through your electric meter, which can electrocute utility linemen working to restore power and cause catastrophic electrical fires. Always connect your generator via a professionally installed **transfer switch** or an **interlock panel kit**.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-1 font-semibold uppercase tracking-wider">Recommended Running</p>
              <p className="text-2xl font-extrabold text-orange-850 dark:text-orange-200">
                {results.recommendedContinuousRating.toLocaleString()} <span className="text-sm font-normal text-orange-600 dark:text-orange-400">W</span>
              </p>
              <p className="text-[10px] text-orange-500 dark:text-orange-400 mt-1 font-medium">Continuous operating limit</p>
            </div>
            
            <div className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-semibold uppercase tracking-wider">Recommended Starting</p>
              <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {results.recommendedSurgeRating.toLocaleString()} <span className="text-sm font-normal text-stone-500 dark:text-stone-400">W</span>
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Motor startup surge limit</p>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-900/30 p-4 rounded-xl border border-stone-100 dark:border-stone-850 mb-6 text-xs">
            <p className="font-semibold text-stone-850 dark:text-stone-200 mb-1 capitalize">
              Suggested: {
                results.generatorClass === "standby" ? "Whole-House Standby Generator (12kW+)" :
                results.generatorClass === "large_portable" ? "Large Portable Generator (6.5kW - 8.5kW)" :
                results.generatorClass === "medium_portable" ? "Medium Portable / Large Inverter Generator (3kW - 5kW)" :
                "Small Inverter Generator (1.5kW - 2.2kW)"
              }
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed mt-1">
              {
                results.generatorClass === "standby" ? "This size requires a standby unit tied directly to your home propane or natural gas supply line. It automatically starts when utility power cuts out via an Automatic Transfer Switch (ATS)." :
                results.generatorClass === "large_portable" ? "Perfect for running multiple large critical items like a well pump, refrigerator, furnace fan, and a few lights. Can be rolled out and connected via a 30A or 50A generator inlet box." :
                results.generatorClass === "medium_portable" ? "Ideal for powering the essentials: refrigerator, sump pump, router, phone chargers, and a microwave. Easy to run on gasoline or dual-fuel propane." :
                "A highly compact, quiet, and fuel-efficient unit suitable for tailgating or backing up simple appliances like light bulbs, routers, and laptops. Cannot support motors (like pumps or ACs)."
              }
            </p>
          </div>

          <h3 className="font-bold text-stone-850 dark:text-stone-250 text-xs mb-3 uppercase tracking-wider">Wattage Calculations</h3>
          <div className="space-y-3 mb-8 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Selected Appliances</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedIds.length} items</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Sum of Running Watts</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{results.totalRunningWatts.toLocaleString()} W</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Single Highest Startup Surge Offset</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">+{results.maxStartingSurgeWatts.toLocaleString()} W</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Minimum Operational Surge Needed</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{results.requiredSurgeWatts.toLocaleString()} W</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Safety Buffer Multiplier</span>
              <span className="font-semibold text-stone-850 dark:text-stone-205 font-medium">15% Margin (+{(results.recommendedContinuousRating - results.totalRunningWatts).toLocaleString()}W)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button onClick={handlePrint} variant="secondary" className="flex-1 flex justify-center items-center gap-2 h-11">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Load Profile
            </Button>
          </div>
        </Card>

        {/* Cross link card */}
        <Card className="p-5 border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-colors print:hidden">
          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1.5">Conductor & Inlet Wire Sizing</h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
            Sizing the wire from your generator inlet box to your panel's transfer breaker? Size wire gauges safely.
          </p>
          <a href="/calculators/wire-sizing/" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1">
            Open Wire Sizer
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(GeneratorCalculator);
