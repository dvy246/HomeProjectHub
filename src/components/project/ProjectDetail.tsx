import { useState, useEffect } from "react";
import { getProject, deleteProject, aggregateMaterials, getProjectProgress, PROJECT_TEMPLATES, type SavedProject } from "../../lib/projectEngine";

export default function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [project, setProject] = useState<SavedProject | null>(null);

  useEffect(() => {
    setProject(getProject(projectId));
  }, [projectId]);

  if (!project) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-12 text-center">
        <h2 className="text-lg font-bold mb-2">Project not found</h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">This project could not be found. It may have been deleted.</p>
        <button type="button" onClick={onBack} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all">
          Back to Projects
        </button>
      </div>
    );
  }

  const progress = getProjectProgress(project);
  const template = PROJECT_TEMPLATES.find((t) => t.type === project.projectType);
  const allMaterials = aggregateMaterials(project);

  const handleDelete = () => {
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" /></svg>
        Back to all projects
      </button>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
            <p className="text-sm text-[var(--fg-muted)] capitalize">{project.projectType} project</p>
          </div>
          <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors" aria-label="Delete project">
            Delete
          </button>
        </div>

        {project.sharedDimensions.length && (
          <div className="bg-[var(--bg-subtle)] rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-[var(--fg-muted)] mb-1">Shared Dimensions</p>
            <p className="text-sm font-semibold tabular-nums">
              {project.sharedDimensions.length}&prime; × {project.sharedDimensions.width}&prime;
              {project.sharedDimensions.depth ? ` × ${project.sharedDimensions.depth}″` : ""}
            </p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
            <span>Project Progress</span>
            <span>{progress.completed} / {progress.total} calculators</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>

        {template && (
          <div>
            <p className="text-xs font-medium text-[var(--fg-muted)] mb-2">Recommended Calculators</p>
            <div className="flex flex-wrap gap-2">
              {template.recommendedCalculators.map((calc) => {
                const isDone = project.calculations.some((c) => c.calculatorSlug === calc);
                return (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg ${isDone ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>
                    {isDone && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    {calc.replace(/-/g, " ")}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {project.calculations.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h3 className="text-sm font-semibold mb-4">Saved Calculations ({project.calculations.length})</h3>
          <div className="flex flex-col gap-3">
            {project.calculations.map((calc, i) => (
              <div className="bg-[var(--bg-subtle)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{calc.calculatorName}</span>
                  <span className="text-[10px] text-[var(--fg-muted)]">{new Date(calc.completedAt).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(calc.results).slice(0, 4).map(([key, val]) => (
                    <div>
                      <span className="text-[var(--fg-muted)]">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                      <span className="font-semibold ml-1">{typeof val === "number" ? val.toFixed(2) : val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allMaterials.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h3 className="text-sm font-semibold mb-4">Master Shopping List</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 font-semibold">Material</th>
                <th className="text-right py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Unit</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map((mat) => (
                <tr className="border-b border-[var(--border)]">
                  <td className="py-2 text-[var(--fg)]">{mat.name}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{mat.quantity}</td>
                  <td className="py-2 text-right text-[var(--fg-muted)]">{mat.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {project.calculations.length === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
          <h3 className="text-sm font-semibold mb-2">No calculations saved yet</h3>
          <p className="text-xs text-[var(--fg-secondary)] mb-4">Use the calculators below and come back to track your progress.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a href="/calculators/concrete/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] transition-colors">Concrete</a>
            <a href="/calculators/roofing/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] transition-colors">Roofing</a>
            <a href="/calculators/paint/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] transition-colors">Paint</a>
            <a href="/calculators/tile/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] transition-colors">Tile</a>
          </div>
        </div>
      )}
    </div>
  );
}
