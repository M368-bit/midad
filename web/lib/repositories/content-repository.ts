import {
  Scholar,
  Lesson,
  Book,
  Hadith,
  Category,
  HadithCollection,
  SearchResults,
  SearchFacetItem,
  UserProfile,
  Favorite,
  UserHistoryItem,
} from "@/types";
import {
  VERIFIED_SCHOLARS,
  VERIFIED_LESSONS,
  VERIFIED_BOOKS,
  VERIFIED_HADITHS,
  VERIFIED_CATEGORIES,
  VERIFIED_COLLECTIONS,
} from "../data/verified-data";
import { GRAND_ISLAMIC_LIBRARY } from "../data/verified-books-catalog";
import { searchQuranVerses } from "../services/quran-service";
import { matchesArabicSearch, createSearchSnippet, normalizeArabic } from "../arabic-utils";
import { isSupabaseConfigured } from "../supabase/config";
import { createServerSupabaseClient } from "../supabase/server";

// ============================================================================
// العلماء (Scholars)
// ============================================================================

export async function getScholars(options?: {
  query?: string;
  era?: string;
  isContemporary?: boolean;
  status?: string;
}): Promise<Scholar[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      let req = supabase.from("scholars").select("*, sources:scholar_sources(*)");
      if (options?.status) {
        req = req.eq("status", options.status);
      } else {
        req = req.eq("status", "published");
      }
      if (options?.isContemporary !== undefined) {
        req = req.eq("is_contemporary", options.isContemporary);
      }
      const { data, error } = await req;
      if (!error && data) return data as Scholar[];
    } catch (e) {
      console.warn("[Repository] Supabase query failed, falling back to verified dataset", e);
    }
  }

  // Fallback to verified real dataset
  return VERIFIED_SCHOLARS.filter((s) => {
    if (options?.status && s.status !== options.status) return false;
    if (options?.isContemporary !== undefined && s.is_contemporary !== options.isContemporary) return false;
    if (options?.query && !matchesArabicSearch(s.name + " " + s.bio, options.query)) return false;
    return true;
  });
}

export async function getScholarBySlug(slug: string): Promise<Scholar | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("scholars")
        .select("*, sources:scholar_sources(*)")
        .eq("slug", slug)
        .single();
      if (!error && data) return data as Scholar;
    } catch (e) {
      console.warn("[Repository] Supabase query error", e);
    }
  }

  return (
    VERIFIED_SCHOLARS.find((s) => s.slug === slug || s.id === slug) || null
  );
}

// ============================================================================
// الدروس والمحاضرات (Lessons)
// ============================================================================

export async function getLessons(options?: {
  query?: string;
  scholarId?: string;
  categoryId?: string;
  mediaType?: string;
}): Promise<Lesson[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      let req = supabase
        .from("lessons")
        .select("*, scholar:scholars(*), category:categories(*), sources:lesson_sources(*)")
        .eq("status", "published");

      if (options?.scholarId) req = req.eq("scholar_id", options.scholarId);
      if (options?.categoryId) req = req.eq("category_id", options.categoryId);
      if (options?.mediaType) req = req.eq("media_type", options.mediaType);

      const { data, error } = await req;
      if (!error && data) return data as Lesson[];
    } catch (e) {
      console.warn("[Repository] Supabase lessons error", e);
    }
  }

  return VERIFIED_LESSONS.map((lesson) => ({
    ...lesson,
    scholar: VERIFIED_SCHOLARS.find((s) => s.id === lesson.scholar_id) || null,
    category: VERIFIED_CATEGORIES.find((c) => c.id === lesson.category_id) || null,
  })).filter((l) => {
    if (options?.scholarId && l.scholar_id !== options.scholarId) return false;
    if (options?.categoryId && l.category_id !== options.categoryId) return false;
    if (options?.mediaType && l.media_type !== options.mediaType) return false;
    if (
      options?.query &&
      !matchesArabicSearch(l.title + " " + (l.description || ""), options.query)
    )
      return false;
    return true;
  });
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const lessons = await getLessons();
  return lessons.find((l) => l.slug === slug || l.id === slug) || null;
}

// ============================================================================
// المكتبة والكتب (Books)
// ============================================================================

export async function getBooks(options?: {
  query?: string;
  scholarId?: string;
  categoryId?: string;
}): Promise<Book[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      let req = supabase
        .from("books")
        .select("*, author:scholars(*), category:categories(*), sources:book_sources(*)")
        .eq("status", "published");

      if (options?.scholarId) req = req.eq("scholar_id", options.scholarId);
      if (options?.categoryId) req = req.eq("category_id", options.categoryId);

      const { data, error } = await req;
      if (!error && data) return data as Book[];
    } catch (e) {
      console.warn("[Repository] Supabase books error", e);
    }
  }

  // Combine baseline verified books and the Grand Islamic Library
  const allRawBooks = [...VERIFIED_BOOKS];
  for (const gb of GRAND_ISLAMIC_LIBRARY) {
    if (!allRawBooks.some((b) => b.id === gb.id || b.slug === gb.slug)) {
      allRawBooks.push(gb);
    }
  }

  return allRawBooks.map((b) => ({
    ...b,
    author: VERIFIED_SCHOLARS.find((s) => s.id === b.scholar_id) || null,
    category: VERIFIED_CATEGORIES.find((c) => c.id === b.category_id) || null,
  })).filter((b) => {
    if (options?.scholarId && b.scholar_id !== options.scholarId) return false;
    if (options?.categoryId && b.category_id !== options.categoryId) return false;
    if (
      options?.query &&
      !matchesArabicSearch(
        b.title + " " + (b.description || "") + " " + (b.author?.name || ""),
        options.query
      )
    )
      return false;
    return true;
  });
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const books = await getBooks();
  return books.find((b) => b.slug === slug || b.id === slug) || null;
}

// ============================================================================
// الحديث الشريف (Hadiths & Collections)
// ============================================================================

export async function getHadithCollections(): Promise<HadithCollection[]> {
  return VERIFIED_COLLECTIONS;
}

export async function getHadiths(options?: {
  query?: string;
  collectionId?: string;
  bookId?: string;
  type?: "prophetic" | "qudsi";
  limit?: number;
  offset?: number;
}): Promise<Hadith[]> {
  const { isQudsiHadith, getArabicChapterTitle } = await import("../services/hadith-api");

  // Fallback: static data + AI-imported hadiths merged
  const { getImportedHadiths } = await import("../ai-content-store");

  const sanitizeHadith = (h: Hadith): Hadith => {
    let cleanChapter = h.chapter_title;
    if (!cleanChapter || /[a-zA-Z]/.test(cleanChapter)) {
      const isBukhari = h.collection_id === "coll-bukhari";
      const bookNum = (h as any).reference?.book || 1;
      cleanChapter = getArabicChapterTitle(isBukhari, bookNum);
    }
    const isQudsi = h.hadith_type === "qudsi" || isQudsiHadith(h.arabic_text);

    return {
      ...h,
      chapter_title: cleanChapter,
      hadith_type: isQudsi ? "qudsi" : "prophetic",
    };
  };

  const staticHadiths = VERIFIED_HADITHS.map((h) => ({
    ...sanitizeHadith(h),
    collection: VERIFIED_COLLECTIONS.find((c) => c.id === h.collection_id) || null,
  })).filter((h) => {
    if (options?.collectionId && h.collection_id !== options.collectionId) return false;
    if (options?.bookId && h.book_id !== options.bookId) return false;
    if (options?.type && h.hadith_type !== options.type) return false;
    if (
      options?.query &&
      !matchesArabicSearch(
        h.arabic_text + " " + (h.narrator || "") + " " + (h.chapter_title || ""),
        options.query
      )
    )
      return false;
    return true;
  });

  const importedHadiths = getImportedHadiths()
    .map(sanitizeHadith)
    .filter((h) => {
      if (options?.collectionId && h.collection_id !== options.collectionId) return false;
      if (options?.bookId && (h as Hadith & { book_id?: string }).book_id !== options.bookId) return false;
      if (options?.type && h.hadith_type !== options.type) return false;
      if (
        options?.query &&
        !matchesArabicSearch(
          h.arabic_text + " " + (h.narrator || "") + " " + (h.chapter_title || ""),
          options.query
        )
      )
        return false;
      return true;
    });

  // Deduplicate hadiths so static and imported don't collide
  const hadithMap = new Map<string, Hadith>();
  for (const h of [...staticHadiths, ...importedHadiths]) {
    const key = `${h.collection_id}-${h.hadith_number}`;
    if (!hadithMap.has(key)) {
      hadithMap.set(key, h);
    }
  }

  const all = Array.from(hadithMap.values());

  // Sort strictly by hadith_number ascending (1, 2, 3...)
  all.sort((a, b) => {
    if (a.collection_id !== b.collection_id) {
      if (a.collection_id === "coll-bukhari") return -1;
      if (b.collection_id === "coll-bukhari") return 1;
    }
    const numA = typeof a.hadith_number === "number" ? a.hadith_number : parseInt(String(a.hadith_number), 10) || 0;
    const numB = typeof b.hadith_number === "number" ? b.hadith_number : parseInt(String(b.hadith_number), 10) || 0;
    return numA - numB;
  });

  if (options?.offset !== undefined || options?.limit !== undefined) {
    const start = options.offset || 0;
    const end = options.limit ? start + options.limit : undefined;
    return all.slice(start, end);
  }

  return all;
}

export async function getHadithsTotalCount(options?: {
  query?: string;
  collectionId?: string;
  bookId?: string;
  type?: "prophetic" | "qudsi";
}): Promise<number> {
  const hadiths = await getHadiths(options);
  return hadiths.length;
}

export async function getHadithById(id: string): Promise<Hadith | null> {
  // Check AI-imported store first
  const { getImportedHadithById } = await import("../ai-content-store");
  const imported = getImportedHadithById(id);
  if (imported) return imported;

  const hadiths = await getHadiths();
  return hadiths.find((h) => h.id === id || String(h.hadith_number) === id) || null;
}

// ============================================================================
// التصنيفات (Categories)
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  return VERIFIED_CATEGORIES;
}

// ============================================================================
// البحث الشامل (Unified Search across all verified models)
// ============================================================================

export async function searchMidad(query: string): Promise<SearchResults> {
  const cleanQuery = query?.trim() || "";
  if (!cleanQuery) {
    return {
      query: "",
      total: 0,
      results: [],
      scholarsCount: 0,
      lessonsCount: 0,
      booksCount: 0,
      hadithsCount: 0,
    };
  }

  const [scholars, lessons, books, hadiths, quranVerses] = await Promise.all([
    getScholars({ query: cleanQuery }),
    getLessons({ query: cleanQuery }),
    getBooks({ query: cleanQuery }),
    getHadiths({ query: cleanQuery }),
    searchQuranVerses(cleanQuery),
  ]);

  const { QURAN_SURAHS } = await import("../data/quran-surahs");
  const normalQ = normalizeArabic(cleanQuery).replace(/^سورة\s+/, "").trim();
  const surahMatches: SearchFacetItem[] = [];

  for (const s of QURAN_SURAHS) {
    const normalS = normalizeArabic(s.name);
    if (normalS === normalQ || (normalQ.length >= 3 && normalS.includes(normalQ)) || (normalS.length >= 3 && normalQ.includes(normalS))) {
      surahMatches.push({
        type: "quran" as const,
        id: `quran-surah-${s.number}`,
        title: `سورة ${s.name} (${s.numberOfAyahs} آية)`,
        subtitle: `${s.revelationType === "Meccan" ? "سورة مكية" : "سورة مدنية"} • الجزء ${s.juz} • صفحة ${s.page} في مصحف المدينة`,
        snippet: `قراءة واستماع لسورة ${s.name} كاملة بالرسم العثماني لمصحف المدينة النبوية مع التفسير الميسر وتلاوات مشاهير القراء.`,
        url: `/quran/${s.number}`,
        badge: "المصحف الشريف — سورة كاملة",
        is_verified: true,
      });
      break;
    }
  }

  const facetResults: SearchFacetItem[] = [
    ...surahMatches,
    ...quranVerses.map((qv) => ({
      type: "quran" as const,
      id: `quran-${qv.surah.number}-${qv.ayahNumber}`,
      title: `سورة ${qv.surah.name} — الآية (${qv.ayahNumber})`,
      subtitle: `الجزء ${qv.surah.juz} • سورة ${qv.surah.revelationType === "Meccan" ? "مكية" : "مدنية"}`,
      snippet: qv.text,
      tafsir: qv.tafsir,
      url: `/quran/${qv.surah.number}?ayah=${qv.ayahNumber}`,
      badge: "القرآن الكريم",
      is_verified: true,
    })),
    ...hadiths.map((h) => ({
      type: "hadith" as const,
      id: h.id,
      title: `حديث رقم ${h.hadith_number}: ${h.chapter_title || ""}`,
      subtitle: h.narrator ? `عن ${h.narrator}` : "حديث نبوي شريف",
      snippet: createSearchSnippet(h.arabic_text, cleanQuery),
      url: `/hadith/${h.id}`,
      badge: h.grade,
      is_verified: true,
    })),
    ...scholars.map((s) => ({
      type: "scholar" as const,
      id: s.id,
      title: s.name,
      subtitle: s.title || s.era || undefined,
      snippet: createSearchSnippet(s.bio, cleanQuery),
      url: `/scholars/${s.slug}`,
      badge: s.era || "عالم موثق",
      is_verified: s.status === "published",
    })),
    ...books.map((b) => ({
      type: "book" as const,
      id: b.id,
      title: b.title,
      subtitle: b.author?.name ? `المؤلف: ${b.author.name}` : undefined,
      snippet: createSearchSnippet(b.description || "", cleanQuery),
      url: `/books/${b.slug}`,
      badge: "كتاب موثق",
      is_verified: b.status === "published",
    })),
    ...lessons.map((l) => ({
      type: "lesson" as const,
      id: l.id,
      title: l.title,
      subtitle: l.scholar?.name ? `الشيخ: ${l.scholar.name}` : undefined,
      snippet: createSearchSnippet(l.description || "", cleanQuery),
      url: `/lessons/${l.slug}`,
      badge: l.media_type === "audio" ? "درس صوتي" : "مرئي",
      is_verified: l.status === "published",
    })),
  ];

  return {
    query: cleanQuery,
    total: facetResults.length,
    results: facetResults,
    scholarsCount: scholars.length,
    lessonsCount: lessons.length,
    booksCount: books.length,
    hadithsCount: hadiths.length,
    quranCount: quranVerses.length + surahMatches.length,
  };
}

/**
 * بيان حالة مصدر البيانات الحالي بشفافية تامة
 */
export function getDataSourceInfo() {
  const isConfigured = isSupabaseConfigured();
  return {
    isLiveDatabase: isConfigured,
    provider: isConfigured ? "Supabase PostgreSQL" : "Verified Local Baseline (تطوير محلي)",
    description: isConfigured
      ? "البيانات تُجلب مباشرة من قاعدة بيانات Supabase PostgreSQL السحابية."
      : "قاعدة بيانات Supabase لم تُفعّل بعد لعدم توفر المفاتيح في البيئة؛ يتم تشغيل المنصة عبر مستودع البيانات التراثية الموثقة محلياً.",
  };
}

