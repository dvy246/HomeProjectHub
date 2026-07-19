import { useState, useEffect, useCallback, useMemo } from "react";
import { MAINTENANCE_TASKS, CATEGORIES, FREQUENCY_LABELS, SEASON_MONTHS, type MaintenanceTask, type TaskCategory } from "../../data/maintenance/tasks";
import { getCompletedIds, toggleTask, migrateOldStorage, getNextDue, isOverdue } from "../../lib/maintenanceStorage";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";
import { Card } from "../ui/Card";

type TabView = "monthly" | "seasonal" | "yearly";

const TAB_PANEL_ID = "planner-tab-panel";
const SEASONS = ["spring", "summer", "fall", "winter"] as const;
const DIFFICULTIES = ["easy", "moderate", "professional"] as const;

function MaintenancePlanner() {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<TabView>("monthly");
  const [seasonFilter, setSeasonFilter] = useState<string>("auto");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentSeason, setCurrentSeason] = useState<string>("spring");

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
    migrateOldStorage();
    const m = new Date().getMonth();
    setCurrentMonth(m);
    const season = Object.entries(SEASON_MONTHS).find(([, months]) => months.includes(m))?.[0] || "spring";
    setCurrentSeason(season);
    refresh();
  }, []);

  const completed = useMemo(() => isMounted ? getCompletedIds() : new Set<string>(), [isMounted, tick]);

  // Daily alert triggers for active notification subscriptions
  useEffect(() => {
    if (isMounted && notifPermission === "granted") {
      try {
        const lastNotified = localStorage.getItem("hph_last_notified_date");
        const today = new Date().toDateString();
        if (lastNotified !== today) {
          const overdueTasks = MAINTENANCE_TASKS.filter(
            (t) => isOverdue(t.id, t.frequency) && !completed.has(t.id)
          );
          if (overdueTasks.length > 0) {
            new Notification("Home Maintenance Alert", {
              body: `You have ${overdueTasks.length} overdue seasonal maintenance tasks.`,
              icon: "/favicon.ico",
            });
            localStorage.setItem("hph_last_notified_date", today);
          }
        }
      } catch {}
    }
  }, [isMounted, notifPermission, completed]);

  const requestNotificationPermission = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Browser notifications are not supported on this browser.");
      return;
    }
    Notification.requestPermission().then((perm) => {
      setNotifPermission(perm);
      if (perm === "granted") {
        try {
          new Notification("Notifications Enabled!", {
            body: "You will be notified of seasonal home maintenance tasks.",
            icon: "/favicon.ico",
          });
        } catch {}
      }
    });
  };

  const historyItems = useMemo(() => {
    if (!isMounted) return [];
    try {
      const raw = localStorage.getItem("hph_maintenance_tasks");
      if (!raw) return [];
      const parsed: Record<string, { lastCompleted?: string }> = JSON.parse(raw);
      const items = Object.entries(parsed)
        .filter(([, v]) => !!v.lastCompleted)
        .map(([taskId, v]) => {
          const taskObj = MAINTENANCE_TASKS.find(t => t.id === taskId);
          return {
            id: taskId,
            title: taskObj?.title || taskId,
            completedAt: new Date(v.lastCompleted!).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric"
            }),
            rawDate: new Date(v.lastCompleted!)
          };
        });
      // Sort by date descending
      items.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      return items.slice(0, 3);
    } catch {
      return [];
    }
  }, [isMounted, tick]);

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



  const tabs: { key: TabView; label: string }[] = [
    { key: "monthly", label: t('maintenance.planner.monthlyQuarterly') ?? "Monthly & Quarterly" },
    { key: "seasonal", label: t('maintenance.planner.seasonal') ?? "Seasonal" },
    { key: "yearly", label: t('maintenance.planner.yearly') ?? "Yearly" },
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
      {/* Streak Dashboard & Notifications Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak & Badge Card */}
        <Card className="p-4 border border-[var(--border)] bg-[var(--card-bg)] flex flex-col justify-between gap-2 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block">
              Maintenance Badge
            </span>
            <span className="text-sm font-bold text-[var(--fg)] mt-1 block">
              {completed.size >= 15 ? "Gold Master Maintainer" :
               completed.size >= 8 ? "Silver Professional" :
               completed.size >= 3 ? "Bronze Apprentice" :
               completed.size >= 1 ? "Novice Homeowner" :
               "Starter Maintainer"}
            </span>
          </div>
          <span className="text-[10px] text-[var(--fg-muted)]">
            Streak: {completed.size} lifetime tasks completed
          </span>
        </Card>

        {/* Browser Notifications Control */}
        <Card className="p-4 border border-[var(--border)] bg-[var(--card-bg)] flex flex-col justify-between gap-2 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider block">
              Reminders & Alerts
            </span>
            <span className="text-[10px] text-[var(--fg-secondary)] mt-1 block leading-normal">
              Get local browser notifications when your seasonal tasks are due.
            </span>
          </div>
          <button
            type="button"
            onClick={requestNotificationPermission}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
              notifPermission === "granted"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : notifPermission === "denied"
                ? "bg-red-500/10 border-red-500/20 text-red-600 cursor-not-allowed"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] border-[var(--accent)] text-white"
            }`}
            disabled={notifPermission === "denied"}
          >
            {notifPermission === "granted" ? "Notifications: Active" :
             notifPermission === "denied" ? "Alerts Blocked" :
             "Enable Reminders"}
          </button>
        </Card>

        {/* Recently Completed Log */}
        <Card className="p-4 border border-[var(--border)] bg-[var(--card-bg)] flex flex-col justify-between gap-2 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider block">
              Recent Activity Log
            </span>
            {historyItems.length === 0 ? (
              <span className="text-[10px] text-[var(--fg-muted)] italic mt-2 block">
                No completions recorded yet.
              </span>
            ) : (
              <ul className="flex flex-col gap-1.5 mt-2">
                {historyItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-[10px] border-b border-[var(--border)] pb-1 last:border-0 last:pb-0">
                    <span className="text-[var(--fg-secondary)] truncate max-w-[120px] font-medium">{item.title}</span>
                    <span className="text-[var(--fg-muted)] shrink-0">{item.completedAt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)]">
        <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-semibold tabular-nums whitespace-nowrap text-[var(--fg-secondary)]">{t('maintenance.planner.progress')?.replace('{completed}', String(completedCount)).replace('{total}', String(filtered.length)) ?? `${completedCount}/${filtered.length} done`}</span>
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
            aria-label={t('maintenance.planner.filterBySeason') ?? 'Filter by season'}
          >
            <option value="auto">{t('maintenance.planner.currentSeason') ?? 'Current season'}</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>{t(`seasons.${s}`) ?? s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "all")}
          className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)]"
          aria-label={t('maintenance.planner.filterByCategory') ?? 'Filter by category'}
        >
          <option value="all">{t('maintenance.planner.allCategories') ?? 'All categories'}</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)]"
          aria-label={t('maintenance.planner.filterByDifficulty') ?? 'Filter by difficulty'}
        >
          <option value="all">{t('maintenance.planner.allDifficulties') ?? 'All difficulties'}</option>
            {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{t(`maintenance.planner.difficulty_${d}`) ?? d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
      </div>

      {!allDone && allIds.length > 0 && (
        <button
          onClick={() => selectAll(allIds)}
          className="self-start text-xs font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity"
        >
          {t('maintenance.planner.mark_all_complete') ?? 'Mark all as complete'}
        </button>
      )}
      {allDone && allIds.length > 0 && (
        <button
          onClick={() => deselectAll(allIds)}
          className="self-start text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors"
        >
          {t('maintenance.planner.reset_all') ?? 'Reset all'}
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
                  const next = isMounted ? getNextDue(task.id, task.frequency) : null;
                  const overdue = isMounted ? isOverdue(task.id, task.frequency) : false;
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
                              {t('maintenance.planner.due_date')?.replace('{date}', next.toLocaleDateString()) ?? `Due ${next.toLocaleDateString()}`}
                            </span>
                          )}
                          {overdue && !done && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
                              {t('maintenance.calendar.overdue') ?? 'Overdue'}
                            </span>
                          )}
                        </div>
                        {task.relatedCalculator && !done && (
                          <a
                            href={`/calculators/${task.relatedCalculator}/`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block mt-1.5 text-[10px] font-medium text-[var(--accent)] hover:underline"
                          >
                            {t('maintenance.planner.related_calculator') ?? 'Use related calculator →'}
                          </a>
                        )}
                        {!done && (
                          <details className="mt-2">
                            <summary className="text-[11px] text-[var(--fg-muted)] cursor-pointer hover:text-[var(--fg-secondary)]">{t('maintenance.planner.why_matters') ?? 'Why this matters'}</summary>
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
          <p className="text-sm text-[var(--fg-muted)] text-center py-8">{t('maintenance.planner.no_filtered_tasks') ?? 'No tasks match the current filters.'}</p>
        )}
      </div>
    </div>
  );
}

export default withI18n(MaintenancePlanner);
