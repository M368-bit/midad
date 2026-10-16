"use client";

import React, { useState } from "react";
import { Link2, CheckCircle2, XCircle, Clock, ShieldCheck, ExternalLink, Globe } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface CheckResult {
  isValid: boolean;
  statusCode?: number;
  responseTimeMs?: number;
  contentType?: string | null;
  verifiedAt: string;
  error?: string;
  isTrustedDomain?: boolean;
}

export default function AdminSourcesPage() {
  const [url, setUrl] = useState("https://shamela.ws/book/1680");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const predefinedUrls = [
    { label: "صحيح البخاري (المكتبة الشاملة)", url: "https://shamela.ws/book/1680" },
    { label: "صحيح البخاري الحديث 1 (Sunnah.com)", url: "https://sunnah.com/bukhari:1" },
    { label: "سيرة الشيخ ابن عثيمين (الموقع الرسمي)", url: "https://binothaimeen.net/site/biography" },
    { label: "سيرة الإمام ابن باز (الموقع الرسمي)", url: "https://binbaz.org.sa/biography" },
    { label: "رابط وهمي تجريبي للاختبار", url: "https://example-non-existent-domain-12345.xyz" },
  ];

  const handleVerify = async (testUrl = url) => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        isValid: false,
        error: "فشل الاتصال بخدمة التحقق",
        verifiedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-emerald-600" />
          <span>فاحص الروابط والمصادر النشط</span>
        </h2>
        <p className="text-xs text-slate-500">
          أداة فحص استجابة الخوادم للتأكد من صلاحية الروابط ومصداقية المصادر قبل النشر
        </p>
      </div>

      {/* Verifier Tool Box */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="أدخل رابط المصدر الخارجي (https://...)"
            className="flex-1"
          />
          <Button
            onClick={() => handleVerify()}
            variant="primary"
            isLoading={isLoading}
            className="shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>فحص وتوثيق الرابط الآن</span>
          </Button>
        </div>

        {/* Quick Test Links */}
        <div className="space-y-1.5 pt-2">
          <span className="text-xs text-slate-400 block">روابط سريعة للتجربة والفحص:</span>
          <div className="flex flex-wrap gap-2">
            {predefinedUrls.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setUrl(p.url);
                  handleVerify(p.url);
                }}
                className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result */}
        {result && (
          <div
            className={`p-5 rounded-xl border space-y-3 transition-all ${
              result.isValid
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80"
                : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
                <span
                  className={`font-bold text-sm ${
                    result.isValid
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-rose-900 dark:text-rose-200"
                  }`}
                >
                  {result.isValid
                    ? "الرابط نشط، معتمد، وقابل للنشر في مداد"
                    : "الرابط غير صالح أو خادم المصدر لا يستجيب"}
                </span>
              </div>

              {result.statusCode && (
                <Badge variant={result.isValid ? "emerald" : "rose"}>
                  HTTP {result.statusCode}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block">زمن الاستجابة:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {result.responseTimeMs ? `${result.responseTimeMs} ms` : "غير متاح"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">نوع المحتوى:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {result.contentType || "عام"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">النطاق الإسلامي المعتمد:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {result.isTrustedDomain ? "نطاق موثق وقائم" : "نطاق خارجي عام"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">توقيت الفحص:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(result.verifiedAt).toLocaleTimeString("ar-SA")}
                </span>
              </div>
            </div>

            {result.error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 pt-1">
                سبب الرفض: {result.error}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
