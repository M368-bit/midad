import React from "react";
import { GraduationCap } from "lucide-react";
import { getScholars } from "@/lib/repositories/content-repository";
import { ContentCard } from "@/components/shared/ContentCard";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

interface ScholarsPageProps {
  searchParams: {
    q?: string;
    filter?: "all" | "contemporary" | "classical";
  };
}

export default async function ScholarsPage({ searchParams }: ScholarsPageProps) {
  const query = searchParams.q || "";
  const filter = searchParams.filter || "all";

  const isContemporary =
    filter === "contemporary" ? true : filter === "classical" ? false : undefined;

  const scholars = await getScholars({
    query,
    isContemporary,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>تراجم الأئمة وأهل العلم</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          العلماء والدعاة
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          دليل موثق لسير أئمة الإسلام وعلماء الأمة المعتمدين، متضمناً مؤلفاتهم
          ودروسهم المسجلة والمصادر التاريخية لترجمتهم.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <ArabicSearchInput
            initialQuery={query}
            placeholder="ابحث عن عالم (مثال: البخاري، النووي، ابن عثيمين...)"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Link
            href={`/scholars?filter=all${query ? `&q=${query}` : ""}`}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            الكل
          </Link>
          <Link
            href={`/scholars?filter=classical${query ? `&q=${query}` : ""}`}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === "classical"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            الأئمة المتقدمون
          </Link>
          <Link
            href={`/scholars?filter=contemporary${query ? `&q=${query}` : ""}`}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === "contemporary"
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            العلماء المعاصرون
          </Link>
        </div>
      </div>

      {/* Scholars Grid */}
      {scholars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholars.map((scholar) => (
            <ContentCard
              key={scholar.id}
              type="scholar"
              id={scholar.id}
              title={scholar.name}
              subtitle={scholar.title}
              description={scholar.bio}
              href={`/scholars/${scholar.slug}`}
              badge={scholar.era || "عالم موثق"}
              metadata={
                scholar.death_year
                  ? `توفي عام ${scholar.death_year} هـ`
                  : scholar.is_contemporary
                  ? "معاصر"
                  : undefined
              }
              sourceUrl={scholar.sources?.[0]?.url}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="لم نجد عالماً مطابقاً لبحثك"
          description="تأكد من كتابة الاسم بصورة صحيحة، أو تصفح القائمة العامة للعلماء المعتمدين في المنصة."
          actionHref="/scholars"
          actionText="إعادة ضبط الفلاتر"
        />
      )}
    </div>
  );
}
