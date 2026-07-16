import { useState, useEffect } from "react";
import { getSavedProjects, aggregateMaterials, type SavedProject } from "../../lib/projectEngine";

type ProjectWithMaterials = SavedProject & { materials: ReturnType<typeof aggregateMaterials> };

function ShoppingList() {
  const [projects, setProjects] = useState<ProjectWithMaterials[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("hph-shopping-checked") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hph-shopping-checked", JSON.stringify(checked));
    } catch {}
  }, [checked]);

  useEffect(() => {
    const load = () => {
      const all = getSavedProjects();
      setProjects(
        all
          .filter((p) => (p.calculations?.length ?? 0) > 0)
          .map((p) => ({ ...p, materials: aggregateMaterials(p) }))
      );
    };
    load();
    window.addEventListener("saved-projects-changed", load);
    return () => window.removeEventListener("saved-projects-changed", load);
  }, []);

  const toggleChecked = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalMaterials = projects.reduce((sum, p) => sum + p.materials.length, 0);

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-12 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-[var(--fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75V3.75a1.5 1.5 0 00-1.5-1.5H9a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5z" />
        </svg>
        <h2 className="text-lg font-bold mb-2">No Shopping List Yet</h2>
        <p className="text-sm text-[var(--fg-secondary)] mb-6">
          Save calculations to a project first, then come here for a consolidated shopping list across all your projects.
        </p>
        <a
          href="/projects/new/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border border-[var(--accent)] transition-all"
        >
          Start a Project
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--fg-secondary)]">
          {projects.length} {projects.length === 1 ? "project" : "projects"} &middot; {totalMaterials} materials
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-strong)] bg-[var(--bg)] text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors print:hidden"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 19.164c.224-1.124.992-2.103 2.002-2.613l1.17-.591a.75.75 0 0 1 .66 0l1.17.591c1.01.51 1.778 1.49 2.002 2.613L15 21H9l-.28-1.836ZM12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm0 0v3.75m0 0H8.25m3.75 0h3.75" />
          </svg>
          Print List
        </button>
      </div>

      {projects.map((project) => {
        const projectCheckedKey = `project-${project.id}`;
        const allChecked = project.materials.every((m) => checked[`${project.id}::${m.name}`]);
        return (
          <section key={project.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-[var(--bg-subtle)] border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => {
                    project.materials.forEach((m) => {
                      const key = `${project.id}::${m.name}`;
                      if (allChecked) {
                        setChecked((prev) => ({ ...prev, [key]: false }));
                      } else {
                        setChecked((prev) => ({ ...prev, [key]: true }));
                      }
                    });
                  }}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--ring)] accent-[var(--accent)] cursor-pointer"
                  aria-label={`Toggle all for ${project.name}`}
                />
                <div>
                  <h2 className="text-sm font-semibold">{project.name}</h2>
                  <p className="text-xs text-[var(--fg-muted)]">{project.projectType} &middot; {project.materials.length} {project.materials.length === 1 ? "item" : "items"}</p>
                </div>
              </div>
              <a
                href={`/projects/?id=${project.id}`}
                className="text-xs text-[var(--accent)] hover:underline print:hidden"
              >
                View Project
              </a>
            </div>

            {project.materials.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pl-4 font-semibold text-[var(--fg-muted)]">Material</th>
                    <th className="text-right py-2 font-semibold text-[var(--fg-muted)]">Qty</th>
                    <th className="text-right py-2 pr-4 font-semibold text-[var(--fg-muted)]">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {project.materials.map((mat) => {
                    const key = `${project.id}::${mat.name}`;
                    const isChecked = !!checked[key];
                    return (
                      <tr key={key} className={`border-b border-[var(--border)] transition-all ${isChecked ? "opacity-40 line-through bg-[var(--bg-subtle)]" : ""}`}>
                        <td className="py-2.5 pl-4 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleChecked(key)}
                            className="w-3.5 h-3.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--ring)] accent-[var(--accent)] cursor-pointer"
                            aria-label={`Mark ${mat.name} as purchased`}
                          />
                          <span>{mat.name}</span>
                        </td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">{mat.quantity}</td>
                        <td className="py-2.5 pr-4 text-right text-[var(--fg-muted)]">{mat.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-xs text-[var(--fg-muted)] text-center">No materials calculated yet.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default ShoppingList;
