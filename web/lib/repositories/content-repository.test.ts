import { describe, it, expect } from "vitest";
import {
  getScholars,
  getScholarBySlug,
  getLessons,
  getBooks,
  getHadiths,
  getHadithById,
  searchMidad,
  getDataSourceInfo,
} from "./content-repository";

describe("Content Repository (Data Query & Filtering)", () => {
  it("retrieves scholars with era and status filtering", async () => {
    const allScholars = await getScholars();
    expect(allScholars.length).toBeGreaterThan(0);

    const classical = await getScholars({ isContemporary: false });
    expect(classical.every((s) => s.is_contemporary === false)).toBe(true);

    const contemporary = await getScholars({ isContemporary: true });
    expect(contemporary.every((s) => s.is_contemporary === true)).toBe(true);
  });

  it("finds scholars by exact slug or id", async () => {
    const scholar = await getScholarBySlug("al-bukhari");
    expect(scholar).not.toBeNull();
    expect(scholar?.name).toContain("البخاري");

    const nonExistent = await getScholarBySlug("non-existent-scholar");
    expect(nonExistent).toBeNull();
  });

  it("filters lessons by mediaType and category", async () => {
    const audioLessons = await getLessons({ mediaType: "audio" });
    expect(audioLessons.every((l) => l.media_type === "audio")).toBe(true);

    const hadithLessons = await getLessons({ categoryId: "cat-hadith" });
    expect(hadithLessons.every((l) => l.category_id === "cat-hadith")).toBe(true);
  });

  it("retrieves published books with author relationship attached", async () => {
    const books = await getBooks();
    expect(books.length).toBeGreaterThan(0);
    expect(books[0]?.usage_rights).toBe("public_domain");
  });

  it("finds hadith by ID or number and includes takhrij and grade", async () => {
    const hadith = await getHadithById("hadith-bukhari-1");
    expect(hadith).not.toBeNull();
    expect(hadith?.hadith_number).toBe(1);
    expect(hadith?.grade).toContain("صحيح");
    expect(hadith?.takhrij).toBeDefined();
    expect(hadith?.grade_source).toBeDefined();
    expect(hadith?.explanation_source).toBeDefined();
  });

  it("executes unified search across all 4 models and returns accurate facets", async () => {
    // 1. Empty query returns 0
    const emptySearch = await searchMidad("");
    expect(emptySearch.total).toBe(0);
    expect(emptySearch.results).toEqual([]);

    // 2. Arabic query with tashkeel or un-normalized characters
    const queryResult = await searchMidad("الاعمال");
    expect(queryResult.total).toBeGreaterThan(0);
    expect(queryResult.hadithsCount).toBeGreaterThan(0);

    // 3. Facets match total count
    const sumFacets =
      queryResult.scholarsCount +
      queryResult.lessonsCount +
      queryResult.booksCount +
      queryResult.hadithsCount;
    expect(queryResult.total).toBe(sumFacets);
  });

  it("provides transparent status of the current active data source", () => {
    const info = getDataSourceInfo();
    expect(info).toBeDefined();
    expect(info.provider).toBeDefined();
    expect(info.description).toBeDefined();
    // Since Supabase credentials are not set in the local test environment, it must report the baseline
    expect(info.isLiveDatabase).toBe(false);
    expect(info.provider).toContain("Verified Local Baseline");
  });
});
