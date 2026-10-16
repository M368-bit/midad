"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MidadError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          حدث خطأ غير متوقع أثناء معالجة الطلب
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          نعمل باستمرار على معالجة الأخطاء لضمان استقرار المنصة ودقة مراجعها. يمكنك إعادة المحاولة الآن.
        </p>
      </div>

      <div className="pt-2">
        <Button onClick={() => reset()} variant="primary" size="md">
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </Button>
      </div>
    </div>
  );
}
