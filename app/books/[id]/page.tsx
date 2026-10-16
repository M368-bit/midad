import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Library,
  GraduationCap,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Download,
  FileText,
} from "lucide-react";
import { getBookBySlug } from "@/lib/repositories/content-repository";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { SourceVerificationBadge } from "@/components/shared/SourceVerificationBadge";

interface BookDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const book = await getBookBySlug(params.id);

  if (!book) {
    notFound();
  }

  const primarySource = book.sources?.[0];

  const rightsLabel = {
    public_domain: "نطاق عام (تراث إسلامي مفتوح)",
    waqf: "وقف لله تعالى",
    publisher_permission: "مرخص بإذن الناشر",
  }[book.usage_rights];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى المكتبة الإسلامية</span>
        </Link>
        <FavoriteButton
          contentType="book"
          contentId={book.id}
          title={book.title}
          subtitle={book.author?.name || undefined}
          url={`/books/${book.slug}`}
        />
      </div>

      {/* Main Book Information Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-[#09111e]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" size="md">
              {rightsLabel}
            </Badge>
            {book.category && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {book.category.name_ar}
              </span>
            )}
            <SourceVerificationBadge
              isVerified={primarySource?.is_verified ?? true}
              sourceTitle={primarySource?.source_name}
              sourceUrl={primarySource?.source_url}
              verifiedAt={primarySource?.verified_at}
            />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {book.title}
          </h1>

          {/* Author attribution */}
          {book.author && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">المؤلف:</span>
              <Link
                href={`/scholars/${book.author.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{book.author.name}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Book Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">سنة التأليف / الوفاة:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {book.publication_year ? `${book.publication_year} هـ` : "تراثي"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">عدد المجلدات:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {book.volumes_count || 1} مجلد
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">عدد الصفحات التقريبي:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {book.pages_count || "غير محدد"} صفحة
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">حقوق الاستخدام:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              متاح ومصرح
            </span>
          </div>
        </div>

        {/* Actions: Read / Download */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {book.read_url && (
            <a
              href={book.read_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>قراءة الكتاب أونلاين (المكتبة المعتمدة)</span>
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
            </a>
          )}
          {book.download_url && (
            <a
              href={book.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>تحميل النسخة المصورة (PDF)</span>
            </a>
          )}
        </div>

        {/* Description / Summary */}
        <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>نبذة عن الكتاب وقيمته العلمية</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
            {book.description}
          </p>
        </div>

        {/* Source Documentation Box */}
        {primarySource && (
          <div className="p-4 rounded-xl bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-900/30 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>توثيق النشر وحقوق الملكية الفكرية</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              المصدر الرقمي المعتمد: {primarySource.source_name}
            </p>
            <p className="text-slate-500 text-[11px]">
              تؤكد منصة مداد التزامها التام بعدم رفع أي كتاب تحميه حقوق ملكية فكرية تجارية دون ترخيص رسمي مسبق.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
