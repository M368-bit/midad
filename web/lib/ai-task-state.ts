/**
 * lib/ai-task-state.ts
 * Global AI Task State — persists within server process lifetime.
 * Module-level singleton: survives across API calls in same Node instance.
 */

export type AITaskType = "import_bukhari" | "import_muslim" | "custom";
export type AITaskStatus = "idle" | "running" | "completed" | "error" | "paused";

export interface AITask {
  id: string;
  type: AITaskType;
  title: string;
  description: string;
  status: AITaskStatus;
  progress: number;      // 0–100
  totalItems: number;
  doneItems: number;
  failedItems: number;
  currentItem: string;   // e.g. "جلب الحديث رقم 234"
  message: string;       // human-readable status
  startedAt: string | null;
  completedAt: string | null;
  errors: string[];
  importedIds: string[];
}

// ── Singleton storage ──────────────────────────────────────────
const taskStore = new Map<string, AITask>();
let _activeTaskId: string | null = null;
let _abortFlag = false;

// ── Public API ─────────────────────────────────────────────────

export function getActiveTask(): AITask | null {
  if (!_activeTaskId) return null;
  return taskStore.get(_activeTaskId) ?? null;
}

export function getAllTasks(): AITask[] {
  return Array.from(taskStore.values()).sort(
    (a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? "")
  );
}

export function createTask(
  type: AITaskType,
  title: string,
  description: string,
  totalItems: number
): AITask {
  const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const task: AITask = {
    id,
    type,
    title,
    description,
    status: "idle",
    progress: 0,
    totalItems,
    doneItems: 0,
    failedItems: 0,
    currentItem: "",
    message: "في الانتظار...",
    startedAt: null,
    completedAt: null,
    errors: [],
    importedIds: [],
  };
  taskStore.set(id, task);
  return task;
}

export function updateTask(id: string, updates: Partial<AITask>): void {
  const existing = taskStore.get(id);
  if (!existing) return;
  taskStore.set(id, { ...existing, ...updates });
}

export function setActiveTaskId(id: string | null): void {
  _activeTaskId = id;
}

export function getActiveTaskId(): string | null {
  return _activeTaskId;
}

export function setAbortFlag(val: boolean): void {
  _abortFlag = val;
}

export function getAbortFlag(): boolean {
  return _abortFlag;
}
