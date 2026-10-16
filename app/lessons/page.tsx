import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  getLessons,
  getCategories,
  getScholars,
} from "@/lib/repositories/content-repository";
import { ContentCard } from "@/components/shared/ContentCard";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

interface LessonsPageProps {
  searchParams: {
    q?: string;
    category?: string;
    scholar?: string;
    type?: string;
  };
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const query = searchParams.q || "";
  const categoryId = searchParams.category;
  const scholarId = searchParams.scholar;
  const mediaType = searchParams.type;

  const [lessons, categories, scholars] = await Promise.all([
    getLessons({
      query,
      categoryId,
      scholarId,
      mediaType,
    }),
    getCategories(),
    getScholars(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>المحاضرات والشروح العلمية</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          الدروس والمحاضرات
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          تسجيلات صوتية ومرئية مسندة لشروح كتب الحديث والفقه والعقيدة، مأخوذة من
          المواقع والمؤسسات العلمية الرسمية المعتمدة.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="max-w-md">
          <ArabicSearchInput
            initialQuery={query}
            placeholder="ابحث عن درس (مثال: شرح حديث النيات، التوحيد...)"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <Link
            href="/lessons"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              !categoryId
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            جميع العلوم
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/lessons?category=${c.id}${query ? `&q=${query}` : ""}`}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                categoryId === c.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {c.name_ar}
            </Link>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      {lessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <ContentCard
              key={lesson.id}
              type="lesson"
              id={lesson.id}
              title={lesson.title}
              subtitle={lesson.scholar?.name}
              description={lesson.description}
              href={`/lessons/${lesson.slug}`}
              badge={lesson.media_type === "audio" ? "صوتي" : "مرئي"}
              metadata={`${lesson.duration_minutes || 45} دقيقة`}
              sourceUrl={lesson.sources?.[0]?.original_url}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="لم نجد درساً يطابق بحثك"
          description="تأكد من اختيار تصنيف صحيح أو جرب كلمات بحث أخرى."
          actionHref="/lessons"
          actionText="عرض جميع الدروس"
        />
      )}
    </div>
  );
}
