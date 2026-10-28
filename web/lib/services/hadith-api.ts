import { Hadith } from "@/types";
import { normalizeArabic } from "../arabic-utils";

/**
 * خدمة جلب الأحاديث النبوية والقدسية الموثقة
 * Real Verified Hadith Integration Service with Pure Arabic Metadata
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_HADITH_API_BASE ||
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

// ── الفهرس العربي الكامل لأبواب صحيح البخاري ──────────────────────────────────
export const BUKHARI_ARABIC_SECTIONS: Record<number, string> = {
  1: "كتاب بدء الوحي",
  2: "كتاب الإيمان",
  3: "كتاب العلم",
  4: "كتاب الوضوء",
  5: "كتاب الغسل",
  6: "كتاب الحيض",
  7: "كتاب التيمم",
  8: "كتاب الصلاة",
  9: "كتاب مواقيت الصلاة",
  10: "كتاب الأذان",
  11: "كتاب الجمعة",
  12: "كتاب صلاة الخوف",
  13: "كتاب العيدين",
  14: "كتاب الوتر",
  15: "كتاب الاستسقاء",
  16: "كتاب الكسوف",
  17: "كتاب سجود القرآن",
  18: "كتاب تقصير الصلاة",
  19: "كتاب التهجد",
  20: "كتاب فضل الصلاة في مسجدي مكة والمدينة",
  21: "كتاب العمل في الصلاة",
  22: "كتاب السهو",
  23: "كتاب الجنائز",
  24: "كتاب الزكاة",
  25: "كتاب الحج",
  26: "كتاب العمرة",
  27: "كتاب المحصر",
  28: "كتاب جزاء الصيد",
  29: "كتاب فضائل المدينة",
  30: "كتاب الصوم",
  31: "كتاب صلاة التراويح",
  32: "كتاب فضل ليلة القدر",
  33: "كتاب الاعتكاف",
  34: "كتاب البيوع",
  35: "كتاب السلم",
  36: "كتاب الشفعة",
  37: "كتاب الإجارة",
  38: "كتاب الحوالات",
  39: "كتاب الكفالة",
  40: "كتاب الوكالة",
  41: "كتاب المزارعة",
  42: "كتاب المساقاة",
  43: "كتاب الاستقراض وأداء الديون",
  44: "كتاب الخصومات",
  45: "كتاب اللقطة",
  46: "كتاب المظالم والغصب",
  47: "كتاب الشركة",
  48: "كتاب الرهن",
  49: "كتاب العتق",
  50: "كتاب المكاتب",
  51: "كتاب الهبة وفضلها",
  52: "كتاب الشهادات",
  53: "كتاب الصلح",
  54: "كتاب الشروط",
  55: "كتاب الوصايا",
  56: "كتاب الجهاد والسير",
  57: "كتاب فرض الخمس",
  58: "كتاب الجزية والموادعة",
  59: "كتاب بدء الخلق",
  60: "كتاب أحاديث الأنبياء",
  61: "كتاب المناقب",
  62: "كتاب فضائل أصحاب النبي ﷺ",
  63: "كتاب مناقب الأنصار",
  64: "كتاب المغازي",
  65: "كتاب التفسير",
  66: "كتاب فضائل القرآن",
  67: "كتاب النكاح",
  68: "كتاب الطلاق",
  69: "كتاب النفقات",
  70: "كتاب الأطعمة",
  71: "كتاب العقيقة",
  72: "كتاب الذبائح والصيد",
  73: "كتاب الأضاحي",
  74: "كتاب الأشربة",
  75: "كتاب المرضى",
  76: "كتاب الطب",
  77: "كتاب اللباس",
  78: "كتاب الأدب",
  79: "كتاب الاستئذان",
  80: "كتاب الدعوات",
  81: "كتاب الرقاق",
  82: "كتاب القدر",
  83: "كتاب الأيمان والنذور",
  84: "كتاب الكفارات",
  85: "كتاب الفرائض",
  86: "كتاب الحدود",
  87: "كتاب الديات",
  88: "كتاب استتابة المرتدين",
  89: "كتاب الإكراه",
  90: "كتاب الحيل",
  91: "كتاب التعبير",
  92: "كتاب الفتن",
  93: "كتاب الأحكام",
  94: "كتاب التمني",
  95: "كتاب أخبار الآحاد",
  96: "كتاب الاعتصام بالكتاب والسنة",
  97: "كتاب التوحيد",
};

// ── الفهرس العربي الكامل لأبواب صحيح مسلم ──────────────────────────────────
export const MUSLIM_ARABIC_SECTIONS: Record<number, string> = {
  0: "مقدمة الإمام مسلم",
  1: "كتاب الإيمان",
  2: "كتاب الطهارة",
  3: "كتاب الحيض",
  4: "كتاب الصلاة",
  5: "كتاب المساجد ومواضع الصلاة",
  6: "كتاب صلاة المسافرين وقصرها",
  7: "كتاب الجمعة",
  8: "كتاب صلاة العيدين",
  9: "كتاب صلاة الاستسقاء",
  10: "كتاب الكسوف",
  11: "كتاب الجنائز",
  12: "كتاب الزكاة",
  13: "كتاب الصيام",
  14: "كتاب الاعتكاف",
  15: "كتاب الحج",
  16: "كتاب النكاح",
  17: "كتاب الرضاع",
  18: "كتاب الطلاق",
  19: "كتاب اللعان",
  20: "كتاب العتق",
  21: "كتاب البيوع",
  22: "كتاب المساقاة والمزارعة",
  23: "كتاب الفرائض",
  24: "كتاب الهبات",
  25: "كتاب الوصية",
  26: "كتاب النذر",
  27: "كتاب الأيمان",
  28: "كتاب القسامة والمحاربين والقصاص والديات",
  29: "كتاب الحدود",
  30: "كتاب الأقضية",
  31: "كتاب اللقطة",
  32: "كتاب الجهاد والسير",
  33: "كتاب الإمارة",
  34: "كتاب الصيد والذبائح",
  35: "كتاب الأضاحي",
  36: "كتاب الأشربة",
  37: "كتاب اللباس والزينة",
  38: "كتاب الآداب",
  39: "كتاب السلام",
  40: "كتاب الألفاظ من الأدب",
  41: "كتاب الشعر",
  42: "كتاب الرؤيا",
  43: "كتاب الفضائل",
  44: "كتاب فضائل الصحابة رضي الله عنهم",
  45: "كتاب البر والصلة والآداب",
  46: "كتاب القدر",
  47: "كتاب العلم",
  48: "كتاب الذكر والدعاء والتوبة",
  49: "كتاب الرقاق",
  50: "كتاب التوبة",
  51: "كتاب صفات المنافقين وأحكامهم",
  52: "كتاب صفة القيامة والجنة والنار",
  53: "كتاب الجنة وصفة نعيمها وأهلها",
  54: "كتاب الفتن وأشراط الساعة",
  55: "كتاب الزهد والرقائق",
  56: "كتاب التفسير",
};

/**
 * تحديد ما إذا كان الحديث قدسياً بناء على نصه الشرعي
 */
export function isQudsiHadith(text: string): boolean {
  if (!text) return false;
  const clean = normalizeArabic(text);
  const qudsiPatterns = [
    "قال الله تعالى",
    "يقول الله تعالى",
    "يقول الله تبارك وتعالى",
    "قال الله تبارك وتعالى",
    "قال الله عز وجل",
    "يقول الله عز وجل",
    "فيما يرويه عن ربه",
    "فيما روى عن ربه",
    "ان الله تعالى قال",
    "ان الله عز وجل قال",
    "ان ربكم تبارك وتعالى قال",
    "يا عبادي اني",
    "انا عند ظن عبدي",
    "كل عمل ابن ادم له الا الصوم",
    "قسمت الصلاة بيني وبين عبدي",
  ];

  return qudsiPatterns.some((pattern) => clean.includes(pattern));
}

/**
 * ترجمة أو استخراج اسم الباب بالعربية الخالصة دون أي إنجليزية
 */
export function getArabicChapterTitle(
  isBukhari: boolean,
  bookNumber?: number | null
): string {
  const num = typeof bookNumber === "number" ? bookNumber : 1;
  if (isBukhari) {
    return BUKHARI_ARABIC_SECTIONS[num] || `كتاب من صحاح البخاري (باب ${num})`;
  }
  return MUSLIM_ARABIC_SECTIONS[num] || `كتاب من صحاح مسلم (باب ${num})`;
}

/**
 * جلب حديث موثق منفرد برقم الحديث
 */
export async function fetchVerifiedHadith(
  collection: "ara-bukhari" | "ara-muslim" = "ara-bukhari",
  hadithNumber: number = 1
): Promise<Hadith | null> {
  try {
    const url = `${API_BASE_URL}/editions/${collection}/${hadithNumber}.json`;
    const response = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const item = data.hadiths?.[0];

    if (!item || !item.text || item.text.trim().length === 0) {
      return null;
    }

    const isBukhari = collection === "ara-bukhari";
    const collectionName = isBukhari ? "صحيح البخاري" : "صحيح مسلم";
    const collectionId = isBukhari ? "coll-bukhari" : "coll-muslim";
    const bookNum = item.reference?.book ?? 1;
    const arabicChapter = getArabicChapterTitle(isBukhari, bookNum);
    const qudsi = isQudsiHadith(item.text);

    return {
      id: `${collection}-${item.hadithnumber}`,
      collection_id: collectionId,
      hadith_number: item.hadithnumber,
      arabic_text: item.text,
      arabic_normalized: normalizeArabic(item.text),
      grade: isBukhari ? "صحيح البخاري" : "صحيح مسلم",
      grade_source: isBukhari
        ? "مخرج في الجامع المسند الصحيح للإمام البخاري (وفق شروطه الإسنادية الصارمة)"
        : "مخرج في المسند الصحيح للإمام مسلم بن الحجاج النيسابوري",
      takhrij: `${collectionName} - رقم الحديث: ${item.hadithnumber}`,
      hadith_type: qudsi ? "qudsi" : "prophetic",
      chapter_title: arabicChapter,
      status: "published",
      sources: [
        {
          id: `src-${collection}-${item.hadithnumber}`,
          hadith_id: `${collection}-${item.hadithnumber}`,
          reference_book: collectionName,
          hadith_number_in_source: String(item.hadithnumber),
          verified_url: `https://sunnah.com/${isBukhari ? "bukhari" : "muslim"}:${item.hadithnumber}`,
          is_verified: true,
          verified_at: new Date().toISOString(),
        },
      ],
    };
  } catch (error) {
    console.error("[HadithAPI] Error fetching external hadith:", error);
    return null;
  }
}

/**
 * جلب المجموعة كاملة دفعة واحدة في ملف واحد فائق السرعة
 * Fast Bulk Fetch for the Entire Collection
 */
export async function fetchEntireCollection(
  collection: "ara-bukhari" | "ara-muslim"
): Promise<Hadith[]> {
  try {
    const url = `${API_BASE_URL}/editions/${collection}.min.json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download collection ${collection}: HTTP ${res.status}`);
    }

    const data = await res.json();
    const isBukhari = collection === "ara-bukhari";
    const collectionName = isBukhari ? "صحيح البخاري" : "صحيح مسلم";
    const collectionId = isBukhari ? "coll-bukhari" : "coll-muslim";

    const results: Hadith[] = [];

    if (Array.isArray(data.hadiths)) {
      for (const item of data.hadiths) {
        if (!item.text || item.text.trim().length === 0) continue;

        const bookNum = item.reference?.book ?? 1;
        const arabicChapter = getArabicChapterTitle(isBukhari, bookNum);
        const qudsi = isQudsiHadith(item.text);

        results.push({
          id: `${collection}-${item.hadithnumber}`,
          collection_id: collectionId,
          hadith_number: item.hadithnumber,
          arabic_text: item.text,
          arabic_normalized: normalizeArabic(item.text),
          grade: isBukhari ? "صحيح البخاري" : "صحيح مسلم",
          grade_source: isBukhari
            ? "مخرج في الجامع المسند الصحيح للإمام البخاري"
            : "مخرج في المسند الصحيح للإمام مسلم",
          takhrij: `${collectionName} - رقم الحديث: ${item.hadithnumber}`,
          hadith_type: qudsi ? "qudsi" : "prophetic",
          chapter_title: arabicChapter,
          status: "published",
          sources: [
            {
              id: `src-${collection}-${item.hadithnumber}`,
              hadith_id: `${collection}-${item.hadithnumber}`,
              reference_book: collectionName,
              hadith_number_in_source: String(item.hadithnumber),
              verified_url: `https://sunnah.com/${isBukhari ? "bukhari" : "muslim"}:${item.hadithnumber}`,
              is_verified: true,
              verified_at: new Date().toISOString(),
            },
          ],
        });
      }
    }

    return results;
  } catch (err) {
    console.error(`[HadithAPI] Failed bulk fetch for ${collection}:`, err);
    return [];
  }
}
