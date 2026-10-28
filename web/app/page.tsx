import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  BookMarked,
  GraduationCap,
  Library,
  Scroll,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  Globe,
  Headphones,
} from "lucide-react";
import { ArabicSearchInput } from "@/components/shared/ArabicSearchInput";
import { ContentCard } from "@/components/shared/ContentCard";
import { Badge } from "@/components/ui/Badge";
import {
  getScholars,
  getLessons,
  getBooks,
  getHadiths,
  getCategories,
} from "@/lib/repositories/content-repository";

const categoryIcons = [Compass, BookOpen, Library, Scroll, GraduationCap, Star];

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
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="relative islamic-pattern-bg overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-28">
        {/* Hero radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 65% at 50% 0%, rgba(16,185,129,0.13) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Trust badge */}
          <div className="anim-fade-up d-0 flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 anim-glow" />
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>منصة المعرفة الإسلامية الموثقة — بلا اختلاق أو روابط وهمية</span>
            </div>
          </div>

          {/* Main heading — fixed sizes so they don't overlap */}
          <div className="anim-fade-up d-100 mb-4 space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              تراث الأمة الموثوق
            </h1>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight gradient-text-animated">
              بمنهجية علمية أصيلة
            </h1>
          </div>

          {/* Subtitle */}
          <p className="anim-fade-up d-200 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-7 mb-8">
            محرك بحث ومستودع معرفي للأحاديث الصحيحة المسندة، وتراجم الأئمة والعلماء،
            والمكتبة التراثية المفتوحة، والمحاضرات المؤصلة من مصادرها الأصلية المعتمدة.
          </p>

          {/* Search */}
          <div className="anim-fade-up d-300 max-w-2xl mx-auto mb-10">
            <ArabicSearchInput />
          </div>

          {/* Stats */}
          <div className="anim-fade-up d-400 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { value: "١١٤", label: "سورة بالمصحف الشريف", icon: BookMarked },
              { value: "٣٠,٠٠٠+", label: "كتاب تراثي موثق", icon: Library },
              { value: `${hadiths.length}+`, label: "حديث مسند ومخرّج", icon: Scroll },
              { value: "١٠٠%", label: "موثق من المصادر الأصلية", icon: ShieldCheck },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-4 text-center group">
                  <div className="w-8 h-8 rounded-xl glass-emerald flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-24">

        {/* ═══════════════════════════════════════════════════
            CATEGORIES
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0 space-y-8">
          <div className="text-center space-y-2">
            <div className="islamic-divider mb-4">
              <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 uppercase">
                استكشف
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              التصنيفات والعلوم الشرعية
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              تصفح العلوم الإسلامية وفق الترتيب العلمي المعتمد
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[i % categoryIcons.length];
              return (
                <Link
                  key={cat.id}
                  href={`/lessons?category=${cat.id}`}
                  className="glass-card rounded-2xl p-5 flex flex-col items-center text-center group"
                >
                  <div className="w-11 h-11 rounded-xl glass-emerald flex items-center justify-center mb-3 group-hover:scale-110 group-hover:anim-glow transition-transform duration-300">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {cat.name_ar}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HOLY QURAN — MEDINA MUSHAF SHOWCASE
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="islamic-divider mb-3">
                <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 uppercase">
                  كتاب الله
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>المصحف الشريف — مصحف المدينة النبوية</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                قراءة متقنة بالرسم العثماني برواية حفص عن عاصم، مع التفسير الميسر وتلاوات مرتلة لعمالقة القراء
              </p>
            </div>
            <Link
              href="/quran"
              className="shrink-0 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
            >
              <span>المصحف كاملاً (١١٤ سورة)</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Surahs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { num: 1, name: "الفاتحة", type: "مكية", ayahs: 7, juz: 1 },
              { num: 18, name: "الكهف", type: "مكية", ayahs: 110, juz: 15 },
              { num: 36, name: "يس", type: "مكية", ayahs: 83, juz: 22 },
              { num: 55, name: "الرحمن", type: "مدنية", ayahs: 78, juz: 27 },
              { num: 67, name: "الملك", type: "مكية", ayahs: 30, juz: 29 },
              { num: 112, name: "الإخلاص", type: "مكية", ayahs: 4, juz: 30 },
            ].map((surah) => (
              <Link
                key={surah.num}
                href={`/quran/${surah.num}`}
                className="glass-card rounded-2xl p-4 text-center group hover:border-emerald-500/40 transition-all duration-300 block"
              >
                <div className="w-8 h-8 rounded-xl glass-emerald flex items-center justify-center mx-auto mb-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  {surah.num}
                </div>
                <h3 className="font-traditional text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  سورة {surah.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{surah.type}</span>
                  <span>•</span>
                  <span>{surah.ayahs} آيات</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quran Features Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-right">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl glass-emerald flex items-center justify-center mx-auto sm:mx-0">
                  <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">الرسم العثماني المعتمد</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  موافق لطبعة مجمع الملك فهد لمصحف المدينة النبوية مع ضبط التشكيل والوقف.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl glass-emerald flex items-center justify-center mx-auto sm:mx-0">
                  <Headphones className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">تلاوات صوتية مسندة</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  استماع آية بآية بصوت كبار المقرئين: الحصري، المنشاوي، عبد الباسط، والعفاسي.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl glass-emerald flex items-center justify-center mx-auto sm:mx-0">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">التفسير الميسر المعتمد</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  بيان لمعاني مفردات القرآن والأحكام بعبارة سهلة موجزة تناسب جميع المسلمين.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HADITH SPOTLIGHT
        ═══════════════════════════════════════════════════ */}
        {featuredHadith && (
          <section className="anim-fade-up d-0 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="islamic-divider mb-3">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 uppercase">
                    الحديث
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scroll className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>من مشكاة النبوة</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  أحاديث صحيحة متصلة الإسناد مع التخريج وبيان درجة الصحة
                </p>
              </div>
              <Link
                href="/hadith"
                className="shrink-0 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                <span>جميع الأحاديث</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="glass-card rounded-3xl relative overflow-hidden">
              {/* Decorative glow corner */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 w-56 h-56"
                style={{
                  background:
                    "radial-gradient(ellipse at top right, rgba(16,185,129,0.12), transparent 70%)",
                }}
              />

              <div className="relative z-10 p-6 sm:p-10">
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="emerald">{featuredHadith.grade}</Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {featuredHadith.chapter_title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 glass-sm rounded-lg px-2.5 py-1">
                    {featuredHadith.takhrij}
                  </span>
                </div>

                {/*
                  Hadith text — WITHOUT tashkeel by default on homepage preview.
                  line-height: 2.0 is comfortable for plain Arabic text.
                  The HadithViewer on /hadith/[id] has the proper toggle.
                */}
                <blockquote className="hadith-text-plain text-lg sm:text-2xl text-slate-800 dark:text-slate-100 text-justify mb-8">
                  «{featuredHadith.arabic_text
                    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")}»
                </blockquote>

                {/* Footer */}
                <div className="pt-5 border-t border-slate-200/40 dark:border-white/06 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    الراوي:{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {featuredHadith.narrator}
                    </span>
                  </div>
                  <Link
                    href={`/hadith/${featuredHadith.id}`}
                    className="btn-glass-emerald inline-flex items-center gap-1.5 text-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>التخريج والشرح</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════
            SCHOLARS
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="islamic-divider mb-3">
                <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 uppercase">
                  العلماء
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>العلماء والدعاة الموثقون</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                تراجم محققة لأئمة الإسلام وعلماء الأمة ومصادر مؤلفاتهم
              </p>
            </div>
            <Link href="/scholars" className="shrink-0 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
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

        {/* ═══════════════════════════════════════════════════
            LESSONS
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="islamic-divider mb-3">
                <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 uppercase">
                  الدروس
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>الدروس والمحاضرات المسندة</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                شروح علمية ومحاضرات مؤصلة مع مشغل صوتي وروابط المصادر الرسمية
              </p>
            </div>
            <Link href="/lessons" className="shrink-0 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
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

        {/* ═══════════════════════════════════════════════════
            LIBRARY
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="islamic-divider mb-3">
                <span className="text-[10px] font-bold tracking-[0.3em] text-emerald-600 dark:text-emerald-400 uppercase">
                  المكتبة
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Library className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>المكتبة الإسلامية التراثية</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                أمهات كتب الحديث والعقيدة والفقه المتاحة في النطاق العام بروابط معتمدة
              </p>
            </div>
            <Link href="/books" className="shrink-0 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
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

        {/* ═══════════════════════════════════════════════════
            VERIFICATION BANNER
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0">
          <div className="glass-card rounded-3xl relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(16,185,129,0.11), transparent 70%)",
              }}
            />
            <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-right">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ميثاق الجودة والمصداقية في مداد</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  لا نُدرج حديثاً إلا مسنداً، ولا كتاباً إلا موثقاً
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-7">
                  تعتمد منصة مداد سياسة صارمة تعزل أي محتوى لم يتم التحقق من مصدره الخارجي وصحة رابطه.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-16 h-16 rounded-2xl glass-emerald flex items-center justify-center anim-float">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Link href="/about" className="btn-glass-emerald text-sm">
                  <Globe className="w-4 h-4" />
                  <span>منهجية التوثيق</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            QUICK ACCESS CARDS
        ═══════════════════════════════════════════════════ */}
        <section className="anim-fade-up d-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                href: "/quran",
                icon: BookMarked,
                title: "المصحف الشريف",
                desc: "تلاوة وقراءة بالرسم العثماني مع التفسير الميسر",
              },
              {
                href: "/hadith",
                icon: Scroll,
                title: "الحديث الشريف",
                desc: "أحاديث صحيحة مخرّجة مع درجة الصحة وتراجم الرواة",
              },
              {
                href: "/books",
                icon: Library,
                title: "المكتبة الإسلامية",
                desc: "أمهات الكتب التراثية مع قارئ PDF الذكي المدمج",
              },
              {
                href: "/lessons",
                icon: BookOpen,
                title: "الدروس والمحاضرات",
                desc: "محاضرات علمية مع مشغّل صوت ومصادر أصلية",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="glass-card rounded-2xl p-6 group block">
                  <div className="w-12 h-12 rounded-2xl glass-emerald flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-7">
                    {item.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-1 transition-transform">
                    <span>تصفح الآن</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
