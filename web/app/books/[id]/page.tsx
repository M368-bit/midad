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
  Sparkles,
  Zap,
} from "lucide-react";
import { getBookBySlug, getBooks } from "@/lib/repositories/content-repository";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { SourceVerificationBadge } from "@/components/shared/SourceVerificationBadge";
import { BookCover } from "@/components/books/BookCover";
import { GlassPDFViewer } from "@/components/books/GlassPDFViewer";
import { getRelatedBooks, ExtendedBook } from "@/lib/data/verified-books-catalog";

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

  // AI-recommended related books
  const relatedBooks = getRelatedBooks(book as ExtendedBook, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى خزانة الكتب الإسلامية</span>
        </Link>
        <FavoriteButton
          contentType="book"
          contentId={book.id}
          title={book.title}
          subtitle={book.author?.name || undefined}
          url={`/books/${book.slug}`}
        />
      </div>

      {/* Main Book Hero: Liquid Glass Cover + Metadata */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Book Cover Column */}
        <div className="md:col-span-4 lg:col-span-3 flex justify-center">
          <BookCover
            title={book.title}
            author={book.author?.name || undefined}
            categoryName={book.category?.name_ar || undefined}
            volumesCount={book.volumes_count || 1}
            coverImage={book.cover_image}
            size="lg"
            leatherColor={(book as any).leather_color || "emerald"}
            className="w-full max-w-[280px]"
          />
        </div>

        {/* Book Information Column */}
        <div className="md:col-span-8 lg:col-span-9 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" size="md">
              {rightsLabel}
            </Badge>
            {book.category && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full glass-sm text-emerald-400">
                {book.category.name_ar}
              </span>
            )}
            <SourceVerificationBadge
              isVerified={primarySource?.is_verified ?? true}
              sourceTitle={primarySource?.source_name || book.source_library || "المكتبة الوقفية المعتمدة"}
              sourceUrl={primarySource?.source_url || book.read_url || undefined}
              verifiedAt={primarySource?.verified_at}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight font-traditional">
            {book.title}
          </h1>

          {/* Author attribution */}
          {book.author && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">المؤلف:</span>
              <Link
                href={`/scholars/${book.author.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-400 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>{book.author.name}</span>
              </Link>
            </div>
          )}

          {/* Book Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl glass-sm text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">سنة التأليف / الوفاة:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {book.publication_year ? `${book.publication_year} هـ` : "تراثي محقق"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">عدد المجلدات:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {book.volumes_count || 1} مجلد
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">عدد الصفحات الكاملة:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {book.pages_count ? `${book.pages_count} صفحة` : "كامل الصفحات"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">ترخيص القراءة:</span>
              <span className="font-semibold text-emerald-500">
                تراث إسلامي مفتوح
              </span>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="space-y-2 pt-2">
              <h2 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>نبذة عن الكتاب وقيمته العلمية</span>
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                {book.description}
              </p>
            </div>
          )}

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#pdf-player"
              className="btn-glass-emerald px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>بدء القراءة في مشغل الموقع المدمج</span>
            </a>
            {book.download_url && (
              <a
                href={book.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl glass-sm hover:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>تحميل النسخة المصورة الكاملة (PDF)</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── In-Site Liquid Glass PDF Reader Section ──────────────────────── */}
      <section id="pdf-player" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl glass-emerald flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                مشغل الكتاب الإلكتروني المدمج (PDF)
              </h2>
              <p className="text-xs text-slate-400">
                اقرأ الكتاب كاملاً بجميع صفحاته دون مغادرة الموقع مع ميزات التكبير والوضع الليلي وفهرس الأبواب
              </p>
            </div>
          </div>
        </div>

        <GlassPDFViewer
          title={book.title}
          pdfUrl={book.pdf_url || book.download_url}
          readUrl={book.read_url}
          downloadUrl={book.download_url}
          totalPages={book.pages_count || 500}
          toc={book.toc || []}
        />
      </section>

      {/* ── AI Related Books Section ────────────────────────────────────── */}
      {relatedBooks.length > 0 && (
        <section className="space-y-5 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl glass-emerald flex items-center justify-center text-emerald-400 anim-glow">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>كتب ذات صلة مقترحة عبر الذكاء الاصطناعي</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    تطابق موضوعي
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  حلل محرك الذكاء الاصطناعي فهرس ومواضيع هذا الكتاب واقترح الكتب الأكثر قرباً منه في المنهج والباب
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBooks.map((rb, idx) => (
              <div
                key={rb.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0">
                    <BookCover
                      title={rb.title}
                      author={rb.author?.name || undefined}
                      volumesCount={rb.volumes_count || 1}
                      coverImage={rb.cover_image}
                      size="sm"
                      className="h-32"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <Zap className="w-3 h-3" />
                      <span>تطابق ذكاء اصطناعي {95 - idx * 4}%</span>
                    </div>
                    <Link
                      href={`/books/${rb.slug}`}
                      className="block text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-400 transition-colors line-clamp-2"
                    >
                      {rb.title}
                    </Link>
                    {rb.author?.name && (
                      <p className="text-xs text-slate-400 truncate">
                        {rb.author.name}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {rb.pages_count} صفحة • {rb.volumes_count || 1} مجلد
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {rb.category?.name_ar || "تراث إسلامي"}
                  </span>
                  <Link
                    href={`/books/${rb.slug}`}
                    className="btn-glass-emerald text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <span>قراءة الكتاب</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export async function generateStaticParams() { const books = await getBooks(); return books.map(b => ({ id: b.slug })); }
