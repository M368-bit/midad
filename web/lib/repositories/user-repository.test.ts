import { describe, it, expect, beforeEach } from "vitest";
import {
  getUserFavorites,
  toggleFavorite,
  isItemFavorited,
  recordHistoryItem,
  getUserHistory,
  _clearUserStorageForTesting,
} from "./user-repository";

describe("User Repository (Local Fallback & Isomorphic State)", () => {
  beforeEach(() => {
    _clearUserStorageForTesting();
  });

  it("starts with empty favorites and history", async () => {
    const favorites = await getUserFavorites();
    const history = await getUserHistory();
    expect(favorites).toEqual([]);
    expect(history).toEqual([]);
  });

  it("toggles favorite on (adds) and persists metadata", async () => {
    const isAdded = await toggleFavorite(
      "hadith",
      "bukhari-1",
      {
        title: "حديث إنما الأعمال بالنيات",
        subtitle: "صحيح البخاري",
        url: "/hadith/bukhari-1",
      }
    );

    expect(isAdded).toBe(true);

    const isFav = await isItemFavorited("hadith", "bukhari-1");
    expect(isFav).toBe(true);

    const favorites = await getUserFavorites();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].content_id).toBe("bukhari-1");
    expect(favorites[0].title).toBe("حديث إنما الأعمال بالنيات");
  });

  it("toggles favorite off (removes) when called again on same item", async () => {
    await toggleFavorite("book", "riyad-al-salihin", { title: "رياض الصالحين" });
    expect(await isItemFavorited("book", "riyad-al-salihin")).toBe(true);

    const isAddedSecondTime = await toggleFavorite("book", "riyad-al-salihin");
    expect(isAddedSecondTime).toBe(false);

    expect(await isItemFavorited("book", "riyad-al-salihin")).toBe(false);
    const favorites = await getUserFavorites();
    expect(favorites).toHaveLength(0);
  });

  it("records user history and prevents duplicates while updating order", async () => {
    await recordHistoryItem({
      contentType: "lesson",
      contentId: "lesson-1",
      title: "شرح كتاب التوحيد - الدرس الأول",
      url: "/lessons/lesson-1",
      progressSeconds: 120,
    });

    await recordHistoryItem({
      contentType: "scholar",
      contentId: "ibn-baz",
      title: "سماحة الشيخ عبد العزيز بن باز",
      url: "/scholars/ibn-baz",
    });

    let history = await getUserHistory();
    expect(history).toHaveLength(2);
    expect(history[0].content_id).toBe("ibn-baz");
    expect(history[1].content_id).toBe("lesson-1");

    // Re-visiting lesson-1 should move it to the top
    await recordHistoryItem({
      contentType: "lesson",
      contentId: "lesson-1",
      title: "شرح كتاب التوحيد - الدرس الأول",
      url: "/lessons/lesson-1",
      progressSeconds: 300,
    });

    history = await getUserHistory();
    expect(history).toHaveLength(2);
    expect(history[0].content_id).toBe("lesson-1");
    expect(history[0].progress_seconds).toBe(300);
  });
});
