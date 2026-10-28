import React from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Lock className="w-4 h-4" />
          <span>الأمان والخصوصية</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          سياسة الخصوصية
        </h1>
        <p className="text-xs text-slate-500">
          آخر تحديث: 2026-01-01
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            1. التزامنا بحماية خصوصيتك
          </h2>
          <p>
            تلتزم منصة <strong>مداد | MIDAD</strong> بحماية خصوصية كافة المستخدمين والزوار. نحن لا نقوم ببيع أو مشاركة أو تداول بياناتك الشخصية مع أي طرف ثالث لأغراض دعائية أو تجارية على الإطلاق.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            2. البيانات التي نقوم بجمعها
          </h2>
          <p>
            تقتصر البيانات التي نجمعها على ما تحتاجه وظائف المنصة الأساسية:
          </p>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li>عنوان البريد الإلكتروني والاسم المستعار عند قيامك بإنشاء حساب مسجل.</li>
            <li>قائمة المفضلة وسجل التقدم في الاستماع للمحاضرات لتمكينك من المتابعة بسلاسة.</li>
            <li>سجلات فنية طفيفة لضمان استقرار الخوادم ومكافحة الهجمات الإلكترونية.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            3. الحماية التقنية ومستوى أمان البيانات (RLS)
          </h2>
          <p>
            تُدار قواعد بياناتنا عبر تقنية Supabase PostgreSQL وتخضع لسياسات أمان صارمة على مستوى السجل (Row Level Security - RLS). هذا يضمن تقنياً وبرمجياً أن كل مستخدم هو الوحيد القادر على استعراض أو تعديل مفضلته وسجل تصفحه، ويمنع أي مستخدم آخر من الوصول إليها.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            4. حقك في حذف البيانات
          </h2>
          <p>
            يحق لك في أي وقت مسح سجل نشاطك بضغطة زر واحدة من واجهة السجل، كما يمكنك طلب حذف حسابك وبياناتك نهائياً من خوادمنا.
          </p>
        </section>
      </Card>
    </div>
  );
}
