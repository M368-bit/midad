/**
 * lib/ai-search.ts
 * AI-powered Arabic search with confidence scoring.
 */
import { SearchFacetItem } from "@/types";
import { normalizeArabic, removeTashkeel, createSearchSnippet } from "./arabic-utils";
import { getScholars, getLessons, getBooks, getHadiths } from "./repositories/content-repository";
import { QURAN_SURAHS } from "./data/quran-surahs";
import { searchQuranVerses } from "./services/quran-service";
import { getRelatedBooks } from "./data/verified-books-catalog";

export { getRelatedBooks };

export interface AISearchResult extends SearchFacetItem {
  confidence: number;    // 0–100
  matchReason: string;   // e.g. "تطابق النص العربي"
}

export interface AISearchResponse {
  results: AISearchResult[];
  topSuggestion: AISearchResult | null;
  totalFound: number;
  processingTimeMs: number;
}

// ── Scoring ────────────────────────────────────────────────────

function scoreText(text: string, query: string): number {
  if (!text || !query) return 0;

  const normalQ = normalizeArabic(query);
  const normalT = normalizeArabic(text);
  const plainQ  = removeTashkeel(query.trim());
  const plainT  = removeTashkeel(text);

  // Exact full phrase match → 100
  if (normalT.includes(normalQ)) return 100;
  if (plainT.includes(plainQ))   return 95;

  // Word-level scoring
  const words = normalQ.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return 0;

  let matched = 0;
  for (const word of words) {
    if (normalT.includes(word)) matched++;
  }

  const ratio = matched / words.length;

  if (ratio === 1)   return 88;
  if (ratio >= 0.75) return 72;
  if (ratio >= 0.5)  return 55;
  if (ratio >= 0.25) return 38;
  if (ratio > 0)     return 22;

  return 0;
}

function computeScore(
  primaryField: string,
  secondaryField: string,
  query: string
): { score: number; reason: string } {
  const primaryScore   = scoreText(primaryField, query);
  const secondaryScore = scoreText(secondaryField, query);

  if (primaryScore >= 95) return { score: primaryScore, reason: "تطابق تام للنص" };
  if (primaryScore >= 80) return { score: primaryScore, reason: "تطابق عالٍ في العنوان" };
  if (primaryScore >= 50) return { score: primaryScore, reason: "تطابق جزئي في العنوان" };
  if (secondaryScore >= 80) return { score: Math.min(secondaryScore, 78), reason: "تطابق في الوصف" };
  if (secondaryScore >= 40) return { score: Math.min(secondaryScore, 60), reason: "تطابق جزئي في الوصف" };
  if (primaryScore > 0) return { score: primaryScore, reason: "تطابق ضعيف" };
  return { score: 0, reason: "لا تطابق" };
}

// ── Main AI Search ─────────────────────────────────────────────

export async function aiSearch(query: string): Promise<AISearchResponse> {
  const t0 = Date.now();
  const cleanQuery = query.trim();

  if (!cleanQuery || cleanQuery.length < 2) {
    return { results: [], topSuggestion: null, totalFound: 0, processingTimeMs: 0 };
  }

  const [scholars, lessons, books, hadiths, quranVerses] = await Promise.all([
    getScholars({ query: cleanQuery }),
    getLessons({ query: cleanQuery }),
    getBooks({ query: cleanQuery }),
    getHadiths({ query: cleanQuery }),
    searchQuranVerses(cleanQuery),
  ]);

  const candidates: AISearchResult[] = [];
  const normalQ = normalizeArabic(cleanQuery).replace(/^سورة\s+/, "").trim();

  // 1. SURAH-FIRST: If searching for a Surah by name, promote it to the very top!
  for (const s of QURAN_SURAHS) {
    const normalS = normalizeArabic(s.name);
    if (normalS === normalQ || (normalQ.length >= 3 && normalS.includes(normalQ)) || (normalS.length >= 3 && normalQ.includes(normalS))) {
      candidates.push({
        type: "quran",
        id: `quran-surah-${s.number}`,
        title: `سورة ${s.name} (${s.numberOfAyahs} آية)`,
        subtitle: `${s.revelationType === "Meccan" ? "سورة مكية" : "سورة مدنية"} • الجزء ${s.juz} • صفحة ${s.page} بمصحف المدينة`,
        snippet: `قراءة واستماع لسورة ${s.name} كاملة بالرسم العثماني لمصحف المدينة النبوية مع التفسير الميسر وتلاوات مشاهير القراء.`,
        url: `/quran/${s.number}`,
        badge: "المصحف الشريف — سورة كاملة",
        is_verified: true,
        confidence: 100,
        matchReason: "تطابق تام لاسم السورة الكريمة بالمصحف الشريف",
      });
      break;
    }
  }

  // 2. Quran Verses with Tafsir (following the Surah)
  for (const qv of quranVerses) {
    const { score } = computeScore(qv.text, qv.tafsir, cleanQuery);
    const confidence = Math.max(score, 92);
    candidates.push({
      type: "quran",
      id: `quran-${qv.surah.number}-${qv.ayahNumber}`,
      title: `سورة ${qv.surah.name} — الآية (${qv.ayahNumber})`,
      subtitle: `الجزء ${qv.surah.juz} • مصحف المدينة النبوية`,
      snippet: qv.text,
      tafsir: qv.tafsir,
      url: `/quran/${qv.surah.number}?ayah=${qv.ayahNumber}`,
      badge: "القرآن الكريم",
      is_verified: true,
      confidence,
      matchReason: "آية من القرآن الكريم مع التفسير الميسر",
    });
  }

  // Hadiths
  for (const h of hadiths) {
    const { score, reason } = computeScore(
      h.arabic_text,
      (h.chapter_title ?? "") + " " + (h.narrator ?? ""),
      cleanQuery
    );
    if (score < 15) continue;
    candidates.push({
      type: "hadith",
      id: h.id,
      title: `حديث رقم ${h.hadith_number}: ${h.chapter_title || ""}`,
      subtitle: h.narrator ? `عن ${h.narrator}` : "حديث نبوي شريف",
      snippet: createSearchSnippet(removeTashkeel(h.arabic_text), cleanQuery),
      url: `/hadith/${h.id}`,
      badge: h.grade,
      is_verified: true,
      confidence: score,
      matchReason: reason,
    });
  }

  // Scholars
  for (const s of scholars) {
    const { score, reason } = computeScore(
      s.name,
      (s.bio ?? "") + " " + (s.title ?? ""),
      cleanQuery
    );
    if (score < 15) continue;
    candidates.push({
      type: "scholar",
      id: s.id,
      title: s.name,
      subtitle: s.title || s.era || undefined,
      snippet: createSearchSnippet(s.bio ?? "", cleanQuery),
      url: `/scholars/${s.slug}`,
      badge: s.era || "عالم موثق",
      is_verified: s.status === "published",
      confidence: score,
      matchReason: reason,
    });
  }

  // Books
  for (const b of books) {
    const { score, reason } = computeScore(
      b.title,
      b.description ?? "",
      cleanQuery
    );
    if (score < 15) continue;
    candidates.push({
      type: "book",
      id: b.id,
      title: b.title,
      subtitle: b.author?.name ? `المؤلف: ${b.author.name}` : undefined,
      snippet: createSearchSnippet(b.description ?? "", cleanQuery),
      url: `/books/${b.slug}`,
      badge: "كتاب موثق",
      is_verified: b.status === "published",
      confidence: score,
      matchReason: reason,
    });
  }

  // Lessons
  for (const l of lessons) {
    const { score, reason } = computeScore(
      l.title,
      (l.description ?? "") + " " + (l.scholar?.name ?? ""),
      cleanQuery
    );
    if (score < 15) continue;
    candidates.push({
      type: "lesson",
      id: l.id,
      title: l.title,
      subtitle: l.scholar?.name ? `الشيخ: ${l.scholar.name}` : undefined,
      snippet: createSearchSnippet(l.description ?? "", cleanQuery),
      url: `/lessons/${l.slug}`,
      badge: l.media_type === "audio" ? "درس صوتي" : "مرئي",
      is_verified: l.status === "published",
      confidence: score,
      matchReason: reason,
    });
  }

  // Sort by confidence descending
  candidates.sort((a, b) => b.confidence - a.confidence);

  const processingTimeMs = Date.now() - t0;

  return {
    results: candidates.slice(0, 15),
    topSuggestion: candidates[0] ?? null,
    totalFound: candidates.length,
    processingTimeMs,
  };
}
