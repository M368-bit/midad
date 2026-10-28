import React from "react";
import Link from "next/link";
import {
  Search,
  Scroll,
  GraduationCap,
  Library,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Zap,
  BookMarked,
  Volume2,
} from "lucide-react";
import { searchMidad } from "@/lib/repositories/content-repository";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface SearchPageProps {
  searchParams: {
    q?: string;
    tab?: "all" | "quran" | "hadith" | "scholar" | "book" | "lesson";
  };
}

const typeLabels: Record<string, string> = {
  quran: "آية من القرآن الكريم",
  hadith: "حديث نبوي شريف",
  scholar: "ترجمة عالم",
  book: "كتاب ومصدر تراثي",
  lesson: "درس ومحاضرة",
};

const typeIcons = {
  all: Search,
  quran: BookMarked,
  hadith: Scroll,
  scholar: GraduationCap,
  book: Library,
  lesson: BookOpen,
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const tab = searchParams.tab || "all";

  const searchResults = await searchMidad(query);

  const filteredResults =
    tab === "all"
      ? searchResults.results
      : searchResults.results.filter((item) => item.type === tab);

  const tabs = [
    { key: "all", label: "جميع الأقسام", count: searchResults.total },
    { key: "quran", label: "القرآن الكريم", count: searchResults.quranCount || 0, icon: BookMarked },
    { key: "hadith", label: "الأحاديث النبوية", count: searchResults.hadithsCount, icon: Scroll },
    { key: "book", label: "أمهات الكتب", count: searchResults.booksCount, icon: Library },
    { key: "lesson", label: "الدروس والمحاضرات", count: searchResults.lessonsCount, icon: BookOpen },
    { key: "scholar", label: "العلماء والدعاة", count: searchResults.scholarsCount, icon: GraduationCap },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="relative z-20 space-y-4 max-w-3xl mx-auto text-center anim-fade-up d-0">
        <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>محرك البحث الشامل والمفسر الذكي</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          البحث الشرعي الموثق
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          ابحث في القرآن الكريم بتفسيره الميسر، والمتون الحديثية، وأمهات الكتب التراثية، والمحاضرات، وتراجم الأئمة.
        </p>
        <div className="pt-2 relative z-30">
          <ArabicSearchInput
            initialQuery={query}
            autoFocus={!query}
            redirectOnFocus={false}
            placeholder="ابحث بآية، حديث، كتاب، أو مسألة (مثال: الله نور السماوات، إنما الأعمال بالنيات، كتاب التوحيد...)"
          />
        </div>
      </div>

      {query ? (
        <div className="relative z-10 space-y-5 anim-fade-up d-100">
          {/* AI Badge & Stats Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 glass-sm rounded-xl px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>
                عُثر على <span className="font-bold text-emerald-600 dark:text-emerald-400">{searchResults.total}</span> نتيجة
                موثقة لـ «<span className="font-bold text-slate-800 dark:text-slate-200">{query}</span>»
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 glass-sm rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 anim-glow" />
              <span>فهرسة ذكية موثقة</span>
            </div>
          </div>

          {/* Section Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((t) => {
              const Icon = typeIcons[t.key as keyof typeof typeIcons];
              const isActive = tab === t.key;
              return (
                <Link
                  key={t.key}
                  href={`/search?q=${encodeURIComponent(query)}&tab=${t.key}`}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "btn-glass-emerald shadow-glass-emerald"
                      : "glass-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{t.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {t.count}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Results List */}
          {filteredResults.length > 0 ? (
            <div className="space-y-3.5">
              {filteredResults.map((item, i) => {
                const Icon = typeIcons[item.type as keyof typeof typeIcons] || Search;
                const isQuran = item.type === "quran";

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 anim-fade-up ${
                      isQuran ? "border-emerald-500/40 bg-emerald-950/10" : ""
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="space-y-2.5 flex-1 min-w-0">
                      {/* Type Badge Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isQuran
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "glass-emerald text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {typeLabels[item.type] || item.type}
                        </span>
                        {item.badge && (
                          <Badge variant="slate" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                        <span className="text-[10px] glass-sm rounded-lg px-2 py-0.5 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-emerald-500" />
                          <span>مطابقة ذكية</span>
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={item.url} className="block group">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>

                      {item.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Text / Verse */}
                      {item.snippet && (
                        <p
                          className={`leading-relaxed ${
                            isQuran
                              ? "font-traditional font-bold text-emerald-300 text-base sm:text-lg p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20"
                              : "text-xs text-slate-600 dark:text-slate-400 leading-6 font-traditional line-clamp-3"
                          }`}
                        >
                          {isQuran ? `﴿ ${item.snippet} ﴾` : item.snippet}
                        </p>
                      )}

                      {/* Tafsir box for Quran */}
                      {isQuran && item.tafsir && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed text-justify">
                          <span className="font-bold text-emerald-400">التفسير الميسر: </span>
                          {item.tafsir}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 self-start sm:self-center flex sm:flex-col items-center gap-2">
                      <Link
                        href={item.url}
                        className="btn-glass-emerald text-xs px-3.5 py-2 font-semibold flex items-center gap-1.5"
                      >
                        {isQuran ? (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>المصحف والتلاوة</span>
                          </>
                        ) : (
                          <>
                            <span>الانتقال</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={`لا توجد نتائج مطابقة لـ "${query}" في هذا القسم`}
              description="تأكد من كتابة الكلمات بدقة، أو اختر قسماً آخر من شريط التصنيفات بالأعلى."
              actionHref="/search"
              actionText="عرض كل النتائج"
            />
          )}
        </div>
      ) : (
        /* Default guidance */
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto anim-fade-up d-200">
          <div className="w-16 h-16 rounded-2xl glass-emerald flex items-center justify-center mx-auto anim-float">
            <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xl">
            أقسام البحث الشرعي في منصة مداد
          </h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3 text-right">
            {[
              "القرآن الكريم: ابحث عن أي آية واستعرض رسمها العثماني وتفسيرها الميسر فوراً",
              "الحديث الشريف: بحث دقيق في الصحاح والسنن مع إظهار درجات الصحة وتخريج الأئمة",
              "المكتبة الإسلامية: خزانة أمهات الكتب التراثية المحققة مع مشغل PDF داخلي متكامل",
              "الدروس والمحاضرات: استمع للمحاضرات الصوتية المؤصلة وشروح كبار الأئمة",
              "تراجم الأئمة والعلماء: سير موثقة للمحدثين والفقهاء والمفسرين عبر القرون الهجرية",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg glass-emerald flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                    {i + 1}
                  </span>
                </span>
                <span className="leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
