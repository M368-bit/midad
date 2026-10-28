import React from "react";
import Link from "next/link";
import {
  Library,
  BookOpen,
  ArrowRight,
  Sparkles,
  Download,
  GraduationCap,
  Layers,
  FileText,
} from "lucide-react";
import {
  getBooks,
  getCategories,
} from "@/lib/repositories/content-repository";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookCover } from "@/components/books/BookCover";
import { Badge } from "@/components/ui/Badge";

interface BooksPageProps {
  searchParams: {
    q?: string;
    category?: string;
    scholar?: string;
  };
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const query = searchParams.q || "";
  const categoryId = searchParams.category;
  const scholarId = searchParams.scholar;

  const [books, categories] = await Promise.all([
    getBooks({
      query,
      categoryId,
      scholarId,
    }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <Library className="w-3.5 h-3.5" />
          <span>خزانة التراث الإسلامي المفتوح — أمهات الكتب المحققة</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          المكتبة الإسلامية الكبرى
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          أمهات كتب الحديث والتفسير والعقيدة والفقه والسيرة والرقائق، موثقة بنسخها المعتمدة
          المحققة مع مشغل PDF داخلي متطور وقراءة حية بجميع الصفحات.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="max-w-xl">
          <ArabicSearchInput
            initialQuery={query}
            placeholder="ابحث عن كتاب، مؤلف، أو موضوع (مثال: صحيح البخاري، تفسير ابن كثير، التوحيد...)"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <Link
            href="/books"
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold transition-all ${
              !categoryId
                ? "btn-glass-emerald shadow-glass-emerald"
                : "glass-sm text-slate-600 dark:text-slate-400 hover:text-emerald-500"
            }`}
          >
            جميع المصادر ({books.length})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/books?category=${c.id}${query ? `&q=${query}` : ""}`}
              className={`px-4 py-2 rounded-xl whitespace-nowrap font-semibold transition-all ${
                categoryId === c.id
                  ? "btn-glass-emerald shadow-glass-emerald"
                  : "glass-sm text-slate-600 dark:text-slate-400 hover:text-emerald-500"
              }`}
            >
              {c.name_ar}
            </Link>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="glass-card rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all duration-300 group"
            >
              <div className="flex gap-4 items-start">
                {/* Book Cover */}
                <div className="w-28 shrink-0">
                  <BookCover
                    title={book.title}
                    author={book.author?.name || undefined}
                    categoryName={book.category?.name_ar || undefined}
                    volumesCount={book.volumes_count || 1}
                    coverImage={book.cover_image}
                    size="md"
                    leatherColor={(book as any).leather_color || "emerald"}
                    className="h-36 sm:h-40"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-emerald text-emerald-400 font-bold">
                      {book.category?.name_ar || "تراث إسلامي"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {book.publication_year ? `${book.publication_year} هـ` : "محقق"}
                    </span>
                  </div>

                  <Link href={`/books/${book.slug}`} className="block">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h2>
                  </Link>

                  {book.author && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{book.author.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="font-mono text-emerald-400/90 font-semibold">
                      {book.pages_count} صفحة
                    </span>
                    <span>•</span>
                    <span>
                      {book.volumes_count && book.volumes_count > 1
                        ? `${book.volumes_count} مجلدات`
                        : "مجلد واحد"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description snippet */}
              {book.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <Link
                  href={`/books/${book.slug}`}
                  className="btn-glass-emerald text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 flex-1 justify-center"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>فتح وقراءة في المشغل (PDF)</span>
                </Link>

                {book.download_url && (
                  <a
                    href={book.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl glass-sm text-slate-400 hover:text-emerald-400 transition-colors"
                    title="تحميل النسخة المصورة"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لم نجد كتاباً يطابق بحثك"
          description="تأكد من كتابة العنوان بدقة أو استعرض كتب الأقسام الأخرى."
          actionHref="/books"
          actionText="عرض كل الكتب"
        />
      )}
    </div>
  );
}
