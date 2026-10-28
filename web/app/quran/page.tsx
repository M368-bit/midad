import React from "react";
import Link from "next/link";
import {
  BookMarked,
  Sparkles,
  Search,
  Volume2,
  Bookmark,
  Compass,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { QURAN_SURAHS, SurahMeta } from "@/lib/data/quran-surahs";
import { QURAN_RECITERS } from "@/lib/services/quran-service";
import { QuranIndexClient } from "./QuranIndexClient";

export const metadata = {
  title: "المصحف الشريف — مصحف المدينة النبوية بالرسم العثماني | مداد",
  description:
    "تصفح وقراءة المصحف الشريف كاملاً بالرسم العثماني المعتمد لمصحف المدينة النبوية، مع التلاوات الصوتية لمشاهير القراء والتفسير الميسر لكل آية.",
};

export default function QuranPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 text-center space-y-6">
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-emerald rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <BookMarked className="w-3.5 h-3.5" />
          <span>مصحف المدينة النبوية — مجمع الملك فهد لطباعة المصحف الشريف</span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-traditional tracking-wide">
            المصحف الشريف
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            القرآن الكريم كاملاً برواية حفص عن عاصم بالرسم العثماني الأصيل، مدعوماً
            بتلاوات عذبة متقنة لأئمة القراء مع التفسير الميسر لكل آية.
          </p>
        </div>

        {/* Features Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs font-semibold">
          <div className="p-3 rounded-2xl glass-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
              ١١٤
            </span>
            <span className="text-[11px] text-slate-400">سورة كاملة</span>
          </div>
          <div className="p-3 rounded-2xl glass-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
              ٣٠
            </span>
            <span className="text-[11px] text-slate-400">جزءاً شريفاً</span>
          </div>
          <div className="p-3 rounded-2xl glass-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
              ٦٠٤
            </span>
            <span className="text-[11px] text-slate-400">صفحة بالرسم العثماني</span>
          </div>
          <div className="p-3 rounded-2xl glass-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
              ١٨
            </span>
            <span className="text-[11px] text-slate-400">قارئاً من كبار الأئمة</span>
          </div>
        </div>

        {/* Reciters Preview */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">مشاهير القراء وأئمة الحرمين:</span>
          {QURAN_RECITERS.slice(0, 6).map((r) => (
            <span
              key={r.id}
              className="px-3 py-1 rounded-full glass-sm text-slate-300 font-medium flex items-center gap-1.5"
            >
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>الشيخ {r.name}</span>
            </span>
          ))}
          <span className="px-3 py-1 rounded-full glass-emerald text-emerald-300 font-bold">
            + ١٢ قارئاً إضافياً
          </span>
        </div>
      </div>

      {/* ── Client Index (Search, Juz Filter, Makki/Madani, and Surahs List) ── */}
      <QuranIndexClient surahs={QURAN_SURAHS} />
    </div>
  );
}
