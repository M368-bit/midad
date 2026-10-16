import React from "react";
import Link from "next/link";
import {
  Search,
  Scroll,
  GraduationCap,
  Library,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { searchMidad } from "@/lib/repositories/content-repository";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface SearchPageProps {
  searchParams: {
    q?: string;
    tab?: "all" | "hadith" | "scholar" | "book" | "lesson";
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const tab = searchParams.tab || "all";

  const searchResults = await searchMidad(query);

  const filteredResults =
    tab === "all"
      ? searchResults.results
      : searchResults.results.filter((item) => item.type === tab);

  const tabIcons = {
    all: Search,
    hadith: Scroll,
    scholar: GraduationCap,
    book: Library,
    lesson: BookOpen,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="space-y-4 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          البحث الشرعي الموثق
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          محرك بحث دقيق في المتون الحديثية وتراجم الأئمة والمكتبة والدروس، يدعم معالجة التشكيل وتوحيد الحروف العربية.
        </p>
        <ArabicSearchInput
          initialQuery={query}
          autoFocus={!query}
          placeholder="ابحث بكلمة أو عبارة (مثال: النية، ابن عثيمين، التوحيد...)"
        />
      </div>

      {query ? (
        <div className="space-y-6">
          {/* Facets Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=all`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors ${
                tab === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>جميع النتائج</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {searchResults.total}
              </span>
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=hadith`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors ${
                tab === "hadith"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Scroll className="w-4 h-4" />
              <span>الأحاديث</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {searchResults.hadithsCount}
              </span>
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=scholar`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors ${
                tab === "scholar"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>العلماء</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {searchResults.scholarsCount}
              </span>
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=book`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors ${
                tab === "book"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Library className="w-4 h-4" />
              <span>الكتب</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {searchResults.booksCount}
              </span>
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(query)}&tab=lesson`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors ${
                tab === "lesson"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>الدروس</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {searchResults.lessonsCount}
              </span>
            </Link>
          </div>

          {/* Results List */}
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((item) => {
                const Icon = tabIcons[item.type];
                return (
                  <Card
                    key={`${item.type}-${item.id}`}
                    hoverEffect
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.type === "hadith"
                            ? "حديث نبوي شريف"
                            : item.type === "scholar"
                            ? "ترجمة عالم"
                            : item.type === "book"
                            ? "كتاب إسلامي"
                            : "درس ومحاضرة"}
                        </span>
                        {item.badge && (
                          <Badge variant="slate" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </div>

                      <Link href={item.url} className="block group">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                      </Link>

                      {item.subtitle && (
                        <p className="text-xs text-slate-500 font-medium">
                          {item.subtitle}
                        </p>
                      )}

                      {item.snippet && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-traditional pt-1">
                          {item.snippet}
                        </p>
                      )}
                    </div>

                    <Link
                      href={item.url}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                    >
                      <span>الانتقال للمحتوى</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={`لا توجد نتائج مطابقة لـ "${query}"`}
              description="تأكد من عدم وجود أخطاء إملائية. يدعم محرك بحث مداد البحث دون تشكيل وبصيغ الهمزات المختلفة."
            />
          )}
        </div>
      ) : (
        /* Default Search Guidance */
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            مميزات محرك بحث مداد الإسلامي
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 text-right">
            <li>• إزالة آلية للتشكيل والحركات لتسهيل الوصول للألفاظ النبوية.</li>
            <li>• توحيد أشكال الهمزات (أ، إ، آ) والألف المقصورة (ى) والتاء المربوطة (ة).</li>
            <li>• بحث شامل في المتون، وشروح الأحاديث، وتراجم العلماء، وفهارس الكتب.</li>
            <li>• نتائج حقيقية موثقة مستندة للمصادر دون اختلاق أو ذكاء اصطناعي توليدي غير مسند.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
