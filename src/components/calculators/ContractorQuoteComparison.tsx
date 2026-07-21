import React, { useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { Card } from "../ui/Card";
import {
  compareContractorQuotes,
  type ContractorBid,
  type ProjectCategory,
  type NormalizationUnit,
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  NORMALIZATION_UNIT_LABELS,
} from "../../lib/contractorQuoteEngine";
import { getUrlParam, setUrlParams, copyShareUrl } from "../../lib/urlState";

function ContractorQuoteComparison() {
  const { t } = useI18n();

  // ─── State Initialization from URL (with clean fallbacks) ─────────────────
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>(
    () => (getUrlParam("cat", "roofing") as ProjectCategory)
  );
  const [projectArea, setProjectArea] = useState<number>(() => getUrlParam("sz", 2000));
  const [normalizationUnit, setNormalizationUnit] = useState<NormalizationUnit>(
    () => (getUrlParam("ut", "per_sqft") as NormalizationUnit)
  );

  // Initialize contractor bids
  const [bids, setBids] = useState<[ContractorBid, ContractorBid, ContractorBid]>(() => [
    {
      name: getUrlParam("n0", "Contractor A"),
      totalBid: getUrlParam("t0", 0),
      laborCost: getUrlParam("l0", 0),
      materialCost: getUrlParam("m0", 0),
      permitCost: getUrlParam("p0", 0),
      disposalCost: getUrlParam("d0", 0),
      warrantyCost: getUrlParam("w0", 0),
      cleanupIncluded: getUrlParam("c0", false),
      permitIncluded: getUrlParam("pi0", false),
      warrantyYears: getUrlParam("y0", 0),
      notes: getUrlParam("nt0", ""),
    },
    {
      name: getUrlParam("n1", "Contractor B"),
      totalBid: getUrlParam("t1", 0),
      laborCost: getUrlParam("l1", 0),
      materialCost: getUrlParam("m1", 0),
      permitCost: getUrlParam("p1", 0),
      disposalCost: getUrlParam("d1", 0),
      warrantyCost: getUrlParam("w1", 0),
      cleanupIncluded: getUrlParam("c1", false),
      permitIncluded: getUrlParam("pi1", false),
      warrantyYears: getUrlParam("y1", 0),
      notes: getUrlParam("nt1", ""),
    },
    {
      name: getUrlParam("n2", "Contractor C"),
      totalBid: getUrlParam("t2", 0),
      laborCost: getUrlParam("l2", 0),
      materialCost: getUrlParam("m2", 0),
      permitCost: getUrlParam("p2", 0),
      disposalCost: getUrlParam("d2", 0),
      warrantyCost: getUrlParam("w2", 0),
      cleanupIncluded: getUrlParam("c2", false),
      permitIncluded: getUrlParam("pi2", false),
      warrantyYears: getUrlParam("y2", 0),
      notes: getUrlParam("nt2", ""),
    },
  ]);

  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  // ─── Sync state to URL ────────────────────────────────────────────────────
  useEffect(() => {
    const params: Record<string, string | number | boolean> = {
      cat: projectCategory,
      sz: projectArea,
      ut: normalizationUnit,
    };
    bids.forEach((bid, i) => {
      params[`n${i}`] = bid.name;
      params[`t${i}`] = bid.totalBid;
      params[`l${i}`] = bid.laborCost;
      params[`m${i}`] = bid.materialCost;
      params[`p${i}`] = bid.permitCost;
      params[`d${i}`] = bid.disposalCost;
      params[`w${i}`] = bid.warrantyCost;
      params[`c${i}`] = bid.cleanupIncluded;
      params[`pi${i}`] = bid.permitIncluded;
      params[`y${i}`] = bid.warrantyYears;
      params[`nt${i}`] = bid.notes;
    });

    const defaults: Record<string, string | number | boolean> = {
      cat: "roofing",
      sz: 2000,
      ut: "per_sqft",
    };
    [0, 1, 2].forEach(i => {
      defaults[`n${i}`] = `Contractor ${String.fromCharCode(65 + i)}`;
      defaults[`t${i}`] = 0;
      defaults[`l${i}`] = 0;
      defaults[`m${i}`] = 0;
      defaults[`p${i}`] = 0;
      defaults[`d${i}`] = 0;
      defaults[`w${i}`] = 0;
      defaults[`c${i}`] = false;
      defaults[`pi${i}`] = false;
      defaults[`y${i}`] = 0;
      defaults[`nt${i}`] = "";
    });

    setUrlParams(params, defaults);
  }, [projectCategory, projectArea, normalizationUnit, bids]);

  // Handle input update helper
  const updateBidField = <K extends keyof ContractorBid>(
    index: number,
    field: K,
    value: ContractorBid[K]
  ) => {
    setBids(prev => {
      const next = [...prev] as [ContractorBid, ContractorBid, ContractorBid];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Run pure comparison engine logic
  const output = compareContractorQuotes({
    projectCategory,
    projectArea,
    normalizationUnit,
    bids,
  });

  const resetBids = () => {
    setBids([
      { name: "Contractor A", totalBid: 0, laborCost: 0, materialCost: 0, permitCost: 0, disposalCost: 0, warrantyCost: 0, cleanupIncluded: false, permitIncluded: false, warrantyYears: 0, notes: "" },
      { name: "Contractor B", totalBid: 0, laborCost: 0, materialCost: 0, permitCost: 0, disposalCost: 0, warrantyCost: 0, cleanupIncluded: false, permitIncluded: false, warrantyYears: 0, notes: "" },
      { name: "Contractor C", totalBid: 0, laborCost: 0, materialCost: 0, permitCost: 0, disposalCost: 0, warrantyCost: 0, cleanupIncluded: false, permitIncluded: false, warrantyYears: 0, notes: "" }
    ]);
    setProjectCategory("roofing");
    setProjectArea(2000);
    setNormalizationUnit("per_sqft");
  };

  // Pre-fill with realistic sample data for demo / ease of use
  const loadDemoData = () => {
    setProjectCategory("roofing");
    setProjectArea(2200);
    setNormalizationUnit("per_sqft");
    setBids([
      {
        name: "Apex Roofing",
        totalBid: 12500,
        laborCost: 5500,
        materialCost: 5500,
        permitCost: 400,
        disposalCost: 600,
        warrantyCost: 500,
        cleanupIncluded: true,
        permitIncluded: true,
        warrantyYears: 10,
        notes: "Full shingle tear-off, synthetic underlayment, Owens Corning Durations.",
      },
      {
        name: "Elite Builders",
        totalBid: 14800,
        laborCost: 7000,
        materialCost: 6200,
        permitCost: 500,
        disposalCost: 800,
        warrantyCost: 300,
        cleanupIncluded: true,
        permitIncluded: true,
        warrantyYears: 15,
        notes: "Premium GAF Timberline HDZ, includes magnetic nail sweeping.",
      },
      {
        name: "Budget Roofing",
        totalBid: 9200,
        laborCost: 3800,
        materialCost: 5400,
        permitCost: 0,
        disposalCost: 0,
        warrantyCost: 0,
        cleanupIncluded: false,
        permitIncluded: false,
        warrantyYears: 0,
        notes: "Estimate excludes dumpster fee, permits, and workmanship warranty.",
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ─── Header Info Box ────────────────────────────────────────────────── */}
      <div className="glass-panel border-l-4 border-[var(--accent)] p-5 flex flex-col gap-2 rounded-r-xl">
        <h2 className="text-base font-bold text-[var(--fg)] flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Transparent Contractor Quote Analyzer
        </h2>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed text-pretty">
          Analyze home remodeling bids side-by-side. Our engine compares scope completeness (cleanup, disposal, permits), identifies pricing red flags (lowball or gouging risks), and computes trust scores so you do not compare apples to oranges.
        </p>
        <div className="flex flex-wrap gap-2 mt-2 no-print">
          <button
            type="button"
            onClick={loadDemoData}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
          >
            Load Example Roof Bids
          </button>
          <button
            type="button"
            onClick={resetBids}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-inset)] text-[var(--fg)] transition-all border border-[var(--border)] cursor-pointer"
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* ─── Inputs Area ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Project Context Card */}
        <Card className="p-5 flex flex-col gap-4 col-span-1 lg:col-span-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">1. General Project Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="project-category" className="font-semibold text-[var(--fg-secondary)]">Project Category</label>
              <select
                id="project-category"
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value as ProjectCategory)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2.5 font-medium focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 focus-visible:outline-none transition-colors cursor-pointer"
              >
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{PROJECT_CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="normalization-unit" className="font-semibold text-[var(--fg-secondary)]">Normalization Unit</label>
              <select
                id="normalization-unit"
                value={normalizationUnit}
                onChange={(e) => setNormalizationUnit(e.target.value as NormalizationUnit)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2.5 font-medium focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 focus-visible:outline-none transition-colors cursor-pointer"
              >
                {Object.entries(NORMALIZATION_UNIT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {normalizationUnit !== "lump_sum" && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <label htmlFor="project-area" className="font-semibold text-[var(--fg-secondary)]">
                  Project Size ({normalizationUnit === "per_sqft" ? "Sq Ft" : "Linear Ft"})
                </label>
                <input
                  id="project-area"
                  type="number"
                  min={1}
                  value={projectArea || ""}
                  onChange={(e) => setProjectArea(Math.max(1, parseFloat(e.target.value) || 0))}
                  autoComplete="off"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2.5 font-medium focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 focus-visible:outline-none transition-colors"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Bids Setup Card */}
        <Card className="p-5 flex flex-col gap-4 col-span-1 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">2. Contractor Estimates</h3>
            {/* Mobile Tab Selectors */}
            <div className="flex lg:hidden bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs border border-[var(--border)]">
              {bids.map((bid, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTab(i as 0 | 1 | 2)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTab === i
                      ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm border border-[var(--border)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {bid.name || `Bid ${i + 1}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {bids.map((bid, i) => {
              const isHiddenOnMobile = activeTab !== i;
              return (
                <div
                  key={i}
                  className={`flex flex-col gap-4 ${isHiddenOnMobile ? "hidden lg:flex" : "flex"} border-b lg:border-b-0 pb-6 lg:pb-0 border-[var(--border)]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                      Quote Slot {String.fromCharCode(65 + i)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Name */}
                    <div className="flex flex-col gap-1 col-span-2">
                      <label htmlFor={`name-${i}`} className="font-semibold text-[var(--fg-secondary)]">Contractor Name</label>
                      <input
                        id={`name-${i}`}
                        type="text"
                        placeholder={`Contractor ${String.fromCharCode(65 + i)}`}
                        value={bid.name}
                        onChange={(e) => updateBidField(i, "name", e.target.value)}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Total Bid */}
                    <div className="flex flex-col gap-1 col-span-2">
                      <label htmlFor={`total-${i}`} className="font-semibold text-[var(--fg-secondary)] font-bold text-[var(--fg)]">
                        Total Bid Quote ($) *
                      </label>
                      <input
                        id={`total-${i}`}
                        type="number"
                        min={0}
                        value={bid.totalBid || ""}
                        placeholder="0"
                        onChange={(e) => updateBidField(i, "totalBid", Math.max(0, parseFloat(e.target.value) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border-2 border-[var(--border-strong)] rounded-lg p-2 font-semibold text-sm focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Labor Cost */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`labor-${i}`} className="font-semibold text-[var(--fg-secondary)]">Labor Cost ($)</label>
                      <input
                        id={`labor-${i}`}
                        type="number"
                        min={0}
                        value={bid.laborCost || ""}
                        placeholder="Optional"
                        onChange={(e) => updateBidField(i, "laborCost", Math.max(0, parseFloat(e.target.value) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Material Cost */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`material-${i}`} className="font-semibold text-[var(--fg-secondary)]">Material Cost ($)</label>
                      <input
                        id={`material-${i}`}
                        type="number"
                        min={0}
                        value={bid.materialCost || ""}
                        placeholder="Optional"
                        onChange={(e) => updateBidField(i, "materialCost", Math.max(0, parseFloat(e.target.value) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Disposal Cost */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`disposal-${i}`} className="font-semibold text-[var(--fg-secondary)]">Disposal / Dumpster ($)</label>
                      <input
                        id={`disposal-${i}`}
                        type="number"
                        min={0}
                        value={bid.disposalCost || ""}
                        placeholder="Optional"
                        onChange={(e) => updateBidField(i, "disposalCost", Math.max(0, parseFloat(e.target.value) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Permit Cost */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`permit-${i}`} className="font-semibold text-[var(--fg-secondary)]">Permit Fees ($)</label>
                      <input
                        id={`permit-${i}`}
                        type="number"
                        min={0}
                        value={bid.permitCost || ""}
                        placeholder="Optional"
                        onChange={(e) => updateBidField(i, "permitCost", Math.max(0, parseFloat(e.target.value) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Warranty Years */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`warranty-years-${i}`} className="font-semibold text-[var(--fg-secondary)]">Warranty (Years)</label>
                      <input
                        id={`warranty-years-${i}`}
                        type="number"
                        min={0}
                        value={bid.warrantyYears || ""}
                        placeholder="0 = None"
                        onChange={(e) => updateBidField(i, "warrantyYears", Math.max(0, parseInt(e.target.value, 10) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>

                    {/* Warranty Cost */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`warranty-cost-${i}`} className="font-semibold text-[var(--fg-secondary)]">Warranty Fee ($)</label>
                      <input
                        id={`warranty-cost-${i}`}
                        type="number"
                        min={0}
                        value={bid.warrantyCost || ""}
                        placeholder="0 = Free"
                        onChange={(e) => updateBidField(i, "warrantyCost", Math.max(0, parseFloat(e.target.value) || 0))}
                        autoComplete="off"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Inclusion Checkboxes */}
                  <div className="flex flex-col gap-2 text-xs mt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bid.cleanupIncluded}
                        onChange={(e) => updateBidField(i, "cleanupIncluded", e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--bg)] border-[var(--border)] focus:ring-[var(--accent)] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="font-medium text-[var(--fg-secondary)]">Post-Job Cleanup Included</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bid.permitIncluded}
                        onChange={(e) => updateBidField(i, "permitIncluded", e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--accent)] bg-[var(--bg)] border-[var(--border)] focus:ring-[var(--accent)] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="font-medium text-[var(--fg-secondary)]">Contractor Pulls Permits</span>
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1 text-xs">
                    <label htmlFor={`notes-${i}`} className="font-semibold text-[var(--fg-secondary)]">Notes / Scope details</label>
                    <textarea
                      id={`notes-${i}`}
                      rows={2}
                      placeholder="Material grades, exclusion clauses..."
                      value={bid.notes}
                      onChange={(e) => updateBidField(i, "notes", e.target.value)}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium focus:border-[var(--accent)] focus-visible:outline-none transition-colors resize-none text-[11px]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ─── Comparison Output Results (Premium Dashboard) ──────────────────── */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] border-b border-[var(--border)] pb-2 flex items-center justify-between">
          <span>3. Analysis Results</span>
          <span className="text-[10px] lowercase font-normal italic no-print text-[var(--fg-muted)]">
            updates automatically
          </span>
        </h3>

        {/* Global Spread Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-muted)]">Median Quote</span>
            <span className="text-xl font-bold tracking-tight text-[var(--fg)] tabular-nums">
              ${output.medianBid.toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-muted)]">Pricing Spread</span>
            <span className="text-xl font-bold tracking-tight text-[var(--fg)] tabular-nums">
              ${output.bidRange.toLocaleString()}
            </span>
          </div>
          <div className="bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-muted)]">Spread Percent</span>
            <span className="text-xl font-bold tracking-tight text-[var(--fg)] tabular-nums">
              {output.bidRangePct}%
            </span>
          </div>
          <div className="bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-xl flex flex-col gap-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-muted)]">Lowest Quote</span>
            <span className="text-xl font-bold tracking-tight text-[var(--accent)] tabular-nums">
              ${output.lowestBid.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Verdict Box */}
        <div className="bg-[var(--bg-inset)] border border-[var(--border)] p-5 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Comparison Verdict
          </div>
          <p className="text-sm text-[var(--fg)] leading-relaxed text-pretty font-medium">
            {output.summaryVerdict}
          </p>
        </div>

        {/* Bid Specific Detail Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {output.analyses.map((analysis) => {
            const isWinner = output.recommendedBidIndex === analysis.bidIndex;
            const percentageText = analysis.pctFromMedian === 0
              ? "exactly at median"
              : analysis.pctFromMedian > 0
                ? `${analysis.pctFromMedian}% above median`
                : `${Math.abs(analysis.pctFromMedian)}% below median`;

            return (
              <div
                key={analysis.bidIndex}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
                  isWinner
                    ? "bg-[var(--bg-subtle)] border-[var(--accent)] shadow-md translate-y-[-2px]"
                    : "bg-[var(--card-bg)] border-[var(--border)]"
                }`}
              >
                {isWinner && (
                  <span className="absolute top-[-10px] right-4 bg-[var(--accent)] text-[var(--accent-fg)] text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                    ★ Best Match
                  </span>
                )}

                <div className="flex flex-col gap-4">
                  {/* Name and Rank */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                    <div>
                      <h4 className="font-bold text-sm text-[var(--fg)]">
                        {analysis.contractorName}
                      </h4>
                      <span className="text-[10px] text-[var(--fg-muted)]">
                        Rank {analysis.rank} of 3
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">Trust Score</span>
                      <span className={`text-base font-extrabold ${
                        analysis.trustScore >= 80
                          ? "text-[var(--success)]"
                          : analysis.trustScore >= 50
                            ? "text-[var(--warning)]"
                            : "text-[var(--error)]"
                      }`}>
                        {analysis.trustScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[var(--fg-secondary)]">Total Bid:</span>
                      <span className="font-bold text-[var(--fg)] tabular-nums text-sm">
                        ${analysis.totalBid.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[var(--fg-muted)]">Normalized rate:</span>
                      <span className="font-medium text-[var(--fg-secondary)] tabular-nums">
                        ${analysis.normalizedCostPerUnit.toLocaleString()} / {normalizationUnit === "lump_sum" ? "job" : normalizationUnit === "per_sqft" ? "sq ft" : "lf"}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[var(--fg-muted)]">Vs Median:</span>
                      <span className={`font-semibold tabular-nums ${
                        analysis.pctFromMedian > 0 ? "text-[var(--warning)]" : "text-[var(--success)]"
                      }`}>
                        {percentageText}
                      </span>
                    </div>

                    {analysis.savings > 0 && (
                      <div className="flex justify-between items-baseline text-xs text-[var(--success)] font-semibold mt-1">
                        <span>Bid Savings:</span>
                        <span className="tabular-nums">+${analysis.savings.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Gaps List */}
                  <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Scope & Gaps</span>
                    {analysis.scopeGaps.length === 0 ? (
                      <span className="text-xs text-[var(--success)] flex items-start gap-1.5 font-medium leading-relaxed">
                        <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        No major scope gaps detected.
                      </span>
                    ) : (
                      <ul className="flex flex-col gap-1.5 pl-0 list-none m-0">
                        {analysis.scopeGaps.map((gap, gIdx) => (
                          <li key={gIdx} className="text-xs text-[var(--warning)] flex items-start gap-1.5 leading-relaxed font-medium">
                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Red Flags List */}
                  {analysis.redFlags.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Alert flags</span>
                      <ul className="flex flex-col gap-1.5 pl-0 list-none m-0">
                        {analysis.redFlags.map((flag, fIdx) => (
                          <li
                            key={fIdx}
                            className={`text-xs flex items-start gap-1.5 leading-relaxed font-medium ${
                              flag.severity === "critical" ? "text-[var(--error)]" : "text-[var(--warning)]"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{flag.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Notes footer */}
                {bids[analysis.bidIndex].notes && (
                  <div className="border-t border-[var(--border)] pt-3 mt-4 text-[10px] text-[var(--fg-muted)] italic leading-relaxed break-words">
                    <strong>Note:</strong> {bids[analysis.bidIndex].notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Share/Print Actions ────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mt-4 no-print">
        <button
          type="button"
          onClick={() => {
            copyShareUrl().then(ok => {
              if (ok) {
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
              }
            });
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-inset)] text-[var(--fg)] border border-[var(--border)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="Copy shareable link"
        >
          <svg className="w-4 h-4 text-[var(--fg-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          {shareSuccess ? "Link Copied!" : "Copy Share Link"}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          aria-label="Print quote comparison report"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Quote Report
        </button>
      </div>

      {/* YMYL Compliance Safety Card */}
      <div className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-5 mt-4 text-xs text-[var(--fg-muted)] leading-relaxed space-y-2">
        <h4 className="font-bold text-[var(--fg)] text-[11px] uppercase tracking-wide">YMYL Safety & Editorial Methodological Disclaimer</h4>
        <p>
          HomePlanningHub Contractor Quote Comparison Tool is designed to assist in math normalization and scope gap comparison based on user-supplied details. It does not evaluate structural integrity, local building codes, licensure credentials, or contractor insurance validity.
        </p>
        <p>
          Pricing evaluations are based on mathematical ranges relative to the median of your inputs and do not represent local cost guarantees. Always check contractor licenses, references, and verify local permitting laws before signing any contract.
        </p>
      </div>
    </div>
  );
}

export default withI18n(ContractorQuoteComparison);
