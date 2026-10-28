"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, Trash2, ArrowLeft, Clock, BookOpen, Scroll, Library, GraduationCap, BookMarked } from "lucide-react";
import { UserHistoryItem } from "@/types";
import { getUserHistory } from "@/lib/repositories/user-repository";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserHistory(user?.id).then((items) => {
      setHistory(items);
      setLoading(false);
    });
  }, [user?.id]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem("midad_history_local");
      setHistory([]);
    } catch {}
  };

  const typeIcons: Record<string, any> = {
    hadith: Scroll,
    scholar: GraduationCap,
    book: Library,
    lesson: BookOpen,
    quran: BookMarked,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <History className="w-4 h-4" />
            <span>سجل التصفح والنشاط</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            سجل النشاط والاستماع
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            قائمة بالدروس والأحاديث والكتب التي اطلعت عليها مؤخراً
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح السجل</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">
          جاري تحميل السجل...
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => {
            const Icon = typeIcons[item.content_type] || BookOpen;
            const targetUrl =
              item.url ||
              `/${item.content_type === "scholar" ? "scholars" : item.content_type === "lesson" ? "lessons" : item.content_type === "book" ? "books" : "hadith"}/${item.content_id}`;

            return (
              <Card
                key={item.id}
                hoverEffect
                className="p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="slate" size="sm">
                        {item.content_type === "hadith"
                          ? "حديث"
                          : item.content_type === "scholar"
                          ? "عالم"
                          : item.content_type === "book"
                          ? "كتاب"
                          : "درس"}
                      </Badge>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(item.last_viewed_at).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    </div>
                    <Link href={targetUrl} className="block group">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate">
                        {item.title}
                      </h3>
                    </Link>
                  </div>
                </div>

                <Link
                  href={targetUrl}
                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                  title="متابعة"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="لا يوجد نشاط مسجل بعد"
          description="عندما تستمع إلى الدروس أو تتصفح الأحاديث والكتب، سيتم حفظ تقدمك تلقائياً هنا."
          actionHref="/lessons"
          actionText="استكشف الدروس والمحاضرات"
        />
      )}
    </div>
  );
}
