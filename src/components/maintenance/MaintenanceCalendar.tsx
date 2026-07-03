import { useState, useMemo, useId } from "react";
import { MAINTENANCE_TASKS, CATEGORIES, type MaintenanceTask, type TaskCategory } from "../../data/maintenance/tasks";

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

export default function MaintenanceCalendar() {
  const id = useId();
  const now = new Date();
  const currentMonth = now.getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("maint-calendar-completed");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

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

  const selectedTasks = selectedMonth !== null ? (monthTasks.get(selectedMonth) || []) : [];
  const categoryCounts = useMemo(() => {
    const counts = new Map<TaskCategory, number>();
    for (const t of selectedTasks) {
      counts.set(t.category, (counts.get(t.category) || 0) + 1);
    }
    return counts;
  }, [selectedTasks]);

  function toggleTask(taskId: string) {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      localStorage.setItem("maint-calendar-completed", JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {MONTHS.map((name, i) => {
          const tasks = monthTasks.get(i) || [];
          const count = tasks.length;
          const done = tasks.filter(t => completedTasks.has(t.id)).length;
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
              aria-label={`${name}: ${count} tasks, ${done} completed`}
              aria-pressed={isSelected}
            >
              <span className="text-xs font-medium text-[var(--fg-muted)]">{name}</span>
              <span className="text-lg font-bold tabular-nums">{count}</span>
              {count > 0 && (
                <div className="flex gap-0.5">
                  {[...categoryCounts.entries()].slice(0, 3).map(([cat]) => (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedMonth !== null && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <h3 className="text-sm font-bold mb-3">{MONTHS[selectedMonth]} Tasks ({selectedTasks.length})</h3>
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-[var(--fg-muted)]">No scheduled tasks for this month.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedTasks.map(task => (
                <li key={task.id} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    id={`${id}-${task.id}`}
                    checked={completedTasks.has(task.id)}
                    onChange={() => toggleTask(task.id)}
                    className="mt-0.5 accent-[var(--accent)]"
                  />
                  <label
                    htmlFor={`${id}-${task.id}`}
                    className={`flex-1 cursor-pointer ${completedTasks.has(task.id) ? 'line-through text-[var(--fg-muted)]' : 'text-[var(--fg)]'}`}
                  >
                    <span className="font-medium">{task.title}</span>
                    <span className="block text-xs text-[var(--fg-muted)]">{task.explanation}</span>
                  </label>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--fg-muted)]"
                    style={{ backgroundColor: CATEGORY_COLORS[task.category] + '20', color: CATEGORY_COLORS[task.category] }}>
                    {CATEGORIES.find(c => c.key === task.category)?.label || task.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
