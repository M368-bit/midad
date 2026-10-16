import React from "react";
import Link from "next/link";
import { Library, BookMarked } from "lucide-react";
import {
  getBooks,
  getCategories,
} from "@/lib/repositories/content-repository";
import { ContentCard } from "@/components/shared/ContentCard";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Library className="w-4 h-4" />
          <span>خزانة التراث الإسلامي المفتوح</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          المكتبة الإسلامية
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          أمهات كتب الحديث والتفسير والعقيدة والفقه، موثقة بنسخها المعتمدة
          المحققة والمتاحة في النطاق العام، مع روابط القراءة والتحميل المباشرة.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="max-w-md">
          <ArabicSearchInput
            initialQuery={query}
            placeholder="ابحث عن كتاب أو مؤلف (مثال: صحيح البخاري، رياض الصالحين...)"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <Link
            href="/books"
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              !categoryId
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            جميع الأقسام
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/books?category=${c.id}${query ? `&q=${query}` : ""}`}
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

      {/* Books Grid */}
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <ContentCard
              key={book.id}
              type="book"
              id={book.id}
              title={book.title}
              subtitle={book.author?.name ? `المؤلف: ${book.author.name}` : undefined}
              description={book.description}
              href={`/books/${book.slug}`}
              badge="نطاق عام"
              metadata={`${book.pages_count} صفحة • ${book.volumes_count} مجلد`}
              sourceUrl={book.sources?.[0]?.source_url}
            />
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
