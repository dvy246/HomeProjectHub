import { useState, useMemo, useId, useEffect, useCallback } from "react";
import { MAINTENANCE_TASKS, CATEGORIES, type MaintenanceTask, type TaskCategory } from "../../data/maintenance/tasks";
import { getCompletedIds, toggleTask, migrateOldStorage, isOverdue } from "../../lib/maintenanceStorage";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SEASON_MONTHS: Record<string, number[]> = { spring: [2, 3, 4], summer: [5, 6, 7], fall: [8, 9, 10], winter: [11, 0, 1] };
const CATEGORY_COLORS: Record<TaskCategory, string> = {
  hvac: "var(--accent)",
  plumbing: "#3b82f6",
  electrical: "#f59e0b",
  exterior: "#10b981",
  interior: "#8b5cf6",
  safety: "#ef4444",
};

function getTaskMonths(task: MaintenanceTask): number[] {
  if (task.months && task.months.length > 0) return task.months;
  if (task.seasons) {
    const months = new Set<number>();
    for (const s of task.seasons) {
      for (const m of (SEASON_MONTHS[s] || [])) months.add(m);
    }
    return [...months];
  }
  if (task.frequency === "monthly") return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  if (task.frequency === "quarterly") return [2, 5, 8, 11];
  if (task.frequency === "yearly") return [task.months?.[0] ?? 0];
  return [];
}

function getCategoryCounts(tasks: MaintenanceTask[]) {
  const counts = new Map<TaskCategory, number>();
  for (const t of tasks) {
    counts.set(t.category, (counts.get(t.category) || 0) + 1);
  }
  return counts;
}

function MaintenanceCalendar() {
  const { t } = useI18n();
  const id = useId();
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => new Set());
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    migrateOldStorage();
    const m = new Date().getMonth();
    setCurrentMonth(m);
    setSelectedMonth(m);
    setCompletedTasks(getCompletedIds());
  }, []);

  useEffect(() => {
    const handler = () => setCompletedTasks(getCompletedIds());
    window.addEventListener("storage", handler);
    window.addEventListener("maintenance-update", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("maintenance-update", handler);
    };
  }, []);

  const handleToggle = useCallback((taskId: string) => {
    toggleTask(taskId);
    window.dispatchEvent(new Event("maintenance-update"));
    setCompletedTasks(getCompletedIds());
  }, []);

  const monthTasks = useMemo(() => {
    const map = new Map<number, MaintenanceTask[]>();
    for (const task of MAINTENANCE_TASKS) {
      const months = getTaskMonths(task);
      for (const m of months) {
        if (!map.has(m)) map.set(m, []);
        map.get(m)!.push(task);
      }
    }
    return map;
  }, []);

  const selectedTasks = useMemo(() => {
    if (selectedMonth === null) return [];
    let tasks = monthTasks.get(selectedMonth) || [];
    if (categoryFilter !== "all") tasks = tasks.filter((t) => t.category === categoryFilter);
    return tasks;
  }, [selectedMonth, monthTasks, categoryFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "all")}
          className="text-xs bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg h-10 px-3 text-[var(--fg)]"
          aria-label={t('maintenance.calendar.filterByCategory') ?? 'Filter by category'}
        >
          <option value="all">{t('maintenance.calendar.allCategories') ?? 'All categories'}</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {MONTHS.map((name, i) => {
          const tasks = monthTasks.get(i) || [];
          const filtered = categoryFilter === "all" ? tasks : tasks.filter((t) => t.category === categoryFilter);
          const count = filtered.length;
          const done = filtered.filter(t => completedTasks.has(t.id)).length;
          const isCurrent = i === currentMonth;
          const isSelected = i === selectedMonth;
          return (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm transition-all ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                  : isCurrent
                    ? "border-[var(--border-strong)] bg-[var(--card-bg)]"
                    : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--border-hover)]"
              }`}
              aria-label={t('maintenance.calendar.monthAria')?.replace('{month}', name).replace('{count}', String(count)).replace('{done}', String(done)) ?? `${name}: ${count} tasks, ${done} completed`}
              aria-pressed={isSelected}
            >
              <span className="text-xs font-medium text-[var(--fg-muted)]">{name}</span>
              <span className="text-lg font-bold tabular-nums">{count}</span>
              {count > 0 && (
                <div className="flex gap-0.5">
                  {[...getCategoryCounts(filtered).entries()].slice(0, 3).map(([cat]) => (
                    <span key={cat} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedMonth !== null && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <h3 className="text-sm font-bold mb-3">{t('maintenance.calendar.monthTasks')?.replace('{month}', MONTHS[selectedMonth]).replace('{count}', String(selectedTasks.length)) ?? `${MONTHS[selectedMonth]} Tasks (${selectedTasks.length})`}</h3>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-[var(--fg-muted)]">{t('maintenance.calendar.noTasks') ?? 'No scheduled tasks for this month.'}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedTasks.map(task => {
                const done = completedTasks.has(task.id);
                const overdue = isMounted ? isOverdue(task.id, task.frequency) : false;
                return (
                  <li key={task.id} className={`flex items-start gap-3 text-sm p-2 rounded-lg ${overdue && !done ? 'bg-[var(--warning)]/10' : ''}`}>
                    <input
                      type="checkbox"
                      id={`${id}-${task.id}`}
                      checked={done}
                      onChange={() => handleToggle(task.id)}
                      className="mt-0.5 accent-[var(--accent)]"
                    />
                    <label
                      htmlFor={`${id}-${task.id}`}
                      className={`flex-1 cursor-pointer ${done ? 'line-through text-[var(--fg-muted)]' : 'text-[var(--fg)]'}`}
                    >
                      <span className="font-medium">{task.title}</span>
                      <span className="block text-xs text-[var(--fg-muted)]">{task.explanation}</span>
                      {task.relatedCalculator && !done && (
                        <a
                          href={`/calculators/${task.relatedCalculator}/`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block mt-1 text-[10px] font-medium text-[var(--accent)] hover:underline"
                        >
                          {t('maintenance.calendar.relatedCalculator') ?? 'Use related calculator →'}
                        </a>
                      )}
                      {overdue && !done && (
                        <span className="inline-block mt-1 ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
                          {t('maintenance.calendar.overdue') ?? 'Overdue'}
                        </span>
                      )}
                    </label>
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--fg-muted)]"
                      style={{ backgroundColor: CATEGORY_COLORS[task.category] + '20', color: CATEGORY_COLORS[task.category] }}>
                      {CATEGORIES.find(c => c.key === task.category)?.label || task.category}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default withI18n(MaintenanceCalendar);
