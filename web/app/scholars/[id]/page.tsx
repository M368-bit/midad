import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Library,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  getScholarBySlug, getScholars,
  getBooks,
  getLessons,
} from "@/lib/repositories/content-repository";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ContentCard } from "@/components/shared/ContentCard";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { SourceVerificationBadge } from "@/components/shared/SourceVerificationBadge";

interface ScholarDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ScholarDetailPage({ params }: ScholarDetailPageProps) {
  const scholar = await getScholarBySlug(params.id);

  if (!scholar) {
    notFound();
  }

  const [allBooks, allLessons] = await Promise.all([
    getBooks({ scholarId: scholar.id }),
    getLessons({ scholarId: scholar.id }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/scholars"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى دليل العلماء</span>
        </Link>
        <FavoriteButton
          contentType="scholar"
          contentId={scholar.id}
          title={scholar.name}
          subtitle={scholar.title || undefined}
          url={`/scholars/${scholar.slug}`}
        />
      </div>

      {/* Scholar Profile Header */}
      <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-[#09101c]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" size="md">
                {scholar.era || "عالم موثق"}
              </Badge>
              {scholar.title && (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {scholar.title}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {scholar.name}
            </h1>

            {/* Life years */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              {scholar.birth_year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>المولد: {scholar.birth_year} هـ</span>
                </div>
              )}
              {scholar.death_year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>الوفاة: {scholar.death_year} هـ</span>
                </div>
              )}
              {scholar.is_contemporary && (
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  (عالم معاصر)
                </div>
              )}
            </div>

            {/* Biography */}
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl text-justify pt-2">
              {scholar.bio}
            </p>
          </div>
        </div>

        {/* Verified Sources for Scholar */}
        {scholar.sources && scholar.sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>مراجع وتوثيق ترجمة العالم</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scholar.sources.map((src) => (
                <div
                  key={src.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {src.title}
                  </span>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>المصدر الأصلي</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Associated Lessons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span>الدروس والمحاضرات المسجلة ({allLessons.length})</span>
        </h2>
        {allLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allLessons.map((lesson) => (
              <ContentCard
                key={lesson.id}
                type="lesson"
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                href={`/lessons/${lesson.slug}`}
                badge={lesson.media_type === "audio" ? "صوتي" : "مرئي"}
                metadata={`${lesson.duration_minutes || 45} دقيقة`}
                sourceUrl={lesson.sources?.[0]?.original_url}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
            لا تتوفر تسجيلات صوتية معاصرة لهذا العالم الجليل، حيث إنه من أئمة التراث المتقدمين.
          </div>
        )}
      </section>

      {/* Associated Books */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-emerald-600" />
          <span>المؤلفات والكتب الموثقة ({allBooks.length})</span>
        </h2>
        {allBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allBooks.map((book) => (
              <ContentCard
                key={book.id}
                type="book"
                id={book.id}
                title={book.title}
                description={book.description}
                href={`/books/${book.slug}`}
                badge="نطاق عام"
                metadata={`${book.pages_count} صفحة • ${book.volumes_count} مجلد`}
                sourceUrl={book.sources?.[0]?.source_url}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
            لم تُضف كتب موثقة بعد لهذا العالم في قاعدة بيانات مداد.
          </div>
        )}
      </section>
    </div>
  );
}

export async function generateStaticParams() { const scholars = await getScholars(); return scholars.map(s => ({ id: s.slug })); }
