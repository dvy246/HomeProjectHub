import { useState, useEffect, useCallback, useMemo } from "react";
import { MAINTENANCE_TASKS, CATEGORIES, FREQUENCY_LABELS, SEASON_MONTHS, type MaintenanceTask } from "../../data/maintenance/tasks";

const STORAGE_KEY = "hph_maintenance_planner";

function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

type TabView = "monthly" | "seasonal" | "yearly";

const TAB_PANEL_ID = "planner-tab-panel";

export default function MaintenancePlanner() {
  const [completed, setCompleted] = useState<Set<string>>(loadCompleted);
  const [activeTab, setActiveTab] = useState<TabView>("monthly");

  useEffect(() => {
    saveCompleted(completed);
  }, [completed]);

  useEffect(() => {
    const handler = () => setCompleted(loadCompleted());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectAll = useCallback((ids: string[]) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const tabs: { key: TabView; label: string }[] = [
    { key: "monthly", label: "Monthly & Quarterly" },
    { key: "seasonal", label: "Seasonal" },
    { key: "yearly", label: "Yearly" },
  ];

  const filtered = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentSeason = Object.entries(SEASON_MONTHS).find(([, months]) => months.includes(currentMonth))?.[0] || "spring";

    if (activeTab === "monthly") {
      return MAINTENANCE_TASKS.filter((t) => t.frequency === "monthly" || t.frequency === "quarterly");
    }
    if (activeTab === "seasonal") {
      return MAINTENANCE_TASKS.filter((t) =>
        (t.frequency === "seasonal" || t.frequency === "biannual") &&
        (!t.seasons || t.seasons.includes(currentSeason as "spring" | "summer" | "fall" | "winter"))
      );
    }
    return MAINTENANCE_TASKS.filter((t) => t.frequency === "yearly");
  }, [activeTab]);

  const completedCount = useMemo(
    () => filtered.filter((t) => completed.has(t.id)).length,
    [filtered, completed]
  );

  const progress = filtered.length > 0 ? Math.round((completedCount / filtered.length) * 100) : 0;

  const grouped = useMemo(() => {
    const map = new Map<string, MaintenanceTask[]>();
    for (const task of filtered) {
      const existing = map.get(task.category) || [];
      existing.push(task);
      map.set(task.category, existing);
    }
    return map;
  }, [filtered]);

  const allIds = useMemo(() => filtered.map((t) => t.id), [filtered]);
  const allCompleted = allIds.every((id) => completed.has(id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)]">
        <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-semibold tabular-nums whitespace-nowrap text-[var(--fg-secondary)]">{completedCount}/{filtered.length} done</span>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)]" role="tablist" aria-label="Task frequency">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            aria-controls={TAB_PANEL_ID}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm border border-[var(--border)]"
                : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!allCompleted && allIds.length > 0 && (
        <button
          onClick={() => selectAll(allIds)}
          className="self-start text-xs font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity"
        >
          Mark all as complete
        </button>
      )}
      {allCompleted && allIds.length > 0 && (
        <button
          onClick={() => deselectAll(allIds)}
          className="self-start text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors"
        >
          Reset all
        </button>
      )}

      <div role="tabpanel" id={TAB_PANEL_ID} aria-labelledby={`tab-${activeTab}`}>
        {CATEGORIES.map((cat) => {
          const tasks = grouped.get(cat.key);
          if (!tasks || tasks.length === 0) return null;
          const catDone = tasks.filter((t) => completed.has(t.id)).length;
          return (
            <div key={cat.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {cat.label}
                </h3>
                <span className="text-[10px] text-[var(--fg-muted)] tabular-nums">{catDone}/{tasks.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {tasks.map((task) => {
                  const done = completed.has(task.id);
                  return (
                    <label
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        done
                          ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/10"
                          : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(task.id)}
                        className="mt-0.5 w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--accent)]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${done ? "line-through text-[var(--fg-muted)]" : ""}`}>
                          {task.title}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--fg-muted)]">
                            {FREQUENCY_LABELS[task.frequency]}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--fg-muted)]">
                            {task.estimatedCost}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--fg-muted)]">
                            {task.difficulty}
                          </span>
                        </div>
                        {done ? null : (
                          <details className="mt-2">
                            <summary className="text-[11px] text-[var(--fg-muted)] cursor-pointer hover:text-[var(--fg-secondary)]">Why this matters</summary>
                            <p className="text-[11px] text-[var(--fg-secondary)] mt-1 leading-relaxed">{task.consequence}</p>
                          </details>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-[var(--fg-muted)] text-center py-8">No tasks for this view.</p>
        )}
      </div>
    </div>
  );
}
