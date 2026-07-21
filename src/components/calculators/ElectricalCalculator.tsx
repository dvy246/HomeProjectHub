import React, { useState, useMemo, useEffect } from "react";
import { calculateElectricalSizing, APPLIANCE_PRESETS, type ConductorMaterial, type WiringMethod, type ElectricalInput } from "../../lib/electricalEngine";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function ElectricalCalculator() {
  const { t } = useI18n();

  const [presetKey, setPresetKey] = useState<string>("custom");
  const [loadAmps, setLoadAmps] = useState<number>(15);
  const [volts, setVolts] = useState<120 | 240>(120);
  const [isContinuous, setIsContinuous] = useState<boolean>(false);
  const [distanceFt, setDistanceFt] = useState<number>(50);
  const [material, setMaterial] = useState<ConductorMaterial>("copper");
  const [wiringMethod, setWiringMethod] = useState<WiringMethod>("romex");

  // Sync preset changes to form values
  useEffect(() => {
    if (presetKey !== "custom") {
      const preset = APPLIANCE_PRESETS[presetKey];
      if (preset) {
        setLoadAmps(preset.defaultAmps);
        setVolts(preset.defaultVolts);
        setIsContinuous(preset.isContinuous);
      }
    }
  }, [presetKey]);

  // If user modifies inputs manually, set preset selection to custom
  const handleAmpsChange = (val: number) => {
    setPresetKey("custom");
    setLoadAmps(val);
  };
  const handleVoltsChange = (val: 120 | 240) => {
    setPresetKey("custom");
    setVolts(val);
  };
  const handleContinuousChange = (val: boolean) => {
    setPresetKey("custom");
    setIsContinuous(val);
  };

  const input: ElectricalInput = useMemo(() => ({
    applianceKey: presetKey,
    loadAmps,
    volts,
    isContinuous,
    distanceFt,
    material,
    wiringMethod,
  }), [presetKey, loadAmps, volts, isContinuous, distanceFt, material, wiringMethod]);

  const results = useMemo(() => {
    try {
      return calculateElectricalSizing(input);
    } catch (e) {
      return null;
    }
  }, [input]);

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
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">Load & Appliance Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Appliance Preset
              </label>
              <select
                className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm"
                value={presetKey}
                onChange={(e) => setPresetKey(e.target.value)}
              >
                <option value="custom">Custom Load Sizing</option>
                {Object.entries(APPLIANCE_PRESETS).map(([key, value]) => {
                  if (key === "custom") return null;
                  return (
                    <option key={key} value={key}>
                      {value.name} ({value.defaultAmps}A / {value.defaultVolts}V)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Load Amperage (A)"
                  type="number"
                  min="1"
                  max="150"
                  step="0.1"
                  value={String(loadAmps)}
                  onChange={(e) => handleAmpsChange(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Voltage (V)
                </label>
                <select
                  className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={volts}
                  onChange={(e) => handleVoltsChange(Number(e.target.value) as 120 | 240)}
                >
                  <option value="120">120 V (Single-Phase)</option>
                  <option value="240">240 V (Split-Phase / Large Appliance)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 bg-stone-50 dark:bg-stone-900/30 p-3 rounded-lg border border-stone-100 dark:border-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 border-stone-300 rounded focus:ring-orange-500"
                  checked={isContinuous}
                  onChange={(e) => handleContinuousChange(e.target.checked)}
                />
                <div>
                  <p className="text-xs font-semibold text-stone-850 dark:text-stone-200">Continuous Load (runs ≥ 3 hours)</p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">Applies NEC 125% circuit capacity buffer (e.g. EV charger, space heaters).</p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6">Conductor & Run Setup</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Wire Material
                </label>
                <select
                  className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as ConductorMaterial)}
                >
                  <option value="copper">Copper (Standard)</option>
                  <option value="aluminum">Aluminum (Service feeder / Large runs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Wiring Method
                </label>
                <select
                  className="w-full h-11 px-3 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={wiringMethod}
                  onChange={(e) => setWiringMethod(e.target.value as WiringMethod)}
                >
                  <option value="romex">NM-B Romex (Dry/Interior)</option>
                  <option value="conduit_thhn">THHN in Conduit (Wet/Dry/Feeder)</option>
                  <option value="uf_burial">UF-B Cable (Direct Burial)</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Circuit Run Length (Feet)"
                type="number"
                min="5"
                max="500"
                value={String(distanceFt)}
                onChange={(e) => setDistanceFt(Number(e.target.value))}
              />
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Runs over 100 feet frequently require wire gauge upsizing to control voltage drop.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-7 space-y-6 print:col-span-12">
        <Card className="p-6 overflow-hidden relative border-orange-200 dark:border-orange-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Wire & Breaker Sizing Results</h2>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-6 font-medium">Calculations follow NFPA 70 / National Electrical Code guidelines</p>

          {/* DANGER YMYL WARNING BOX */}
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-600 p-4 rounded-r-lg mb-6">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
              <div>
                <p className="text-xs font-bold text-red-900 dark:text-red-300">HIGH VOLTAGE SAFETY WARNING</p>
                <p className="text-[11px] text-red-700 dark:text-red-400 leading-relaxed mt-1">
                  Electricity is inherently dangerous and can cause fire, injury, or death. Sizing wire and breakers incorrectly voids manufacturer warranties, fails local safety inspections, and poses serious fire hazards. **Always turn off main service panels** before handling electrical systems, and consult a **licensed electrical contractor** to inspect and authorize your installations.
                </p>
              </div>
            </div>
          </div>

          {results ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-1 font-semibold uppercase tracking-wider">Recommended Wire Size</p>
                  <p className="text-3xl font-extrabold text-orange-850 dark:text-orange-200">
                    {results.recommendedWireSizeAWG} <span className="text-base font-normal text-orange-600 dark:text-orange-400">AWG</span>
                  </p>
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1 capitalize font-medium">{material} conductor ({wiringMethod.replace("_", " ")})</p>
                </div>
                
                <div className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1 font-semibold uppercase tracking-wider">Minimum Breaker Size</p>
                  <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                    {results.minBreakerSize} <span className="text-base font-normal text-stone-500 dark:text-stone-400">Amps</span>
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Continuous load limit: {results.continuousLoadAmps.toFixed(2)}A</p>
                </div>
              </div>

              {results.upsizedForDistance && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl mb-6 flex gap-2.5 items-start">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs">Upsized for Voltage Drop</h4>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed mt-0.5">
                      Base ampacity code allows for **{results.baseWireSizeAWG} AWG** wire, but at **{distanceFt} feet**, this would cause a **{results.voltageDropPercent.toFixed(2)}%** voltage drop. To prevent overheating and equipment damage, the wire size has been upsized to **{results.recommendedWireSizeAWG} AWG** to keep voltage drop under the recommended 3.0% threshold.
                    </p>
                  </div>
                </div>
              )}

              <h3 className="font-bold text-stone-850 dark:text-stone-250 text-sm mb-3 uppercase tracking-wider">NEC Code Sizing Reference</h3>
              <div className="space-y-3 mb-8 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400">Design Load Current</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{loadAmps} Amps ({volts}V)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400">Continuous Surcharge Factor</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{isContinuous ? "125% Surcharge (NEC 210.20)" : "None"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 font-medium">
                  <span className="text-stone-500 dark:text-stone-400">Continuous Calculation Target</span>
                  <span className="text-stone-800 dark:text-stone-200">{results.continuousLoadAmps.toFixed(2)} Amps</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400">Voltage Drop over Run</span>
                  <span className={`font-semibold ${results.voltageDropPercent > 3.0 ? "text-red-500 dark:text-red-400" : "text-stone-800 dark:text-stone-200"}`}>
                    {results.voltageDropVolts.toFixed(2)}V ({results.voltageDropPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400">Conductor Resistance (Chapter 9, Table 8)</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{results.resistancePer1000Ft} Ω / 1000 ft</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100 dark:border-stone-800 font-medium text-stone-900 dark:text-stone-100">
                  <span>Cited NEC Sections</span>
                  <span className="text-orange-700 dark:text-orange-350 bg-orange-50 dark:bg-orange-950/30 px-2.5 py-0.5 rounded text-[10px] font-bold">{results.necCitation}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-xs text-red-500 font-medium">
              Error sizing wire. Please check inputs. Load may exceed residential standards (200A max).
            </div>
          )}

          <div className="flex gap-4 print:hidden">
            <Button onClick={handlePrint} variant="secondary" className="flex-1 flex justify-center items-center gap-2 h-11">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Spec Sheet
            </Button>
          </div>
        </Card>

        {/* Cross Link Card */}
        <Card className="p-5 border border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 transition-colors print:hidden">
          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1.5">Standby & Portable Generator Sizing</h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
            Connecting a home generator? Size your transfer switch inlet breaker and select which essential appliances to back up.
          </p>
          <a href="/calculators/generator-sizing/" className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 inline-flex items-center gap-1">
            Open Generator Calculator
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </Card>
      </div>
    </div>
  );
}

export default withI18n(ElectricalCalculator);
