import { describe, it, expect } from "vitest";
import { fetchVerifiedHadith } from "./hadith-api";

describe("Hadith API Integration Service", () => {
  it("fetches canonical Hadith #1 (إنما الأعمال بالنيات) with complete verification", async () => {
    const hadith = await fetchVerifiedHadith("ara-bukhari", 1);
    expect(hadith).not.toBeNull();
    if (hadith) {
      expect(hadith.hadith_number).toBe(1);
      expect(hadith.arabic_normalized).toContain("الاعمال بالنيات");
      expect(hadith.grade).toContain("صحيح");
      expect(hadith.status).toBe("published");
      expect(hadith.sources?.[0]?.is_verified).toBe(true);
      expect(hadith.sources?.[0]?.verified_url).toBe("https://sunnah.com/bukhari:1");
    }
  });

  it("handles non-existent hadith numbers gracefully without throwing", async () => {
    const hadith = await fetchVerifiedHadith("ara-bukhari", 9999999);
    expect(hadith).toBeNull();
  });
});
