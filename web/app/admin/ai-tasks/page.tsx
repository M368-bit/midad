"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Zap,
  Scroll,
  BookOpen,
  StopCircle,
  Play,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AdminAIChat } from "@/components/ai/AdminAIChat";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TaskState {
  id: string;
  type: "import_bukhari" | "import_muslim" | "custom";
  title: string;
  status: "idle" | "running" | "completed" | "error" | "paused";
  progress: number;
  totalItems: number;
  doneItems: number;
  failedItems: number;
  currentItem: string;
  message: string;
  startedAt: string | null;
  completedAt: string | null;
  errors: string[];
  importedIds: string[];
}

// ── Task definition cards ──────────────────────────────────────────────────────

const TASK_CARDS = [
  {
    type: "import_bukhari" as const,
    icon: Scroll,
    title: "استيراد صحيح البخاري",
    subtitle: "الجامع الصحيح للإمام البخاري",
    count: "٧٥٦٣",
    countNum: 7563,
    description:
      "استيراد جميع أحاديث صحيح البخاري من مصادر موثقة ومتحققة، وإضافتها إلى قاعدة البيانات المحلية.",
    color: "emerald",
  },
  {
    type: "import_muslim" as const,
    icon: BookOpen,
    title: "استيراد صحيح مسلم",
    subtitle: "الجامع الصحيح للإمام مسلم",
    count: "٣٠٣٣",
    countNum: 3033,
    description:
      "استيراد جميع أحاديث صحيح مسلم من مصادر موثقة ومتحققة، وإضافتها إلى قاعدة البيانات المحلية.",
    color: "emerald",
  },
];

// ── Live Progress Panel ────────────────────────────────────────────────────────

function LiveProgressPanel({ task }: { task: TaskState }) {
  const isRunning = task.status === "running";
  const isCompleted = task.status === "completed";
  const isError = task.status === "error";

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isCompleted
              ? "bg-emerald-500/20"
              : isError
              ? "bg-red-500/20"
              : "bg-emerald-500/10"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Zap className="w-5 h-5 text-emerald-400 anim-glow" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            {task.title}
          </h3>
          <p className="text-xs text-slate-500">{task.message}</p>
        </div>
        <div className="mr-auto text-left rtl:text-right">
          <span
            className={`text-3xl font-black tabular-nums ${
              isCompleted
                ? "text-emerald-500"
                : isError
                ? "text-red-500"
                : "text-emerald-400"
            }`}
          >
            {Math.round(task.progress)}
          </span>
          <span className="text-sm text-slate-400">٪</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isCompleted
              ? "bg-emerald-500"
              : isError
              ? "bg-red-500"
              : "bg-gradient-to-r from-emerald-700 to-emerald-400"
          }`}
          style={{ width: `${task.progress}%` }}
        >
          {isRunning && (
            <div className="shimmer-parent absolute inset-0 overflow-hidden rounded-full">
              <div className="shimmer-bar" />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "تم استيراده",
            value: task.doneItems.toLocaleString("ar-EG"),
            color: "text-emerald-500",
          },
          {
            label: "الإجمالي",
            value: task.totalItems.toLocaleString("ar-EG"),
            color: "text-slate-600 dark:text-slate-300",
          },
          {
            label: "الفاشلة",
            value: task.failedItems.toLocaleString("ar-EG"),
            color: task.failedItems > 0 ? "text-red-400" : "text-slate-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-sm rounded-xl p-3 text-center"
          >
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current item */}
      {task.currentItem && isRunning && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl glass-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs text-slate-400 truncate">
            يجري الآن: {task.currentItem}
          </span>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex gap-4 text-[10px] text-slate-400">
        {task.startedAt && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            بدأ:{" "}
            {new Date(task.startedAt).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        {task.completedAt && (
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            انتهى:{" "}
            {new Date(task.completedAt).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Errors list */}
      {task.errors.length > 0 && (
        <details className="text-xs text-red-400">
          <summary className="cursor-pointer font-medium">
            {task.errors.length} خطأ — اضغط لعرضها
          </summary>
          <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {task.errors.slice(-20).map((err, i) => (
              <li key={i} className="text-[10px] text-red-400/80">
                {err}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AITasksPage() {
  const [task, setTask] = useState<TaskState | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-task");
      if (!res.ok) return;
      const data = (await res.json()) as { activeTask: TaskState | null; importedCount?: number };
      setTask(data.activeTask);
    } catch {
      // ignore
    }
  }, []);

  // Polling while running
  useEffect(() => {
    void fetchTask();
    const id = setInterval(() => void fetchTask(), 2000);
    setPolling(true);
    return () => {
      clearInterval(id);
      setPolling(false);
    };
  }, [fetchTask]);

  const startTask = async (type: "import_bukhari" | "import_muslim") => {
    setLoading(true);
    setLastError(null);
    try {
      const res = await fetch("/api/ai-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", type }),
      });
      const data = (await res.json()) as { task?: TaskState; error?: string };
      if (res.status === 409) {
        // Task already running — just show current state
        await fetchTask();
      } else if (!res.ok || data.error) {
        setLastError(data.error ?? "فشل بدء المهمة");
      } else if (data.task) {
        setTask(data.task);
      }
    } catch {
      setLastError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const stopTask = async () => {
    setLoading(true);
    try {
      await fetch("/api/ai-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      await fetchTask();
    } finally {
      setLoading(false);
    }
  };

  const clearTask = async () => {
    setLoading(true);
    try {
      await fetch("/api/ai-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = task?.status === "running";
  const isCompleted = task?.status === "completed";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl glass-emerald flex items-center justify-center shadow-glass-emerald">
            <Zap className="w-7 h-7 text-emerald-400 anim-glow" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black gradient-text-animated">
          مركز الذكاء الاصطناعي
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
          أوكِل مهمة للذكاء الاصطناعي، وسيعمل عليها بشكل مستقل وكامل مع عرض
          التقدم الحي لجميع المستخدمين.
        </p>
      </div>

      {/* Info — persistent storage */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-sm text-emerald-700 dark:text-emerald-300">
          <strong>ذاكرة دائمة:</strong> الأحاديث المستوردة تُحفظ على القرص في{" "}
          <code className="text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
            data/ai-hadiths.json
          </code>{" "}
          وتُحمَّل تلقائياً عند كل إعادة تشغيل للخادم. لن تُفقد البيانات بعد الآن.
        </div>
      </div>

      {/* Admin AI Chat Terminal */}
      <AdminAIChat onTaskTriggered={fetchTask} />

      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TASK_CARDS.map((card) => {
          const Icon = card.icon;
          const isThisRunning = isRunning && task?.type === card.type;
          const isThisCompleted = isCompleted && task?.type === card.type;
          const otherRunning = isRunning && task?.type !== card.type;

          return (
            <Card
              key={card.type}
              className={`p-5 space-y-4 transition-all duration-300 ${
                isThisRunning
                  ? "border-emerald-500/40 shadow-glass-emerald"
                  : isThisCompleted
                  ? "border-emerald-500/20"
                  : ""
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isThisRunning || isThisCompleted
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "glass-sm text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">
                    {card.title}
                  </h2>
                  <p className="text-xs text-slate-400">{card.subtitle}</p>
                </div>
                <div className="shrink-0 text-left">
                  <span className="text-2xl font-black text-emerald-500 tabular-nums">
                    {card.count}
                  </span>
                  <p className="text-[10px] text-slate-400 text-center">حديث</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {card.description}
              </p>

              {/* Progress (inline mini bar for active task) */}
              {isThisRunning && task && (
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{task.doneItems.toLocaleString("ar-EG")} / {task.totalItems.toLocaleString("ar-EG")}</span>
                    <span className="text-emerald-500 font-bold">{Math.round(task.progress)}٪</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-700"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {!isThisRunning ? (
                  <button
                    onClick={() => void startTask(card.type)}
                    disabled={loading || !!isRunning}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 btn-glass-emerald text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Play className="w-4 h-4" />
                    {otherRunning ? "مهمة أخرى تعمل" : isThisCompleted ? "إعادة الاستيراد" : "بدء الاستيراد"}
                  </button>
                ) : (
                  <button
                    onClick={() => void stopTask()}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                  >
                    <StopCircle className="w-4 h-4" />
                    إيقاف المهمة
                  </button>
                )}

                {(isThisCompleted || task?.type === card.type) && task && (
                  <button
                    onClick={() => void clearTask()}
                    disabled={loading || isThisRunning}
                    className="px-3 py-2.5 glass-sm rounded-xl text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="مسح السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Error display */}
              {lastError && task?.type === card.type && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {lastError}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Live Progress Panel */}
      {task && (
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            التقدم الحي
            {polling && (
              <span className="text-[10px] text-slate-400 font-normal">
                (تحديث كل ثانيتين)
              </span>
            )}
          </h2>
          <LiveProgressPanel task={task} />
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 rounded-2xl glass-sm">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          شريط التقدم مرئي لجميع المستخدمين في الموقع أثناء التنفيذ. يمكنك إغلاق هذه الصفحة والمهمة ستستمر على الخادم حتى الاكتمال أو إعادة التشغيل.
        </p>
      </div>
    </div>
  );
}
