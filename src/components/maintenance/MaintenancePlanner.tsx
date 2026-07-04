import { useState, useEffect, useCallback, useMemo } from "react";
import { MAINTENANCE_TASKS, CATEGORIES, FREQUENCY_LABELS, SEASON_MONTHS, type MaintenanceTask, type TaskCategory } from "../../data/maintenance/tasks";
import { getCompletedIds, toggleTask, migrateOldStorage, getNextDue, isOverdue } from "../../lib/maintenanceStorage";

type TabView = "monthly" | "seasonal" | "yearly";

const TAB_PANEL_ID = "planner-tab-panel";
const SEASONS = ["spring", "summer", "fall", "winter"] as const;
const DIFFICULTIES = ["easy", "moderate", "professional"] as const;

export default function MaintenancePlanner() {
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<TabView>("monthly");
  const [seasonFilter, setSeasonFilter] = useState<string>("auto");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => { migrateOldStorage(); refresh(); }, []);

  const completed = useMemo(() => getCompletedIds(), [tick]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    window.addEventListener("maintenance-update", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("maintenance-update", handler);
    };
  }, [refresh]);

  const handleToggle = useCallback((id: string) => {
    toggleTask(id);
    window.dispatchEvent(new Event("maintenance-update"));
    refresh();
  }, [refresh]);

  const selectAll = useCallback((ids: string[]) => {
    ids.forEach((id) => toggleTask(id, true));
    window.dispatchEvent(new Event("maintenance-update"));
    refresh();
  }, [refresh]);

  const deselectAll = useCallback((ids: string[]) => {
    ids.forEach((id) => toggleTask(id, false));
    window.dispatchEvent(new Event("maintenance-update"));
    refresh();
  }, [refresh]);

  const currentMonth = new Date().getMonth();
  const currentSeason = useMemo(
    () => Object.entries(SEASON_MONTHS).find(([, months]) => months.includes(currentMonth))?.[0] || "spring",
    []
  );

  const tabs: { key: TabView; label: string }[] = [
    { key: "monthly", label: "Monthly & Quarterly" },
    { key: "seasonal", label: "Seasonal" },
    { key: "yearly", label: "Yearly" },
  ];

  const filtered = useMemo(() => {
    const activeSeason = seasonFilter === "auto" ? currentSeason : seasonFilter;
    let tasks: MaintenanceTask[];
    if (activeTab === "monthly") {
      tasks = MAINTENANCE_TASKS.filter((t) => t.frequency === "monthly" || t.frequency === "quarterly");
    } else if (activeTab === "seasonal") {
      tasks = MAINTENANCE_TASKS.filter((t) =>
        (t.frequency === "seasonal" || t.frequency === "biannual") &&
        (!t.seasons || t.seasons.includes(activeSeason as "spring" | "summer" | "fall" | "winter"))
      );
    } else {
      tasks = MAINTENANCE_TASKS.filter((t) => t.frequency === "yearly");
    }
    if (categoryFilter !== "all") tasks = tasks.filter((t) => t.category === categoryFilter);
    if (difficultyFilter !== "all") tasks = tasks.filter((t) => t.difficulty === difficultyFilter);
    return tasks;
  }, [activeTab, seasonFilter, categoryFilter, difficultyFilter, currentSeason]);

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
  const allDone = allIds.every((id) => completed.has(id));

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

      <div className="flex flex-wrap gap-2">
        {activeTab === "seasonal" && (
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)]"
            aria-label="Filter by season"
          >
            <option value="auto">Current season</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "all")}
          className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)]"
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)]"
          aria-label="Filter by difficulty"
        >
          <option value="all">All difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      {!allDone && allIds.length > 0 && (
        <button
          onClick={() => selectAll(allIds)}
          className="self-start text-xs font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity"
        >
          Mark all as complete
        </button>
      )}
      {allDone && allIds.length > 0 && (
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
                  const next = getNextDue(task.id, task.frequency);
                  const overdue = isOverdue(task.id, task.frequency);
                  return (
                    <label
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        done
                          ? "border-[var(--success)]/30 bg-[var(--success)]/10"
                          : overdue
                            ? "border-[var(--warning)]/30 bg-[var(--warning)]/10"
                            : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => handleToggle(task.id)}
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
                          {next && !done && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--fg-muted)]">
                              Due {next.toLocaleDateString()}
                            </span>
                          )}
                          {overdue && !done && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
                              Overdue
                            </span>
                          )}
                        </div>
                        {task.relatedCalculator && !done && (
                          <a
                            href={`/calculators/${task.relatedCalculator}/`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block mt-1.5 text-[10px] font-medium text-[var(--accent)] hover:underline"
                          >
                            Use related calculator →
                          </a>
                        )}
                        {!done && (
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
          <p className="text-sm text-[var(--fg-muted)] text-center py-8">No tasks match the current filters.</p>
        )}
      </div>
    </div>
  );
}
