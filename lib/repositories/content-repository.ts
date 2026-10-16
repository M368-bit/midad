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
import { matchesArabicSearch, createSearchSnippet } from "../arabic-utils";
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
      if (!error && data && data.length > 0) return data as Scholar[];
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
      if (!error && data && data.length > 0) return data as Lesson[];
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
      if (!error && data && data.length > 0) return data as Book[];
    } catch (e) {
      console.warn("[Repository] Supabase books error", e);
    }
  }

  return VERIFIED_BOOKS.map((b) => ({
    ...b,
    author: VERIFIED_SCHOLARS.find((s) => s.id === b.scholar_id) || null,
    category: VERIFIED_CATEGORIES.find((c) => c.id === b.category_id) || null,
  })).filter((b) => {
    if (options?.scholarId && b.scholar_id !== options.scholarId) return false;
    if (options?.categoryId && b.category_id !== options.categoryId) return false;
    if (
      options?.query &&
      !matchesArabicSearch(b.title + " " + (b.description || ""), options.query)
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
}): Promise<Hadith[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      let req = supabase
        .from("hadiths")
        .select("*, collection:hadith_collections(*), book:hadith_books(*), sources:hadith_sources(*)")
        .eq("status", "published");

      if (options?.collectionId) req = req.eq("collection_id", options.collectionId);
      if (options?.bookId) req = req.eq("book_id", options.bookId);

      const { data, error } = await req;
      if (!error && data && data.length > 0) return data as Hadith[];
    } catch (e) {
      console.warn("[Repository] Supabase hadiths error", e);
    }
  }

  return VERIFIED_HADITHS.map((h) => ({
    ...h,
    collection: VERIFIED_COLLECTIONS.find((c) => c.id === h.collection_id) || null,
  })).filter((h) => {
    if (options?.collectionId && h.collection_id !== options.collectionId) return false;
    if (options?.bookId && h.book_id !== options.bookId) return false;
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
}

export async function getHadithById(id: string): Promise<Hadith | null> {
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

  const [scholars, lessons, books, hadiths] = await Promise.all([
    getScholars({ query: cleanQuery }),
    getLessons({ query: cleanQuery }),
    getBooks({ query: cleanQuery }),
    getHadiths({ query: cleanQuery }),
  ]);

  const facetResults: SearchFacetItem[] = [
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
  };
}
