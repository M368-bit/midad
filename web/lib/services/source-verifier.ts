/**
 * خدمة التحقق المنهجي من المصادر وروابط النشر
 * Source URL Verification & Reliability Checker
 */

export interface SourceVerificationResult {
  isValid: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  contentType?: string | null;
  finalUrl?: string;
  isRedirected?: boolean;
  verifiedAt: string;
  error?: string;
}

/**
 * فحص صحة الرابط الخارجي عبر إرسال طلب HEAD أو GET خفيف
 * والتأكد من استجابة الخادم برمز نجاح حقيقي، ومعالجة التحويلات والمهلات الزمنية
 */
export async function verifySourceUrl(
  url: string,
  timeoutMs = 6000
): Promise<SourceVerificationResult> {
  const verifiedAt = new Date().toISOString();

  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "الرابط فارغ أو غير صالح",
      verifiedAt,
    };
  }

  // التحقق من صيغة الرابط والبروتوكول
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        error: "البروتوكول يجب أن يكون HTTP أو HTTPS فقط",
        verifiedAt,
      };
    }
  } catch {
    return {
      isValid: false,
      error: "صيغة الرابط غير صحيحة",
      verifiedAt,
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // محاولة أولى عبر طلب HEAD الخفيف مع تتبع التحويلات (Redirects)
    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Midad-Verifier/1.0 (Islamic Knowledge Platform; +https://midad.org)",
        Accept: "*/*",
      },
    });

    // بعض الخوادم ترفض HEAD بـ 405 Method Not Allowed أو 501؛ في هذه الحالة نطلب أول 1 كيلوبايت فقط عبر GET
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent": "Midad-Verifier/1.0 (Islamic Knowledge Platform; +https://midad.org)",
          Range: "bytes=0-1024",
        },
      });
    }

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const isSuccessful = response.status >= 200 && response.status < 400;
    const finalUrl = response.url || url;
    const isRedirected = Boolean(response.redirected || (response.url && response.url !== url));

    return {
      isValid: isSuccessful,
      statusCode: response.status,
      responseTimeMs,
      contentType: response.headers.get("content-type"),
      finalUrl,
      isRedirected,
      verifiedAt,
      error: isSuccessful
        ? undefined
        : `استجاب خادم المصدر برمز غير ناجح: ${response.status} ${response.statusText}`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const isTimeout = err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
    const message = isTimeout
      ? `انتهت مهلة الاتصال بالمصدر (${timeoutMs} ms) دون استجابة`
      : err instanceof Error
      ? err.message
      : "فشل الاتصال بالمصدر";

    return {
      isValid: false,
      responseTimeMs,
      error: message,
      verifiedAt,
    };
  }
}

/**
 * التحقق من قيود المصادر الموثوقة لمنع إدراج روابط مجهولة أو مشبوهة
 */
export function isTrustedIslamicDomain(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    const trustedDomains = [
      "shamela.ws",
      "waqfeya.net",
      "quran.ksu.edu.sa",
      "sunnah.com",
      "dorar.net",
      "islamweb.net",
      "binbaz.org.sa",
      "binothaimeen.net",
      "alfawzan.af.org.sa",
      "archive.org",
      "github.com",
      "jsdelivr.net",
    ];

    return trustedDomains.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}
