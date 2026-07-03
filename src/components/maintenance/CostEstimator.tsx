import { useState, useMemo, useEffect, useCallback, useId } from "react";
import { Card } from "../ui/Card";
import { estimateCosts, REGION_LABELS, AGE_LABELS, PROPERTY_LABELS, type ClimateRegion, type PropertyType, type AgeRange } from "../../data/maintenance/costs";

const STORAGE_KEY = "hph_maintenance_costs";

function loadSaved() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSaved(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function CostEstimator() {
  const saved = loadSaved();
  const [homeSize, setHomeSize] = useState(saved?.homeSize ?? "2000");
  const [age, setAge] = useState<AgeRange>(saved?.age ?? "15-30");
  const [region, setRegion] = useState<ClimateRegion>(saved?.region ?? "temperate");
  const [propertyType, setPropertyType] = useState<PropertyType>(saved?.propertyType ?? "single-family");
  const [remember, setRemember] = useState(saved !== null);

  const size = parseInt(homeSize, 10) || 0;

  const result = useMemo(() => {
    if (size < 100) return null;
    return estimateCosts({ homeSizeSqft: size, age, region, propertyType });
  }, [size, age, region, propertyType]);

  const persist = useCallback(() => {
    if (remember) {
      saveSaved({ homeSize, age, region, propertyType });
    }
  }, [remember, homeSize, age, region, propertyType]);

  useEffect(() => {
    persist();
  }, [persist]);

  const resultsId = useId();

  return (
    <div className="flex flex-col gap-6" aria-live="polite" aria-atomic="true">
      <Card>
        <h3 className="text-sm font-semibold mb-4">Home Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]" id="home-size-label">Home Size</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={homeSize}
                onChange={(e) => setHomeSize(e.target.value)}
                className="flex-1 accent-[var(--accent)]"
                aria-labelledby="home-size-label"
              />
              <span className="text-sm font-semibold tabular-nums min-w-[60px] text-right" aria-hidden="true">{size.toLocaleString()} sq ft</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]" htmlFor="home-age">Home Age</label>
            <select
              id="home-age"
              value={age}
              onChange={(e) => setAge(e.target.value as AgeRange)}
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            >
              {Object.entries(AGE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]" htmlFor="climate-region">Climate Region</label>
            <select
              id="climate-region"
              value={region}
              onChange={(e) => setRegion(e.target.value as ClimateRegion)}
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            >
              {Object.entries(REGION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--fg-secondary)]" htmlFor="property-type">Property Type</label>
            <select
              id="property-type"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full text-sm bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)] focus:outline-none focus:border-[var(--border-hover)] transition-colors"
            >
              {Object.entries(PROPERTY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input type="checkbox" id="save-inputs" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-3.5 h-3.5 rounded border-[var(--border-strong)] accent-[var(--accent)]" />
          <label htmlFor="save-inputs" className="text-[11px] text-[var(--fg-muted)] cursor-pointer">Remember my inputs</label>
        </div>
      </Card>

      {result && (
        <div id={resultsId}>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Estimated Annual Maintenance Budget</h3>
            <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-6 mb-4">
              <div>
                <div className="text-3xl sm:text-4xl font-black tabular-nums">${result.yearlyMid.toLocaleString()}</div>
                <div className="text-xs text-[var(--fg-muted)]">per year (mid-range estimate)</div>
              </div>
              <div className="text-sm text-[var(--fg-secondary)]">
                Range: <span className="font-semibold">${result.yearlyLow.toLocaleString()}</span> – <span className="font-semibold">${result.yearlyHigh.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-inset)] border border-[var(--border)]">
              <div className="text-2xl font-black tabular-nums">${result.monthlyMid.toLocaleString()}</div>
              <div className="text-xs text-[var(--fg-secondary)]">estimated monthly budget</div>
            </div>
            <p className="mt-4 text-xs text-[var(--fg-muted)] leading-relaxed">{result.explanation}</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-4">Cost Breakdown by Category</h3>
            <div className="flex flex-col gap-3">
              {result.breakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold">{cat.category}</span>
                    <div className="text-right">
                      <span className="font-semibold tabular-nums">${cat.amount.toLocaleString()}</span>
                      <span className="text-xs text-[var(--fg-muted)] ml-1">({cat.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    {cat.items.map((item) => (
                      <li key={item} className="text-[10px] text-[var(--fg-muted)] list-disc list-inside">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-2">What This Means</h3>
            <ul className="text-xs text-[var(--fg-secondary)] space-y-2">
              <li><strong>Low range ({result.yearlyLow.toLocaleString()}):</strong> Minimal maintenance year — just filter changes, minor repairs, and routine inspections.</li>
              <li><strong>Mid range ({result.yearlyMid.toLocaleString()}):</strong> Typical year — includes one or two professional services, some component replacements.</li>
              <li><strong>High range ({result.yearlyHigh.toLocaleString()}):</strong> High-cost year — major repairs, system replacements, or unexpected failures.</li>
            </ul>
            <div className="mt-4 p-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5">
              <p className="text-[11px] text-[var(--warning)] font-semibold mb-1">Important Disclaimer</p>
              <p className="text-[11px] text-[var(--fg-secondary)] leading-relaxed">
                This is an educational estimate based on the industry-standard 1% rule and adjusted averages. Actual maintenance costs vary significantly based on local labor rates, material costs, home condition, and unforeseen issues. This is not financial or home warranty advice. Always budget for emergencies and consult a professional for specific cost assessments.
              </p>
            </div>
          </Card>
        </div>
      )}

      {!result && (
        <Card>
          <p className="text-sm text-[var(--fg-muted)] text-center py-4" id={resultsId}>Enter a home size above to see your estimate.</p>
        </Card>
      )}
    </div>
  );
}
