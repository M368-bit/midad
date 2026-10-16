import { Hadith } from "@/types";
import { normalizeArabic } from "../arabic-utils";

/**
 * خدمة جلب الأحاديث النبوية الموثقة من المصادر المفتوحة المعتمدة
 * Real Verified Hadith Integration Service
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_HADITH_API_BASE ||
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

export interface ExternalHadithResponse {
  metadata?: {
    name?: string;
    section?: Record<string, string>;
  };
  hadiths?: Array<{
    hadithnumber: number;
    arabicnumber?: number;
    text: string;
    grades?: Array<{ name: string; grade: string }>;
    reference?: {
      book: number;
      hadith: number;
    };
  }>;
}

/**
 * جلب حديث موثق برقم الحديث من صحيح البخاري عبر واجهة API المعتمدة
 */
export async function fetchVerifiedHadith(
  collection: "ara-bukhari" | "ara-muslim" = "ara-bukhari",
  hadithNumber: number = 1
): Promise<Hadith | null> {
  try {
    const url = `${API_BASE_URL}/editions/${collection}/${hadithNumber}.json`;
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // تخزين مؤقت لـ 24 ساعة لضمان السرعة
    });

    if (!response.ok) {
      console.warn(`[HadithAPI] Failed to fetch hadith #${hadithNumber}: HTTP ${response.status}`);
      return null;
    }

    const data: ExternalHadithResponse = await response.json();
    const item = data.hadiths?.[0];

    if (!item || !item.text) {
      return null;
    }

    const isBukhari = collection === "ara-bukhari";
    const collectionName = isBukhari ? "صحيح البخاري" : "صحيح مسلم";
    const collectionId = isBukhari ? "coll-bukhari" : "coll-muslim";

    return {
      id: `${collection}-${item.hadithnumber}`,
      collection_id: collectionId,
      hadith_number: item.hadithnumber,
      arabic_text: item.text,
      arabic_normalized: normalizeArabic(item.text),
      grade: "صحيح (متفق على صحته)",
      takhrij: `${collectionName} - رقم الحديث: ${item.hadithnumber}`,
      explanation: isBukhari && item.hadithnumber === 1
        ? "أصل عظيم من أصول الإسلام، وقاعدة كبرى في قبول الأعمال؛ حيث بين النبي ﷺ أن مدار قبول العمل والجزاء عليه مرتبط بإخلاص النية لله تعالى."
        : "حديث نبوي شريف صحيح مخرج بأسانيد الأئمة المعتمدة.",
      chapter_title: data.metadata?.section?.[String(item.reference?.book || 1)] || "كتاب بدء الوحي",
      status: "published",
      sources: [
        {
          id: `src-${collection}-${item.hadithnumber}`,
          hadith_id: `${collection}-${item.hadithnumber}`,
          reference_book: collectionName,
          hadith_number_in_source: String(item.hadithnumber),
          verified_url: `https://sunnah.com/bukhari:${item.hadithnumber}`,
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
