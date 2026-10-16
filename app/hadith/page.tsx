import React from "react";
import Link from "next/link";
import { Scroll, BookOpen, Layers } from "lucide-react";
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
  };
}

export default async function HadithPage({ searchParams }: HadithPageProps) {
  const query = searchParams.q || "";
  const collectionId = searchParams.collection || "coll-bukhari";

  const [hadiths, collections] = await Promise.all([
    getHadiths({
      query,
      collectionId,
    }),
    getHadithCollections(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Scroll className="w-4 h-4" />
          <span>الجامع الصحيح المسند</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          الحديث النبوي الشريف
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          تصفح الأحاديث الصحيحة من أمهات كتب السنة (صحيح البخاري، صحيح مسلم)،
          مخرجة ومحققة بالأسانيد والتبويب الفقهي المعتمد.
        </p>
      </div>

      {/* Search and Collection Switcher */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <ArabicSearchInput
            initialQuery={query}
            placeholder="ابحث بلفظ الحديث أو الراوي (مثال: النيات، الحياء، سلم المسلمون...)"
          />
        </div>

        {/* Collections Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {collections.map((coll) => (
            <Link
              key={coll.id}
              href={`/hadith?collection=${coll.id}${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                collectionId === coll.id
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {coll.name_ar}
            </Link>
          ))}
        </div>
      </div>

      {/* Hadith List */}
      {hadiths.length > 0 ? (
        <div className="space-y-5">
          {hadiths.map((h) => (
            <Card
              key={h.id}
              hoverEffect
              className="p-6 transition-all border border-slate-200/80 dark:border-slate-800/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">{h.grade}</Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    رقم الحديث: {h.hadith_number}
                  </span>
                  {h.chapter_title && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:inline">
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

              {/* Matn Preview */}
              <Link href={`/hadith/${h.id}`} className="block group">
                <p className="font-traditional text-base sm:text-xl text-slate-800 dark:text-slate-100 leading-[2.2] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-3">
                  «{h.arabic_text}»
                </p>
              </Link>

              {/* Footer info */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  {h.narrator && (
                    <span>
                      الراوي: <strong className="text-slate-700 dark:text-slate-300">{h.narrator}</strong>
                    </span>
                  )}
                  <span className="text-slate-400">{h.takhrij}</span>
                </div>

                <Link
                  href={`/hadith/${h.id}`}
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  عرض النص الكامل والتخريج والشرح ←
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لم نجد حديثاً يطابق بحثك في هذا الباب"
          description="تأكد من ضبط ألفاظ البحث أو تصفح باقي المجموعات الحديثية."
          actionHref="/hadith"
          actionText="عرض كل الأحاديث"
        />
      )}
    </div>
  );
}
