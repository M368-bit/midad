/**
 * أدوات معالجة النصوص العربية والبحث الذكي
 * Arabic Text Normalization & Search Utilities
 */

// علامات التشكيل والحركات والتنوين
const TASHKEEL_REGEX = /[\u0617-\u061A\u064B-\u0652\u0670]/g;

// التطويل (الكشيدة)
const TATWEEL_REGEX = /\u0640/g;

/**
 * إزالة التشكيل والحركات والتنوين من النص العربي
 */
export function removeTashkeel(text: string): string {
  if (!text) return "";
  return text.replace(TASHKEEL_REGEX, "");
}

/**
 * توحيد أشكال الحروف العربية (تطبيع الألف والياء والتاء المربوطة)
 * لتسهيل المطابقة الدقيقة في البحث
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";

  return (
    text
      // إزالة التشكيل
      .replace(TASHKEEL_REGEX, "")
      // إزالة التطويل
      .replace(TATWEEL_REGEX, "")
      // توحيد الهمزات على الألف
      .replace(/[إأآا]/g, "ا")
      // توحيد الألف المقصورة والياء
      .replace(/ى/g, "ي")
      // توحيد التاء المربوطة والهاء
      .replace(/ة/g, "ه")
      // إزالة الفراغات المكررة والرموز الخاصة الشائعة
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

/**
 * فحص مطابقة البحث الذكي للنصوص العربية
 * يتحقق مما إذا كان النص الهدف يحتوي على كلمات الاستعلام بغض النظر عن التشكيل والهمزات
 */
export function matchesArabicSearch(target: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!target) return false;

  const normalizedTarget = normalizeArabic(target);
  const queryWords = normalizeArabic(query)
    .split(/\s+/)
    .filter((w) => w.length > 0);

  // يجب أن تتطابق جميع كلمات الاستعلام مع النص المستهدف
  return queryWords.every((word) => normalizedTarget.includes(word));
}

/**
 * تنسيق الأرقام إلى أرقام عربية مشرقية (اختياري)
 */
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/[0-9]/g, (match) => arabicDigits[parseInt(match, 10)]);
}

/**
 * استخراج مقتطف نصي حول كلمة البحث (Snippet generator)
 */
export function createSearchSnippet(
  content: string,
  query: string,
  snippetLength = 140
): string {
  if (!content) return "";
  const cleanContent = removeTashkeel(content);
  if (!query || !query.trim()) {
    return cleanContent.length > snippetLength
      ? cleanContent.substring(0, snippetLength) + "..."
      : cleanContent;
  }

  const normalizedContent = normalizeArabic(content);
  const normalizedQuery = normalizeArabic(query).split(/\s+/)[0] || "";

  const index = normalizedContent.indexOf(normalizedQuery);
  if (index === -1) {
    return cleanContent.length > snippetLength
      ? cleanContent.substring(0, snippetLength) + "..."
      : cleanContent;
  }

  const start = Math.max(0, index - Math.floor(snippetLength / 3));
  const end = Math.min(cleanContent.length, start + snippetLength);
  let snippet = cleanContent.substring(start, end);

  if (start > 0) snippet = "..." + snippet;
  if (end < cleanContent.length) snippet = snippet + "...";

  return snippet;
}
