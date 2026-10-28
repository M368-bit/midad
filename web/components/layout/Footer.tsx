import React from "react";
import Link from "next/link";
import { ShieldCheck, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-auto relative overflow-hidden">
      {/* Glass border top line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="glass-elevated border-0 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand Info */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="relative flex items-center justify-center w-full h-full">
                    <span className="font-traditional font-bold text-lg text-white select-none">م</span>
                  </div>
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="font-bold text-base text-slate-900 dark:text-white leading-none">
                    مِــدَاد
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-[0.2em] uppercase opacity-80">
                    MIDAD
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                منصة إسلامية موثقة للمعرفة الشرعية، تعتمد على المصادر الأصيلة المحققة من
                كتب التراث والحديث والدروس المسندة، برؤية تقنية معاصرة ودقيقة.
              </p>

              <div className="inline-flex items-center gap-1.5 glass-emerald rounded-xl px-3 py-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>منهجية توثيق صارمة وخالية من النتائج المفتعلة</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-3 h-px bg-emerald-500" />
                أقسام المنصة
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { href: "/quran", label: "المصحف الشريف وتفاسيره" },
                  { href: "/hadith", label: "الحديث الشريف وتخريجه" },
                  { href: "/books", label: "المكتبة الإسلامية والكتب" },
                  { href: "/lessons", label: "الدروس والمحاضرات الصوتية" },
                  { href: "/scholars", label: "العلماء والدعاة" },
                  { href: "/search", label: "محرك البحث المتخصص" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-500 transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Links */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-3 h-px bg-emerald-500" />
                المستخدم والخدمات
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { href: "/favorites", label: "قائمتي المفضلة" },
                  { href: "/history", label: "سجل الاستماع والتصفح" },
                  { href: "/profile", label: "الملف الشخصي" },
                  { href: "/admin", label: "بوابة المراجعة والإدارة" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-500 transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & About */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-3 h-px bg-emerald-500" />
                عن المشروع والسياسات
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { href: "/about", label: "عن منصة مداد ومنهجية التوثيق" },
                  { href: "/privacy", label: "سياسة الخصوصية" },
                  { href: "/terms", label: "شروط الاستخدام وحقوق الملكية" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-500 transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Globe badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/06">
                <Globe className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>وقف معرفي تقني لخدمة العلم النافع</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 mt-8 border-t border-slate-200/50 dark:border-white/06 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-3">
            <p>
              © {new Date().getFullYear()} مداد | MIDAD — جميع حقوق المحتوى محفوظة لمصادرها الأصلية المعتمدة.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
              <span>خدمات نشطة</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
