import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Library,
  Scroll,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { ContentCard } from "@/components/shared/ContentCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getScholars,
  getLessons,
  getBooks,
  getHadiths,
  getCategories,
} from "@/lib/repositories/content-repository";

export default async function HomePage() {
  const [scholars, lessons, books, hadiths, categories] = await Promise.all([
    getScholars(),
    getLessons(),
    getBooks(),
    getHadiths(),
    getCategories(),
  ]);

  const featuredHadith = hadiths[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-emerald-950/10 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>منصة المعرفة الإسلامية الموثقة — بلا اختلاق أو روابط وهمية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
            تراث الأمة الموثوق، <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-emerald-400">
              بمنهجية علمية أصيلة
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            محرك بحث ومستودع معرفي للأحاديث الصحيحة المسندة، وتراجم الأئمة
            والعلماء، والمكتبة التراثية المفتوحة، والمحاضرات المؤصلة من مصادرها الأصلية المعتمدة.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <ArabicSearchInput />
          </div>

          {/* Stats Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">موثق من المصادر</div>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                {scholars.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">علماء محققون</div>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                {books.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">أمهات الكتب التراثية</div>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                {hadiths.length}+
              </div>
              <div className="text-xs text-slate-500 mt-0.5">أحاديث صحيحة متصلة</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Categories Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                التصنيفات والعلوم الشرعية
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                تصفح العلوم الإسلامية وفق الترتيب العلمي المعتمد
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/lessons?category=${cat.id}`}
                className="group p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 hover:border-emerald-500/50 hover:shadow-glow transition-all flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name_ar}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Hadith Spotlight */}
        {featuredHadith && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scroll className="w-5 h-5 text-emerald-600" />
                  <span>من مشكاة النبوة</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  أحاديث صحيحة متصلة الإسناد مع التخريج وبيان درجة الصحة
                </p>
              </div>
              <Link
                href="/hadith"
                className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>جميع الأحاديث</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <Card className="p-6 sm:p-8 bg-gradient-to-br from-white via-emerald-50/20 to-slate-50 dark:from-slate-900 dark:via-[#0a121b] dark:to-[#080d16] border-emerald-500/20">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald">{featuredHadith.grade}</Badge>
                  <span className="text-xs text-slate-500">
                    {featuredHadith.chapter_title}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {featuredHadith.takhrij}
                </span>
              </div>

              <blockquote className="font-traditional text-lg sm:text-2xl text-slate-800 dark:text-slate-100 leading-[2.3] text-justify mb-6">
                «{featuredHadith.arabic_text}»
              </blockquote>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  الراوي: <span className="font-semibold text-slate-700 dark:text-slate-300">{featuredHadith.narrator}</span>
                </div>
                <Link
                  href={`/hadith/${featuredHadith.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>عرض التخريج والشرح وتغيير التشكيل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </section>
        )}

        {/* Featured Scholars Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>العلماء والدعاة الموثقون</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                تراجم محققة لأئمة الإسلام وعلماء الأمة ومصادر مؤلفاتهم
              </p>
            </div>
            <Link
              href="/scholars"
              className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>دليل العلماء</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {scholars.slice(0, 4).map((scholar) => (
              <ContentCard
                key={scholar.id}
                type="scholar"
                id={scholar.id}
                title={scholar.name}
                subtitle={scholar.title}
                description={scholar.bio}
                href={`/scholars/${scholar.slug}`}
                badge={scholar.era || "عالم موثق"}
                isVerified={scholar.status === "published"}
                sourceUrl={scholar.sources?.[0]?.url}
              />
            ))}
          </div>
        </section>

        {/* Featured Lessons & Lectures */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>الدروس والمحاضرات المسندة</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                شروح علمية ومحاضرات مؤصلة مع مشغل صوتي وروابط المصادر الرسمية
              </p>
            </div>
            <Link
              href="/lessons"
              className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>جميع الدروس</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {lessons.slice(0, 3).map((lesson) => (
              <ContentCard
                key={lesson.id}
                type="lesson"
                id={lesson.id}
                title={lesson.title}
                subtitle={lesson.scholar?.name}
                description={lesson.description}
                href={`/lessons/${lesson.slug}`}
                badge={lesson.media_type === "audio" ? "تسجيل صوتي" : "مرئي"}
                metadata={`${lesson.duration_minutes || 45} دقيقة`}
                sourceUrl={lesson.sources?.[0]?.original_url}
              />
            ))}
          </div>
        </section>

        {/* Featured Books / Library */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Library className="w-5 h-5 text-emerald-600" />
                <span>المكتبة الإسلامية التراثية</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                أمهات كتب الحديث والعقيدة والفقه المتاحة في النطاق العام بروابط معتمدة
              </p>
            </div>
            <Link
              href="/books"
              className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>تصفح المكتبة</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {books.slice(0, 3).map((book) => (
              <ContentCard
                key={book.id}
                type="book"
                id={book.id}
                title={book.title}
                subtitle={book.author?.name ? `تأليف: ${book.author.name}` : undefined}
                description={book.description}
                href={`/books/${book.slug}`}
                badge="نطاق عام"
                metadata={`${book.pages_count} صفحة • ${book.volumes_count} مجلد`}
                sourceUrl={book.sources?.[0]?.source_url}
              />
            ))}
          </div>
        </section>

        {/* Verification Guarantee Banner */}
        <section className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-emerald-950/20 border border-emerald-900/40 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>ميثاق الجودة والمصداقية في مداد</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              لا نُدرج حديثاً إلا مسنداً، ولا كتاباً إلا موثقاً
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تعتمد منصة مداد سياسة صارمة تعزل أي محتوى لم يتم التحقق من مصدره الخارجي وصحة رابطه. لا نستخدم بيانات وهمية أو صوراً غير ملائمة.
            </p>
          </div>
          <Link
            href="/about"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md transition-colors"
          >
            اطلع على منهجية التوثيق
          </Link>
        </section>
      </div>
    </div>
  );
}
