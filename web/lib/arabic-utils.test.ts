import { describe, it, expect } from "vitest";
import {
  removeTashkeel,
  normalizeArabic,
  matchesArabicSearch,
  createSearchSnippet,
} from "./arabic-utils";

describe("Arabic Text Utilities", () => {
  it("removes diacritics and tashkeel correctly", () => {
    const input = "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ";
    const result = removeTashkeel(input);
    expect(result).toBe("إنما الأعمال بالنيات");
  });

  it("normalizes Arabic text with various forms of Alef and Taa Marbuta", () => {
    const input1 = "أحمد وإسماعيل وآية ومكتبة";
    const expected = "احمد واسماعيل وايه ومكتبه";
    expect(normalizeArabic(input1)).toBe(expected);

    const input2 = "مُصْطَفَى وعَلِيّ";
    expect(normalizeArabic(input2)).toBe("مصطفي وعلي");
  });

  it("matches search queries regardless of tashkeel and hamza variations", () => {
    const hadith = "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى";

    // Matching without hamza or tashkeel
    expect(matchesArabicSearch(hadith, "انما الاعمال")).toBe(true);
    expect(matchesArabicSearch(hadith, "النيات")).toBe(true);
    expect(matchesArabicSearch(hadith, "لكل امرئ")).toBe(true);
    expect(matchesArabicSearch(hadith, "ما نوي")).toBe(true);

    // Unmatched term
    expect(matchesArabicSearch(hadith, "الصلاة")).toBe(false);
  });

  it("creates accurate search snippets around query words", () => {
    const longText =
      "عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال سمعت رسول الله صلى الله عليه وسلم يقول إنما الأعمال بالنيات";
    const snippet = createSearchSnippet(longText, "الاعمال", 50);
    expect(snippet).toContain("الأعمال");
  });

  it("handles decomposed Unicode characters and Quranic signs consistently", () => {
    // إيمان مع همزة منفصلة تحت الألف (Combining Hamza Below U+0655)
    const decomposed = "\u0627\u0655\u064A\u0645\u064E\u0627\u0646";
    const plain = "ايمان";
    expect(normalizeArabic(decomposed)).toBe(normalizeArabic(plain));

    // نص قرآني مع علامات وقف وضبط
    const quranic = "مَا نَوَىٰ ۚ فَمَن كَانَتْ";
    expect(matchesArabicSearch(quranic, "ما نوي فمن")).toBe(true);
  });
});
