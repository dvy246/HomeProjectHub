const STORAGE_KEY = "hph_maintenance_tasks";

export interface TaskRecord {
  lastCompleted?: string;
  notes?: string;
}

function loadAll(): Record<string, TaskRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, TaskRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function isTaskCompleted(taskId: string): boolean {
  const data = loadAll();
  return !!data[taskId]?.lastCompleted;
}

export function getCompletedIds(): Set<string> {
  const data = loadAll();
  return new Set(Object.entries(data).filter(([, v]) => !!v.lastCompleted).map(([k]) => k));
}

export function toggleTask(taskId: string, completed?: boolean): void {
  const data = loadAll();
  const isDone = completed ?? !data[taskId]?.lastCompleted;
  if (isDone) {
    data[taskId] = { lastCompleted: new Date().toISOString(), notes: data[taskId]?.notes };
  } else {
    delete data[taskId];
  }
  saveAll(data);
}

export function setTaskNotes(taskId: string, notes: string): void {
  const data = loadAll();
  data[taskId] = { lastCompleted: data[taskId]?.lastCompleted, notes };
  saveAll(data);
}

export function getLastCompleted(taskId: string): string | undefined {
  return loadAll()[taskId]?.lastCompleted;
}

export function getNextDue(taskId: string, frequency: string): Date | null {
  const last = getLastCompleted(taskId);
  if (!last) return null;
  const lastDate = new Date(last);
  switch (frequency) {
    case "monthly": return new Date(lastDate.setMonth(lastDate.getMonth() + 1));
    case "quarterly": return new Date(lastDate.setMonth(lastDate.getMonth() + 3));
    case "biannual": return new Date(lastDate.setMonth(lastDate.getMonth() + 6));
    case "yearly": return new Date(lastDate.setFullYear(lastDate.getFullYear() + 1));
    default: return null;
  }
}

export function isOverdue(taskId: string, frequency: string): boolean {
  const next = getNextDue(taskId, frequency);
  if (!next) return !!getLastCompleted(taskId);
  return next < new Date();
}

export function migrateOldStorage() {
  const LEGACY_KEYS = ["hph_maintenance_planner", "maint-calendar-completed"];
  let migrated = false;
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const data = loadAll();
        for (const id of ids) {
          if (!data[id]?.lastCompleted) {
            data[id] = { lastCompleted: new Date().toISOString() };
          }
        }
        saveAll(data);
        localStorage.removeItem(key);
        migrated = true;
      }
    } catch {}
  }
  return migrated;
}
