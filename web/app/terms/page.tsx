import React from "react";
import { ShieldCheck, Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <Scale className="w-4 h-4" />
          <span>الشروط والأحكام</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          شروط الاستخدام وحقوق الملكية
        </h1>
        <p className="text-xs text-slate-500">
          آخر تحديث: 2026-01-01
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            1. طبيعة المنصة ورسالتها
          </h2>
          <p>
            منصة <strong>مداد | MIDAD</strong> مشروع معرفي مخصص لنشر العلوم الإسلامية الموثقة من كتب التراث وسنة النبي ﷺ والدروس المسندة. استخدامك للمنصة يعني موافقتك على الالتزام بآداب الاستخدام الشرعية والنظامية.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            2. حقوق الملكية الفكرية ومصادر المحتوى
          </h2>
          <p>
            المتون التراثية القديمة (مثل متون كتب الحديث وشروحها المتقدمة) تعد ملكية عامة (Public Domain). أما التحقيقات الحديثة والمطبوعات والصوتيات المسجلة، فحقوقها محفوظة لأصحابها ومؤسساتها الأصلية، وتقتصر منصة مداد على إحالتها لمصادرها الأصلية المصرح بها مع بيان جهة النشر.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            3. ضوابط استخدام المحتوى
          </h2>
          <p>
            يُمنع استخدام محتوى المنصة في أي سياق يهدف إلى تزييف النصوص النبوية الشريفة، أو إساءة استغلال أسماء العلماء، أو أي استخدام تجاري غير مصرح به ينتهك حقوق الناشرين والمؤلفين.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            4. التعديل والتحديث
          </h2>
          <p>
            تحتفظ إدارة المنصة بحق تحديث شروط الاستخدام لمواكبة التطورات التقنية والتنظيمية، مع إشعار المستخدمين عبر المنصة بأي تغييرات جوهرية.
          </p>
        </section>
      </Card>
    </div>
  );
}
