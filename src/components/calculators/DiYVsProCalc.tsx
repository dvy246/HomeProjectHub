import React, { useState } from "react";
import { computeDIYVsPro, computeSunkCost, type ProjectType, type SkillLevel, type Mistakes, PROJECT_TYPES, getProjectLabel } from "../../lib/diyVsProEngine";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function DiYVsProCalc() {
  const { t } = useI18n();

  const [projectType, setProjectType] = useState<ProjectType>("flooring");
  const [areaSqFt, setAreaSqFt] = useState(300);
  const [materialCost, setMaterialCost] = useState(1500);
  const [contractorQuote, setContractorQuote] = useState(0);
  const [hourlyValue, setHourlyValue] = useState(30);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [toolCost, setToolCost] = useState(200);
  const [permitCost, setPermitCost] = useState(0);

  const [showSunk, setShowSunk] = useState(false);
  const [hoursInvested, setHoursInvested] = useState(10);
  const [progressPercent, setProgressPercent] = useState(25);
  const [mistakes, setMistakes] = useState<Mistakes>("none");
  const [contractorQuoteToFinish, setContractorQuoteToFinish] = useState(0);

  const sunkResult = showSunk ? computeSunkCost({
    projectType,
    materialCost,
    toolCost,
    permitCost,
    hoursInvested,
    progressPercent,
    mistakes,
    contractorQuoteToFinish,
    skillLevel,
    hourlyValue,
  }) : null;

  const result = computeDIYVsPro({
    projectType,
    areaSqFt,
    materialCost,
    contractorQuote,
    hourlyValue,
    skillLevel,
    toolCost,
    permitCost,
  });

  const riskColors = { low: "var(--success)", medium: "var(--warning)", high: "var(--error)" };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--fg)]">Project Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Project Type</span>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{getProjectLabel(t)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Area (sq ft)</span>
            <input
              type="number"
              min={1}
              value={areaSqFt}
              onChange={(e) => setAreaSqFt(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Your Skill Level</span>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Your Hourly Value ($/hr)</span>
            <input
              type="number"
              min={0}
              max={200}
              value={hourlyValue}
              onChange={(e) => setHourlyValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Material Cost ($)</span>
            <input
              type="number"
              min={0}
              value={materialCost}
              onChange={(e) => setMaterialCost(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Contractor Quote ($) <span className="text-[var(--fg-muted)]">(0 = estimate)</span></span>
            <input
              type="number"
              min={0}
              value={contractorQuote}
              onChange={(e) => setContractorQuote(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Tool Cost (buy/rent) ($)</span>
            <input
              type="number"
              min={0}
              value={toolCost}
              onChange={(e) => setToolCost(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-[var(--fg-secondary)]">Permit Cost ($)</span>
            <input
              type="number"
              min={0}
              value={permitCost}
              onChange={(e) => setPermitCost(parseFloat(e.target.value) || 0)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-t-4 border-t-[var(--accent)] flex flex-col justify-between gap-5 relative">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-[var(--fg)]">DIY Cost Breakdown</h4>
              <span className="text-[10px] bg-[var(--accent)]/5 text-[var(--accent)] border border-[var(--accent)]/10 font-bold px-2.5 py-0.5 rounded">
                You Do the Work
              </span>
            </div>
            <div className="flex flex-col gap-2.5 text-xs border-b border-[var(--border)] pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Materials</span>
                <span className="font-semibold text-[var(--fg)]">${result.diyBreakdown.materials.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Tools (buy/rent)</span>
                <span className="font-semibold text-[var(--fg)]">${result.diyBreakdown.tools.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Your Time ({result.hoursEstimate} hrs × ${hourlyValue}/hr)</span>
                <span className="font-semibold text-[var(--fg)]">${result.diyBreakdown.laborValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Material Waste ({skillLevel === "beginner" ? "20" : skillLevel === "intermediate" ? "10" : "5"}%)</span>
                <span className="font-semibold text-[var(--fg)]">${result.diyBreakdown.wasteCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Rework Contingency</span>
                <span className="font-semibold text-[var(--fg)]">${result.diyBreakdown.reworkContingency.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Permits</span>
                <span className="font-semibold text-[var(--fg)]">${result.diyBreakdown.permits.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-xs text-[var(--fg-muted)]">DIY Total</span>
            <span className="text-2xl font-black text-[var(--fg)]">${result.diyCost.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-6 border-t-4 border-t-[var(--primary)] flex flex-col justify-between gap-5 relative">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-[var(--fg)]">Pro Contractor Cost</h4>
              <span className="text-[10px] bg-[var(--bg-subtle)] text-[var(--fg-secondary)] border border-[var(--border)] font-bold px-2.5 py-0.5 rounded">
                Hire a Pro
              </span>
            </div>
            <div className="flex flex-col gap-2.5 text-xs border-b border-[var(--border)] pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Labor ({result.hoursEstimate} hrs)</span>
                <span className="font-semibold text-[var(--fg)]">${result.proBreakdown.labor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Materials (with markup)</span>
                <span className="font-semibold text-[var(--fg)]">${result.proBreakdown.materials.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--fg-secondary)]">Contractor Overhead</span>
                <span className="font-semibold text-[var(--fg)]">${result.proBreakdown.markup.toLocaleString()}</span>
              </div>
              {contractorQuote > 0 && (
                <div className="pt-2 border-t border-dashed border-[var(--border)] mt-2">
                  <div className="flex justify-between items-center text-[var(--fg-muted)]">
                    <span className="italic">Your quote entered above</span>
                    <span className="font-mono line-through">${result.proBreakdown.labor.toLocaleString()} + ${result.proBreakdown.materials.toLocaleString()} + ${result.proBreakdown.markup.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-xs text-[var(--fg-muted)]">Pro Total</span>
            <span className="text-2xl font-black text-[var(--primary)]">${result.proCost.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      <Card className={`p-5 border-l-4 ${result.savings >= 0 ? "border-l-emerald-500" : "border-l-red-500"} flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Verdict</h4>
            <p className="text-sm font-bold mt-1 text-[var(--fg)]">
              {result.savings >= 0
                ? `DIY saves you $${result.savings.toLocaleString()} (${result.savingsPercent}% vs hiring a pro)`
                : `Hiring a pro costs $${Math.abs(result.savings).toLocaleString()} more — worth $${result.costPerHourSaved.toFixed(2)}/hr for your time`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: riskColors[result.riskLevel] }} />
              {result.riskLevel === "high" ? "High Risk" : result.riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
          {result.savings >= 0
            ? `Estimated ${result.hoursEstimate} hours of DIY work. Your effective hourly rate for doing this yourself: $${(result.savings / result.hoursEstimate).toFixed(2)}/hr saved.`
            : `Hiring a pro costs more upfront, but you save ${result.hoursEstimate} hours of work at an effective cost of $${result.costPerHourSaved.toFixed(2)} per hour saved.`}
        </p>
      </Card>

      <Card className="p-5 flex flex-col gap-4 no-print">
        <button
          onClick={() => setShowSunk(!showSunk)}
          className="flex items-center justify-between w-full text-left cursor-pointer"
        >
          <h4 className="text-sm font-bold text-[var(--fg)]">Already Started DIY? Analyze Your Situation</h4>
          <svg className={`w-4 h-4 text-[var(--fg-muted)] transition-transform ${showSunk ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {showSunk && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Hours Already Spent</span>
                <input type="number" min={0} value={hoursInvested} onChange={(e) => setHoursInvested(parseFloat(e.target.value) || 0)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Progress (%)</span>
                <input type="number" min={0} max={100} value={progressPercent} onChange={(e) => setProgressPercent(parseFloat(e.target.value) || 0)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Mistakes Made</span>
                <select value={mistakes} onChange={(e) => setMistakes(e.target.value as Mistakes)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium">
                  <option value="none">None or minor</option>
                  <option value="minor">Minor mistakes</option>
                  <option value="major">Major mistakes</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-[var(--fg-secondary)]">Contractor Quote to Finish ($) <span className="text-[var(--fg-muted)]">(0 = estimate)</span></span>
                <input type="number" min={0} value={contractorQuoteToFinish} onChange={(e) => setContractorQuoteToFinish(parseFloat(e.target.value) || 0)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2 font-medium" />
              </div>
            </div>

            {sunkResult && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-subtle)] rounded-xl p-4 border border-[var(--border)] flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Already Invested</span>
                    <span className="text-xl font-black text-[var(--fg)]">${sunkResult.totalInvested.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">{hoursInvested} hrs of labor (${sunkResult.timeValueInvested.toLocaleString()}) + materials & tools</span>
                    {sunkResult.sunkMaterials > 0 && <span className="text-[10px] text-red-500">${sunkResult.sunkMaterials.toLocaleString()} in materials lost to mistakes</span>}
                  </div>
                  <div className="bg-[var(--bg-subtle)] rounded-xl p-4 border border-[var(--border)] flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Cost to Finish DIY</span>
                    <span className="text-xl font-black text-[var(--accent)]">${sunkResult.costToFinishDIY.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">{sunkResult.hoursRemaining} hrs remaining + replacement materials</span>
                  </div>
                  <div className="bg-[var(--bg-subtle)] rounded-xl p-4 border border-[var(--border)] flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Pro to Finish</span>
                    <span className="text-xl font-black text-[var(--primary)]">${sunkResult.costToHireProFinish.toLocaleString()}</span>
                    <span className="text-[10px] text-[var(--fg-muted)]">Estimated contractor cost for remaining work</span>
                  </div>
                </div>

                <div className={`rounded-xl border p-4 flex gap-3 items-start ${
                  sunkResult.bestPath === "hire_pro"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : sunkResult.bestPath === "continue_diy"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[var(--border)] bg-[var(--bg-subtle)]"
                }`}>
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-[var(--fg-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div className="text-xs leading-relaxed text-[var(--fg-secondary)]">
                    {sunkResult.bestPath === "hire_pro" && (
                      <>
                        <strong className="text-amber-600 dark:text-amber-400">Estimated savings by hiring a pro to finish: ${sunkResult.savingsByHiringPro.toLocaleString()}</strong>
                        <span> — The remaining DIY work (${sunkResult.costToFinishDIY.toLocaleString()}) may cost more than hiring a professional to complete the project (${sunkResult.costToHireProFinish.toLocaleString()}). Consider getting a firm quote from a licensed contractor before deciding.</span>
                      </>
                    )}
                    {sunkResult.bestPath === "continue_diy" && (
                      <>
                        <strong className="text-emerald-600 dark:text-emerald-400">Estimated cost to finish DIY is lower</strong>
                        <span> — Completing the work yourself (${sunkResult.costToFinishDIY.toLocaleString()}) may cost less than hiring a pro to finish (${sunkResult.costToHireProFinish.toLocaleString()}). If mistakes are compounding, consider consulting a pro before proceeding further.</span>
                      </>
                    )}
                    {sunkResult.bestPath === "neutral" && (
                      <>
                        <strong className="text-[var(--fg)]">Costs are similar — either path is reasonable</strong>
                        <span> — The difference between finishing DIY (${sunkResult.costToFinishDIY.toLocaleString()}) and hiring a pro (${sunkResult.costToHireProFinish.toLocaleString()}) is small. Decide based on timeline, confidence, and the specific remaining work.</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3 flex flex-col gap-1.5 text-[10px] text-[var(--fg-muted)] leading-relaxed">
                  <p><strong>How this works:</strong> Total project estimate is ${sunkResult.originalDIYEstimate.toLocaleString()}. You've invested ${sunkResult.totalInvested.toLocaleString()} so far. If you abandon entirely, that ${sunkResult.totalInvested.toLocaleString()} is sunk. If you continue DIY, total cost would be ${sunkResult.totalIfContinueDIY.toLocaleString()}. If you hire a pro to finish, total cost would be ${sunkResult.totalIfHireProNow.toLocaleString()}.</p>
                  <p>This is a planning estimate based on industry averages. Actual costs depend on the specific remaining work, local contractor rates, and material replacement needs. Get a firm quote from a licensed contractor for an accurate assessment.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {result.riskLevel === "high" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex gap-3 items-start">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div className="text-xs leading-relaxed text-[var(--fg-secondary)]">
            <strong className="text-red-600 dark:text-red-400">Safety Notice:</strong> This project involves high-risk work (heights, electrical, or structural changes). If you're not experienced, hiring a licensed contractor reduces injury risk and ensures code compliance. Always use fall protection for roofing work and pull permits for structural/electrical changes.
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
        <p className="font-semibold text-[var(--fg)]">Planning Estimates Only</p>
        <p>
          This calculator provides planning estimates based on industry averages. Actual costs vary by location, material quality, project complexity, and contractor availability. Labor rates and material prices change over time. <strong>Always verify estimates with local suppliers and get at least 3 quotes from licensed, insured contractors</strong> before making final decisions. This tool does not replace professional advice from a qualified contractor or structural engineer.
        </p>
        <p className="text-[var(--fg-muted)]">
          Reviewed by <strong>Marcus Vance, DIY Construction Specialist</strong>. Methodology and formulas: <a href="/methodology/" className="text-[var(--accent)] hover:underline">Estimation Methodology</a>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-inset)] border border-[var(--border)] rounded-xl p-4 gap-4 text-xs no-print">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[var(--fg)]">Save or Share This Comparison</span>
          <span className="text-[var(--fg-secondary)]">Print a detailed breakdown for your planning binder.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg)] font-bold px-4 py-2 rounded-lg text-center transition-all cursor-pointer"
          >
            Print Comparison
          </button>
        </div>
      </div>

    </div>
  );
}

export default withI18n(DiYVsProCalc);
