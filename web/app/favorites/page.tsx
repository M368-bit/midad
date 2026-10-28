"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowLeft, Scroll, BookOpen, Library, GraduationCap, BookMarked } from "lucide-react";
import { Favorite } from "@/types";
import { getUserFavorites, toggleFavorite } from "@/lib/repositories/user-repository";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserFavorites(user?.id).then((items) => {
      setFavorites(items);
      setLoading(false);
    });
  }, [user?.id]);

  const handleRemove = async (fav: Favorite) => {
    await toggleFavorite(fav.content_type, fav.content_id, undefined, user?.id);
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
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
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Bookmark className="w-4 h-4" />
          <span>المحتوى المحفوظ</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          قائمتي المفضلة
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          الأحاديث والدروس والكتب والعلماء التي قمت بحفظها للرجوع إليها لاحقاً
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">
          جاري تحميل المفضلة...
        </div>
      ) : favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map((fav) => {
            const Icon = typeIcons[fav.content_type] || Bookmark;
            const targetUrl =
              fav.url ||
              `/${fav.content_type === "scholar" ? "scholars" : fav.content_type === "lesson" ? "lessons" : fav.content_type === "book" ? "books" : "hadith"}/${fav.content_id}`;

            return (
              <Card
                key={fav.id}
                hoverEffect
                className="p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="slate" size="sm">
                        {fav.content_type === "hadith"
                          ? "حديث"
                          : fav.content_type === "scholar"
                          ? "عالم"
                          : fav.content_type === "book"
                          ? "كتاب"
                          : "درس"}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {new Date(fav.created_at).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <Link href={targetUrl} className="block group">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate">
                        {fav.title || "عنصر محفوظ"}
                      </h3>
                    </Link>
                    {fav.subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {fav.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={targetUrl}
                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                    title="عرض"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleRemove(fav)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="حذف من المفضلة"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="قائمتك المفضلة فارغة حالياً"
          description="يمكنك النقر على أيقونة المفضلة عند تصفح أي حديث أو كتاب أو درس لإضافته إلى قائمتك الخاصة هنا."
          actionHref="/"
          actionText="تصفح المحتوى الموثق"
        />
      )}
    </div>
  );
}
