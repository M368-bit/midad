import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b12] text-slate-600 dark:text-slate-400 text-sm transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-traditional font-bold text-base">
                م
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                مِــدَاد | MIDAD
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              منصة إسلامية موثقة للمعرفة الشرعية، تعتمد على المصادر الأصيلة
              المحققة من كتب التراث والحديث والدروس المسندة، برؤية تقنية معاصرة
              ودقيقة.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>منهجية توثيق صارمة وخالية من النتائج المفتعلة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              أقسام المنصة
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/scholars"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  العلماء والدعاة
                </Link>
              </li>
              <li>
                <Link
                  href="/lessons"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  الدروس والمحاضرات الصوتية
                </Link>
              </li>
              <li>
                <Link
                  href="/books"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  المكتبة الإسلامية والكتب
                </Link>
              </li>
              <li>
                <Link
                  href="/hadith"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  الحديث الشريف وتخريجه
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  محرك البحث المتخصص
                </Link>
              </li>
            </ul>
          </div>

          {/* User Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              المستخدم والخدمات
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/favorites"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  قائمتي المفضلة
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  سجل الاستماع والتصفح
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  الملف الشخصي
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  بوابة المراجعة والإدارة
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              عن المشروع والسياسات
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  عن منصة مداد ومنهجية التوثيق
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  شروط الاستخدام وحقوق الملكية
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} مداد | MIDAD — جميع حقوق المحتوى محفوظة لمصادرها الأصلية المعتمدة.</p>
          <p className="flex items-center gap-1 text-[11px]">
            <span>وقف معرفي تقني لخدمة العلم النافع</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
