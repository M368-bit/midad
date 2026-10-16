import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          الصفحة أو المحتوى غير موجود
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          ربما تم نقل هذا المحتوى أو أنه لا يزال قيد التحقق والتوثيق من قبل لجنة المراجعة. نعتذر عن أي إزعاج.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link href="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" size="md">
            <span>البحث في المنصة</span>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
