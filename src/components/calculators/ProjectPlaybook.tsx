import { useState, useEffect } from "react";
import workflowsData from "../../data/workflows.json";
import type { MaterialItem } from "../../lib/projectEngine";

interface WorkflowPhase {
  phase: string;
  duration: string;
  diyDifficulty: string;
  hiringRecommendation: string;
  description: string;
}

interface DecisionCheckpoint {
  phase: string;
  items: string[];
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  steps: { id: string; name: string; calculatorId: string; url: string; requiredInputs: string[] }[];
  timeline: WorkflowPhase[];
  mistakes: string[];
  related: { name: string; url: string }[];
  accessoryTools: { name: string; recommendation: string }[];
  preparationSteps?: string[];
  decisionCheckpoints?: DecisionCheckpoint[];
  cleanupSteps?: string[];
  maintenanceTips?: string[];
}

interface PlaybookProps {
  workflowId: string;
  calculatorInputs?: Record<string, number | string>;
  results?: Record<string, number | string>;
  materials?: MaterialItem[];
  projectName?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const RECOMMENDATION_COLORS: Record<string, string> = {
  buy: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  rent: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "buy or rent": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function getDifficultyLevels(timeline: WorkflowPhase[]): { levels: string[] } {
  const order = ["Easy", "Medium", "Hard"];
  const levels = timeline.map((p) => p.diyDifficulty);
  return { levels: [...new Set(levels)].sort((a, b) => order.indexOf(a) - order.indexOf(b)) };
}

function getTotalDuration(timeline: WorkflowPhase[]): string {
  const durations = timeline.map((p) => p.duration);
  const first = durations[0];
  const last = durations[durations.length - 1];
  if (first && last && first !== last) {
    return `${first} \u2013 ${last}`;
  }
  return first || "";
}

function ProjectPlaybook({ workflowId, calculatorInputs: _calculatorInputs, results, materials, projectName }: PlaybookProps) {
  const workflow = (workflowsData as WorkflowConfig[]).find((w) => w.id === workflowId);

  const [checkedCheckpoints, setCheckedCheckpoints] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`hph-playbook-checked-${workflowId}`) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`hph-playbook-checked-${workflowId}`, JSON.stringify(checkedCheckpoints));
    } catch {}
  }, [checkedCheckpoints, workflowId]);

  const toggleCheckpoint = (key: string) => {
    setCheckedCheckpoints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!workflow) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
        <p className="text-sm text-[var(--fg-muted)]">Playbook not available for this project type.</p>
      </div>
    );
  }

  const difficulty = getDifficultyLevels(workflow.timeline);
  const totalDuration = getTotalDuration(workflow.timeline);
  const resultEntries = results ? Object.entries(results).slice(0, 6) : [];
  const safeMaterials = materials || [];

  const SectionHeader = ({ title }: { title: string }) => (
    <summary className="flex items-center justify-between p-4 font-semibold text-sm cursor-pointer select-none text-[var(--fg)] hover:text-[var(--accent)] outline-none focus:bg-[var(--bg-inset)]">
      <span>{title}</span>
      <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform text-[var(--fg-muted)] group-hover:text-[var(--accent)] no-print" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </summary>
  );

  return (
    <div className="flex flex-col gap-6 w-full mt-8 border-t border-[var(--border)] pt-8 print-full">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] no-print">
        <div>
          <h2 className="text-base font-bold text-[var(--fg)]">
            {projectName || workflow.name} Playbook
          </h2>
          <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
            Everything you need to execute this project
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="text-xs bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer"
        >
          Print Playbook
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Section 1: Summary */}
        <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
          <SectionHeader title="Project Summary" />
          <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed text-pretty mb-4">{workflow.description}</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-[var(--fg-secondary)] font-medium">
                {workflow.timeline.length} {workflow.timeline.length === 1 ? "phase" : "phases"}
              </span>
              {totalDuration && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-[var(--fg-secondary)] font-medium">
                  {totalDuration}
                </span>
              )}
              {difficulty.levels.map((level) => (
                <span key={level} className={`text-xs px-2.5 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[level] || ""}`}>
                  {level}
                </span>
              ))}
            </div>
            {resultEntries.length > 0 && (
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)] text-[var(--fg-secondary)]">
                      <th className="p-3 font-semibold">Calculation Result</th>
                      <th className="p-3 font-semibold text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultEntries.map(([key, val]) => (
                      <tr key={key} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-inset)]/40 transition-colors">
                        <td className="p-3 text-[var(--fg)] font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</td>
                        <td className="p-3 text-right font-semibold tabular-nums text-[var(--fg)]">{typeof val === "number" ? val.toFixed(2) : val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>

        {/* Section 2: Preparation Checklist */}
        {workflow.preparationSteps && workflow.preparationSteps.length > 0 && (
          <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
            <SectionHeader title="Preparation Checklist" />
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              <ul className="flex flex-col gap-2 text-sm">
                {workflow.preparationSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-[var(--fg)]">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* Section 3: Shopping List */}
        {safeMaterials.length > 0 && (
          <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
            <SectionHeader title="Shopping List" />
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              <p className="text-xs text-[var(--fg-secondary)] mb-3">Take this list to your supplier. Quantities are personalized to your project.</p>
              <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--bg-inset)] border-b border-[var(--border)] text-[var(--fg-secondary)]">
                      <th className="p-3 font-semibold">Material</th>
                      <th className="p-3 font-semibold text-right">Quantity</th>
                      <th className="p-3 font-semibold text-right">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeMaterials.map((mat, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-inset)]/40 transition-colors">
                        <td className="p-3 text-[var(--fg)] font-medium">{mat.name}</td>
                        <td className="p-3 text-right font-semibold tabular-nums text-[var(--fg)]">{(mat.quantity || 0).toFixed(1)}</td>
                        <td className="p-3 text-right text-[var(--fg-muted)]">{mat.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        )}

        {/* Section 4: Tool Checklist */}
        {workflow.accessoryTools.length > 0 && (
          <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
            <SectionHeader title="Tool Checklist" />
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {workflow.accessoryTools.map((tool, i) => {
                  const recColor = RECOMMENDATION_COLORS[tool.recommendation] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                      <span className="text-sm text-[var(--fg)]">{tool.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${recColor}`}>
                        {tool.recommendation}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </details>
        )}

        {/* Section 5: Execution Phases with Decision Checkpoints */}
        <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
          <SectionHeader title="Execution Phases" />
          <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
            <div className="flex flex-col gap-4">
              {workflow.timeline.map((phase, idx) => {
                const checkpoints = workflow.decisionCheckpoints?.find((dc) => dc.phase === phase.phase);
                const phaseDiffColor = DIFFICULTY_COLORS[phase.diyDifficulty] || "";
                return (
                  <div key={idx} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--bg)]">
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          <h4 className="text-sm font-semibold text-[var(--fg)]">{phase.phase}</h4>
                        </div>
                        <p className="text-xs text-[var(--fg-muted)] mt-1">{phase.duration}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${phaseDiffColor}`}>
                        {phase.diyDifficulty}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-3">{phase.description}</p>
                    <p className="text-xs text-[var(--fg-muted)] mb-3 italic">{phase.hiringRecommendation}</p>
                    {checkpoints && checkpoints.items.length > 0 && (
                      <div className="border-t border-[var(--border)] pt-3 mt-1">
                        <p className="text-xs font-semibold text-[var(--fg)] mb-2">Verify before proceeding:</p>
                        <div className="flex flex-col gap-1.5">
                          {checkpoints.items.map((item, ci) => {
                            const ck = `${phase.phase}::${ci}`;
                            return (
                              <label key={ci} className={`flex items-center gap-2 text-xs cursor-pointer ${checkedCheckpoints[ck] ? "line-through opacity-50" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={!!checkedCheckpoints[ck]}
                                  onChange={() => toggleCheckpoint(ck)}
                                  className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--ring)] accent-[var(--accent)] cursor-pointer"
                                />
                                <span className="text-[var(--fg)]">{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        {/* Section 6: Common Mistakes */}
        {workflow.mistakes.length > 0 && (
          <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
            <SectionHeader title="Common Mistakes to Avoid" />
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              <ul className="flex flex-col gap-2 text-sm">
                {workflow.mistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    <span className="text-[var(--fg)]">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* Section 7: Cleanup Checklist */}
        {workflow.cleanupSteps && workflow.cleanupSteps.length > 0 && (
          <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
            <SectionHeader title="Cleanup Checklist" />
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              <ul className="flex flex-col gap-2 text-sm">
                {workflow.cleanupSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    <span className="text-[var(--fg)]">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* Section 8: Maintenance Tips */}
        {workflow.maintenanceTips && workflow.maintenanceTips.length > 0 && (
          <details className="group border border-[var(--border)] rounded-xl bg-[var(--bg)] hover:border-[var(--border-hover)] transition-all overflow-hidden" open={true}>
            <SectionHeader title="Maintenance Tips" />
            <div className="p-4 pt-0 border-t border-[var(--border)] bg-[var(--bg-inset)]/15">
              <ul className="flex flex-col gap-2 text-sm">
                {workflow.maintenanceTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
                    <span className="text-[var(--fg)]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default ProjectPlaybook;
