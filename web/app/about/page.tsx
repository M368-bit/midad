import React from "react";
import Link from "next/link";
import { ShieldCheck, BookOpen, Scroll, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>عن منصة مِــدَاد | MIDAD</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          المعرفة الإسلامية الأصيلة، برؤية تقنية محكمة
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          منصة معرفية متخصصة تهدف إلى تيسير الوصول إلى تراث الأمة الإسلامية المحقق
          من كتب وسنن وأحاديث وتراجم ودروس، بأعلى معايير التوثيق والمصداقية العلمية.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Scroll className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            لا اختلاق ولا افتعال
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            لا تدرج مداد أي حديث أو ترجمة أو كتاب دون إسناد حقيقي لمرجع معتمد. نفضل الحالة الفارغة النزيهة على اختلاق معلومات دينية غير محققة.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            تحقق تقني نشط من الروابط
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            لا نفترض أن رابطاً يعمل لمجرد أنه يبدأ بـ HTTPS؛ بل نتحقق برمجياً من استجابة خوادم المصادر وتاريخ الفحص ومطابقة المحتوى.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            حماية صارمة للخصوصية والحقوق
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            احترام كامل لحقوق الملكية الفكرية، والاكتفاء بالكتب المحررة في النطاق العام، مع حماية تامة لبيانات المستخدم عبر سياسات RLS على الخادم.
          </p>
        </Card>
      </div>

      {/* Methodology Section */}
      <Card className="p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span>منهجية التوثيق والنشر في المنصة</span>
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
          <p>
            تتبع منصة <strong>مداد</strong> دورة نشر محكمة تبدأ بإدخال المحتوى كـ (مسودة)، ثم مراجعته من قبل محررين متخصصين للتأكد من تخريج النص من كتب السنة المشهورة (مثل صحيح البخاري ومسلم)، ومطابقة أرقام الأبواب والصفحات والمجلدات.
          </p>
          <p>
            فيما يتعلق بالصوتيات والمحاضرات، يتم ربط كل درس بمصدره الأصلي الموثق (مثل المؤسسات الرسمية للعلماء وإذاعات القرآن الكريم المعتمدة)، مع التحقق المسبق من استقرار الرابط وصلاحيته للتشغيل قبل الاعتماد للنشر العام.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>الإصدار: 1.0.0 (المرحلة الأولى)</span>
          <Link
            href="/terms"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            شروط الاستخدام وحقوق الملكية ←
          </Link>
        </div>
      </Card>
    </div>
  );
}
