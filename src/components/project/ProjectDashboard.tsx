import { useState, useEffect } from "react";
import { getSavedProjects, deleteProject, updateProject, getProjectProgress, type SavedProject } from "../../lib/projectEngine";
import ProjectDetail from "./ProjectDetail";

function hashToId(hash: string): string | null {
  if (!hash.startsWith("#detail-")) return null;
  return hash.replace("#detail-", "");
}

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getSavedProjects());
    setDetailId(hashToId(window.location.hash));

    const handler = () => setProjects(getSavedProjects());
    window.addEventListener("saved-projects-changed", handler);

    const onHashChange = () => setDetailId(hashToId(window.location.hash));
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("saved-projects-changed", handler);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const openDetail = (id: string) => {
    window.location.hash = `detail-${id}`;
    setDetailId(id);
  };

  const closeDetail = () => {
    window.location.hash = "";
    setDetailId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

  if (detailId) {
    return <ProjectDetail projectId={detailId} onBack={closeDetail} />;
  }

  const handleClearAll = () => {
    if (projects.length === 0) return;
    if (confirm(`Delete all ${projects.length} projects? This cannot be undone.`)) {
      projects.forEach((p) => deleteProject(p.id));
    }
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">No projects yet</h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">Create your first project plan to get started.</p>
        <a href="/projects/new/" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all">
          Start a Project
        </a>
      </div>
    );
  }

  const statusBadge = (p: SavedProject) => {
    const colors = {
      planning: "bg-[var(--warning)]/10 text-[var(--warning)]",
      calculating: "bg-[var(--accent)]/10 text-[var(--accent)]",
      complete: "bg-[var(--success)]/10 text-[var(--success)]",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[p.status]}`}>
        {p.status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {projects.length > 1 && (
        <div className="flex justify-end">
          <button type="button" onClick={handleClearAll} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg-muted)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors">
            Clear All Projects
          </button>
        </div>
      )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => {
        const progress = getProjectProgress(project);
        return (
          <div key={project.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 card-elevated">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">{project.name}</h2>
                <p className="text-xs text-[var(--fg-muted)] capitalize">{project.projectType} project</p>
              </div>
              {statusBadge(project)}
            </div>

            {project.sharedDimensions.length && (
              <p className="text-xs text-[var(--fg-secondary)] mb-3">
                {project.sharedDimensions.length}&prime; × {project.sharedDimensions.width}&prime;
                {project.sharedDimensions.depth ? ` × ${project.sharedDimensions.depth}″` : ""}
              </p>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] mb-1">
                <span>Progress: {progress.completed}/{progress.total} calculators</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => openDetail(project.id)} className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors">
                View Plan
              </button>
              <button type="button" onClick={() => handleDelete(project.id, project.name)} className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors" aria-label={`Delete ${project.name}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}
