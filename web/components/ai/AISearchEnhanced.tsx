"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Library,
  Scroll,
  Search,
  Loader2,
  ChevronLeft,
  BookMarked,
} from "lucide-react";
import type { AISearchResult, AISearchResponse } from "@/lib/ai-search";

interface AISearchEnhancedProps {
  query: string;
  /** Ref of the input's container div — used to position the dropdown */
  anchorRef?: React.RefObject<HTMLDivElement>;
  onNavigate?: () => void;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  quran: BookMarked,
  hadith: Scroll,
  scholar: GraduationCap,
  book: Library,
  lesson: BookOpen,
};

const TYPE_LABELS: Record<string, string> = {
  quran: "آية قرآنية",
  hadith: "حديث",
  scholar: "عالم",
  book: "كتاب",
  lesson: "درس",
};

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 80
      ? "bg-emerald-500"
      : value >= 50
      ? "bg-amber-400"
      : "bg-slate-400";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums font-medium text-slate-400 dark:text-slate-500">
        {value}٪
      </span>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded bg-slate-200 dark:bg-white/10 w-3/4" />
        <div className="h-2.5 rounded bg-slate-200 dark:bg-white/10 w-1/2" />
        <div className="h-1 rounded-full bg-slate-200 dark:bg-white/10 w-full" />
      </div>
    </div>
  );
}

// ── Dropdown content (rendered via portal) ────────────────────────────────────

interface DropdownProps {
  rect: DOMRect;
  response: AISearchResponse | null;
  loading: boolean;
  error: boolean;
  query: string;
  onSelect: (url: string) => void;
  onRetry: () => void;
}

function Dropdown({
  rect,
  response,
  loading,
  error,
  query,
  onSelect,
  onRetry,
}: DropdownProps) {
  const style: React.CSSProperties = {
    position: "fixed",
    top: rect.bottom + 8,
    right: window.innerWidth - rect.right,
    left: rect.left,
    zIndex: 9999,
  };

  return (
    <div id="ai-search-dropdown-portal" style={style} className="anim-fade-up" role="listbox" aria-label="نتائج البحث الذكي">
      <div className="glass-elevated rounded-2xl border border-white/20 dark:border-white/10 shadow-glass-dark overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 dark:border-white/5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">
            بحث ذكي بالذكاء الاصطناعي
          </span>
          {response && (
            <span className="mr-auto text-[10px] text-slate-400">
              {response.totalFound} نتيجة • {response.processingTimeMs}ms
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div>
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-slate-400">حدث خطأ أثناء البحث</p>
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-emerald-500 hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && response && response.results.length === 0 && (
          <div className="px-4 py-6 text-center">
            <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">
              لم يُعثر على نتائج لـ &ldquo;{query}&rdquo;
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              حاول كلمات أخرى أو تحقق من التهجئة
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && response && response.results.length > 0 && (
          <ul className="max-h-[420px] overflow-y-auto divide-y divide-white/5">
            {response.results.map((result: AISearchResult, idx: number) => {
              const Icon = TYPE_ICONS[result.type] ?? Search;
              const isTop = idx === 0;

              return (
                <li key={result.id}>
                  <button
                    role="option"
                    aria-selected={isTop}
                    onClick={() => onSelect(result.url)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(result.url);
                    }}
                    className={`w-full text-right flex items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-emerald-500/10 focus:outline-none focus:bg-emerald-500/10 ${
                      isTop
                        ? "bg-emerald-500/5 border-r-2 border-emerald-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                        isTop
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "glass-sm text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {result.title}
                        </span>
                        {isTop && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold shrink-0">
                            أفضل تطابق
                          </span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full glass-sm text-slate-400 shrink-0">
                          {TYPE_LABELS[result.type] ?? result.type}
                        </span>
                      </div>

                      {result.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {result.subtitle}
                        </p>
                      )}

                      {result.snippet && (
                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          result.type === "quran"
                            ? "font-traditional font-bold text-emerald-400 text-xs"
                            : "text-slate-400 dark:text-slate-500"
                        }`}>
                          {result.snippet}
                        </p>
                      )}

                      {result.tafsir && (
                        <div className="mt-1.5 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300/90 line-clamp-2 text-right">
                          <span className="font-bold text-emerald-400">التفسير: </span>
                          {result.tafsir}
                        </div>
                      )}

                      <ConfidenceBar value={result.confidence} />

                      <p className="text-[10px] text-slate-400 mt-1">
                        {result.matchReason}
                      </p>
                    </div>

                    <ChevronLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 mt-1.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-slate-400">مدعوم بالذكاء الاصطناعي</span>
          </div>
          {loading && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AISearchEnhanced({ query, anchorRef, onNavigate }: AISearchEnhancedProps) {
  const router = useRouter();
  const [response, setResponse] = useState<AISearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const selfRef = useRef<HTMLDivElement>(null);

  // Resolve the anchor element (either anchorRef prop or closest parent div)
  const anchorEl = anchorRef?.current ?? selfRef.current?.parentElement ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update rect on scroll/resize so the portal stays aligned
  useEffect(() => {
    if (!mounted || !anchorEl) return;
    const update = () => setRect(anchorEl.getBoundingClientRect());
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [mounted, anchorEl]);

  const fetchResults = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/ai-search?q=${encodeURIComponent(q)}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("fetch failed");
      const data: AISearchResponse = await res.json();
      setResponse(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResponse(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => void fetchResults(query.trim()), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  const handleSelect = (url: string) => {
    onNavigate?.();
    router.push(url);
  };

  const visible = query.trim().length >= 2 && (loading || response !== null || error);

  // Invisible sentinel so we can find the anchor element
  const sentinel = <div ref={selfRef} className="hidden" aria-hidden />;

  if (!mounted || !visible) return sentinel;

  // Compute rect fresh on every render (anchorEl may have updated)
  const liveRect = anchorEl?.getBoundingClientRect() ?? rect;
  if (!liveRect) return sentinel;

  return (
    <>
      {sentinel}
      {createPortal(
        <Dropdown
          rect={liveRect}
          response={response}
          loading={loading}
          error={error}
          query={query}
          onSelect={handleSelect}
          onRetry={() => void fetchResults(query.trim())}
        />,
        document.body
      )}
    </>
  );
}
