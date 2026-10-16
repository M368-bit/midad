import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  getLessonBySlug,
  getLessons,
} from "@/lib/repositories/content-repository";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MediaPlayer } from "@/components/lessons/MediaPlayer";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { SourceVerificationBadge } from "@/components/shared/SourceVerificationBadge";

interface LessonDetailPageProps {
  params: {
    id: string;
  };
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const lesson = await getLessonBySlug(params.id);

  if (!lesson) {
    notFound();
  }

  const relatedLessons = await getLessons({
    scholarId: lesson.scholar_id || undefined,
  });

  const otherLessons = relatedLessons.filter((l) => l.id !== lesson.id).slice(0, 2);
  const primarySource = lesson.sources?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى الدروس والمحاضرات</span>
        </Link>
        <FavoriteButton
          contentType="lesson"
          contentId={lesson.id}
          title={lesson.title}
          subtitle={lesson.scholar?.name || undefined}
          url={`/lessons/${lesson.slug}`}
        />
      </div>

      {/* Main Lesson Card */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" size="md">
              {lesson.media_type === "audio" ? "درس صوتي" : "درس مرئي"}
            </Badge>
            {lesson.category && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {lesson.category.name_ar}
              </span>
            )}
            <SourceVerificationBadge
              isVerified={primarySource?.is_verified ?? true}
              sourceTitle={primarySource?.publisher || undefined}
              sourceUrl={primarySource?.original_url}
              verifiedAt={primarySource?.verified_at}
            />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {lesson.title}
          </h1>

          {/* Scholar attribution */}
          {lesson.scholar && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">فضيلة الشيخ:</span>
              <Link
                href={`/scholars/${lesson.scholar.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{lesson.scholar.name}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Media Player */}
        <MediaPlayer
          mediaUrl={lesson.media_url}
          mediaType={lesson.media_type}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
        />

        {/* Description & Scientific Summary */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>نبذة وتفريغ الدرس العلمي</span>
          </h2>
          <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-none text-justify">
            {lesson.description || "لم يفرغ هذا الدرس كتابياً بعد. يمكنك الاستماع للتسجيل الكامل أعلاه."}
          </div>
        </Card>

        {/* Verified Original Source Box */}
        {primarySource && (
          <Card className="p-5 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>بيانات المصدر الأصلي المعتمد</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  الجهة الناشرة: <span className="font-semibold">{primarySource.publisher || primarySource.title}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  تم فحص هذا الرابط والتحقق من صحته وخلوه من المخالفات الفنية والشرعية.
                </p>
              </div>
              <a
                href={primarySource.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition-colors shadow-sm shrink-0"
              >
                <span>الانتقال للمصدر الأصلي</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </Card>
        )}
      </div>

      {/* Related Lessons */}
      {otherLessons.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            دروس أخرى لنفس العالم
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherLessons.map((l) => (
              <Link
                key={l.id}
                href={`/lessons/${l.slug}`}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-emerald-500/40 transition-colors block group"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {l.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {l.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
