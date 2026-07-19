import { useState, useEffect } from "react";
import { getMaterialPrice, saveMaterialPrice } from "../../lib/storage";

export interface CostItem {
  key: string;          // Key for localStorage overrides, e.g. "concrete_80lb_bag"
  name: string;         // Display name of the material
  quantity: number;     // Quantity computed by the designer/calculator
  unit: string;         // Unit label (e.g. "bags", "sticks", "tons")
  defaultPrice: number; // Default price to fallback to if no custom price
}

interface CostEstimatorWidgetProps {
  items: CostItem[];
  defaultLaborHours?: number; // Pre-estimated hours for hourly labor option
  projectId?: string;
  onTotalChange?: (total: number) => void;
}

export default function CostEstimatorWidget({
  items,
  defaultLaborHours = 8,
  onTotalChange,
}: CostEstimatorWidgetProps) {
  // Local state for pricing overrides
  // Local state for pricing overrides (stored as strings to allow typing decimals/clearing inputs)
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [includeLabor, setIncludeLabor] = useState<boolean>(false);
  const [laborType, setLaborType] = useState<"percent" | "hourly">("percent");
  const [laborPercent, setLaborPercent] = useState<number>(50);
  const [laborRate, setLaborRate] = useState<string>("65");
  const [laborHours, setLaborHours] = useState<string>(String(defaultLaborHours));
  const [contingencyPercent, setContingencyPercent] = useState<number>(10);

  // Load custom labor configurations from storage on mount (avoiding hydration mismatches)
  useEffect(() => {
    setIncludeLabor(getMaterialPrice("include_labor", 0) === 1);
    setLaborType(localStorage.getItem("hph_labor_type") === "hourly" ? "hourly" : "percent");
    setLaborPercent(getMaterialPrice("labor_percent", 50));
    setLaborRate(String(getMaterialPrice("labor_hourly_rate", 65)));
    setLaborHours(String(getMaterialPrice("labor_hours", defaultLaborHours)));
    setContingencyPercent(getMaterialPrice("contingency_percent", 10));
  }, [defaultLaborHours]);

  // Sync laborHours local state if defaultLaborHours prop changes
  useEffect(() => {
    setLaborHours(String(defaultLaborHours));
  }, [defaultLaborHours]);

  // Load prices from localStorage or fallback to defaults
  useEffect(() => {
    const loadedPrices: Record<string, string> = {};
    items.forEach((item) => {
      loadedPrices[item.key] = String(getMaterialPrice(item.key, item.defaultPrice));
    });
    setPrices(loadedPrices);
  }, [items]);

  // Handle unit price change
  const handlePriceChange = (key: string, valStr: string) => {
    setPrices((prev) => ({ ...prev, [key]: valStr }));
  };

  const handlePriceBlur = (key: string, valStr: string, defaultPrice: number) => {
    let val = parseFloat(valStr);
    if (isNaN(val) || val < 0) {
      val = defaultPrice;
    }
    setPrices((prev) => ({ ...prev, [key]: String(val) }));
    saveMaterialPrice(key, val);
  };

  // Handle labor inclusion change
  const handleLaborToggle = (checked: boolean) => {
    setIncludeLabor(checked);
    saveMaterialPrice("include_labor", checked ? 1 : 0);
  };

  // Handle labor percent slider change
  const handleLaborPercentChange = (val: number) => {
    setLaborPercent(val);
    saveMaterialPrice("labor_percent", val);
  };

  // Handle labor hourly rate change
  const handleLaborRateChange = (valStr: string) => {
    setLaborRate(valStr);
  };

  const handleLaborRateBlur = (valStr: string) => {
    let val = parseFloat(valStr);
    if (isNaN(val) || val < 0) val = 65;
    setLaborRate(String(val));
    saveMaterialPrice("labor_hourly_rate", val);
  };

  // Handle labor hours change
  const handleLaborHoursChange = (valStr: string) => {
    setLaborHours(valStr);
  };

  const handleLaborHoursBlur = (valStr: string) => {
    let val = parseFloat(valStr);
    if (isNaN(val) || val < 0) val = defaultLaborHours;
    setLaborHours(String(val));
    saveMaterialPrice("labor_hours", val);
  };

  // Handle contingency slider change
  const handleContingencyChange = (val: number) => {
    setContingencyPercent(val);
    saveMaterialPrice("contingency_percent", val);
  };

  // Calculations
  const materialsCost = items.reduce((acc, item) => {
    const priceStr = prices[item.key];
    const unitPrice = priceStr !== undefined && priceStr !== "" ? parseFloat(priceStr) : item.defaultPrice;
    const cleanPrice = isNaN(unitPrice) ? item.defaultPrice : unitPrice;
    return acc + item.quantity * cleanPrice;
  }, 0);

  let laborCost = 0;
  if (includeLabor) {
    if (laborType === "percent") {
      laborCost = materialsCost * (laborPercent / 100);
    } else {
      const parsedHours = parseFloat(laborHours);
      const parsedRate = parseFloat(laborRate);
      laborCost = (isNaN(parsedHours) ? 0 : parsedHours) * (isNaN(parsedRate) ? 0 : parsedRate);
    }
  }

  const baseTotal = materialsCost + laborCost;
  const contingencyCost = baseTotal * (contingencyPercent / 100);
  const grandTotal = baseTotal + contingencyCost;

  // Propagate total cost to parent components if needed
  useEffect(() => {
    onTotalChange?.(grandTotal);
  }, [grandTotal, onTotalChange]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm flex flex-col gap-6">
      <div className="border-b border-[var(--border)] pb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg)]">Cost Estimate & Budget Customizer</h3>
          <p className="text-[10px] text-[var(--fg-muted)]">Configure local unit prices and contractor rates</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider block">Estimated Project Cost</span>
          <span className="text-xl font-extrabold text-[var(--fg)] tabular-nums">
            ${Math.round(grandTotal).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Materials List table */}
      <div>
        <span className="text-[10px] font-semibold text-[var(--fg-muted)] uppercase tracking-wider block mb-2">Material Pricing Details</span>
        <div className="overflow-x-auto border border-[var(--border)] rounded-lg bg-[var(--bg-inset)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                <th className="p-2.5 font-medium">Material Description</th>
                <th className="p-2.5 font-medium text-center">Qty</th>
                <th className="p-2.5 font-medium text-right">Unit Price</th>
                <th className="p-2.5 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const priceStr = prices[item.key];
                const currentPrice = priceStr !== undefined && priceStr !== "" ? parseFloat(priceStr) : item.defaultPrice;
                const cleanPrice = isNaN(currentPrice) ? item.defaultPrice : currentPrice;
                const totalItemCost = item.quantity * cleanPrice;

                return (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-none text-[var(--fg)] hover:bg-[var(--card-bg-hover)] transition-colors">
                    <td className="p-2.5 font-medium">{item.name}</td>
                    <td className="p-2.5 text-center font-mono tabular-nums">{item.quantity} <span className="text-[10px] text-[var(--fg-muted)]">{item.unit}</span></td>
                    <td className="p-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span className="text-[var(--fg-muted)] font-mono">$</span>
                        <input
                          id={`input-price-${item.key}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={prices[item.key] !== undefined ? prices[item.key] : ""}
                          placeholder={String(item.defaultPrice)}
                          onChange={(e) => handlePriceChange(item.key, e.target.value)}
                          onBlur={(e) => handlePriceBlur(item.key, e.target.value, item.defaultPrice)}
                          className="w-20 h-10 text-right px-2 font-mono bg-[var(--card-bg)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--accent)] transition-colors"
                          aria-label={`Unit price for ${item.name}`}
                        />
                      </div>
                    </td>
                    <td className="p-2.5 text-right font-mono tabular-nums">${Math.round(totalItemCost).toLocaleString()}</td>
                  </tr>
                );
              })}
              <tr className="bg-[var(--card-bg)] font-semibold border-t border-[var(--border)]">
                <td colSpan={3} className="p-2.5 text-right">Materials Subtotal:</td>
                <td className="p-2.5 text-right font-mono tabular-nums">${Math.round(materialsCost).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Labor & Contingency Controls */}
      <div className="space-y-4 pt-2 border-t border-[var(--border)] no-print">
        <span className="text-[10px] font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">Labor & Overhead</span>
        
        {/* Toggle Labor */}
        <div className="flex items-center justify-between">
          <label htmlFor="checkbox-include-labor" className="text-xs text-[var(--fg)] font-medium cursor-pointer flex items-center gap-2">
            <input
              id="checkbox-include-labor"
              type="checkbox"
              checked={includeLabor}
              onChange={(e) => handleLaborToggle(e.target.checked)}
              className="accent-[var(--accent)] w-4 h-4 rounded cursor-pointer"
            />
            Include Contractor Labor Costs
          </label>
          {includeLabor && (
            <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] text-[10px]">
              <button
                type="button"
                className={`px-3 py-2.5 min-h-[44px] rounded-md font-medium transition-all ${laborType === "percent" ? "bg-[var(--card-bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
                onClick={() => { setLaborType("percent"); localStorage.setItem("hph_labor_type", "percent"); }}
              >
                % of Materials
              </button>
              <button
                type="button"
                className={`px-3 py-2.5 min-h-[44px] rounded-md font-medium transition-all ${laborType === "hourly" ? "bg-[var(--card-bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
                onClick={() => { setLaborType("hourly"); localStorage.setItem("hph_labor_type", "hourly"); }}
              >
                Hourly Rates
              </button>
            </div>
          )}
        </div>
 
        {includeLabor && (
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] space-y-4 animate-fadeIn">
            {laborType === "percent" ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--fg-secondary)]">Labor Cost Surcharge:</span>
                  <span className="font-bold text-[var(--accent)]">{laborPercent}% of Materials</span>
                </div>
                <input
                  id="slider-labor-percent"
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={laborPercent}
                  onChange={(e) => handleLaborPercentChange(parseInt(e.target.value))}
                  className="accent-[var(--accent)] w-full h-1.5 rounded-lg bg-[var(--border)] cursor-pointer"
                  aria-label="Labor surcharge percentage"
                />
                <div className="flex justify-between text-[9px] text-[var(--fg-muted)]">
                  <span>10% (Simple Install)</span>
                  <span>50% (Standard Fee)</span>
                  <span>150% (Complex Custom Work)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-labor-rate" className="text-[10px] font-medium text-[var(--fg-secondary)] block mb-1">Labor Rate ($/hr)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--fg-muted)] font-mono">$</span>
                    <input
                      id="input-labor-rate"
                      type="number"
                      min="15"
                      value={laborRate}
                      onChange={(e) => handleLaborRateChange(e.target.value)}
                      onBlur={(e) => handleLaborRateBlur(e.target.value)}
                      className="w-full h-10 pl-6 pr-3 text-xs bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="input-labor-hours" className="text-[10px] font-medium text-[var(--fg-secondary)] block mb-1">Estimated Hours</label>
                  <input
                    id="input-labor-hours"
                    type="number"
                    min="1"
                    value={laborHours}
                    onChange={(e) => handleLaborHoursChange(e.target.value)}
                    onBlur={(e) => handleLaborHoursBlur(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-[var(--card-bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contingency Slider */}
        <div className="space-y-2 border-t border-[var(--border)] pt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--fg-secondary)]">Contingency Buffer (Unplanned Waste & Rework):</span>
            <span className="font-bold text-[var(--accent)]">{contingencyPercent}% of Total</span>
          </div>
          <input
            id="slider-contingency-percent"
            type="range"
            min="0"
            max="30"
            step="5"
            value={contingencyPercent}
            onChange={(e) => handleContingencyChange(parseInt(e.target.value))}
            className="accent-[var(--accent)] w-full h-1.5 rounded-lg bg-[var(--border)] cursor-pointer"
            aria-label="Contingency percentage"
          />
          <div className="flex justify-between text-[9px] text-[var(--fg-muted)]">
            <span>0% (Tight Budget)</span>
            <span>10% (Recommended)</span>
            <span>30% (Complex Retrofits)</span>
          </div>
        </div>
      </div>

      {/* Structured Cost Summary */}
      <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-[var(--fg-muted)]">Materials Subtotal</span>
          <span className="font-semibold font-mono tabular-nums">${Math.round(materialsCost).toLocaleString()}</span>
        </div>
        {includeLabor && (
          <div className="flex justify-between items-center">
            <span className="text-[var(--fg-muted)]">Estimated Contractor Labor</span>
            <span className="font-semibold font-mono tabular-nums">${Math.round(laborCost).toLocaleString()}</span>
          </div>
        )}
        {contingencyPercent > 0 && (
          <div className="flex justify-between items-center text-[var(--accent)] font-medium">
            <span>Contingency Buffer ({contingencyPercent}%)</span>
            <span className="font-mono tabular-nums">${Math.round(contingencyCost).toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)] text-sm font-bold text-[var(--fg)]">
          <span>Project Budget Cost (Total)</span>
          <span className="font-mono tabular-nums text-lg">${Math.round(grandTotal).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
