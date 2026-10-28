"use client";

import React, { useState, useEffect, useRef } from "react";
import { Zap, CheckCircle2, AlertCircle, X } from "lucide-react";

interface TaskState {
  id: string;
  type: string;
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
}

export function AITaskProgress() {
  const [task, setTask] = useState<TaskState | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource("/api/ai-task/stream");
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as { task: TaskState | null };
        const t = data.task;
        setTask(t);
        if (t && (t.status === "running" || t.status === "paused")) {
          setVisible(true);
          setDismissed(false);
        }
        if (t && (t.status === "completed" || t.status === "error")) {
          setVisible(true);
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => setVisible(false), 5000);
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };
  };

  // Poll to check if a task starts
  useEffect(() => {
    const checkTask = async () => {
      try {
        const res = await fetch("/api/ai-task");
        if (!res.ok) return;
        const data = (await res.json()) as { activeTask: TaskState | null };
        const t = data.activeTask;
        if (t && (t.status === "running" || t.status === "paused")) {
          setTask(t);
          setVisible(true);
          setDismissed(false);
          connectSSE();
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // ignore
      }
    };

    void checkTask();
    pollRef.current = setInterval(() => {
      void checkTask();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible || dismissed || !task) return null;

  const isCompleted = task.status === "completed";
  const isError = task.status === "error";
  const isRunning = task.status === "running";

  return (
    <div
      className="fixed top-[72px] left-0 right-0 z-40 px-4 py-2 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label="تقدم مهمة الذكاء الاصطناعي"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div
          className={`glass-elevated rounded-2xl border shadow-glass-dark p-3 sm:p-4 transition-all duration-500 ${
            isCompleted
              ? "border-emerald-500/30"
              : isError
              ? "border-red-500/30"
              : "border-white/20 dark:border-white/10"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
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
                <Zap
                  className={`w-5 h-5 text-emerald-400 ${
                    isRunning ? "anim-glow" : ""
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {task.title}
                </span>
                {isRunning && (
                  <span className="shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-semibold">
                      يعمل
                    </span>
                  </span>
                )}
                {isCompleted && (
                  <span className="shrink-0 text-[10px] text-emerald-500 font-semibold">
                    اكتملت ✓
                  </span>
                )}
                {isError && (
                  <span className="shrink-0 text-[10px] text-red-500 font-semibold">
                    خطأ ✗
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="relative h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCompleted
                      ? "bg-emerald-500"
                      : isError
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  }`}
                  style={{ width: `${task.progress}%` }}
                >
                  {isRunning && (
                    <div className="absolute inset-0 shimmer-parent overflow-hidden rounded-full">
                      <div className="shimmer-bar" />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="font-bold text-emerald-500">
                  {Math.round(task.progress)}٪
                </span>
                <span>
                  {task.doneItems.toLocaleString("ar-EG")} /{" "}
                  {task.totalItems.toLocaleString("ar-EG")}
                </span>
                {task.failedItems > 0 && (
                  <span className="text-red-400">
                    {task.failedItems} فشل
                  </span>
                )}
                {task.currentItem && isRunning && (
                  <span className="truncate max-w-[160px] sm:max-w-xs">
                    ← {task.currentItem}
                  </span>
                )}
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/10 transition-colors"
              aria-label="إخفاء"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
