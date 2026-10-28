import { describe, it, expect } from "vitest";
import { verifySourceUrl, isTrustedIslamicDomain } from "./source-verifier";

describe("Source Verifier Service", () => {
  it("rejects malformed and non-HTTP URLs", async () => {
    const invalid1 = await verifySourceUrl("not-a-url");
    expect(invalid1.isValid).toBe(false);

    const invalid2 = await verifySourceUrl("ftp://example.com/file");
    expect(invalid2.isValid).toBe(false);
    expect(invalid2.error).toContain("HTTP أو HTTPS");

    const invalid3 = await verifySourceUrl("");
    expect(invalid3.isValid).toBe(false);
  });

  it("handles timeout gracefully when server takes too long", async () => {
    // 1 millisecond timeout should trigger abort immediately
    const res = await verifySourceUrl("https://httpbin.org/delay/5", 1);
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("accurately identifies trusted Islamic reference domains", () => {
    expect(isTrustedIslamicDomain("https://shamela.ws/book/123")).toBe(true);
    expect(isTrustedIslamicDomain("https://sunnah.com/bukhari:1")).toBe(true);
    expect(isTrustedIslamicDomain("https://dorar.net/hadith")).toBe(true);
    expect(isTrustedIslamicDomain("https://binbaz.org.sa/biography")).toBe(true);
    expect(isTrustedIslamicDomain("https://binothaimeen.net/site")).toBe(true);
    expect(isTrustedIslamicDomain("https://subdomain.archive.org/details/book")).toBe(true);
    expect(isTrustedIslamicDomain("https://untrusted-suspicious-domain.xyz/page")).toBe(false);
  });
});
