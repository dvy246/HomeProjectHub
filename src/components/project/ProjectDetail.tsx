import { useState, useEffect } from "react";
import { getProject, deleteProject, updateProject, aggregateMaterials, getProjectProgress, PROJECT_TEMPLATES, type SavedProject } from "../../lib/projectEngine";
import { useI18n } from "../i18n/I18nProvider";

export default function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const { t } = useI18n();
  const [project, setProject] = useState<SavedProject | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setProject(getProject(projectId));
    const handler = () => setProject(getProject(projectId));
    window.addEventListener("saved-projects-changed", handler);
    return () => window.removeEventListener("saved-projects-changed", handler);
  }, [projectId]);

  const handleRename = () => {
    if (!editName.trim() || !project) return;
    updateProject(project.id, { name: editName.trim() });
    setProject({ ...project, name: editName.trim() });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: SavedProject["status"]) => {
    if (!project) return;
    const updated = updateProject(project.id, { status: newStatus });
    if (updated) setProject(updated);
  };

  const startEditing = () => {
    if (!project) return;
    setEditName(project.name);
    setIsEditing(true);
  };

  if (!project) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-12 text-center">
        <h2 className="text-lg font-bold mb-2">{t('projects.not_found') ?? 'Project not found'}</h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">{t('projects.not_found_desc') ?? 'This project could not be found. It may have been deleted.'}</p>
        <button type="button" onClick={onBack} className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all">
          {t('projects.back_to_projects') ?? 'Back to Projects'}
        </button>
      </div>
    );
  }

  const progress = getProjectProgress(project);
  const template = PROJECT_TEMPLATES.find((t) => t.type === project.projectType);
  const allMaterials = aggregateMaterials(project);

  const handleDelete = () => {
    if (confirm(t('projects.confirm_delete')?.replace('{name}', project.name) ?? `Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
      onBack();
    }
  };

  const handleRemoveCalculation = (calcIndex: number) => {
    if (!project) return;
    const updated = updateProject(project.id, {
      calculations: project.calculations?.filter((_, i) => i !== calcIndex) ?? [],
    });
    if (updated) setProject(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors print:hidden">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" /></svg>
        {t('projects.back_to_all') ?? 'Back to all projects'}
      </button>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setIsEditing(false); }}
                  onBlur={handleRename}
                  className="text-xl font-bold tracking-tight bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 w-full max-w-xs text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
                <button type="button" onClick={startEditing} className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors print:hidden" aria-label={t('projects.rename_aria') ?? 'Rename project'}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-[var(--fg-muted)]">{t(`projects.type_${project.projectType}`) ?? project.projectType} {t('projects.project') ?? 'project'}</p>
              <span className="text-[var(--border-strong)]">|</span>
              <span className="text-xs font-semibold text-[var(--fg-muted)] hidden print:inline-block">
                {t('projects.status_label')?.replace('{status}', t(`projects.status_${project.status}`) ?? project.status) ?? `Status: ${project.status}`}
              </span>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as SavedProject["status"])}
                className="text-xs bg-transparent border-none text-[var(--fg-muted)] font-medium cursor-pointer focus:outline-none focus:text-[var(--fg)] appearance-none print:hidden"
                aria-label={t('projects.status_aria') ?? 'Project status'}
              >
                <option value="planning">{t('projects.status_planning') ?? 'Planning'}</option>
                <option value="calculating">{t('projects.status_calculating') ?? 'In Progress'}</option>
                <option value="complete">{t('projects.status_complete') ?? 'Complete'}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-strong)] bg-[var(--bg)] text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors gap-1.5 cursor-pointer"
              aria-label={t('projects.export_pdf_aria') ?? 'Export project to PDF'}
              >
                <svg className="w-3.5 h-3.5 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 19.164c.224-1.124.992-2.103 2.002-2.613l1.17-.591a.75.75 0 0 1 .66 0l1.17.591c1.01.51 1.778 1.49 2.002 2.613L15 21H9l-.28-1.836ZM12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm0 0v3.75m0 0H8.25m3.75 0h3.75" />
                </svg>
                <span>{t('common.print') ?? 'Export PDF'}</span>
              </button>
            <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer" aria-label={t('projects.delete_aria') ?? 'Delete project'}>
              {t('common.delete') ?? 'Delete'}
            </button>
          </div>
        </div>

        {project.sharedDimensions.length && (
          <div className="bg-[var(--bg-subtle)] rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-[var(--fg-muted)] mb-1">{t('projects.shared_dimensions') ?? 'Shared Dimensions'}</p>
            <p className="text-sm font-semibold tabular-nums">
              {project.sharedDimensions.length}&prime; × {project.sharedDimensions.width}&prime;
              {project.sharedDimensions.depth ? ` × ${project.sharedDimensions.depth}″` : ""}
            </p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
            <span>{t('projects.progress_label') ?? 'Project Progress'}</span>
            <span>{t('projects.progress')?.replace('{completed}', String(progress.completed)).replace('{total}', String(progress.total)) ?? `${progress.completed} / ${progress.total} calculators`}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>

        {template && (
          <div>
            <p className="text-xs font-medium text-[var(--fg-muted)] mb-2">{t('projects.recommended_calculators') ?? 'Recommended Calculators'}</p>
            <div className="flex flex-wrap gap-2">
              {template.recommendedCalculators.map((calc) => {
                const isDone = project.calculations.some((c) => c.calculatorSlug === calc);
                return (
                  <span key={calc} className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg ${isDone ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--bg-muted)] text-[var(--fg-secondary)]"}`}>
                    {isDone && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    {calc.replace(/-/g, " ")}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(project.calculations?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h3 className="text-sm font-semibold mb-4">{t('projects.saved_calculations')?.replace('{count}', String(project.calculations.length)) ?? `Saved Calculations (${project.calculations.length})`}</h3>
          <div className="flex flex-col gap-3">
            {(project.calculations ?? []).map((calc, i) => (
              <div key={calc.completedAt + calc.calculatorName + i} className="bg-[var(--bg-subtle)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{calc.calculatorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--fg-muted)]">{new Date(calc.completedAt).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCalculation(i)}
                      className="inline-flex items-center justify-center w-5 h-5 rounded text-[var(--fg-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                      aria-label={t('projects.remove_aria')?.replace('{name}', calc.calculatorName) ?? `Remove ${calc.calculatorName}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(calc.results).slice(0, 4).map(([key, val]) => (
                    <div key={key}>
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
          <h3 className="text-sm font-semibold mb-4">{t('projects.shopping_list') ?? 'Master Shopping List'}</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 font-semibold">{t('projects.material_header') ?? 'Material'}</th>
                <th className="text-right py-2 font-semibold">{t('projects.qty_header') ?? 'Qty'}</th>
                <th className="text-right py-2 font-semibold">{t('projects.unit_header') ?? 'Unit'}</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map((mat) => (
                <tr key={mat.name} className="border-b border-[var(--border)]">
                  <td className="py-2 text-[var(--fg)]">{mat.name}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{mat.quantity}</td>
                  <td className="py-2 text-right text-[var(--fg-muted)]">{mat.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(project.calculations?.length ?? 0) === 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
          <h3 className="text-sm font-semibold mb-2">{t('projects.no_calculations') ?? 'No calculations saved yet'}</h3>
          <p className="text-xs text-[var(--fg-secondary)] mb-4">{t('projects.no_calculations_desc') ?? 'Use the calculators below and come back to track your progress.'}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a href="/calculators/concrete/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] transition-colors">{t('calculators.concrete') ?? 'Concrete'}</a>
            <a href="/calculators/roofing/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] transition-colors">{t('calculators.roofing') ?? 'Roofing'}</a>
            <a href="/calculators/paint/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] transition-colors">{t('projects.calculator_paint') ?? 'Paint'}</a>
            <a href="/calculators/tile/" className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] transition-colors">{t('projects.calculator_tile') ?? 'Tile'}</a>
          </div>
        </div>
      )}
    </div>
  );
}
