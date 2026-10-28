import React from "react";
import Link from "next/link";
import {
  Scroll,
  BookOpen,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Compass,
  CheckCircle2,
} from "lucide-react";
import {
  getHadiths,
  getHadithCollections,
} from "@/lib/repositories/content-repository";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FavoriteButton } from "@/components/shared/FavoriteButton";

interface HadithPageProps {
  searchParams: {
    q?: string;
    collection?: string;
    type?: string;
    page?: string;
  };
}

const PAGE_SIZE = 25;

export default async function HadithPage({ searchParams }: HadithPageProps) {
  const query = searchParams.q || "";
  const hadithType = (searchParams.type === "qudsi" ? "qudsi" : "prophetic") as "prophetic" | "qudsi";
  const rawCollection = searchParams.collection;
  const collectionId = rawCollection === "all" ? undefined : (rawCollection || "coll-bukhari");
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));

  // Get total count matching this filter
  const allMatching = await getHadiths({
    query,
    collectionId: collectionId || undefined,
    type: hadithType,
  });

  const totalCount = allMatching.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const offset = (currentPage - 1) * PAGE_SIZE;
  const displayedHadiths = allMatching.slice(offset, offset + PAGE_SIZE);

  const collections = await getHadithCollections();

  const createUrl = (newParams: { type?: string; collection?: string; page?: number; q?: string }) => {
    const pType = newParams.type ?? hadithType;
    const pColl = newParams.collection ?? (collectionId || "all");
    const pPage = newParams.page ?? 1;
    const pQ = newParams.q ?? query;

    let url = `/hadith?type=${pType}&collection=${pColl}`;
    if (pPage > 1) url += `&page=${pPage}`;
    if (pQ) url += `&q=${encodeURIComponent(pQ)}`;
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-emerald text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Scroll className="w-4 h-4 shrink-0" />
          <span>ديوان السنة المطهرة والحديث الشريف</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          الجامع المسند للأحاديث النبوية والقدسية
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          تصفح الأحاديث المخرّجة من أصح كتب السنة النبوية، مصنفة بدقة بين الأحاديث النبوية
          والأحاديث القدسية مع أسانيدها ورواياتها وأبوابها الفقهية باللغة العربية الخالصة.
        </p>
      </div>

      {/* ── Primary Classification: Prophetic vs Qudsi Tabs ──────────────── */}
      <div className="glass-card rounded-2xl p-2 border border-white/10 flex flex-wrap gap-2 text-xs sm:text-sm font-bold">
        <Link
          href={createUrl({ type: "prophetic", page: 1 })}
          className={`flex-1 min-w-[140px] text-center py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            hadithType === "prophetic"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5"
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>الأحاديث النبوية الشريفة</span>
        </Link>

        <Link
          href={createUrl({ type: "qudsi", page: 1 })}
          className={`flex-1 min-w-[140px] text-center py-2.5 sm:py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            hadithType === "qudsi"
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>الأحاديث القدسية</span>
        </Link>
      </div>

      {/* ── Search Bar & Collection Sub-filters ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex-1 max-w-lg">
          <ArabicSearchInput
            initialQuery={query}
            placeholder={
              hadithType === "qudsi"
                ? "ابحث في الأحاديث القدسية (مثال: الظلم، الصوم، رحمتي سبقت غضبي...)"
                : "ابحث بلفظ الحديث أو الراوي (مثال: النيات، الحياء، الصلاة...)"
            }
          />
        </div>

        {/* Source / Collection Selector */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 glass-elevated rounded-2xl border border-white/10 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold px-2 hidden sm:inline">
            المصدر:
          </span>

          <Link
            href={createUrl({ collection: "all", page: 1 })}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              !collectionId || collectionId === "all"
                ? "bg-emerald-500 text-white font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            الكل
          </Link>

          {collections.map((coll) => (
            <Link
              key={coll.id}
              href={createUrl({ collection: coll.id, page: 1 })}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                collectionId === coll.id
                  ? "bg-emerald-500 text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {coll.name_ar}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Results Count Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          <span>يُعرض </span>
          <strong className="text-slate-800 dark:text-slate-200">
            {displayedHadiths.length}
          </strong>
          <span> من إجمالي </span>
          <strong className="text-emerald-600 dark:text-emerald-400">
            {totalCount.toLocaleString("ar-EG")}
          </strong>
          <span> حديث {hadithType === "qudsi" ? "قدسي" : "نبوي شريف"}</span>
        </div>

        {totalPages > 1 && (
          <span>
            الصفحة <strong>{currentPage}</strong> من <strong>{totalPages}</strong>
          </span>
        )}
      </div>

      {/* ── Hadith List (Paginated, Fast Rendering) ───────────────────────── */}
      {displayedHadiths.length > 0 ? (
        <div className="space-y-4">
          {displayedHadiths.map((h) => (
            <Card
              key={h.id}
              hoverEffect
              className="p-5 sm:p-6 transition-all border border-slate-200/80 dark:border-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/05 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="emerald">
                    {h.hadith_type === "qudsi" ? "حديث قدسي" : "حديث نبوي شريف"}
                  </Badge>

                  <span className="glass-sm px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 font-semibold">
                    {h.grade || "صحيح"}
                  </span>

                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    حديث #{h.hadith_number}
                  </span>

                  {h.chapter_title && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      • {h.chapter_title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <FavoriteButton
                    contentType="hadith"
                    contentId={h.id}
                    title={`حديث رقم ${h.hadith_number}`}
                    subtitle={h.takhrij}
                    url={`/hadith/${h.id}`}
                  />
                </div>
              </div>

              {/* Matn Preview in Amiri Calligraphy without overlapping Tashkeel */}
              <Link href={`/hadith/${h.id}`} className="block group py-1">
                <p className="font-traditional text-lg sm:text-2xl text-slate-800 dark:text-slate-100 leading-[2.3] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-3">
                  «{h.arabic_text}»
                </p>
              </Link>

              {/* Footer row */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/05 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  {h.narrator && (
                    <span>
                      الراوي:{" "}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {h.narrator}
                      </strong>
                    </span>
                  )}
                  <span className="text-slate-400">{h.takhrij}</span>
                </div>

                <Link
                  href={`/hadith/${h.id}`}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>عرض التخريج والشرح الكامل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لم نجد حديثاً يطابق خيارات البحث الحالية"
          description="تأكد من اختيار التبويب المناسب (نبوي / قدسي) أو تغيير عبارة البحث أو اختيار مصدر آخر."
          actionHref="/hadith"
          actionText="عرض كل الأحاديث"
        />
      )}

      {/* ── Ultra-Fast Pagination Controls ────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Link
            href={createUrl({ page: Math.max(1, currentPage - 1) })}
            aria-disabled={currentPage <= 1}
            className={`btn-glass px-3 py-2 rounded-xl text-xs flex items-center gap-1 ${
              currentPage <= 1 ? "opacity-30 pointer-events-none" : "hover:text-emerald-500"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
              }
              const isActive = pageNum === currentPage;
              return (
                <Link
                  key={pageNum}
                  href={createUrl({ page: pageNum })}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : "btn-glass text-slate-700 dark:text-slate-300 hover:text-emerald-500"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          <Link
            href={createUrl({ page: Math.min(totalPages, currentPage + 1) })}
            aria-disabled={currentPage >= totalPages}
            className={`btn-glass px-3 py-2 rounded-xl text-xs flex items-center gap-1 ${
              currentPage >= totalPages ? "opacity-30 pointer-events-none" : "hover:text-emerald-500"
            }`}
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
