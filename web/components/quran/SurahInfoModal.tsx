"use client";

import React, { useEffect } from "react";
import { X, Sparkles, BookOpen, Compass, Layers, CheckCircle2 } from "lucide-react";
import { SurahHeaderBanner } from "./SurahHeaderBanner";
import { getSurahByNumber } from "@/lib/data/quran-surahs";

interface SurahInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  theme?: "sepia" | "dark" | "white";
  onNavigateToPage?: (pageNum: number) => void;
  onOpenShareModal?: () => void;
}

function toArabicNumerals(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => arabicDigits[parseInt(d, 10)] ?? d)
    .join("");
}

// Surah specific virtues & summaries for key surahs
const SURAH_SUMMARIES: Record<number, { title: string; desc: string }> = {
  1: {
    title: "أم الكتاب وفاتحة القرآن العظيم",
    desc: "أعظم سورة في كتاب الله، تُقرأ في كل ركعة من صلوات المسلمين. تشتمل على أصول العقيدة، والثناء على الله، وطلب الهداية إلى الصراط المستقيم.",
  },
  2: {
    title: "فسطاط القرآن وسنام التنزيل",
    desc: "أطول سور القرآن الكريم، فيها آية الكرسي وأطول آية (آية الدين)، تضمنت قواعد التشريع والعبادات والمعاملات، وتطرد الشياطين من البيت الذي تُقرأ فيه.",
  },
  3: {
    title: "الزهراء الثانية وحجاج أهل الكتاب",
    desc: "تُحاجّ عن صاحبها يوم القيامة مع سورة البقرة، تناولت غزوة أحد وتثبيت المؤمنين وتأصيل وحدانية الخالق وبراءة عيسى وأمه عليهما السلام.",
  },
  18: {
    title: "عصمة من فتنة الدجال ونور بين الجمعتين",
    desc: "تشتمل على أربع قصص كبرى تمثل فتن الحياة: فتنة الدين (أصحاب الكهف)، فتنة المال (صاحب الجنتين)، فتنة العلم (موسى والخضر)، وفتنة السلطان (ذو القرنين).",
  },
  36: {
    title: "قلب القرآن وتقرير البعث والنشور",
    desc: "سورة مكية عظيمة تُقرر البعث والجزاء بالأدلة القاطعة والآيات الكونية المشهودة وتثبيت رسالة النبي صلى الله عليه وسلم.",
  },
  55: {
    title: "عروس القرآن وإحصاء نعم الرحمن",
    desc: "تتكرر فيها الآية الكريمة (فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ) إحدى وثلاثين مرة للتذكير بآلاء الله ونعمه العظيمة في الدنيا والآخرة.",
  },
  67: {
    title: "المانعة المنجية من عذاب القبر",
    desc: "ثلاثون آية شفعت لرجل حتى غُفر له، تبرهن على كمال ملك الله وتدبيره للخلق والموت والحياة ليبلوكم أيكم أحسن عملاً.",
  },
  112: {
    title: "تعدل ثلث القرآن الشريف",
    desc: "سورة الإخلاص المحضة في توحيد الربوبية والألوهية والأسماء والصفات، تنزه الله سبحانه عن الصاحبة والولد والشريك والند.",
  },
  113: {
    title: "المعوّذة الأولى من شرور المخلوقات",
    desc: "استعاذة برب الفلق من شر كل ذي شر، ومن شر الليل إذا أظلم، والنفث في العقد، والحاسد إذا حسد.",
  },
  114: {
    title: "المعوّذة الثانية وحصن العبد الحصين",
    desc: "استعاذة برب الناس وملكهم وإلههم من شر الوسواس الخناس الجاثم على قلوب البشر لصدّهم عن طاعة ربهم.",
  },
};

export function SurahInfoModal({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  theme = "sepia",
  onNavigateToPage,
  onOpenShareModal,
}: SurahInfoModalProps) {
  const meta = getSurahByNumber(surahNumber);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !meta) return null;

  const isMeccan = meta.revelationType === "Meccan";
  const customSummary = SURAH_SUMMARIES[surahNumber];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 anim-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="glass-elevated border border-emerald-500/30 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-7 shadow-2xl relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Close Button */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <BookOpen className="w-5 h-5" />
            <span>بطاقة معلومات السورة الشريفة</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Authentic King Fahd Complex Banner ─────────────────────────── */}
        <div className="py-1">
          <SurahHeaderBanner
            surahNumber={meta.number}
            surahName={meta.name}
            theme={theme}
            className="drop-shadow-md"
          />
        </div>

        {/* ── 4 Main Core Metrics Tiles ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
          {/* 1. Revelation Type */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
            <div className="text-xl">{isMeccan ? "🕋" : "🕌"}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">نوع السورة</div>
            <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
              {isMeccan ? "مكية" : "مدنية"}
            </div>
          </div>

          {/* 2. Number of Ayahs */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="text-xl">📖</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">عدد الآيات</div>
            <div className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
              {toArabicNumerals(meta.numberOfAyahs)} آية
            </div>
          </div>

          {/* 3. Surah Number in Mushaf */}
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-1">
            <div className="text-xl">🔢</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ترتيب المصحف</div>
            <div className="text-sm font-extrabold text-blue-700 dark:text-blue-300">
              السورة {toArabicNumerals(meta.number)}
            </div>
          </div>

          {/* 4. Revelation Order */}
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-1">
            <div className="text-xl">📜</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ترتيب النزول</div>
            <div className="text-sm font-extrabold text-purple-700 dark:text-purple-300">
              رقم {toArabicNumerals(meta.revelationOrder)}
            </div>
          </div>
        </div>

        {/* ── Location in Mushaf Tile ────────────────────────────────────── */}
        <div className="rounded-2xl p-3.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Compass className="w-4 h-4 text-emerald-500" />
            <span>بداية السورة في مصحف المدينة:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              الصفحة {toArabicNumerals(meta.page)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>الجزء: {toArabicNumerals(meta.juz)}</span>
          </div>
        </div>

        {/* ── Virtues / Meaning Summary ──────────────────────────────────── */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>
              {customSummary?.title ?? `من مقاصد وفضائل سورة ${meta.name} المباركة`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-traditional">
            {customSummary?.desc ??
              `سورة ${meta.name} من سور القرآن العظيم المباركة، اشتملت على معانٍ إيمانية جليلة وأحكام هادية تدعو لتوحيد الله وتزكية النفوس وسلوك الصراط المستقيم.`}
          </p>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 pt-2">
          {onNavigateToPage && (
            <button
              onClick={() => {
                onNavigateToPage(meta.page);
                onClose();
              }}
              className="btn-glass-emerald flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>الانتقال لبداية السورة (ص {toArabicNumerals(meta.page)})</span>
            </button>
          )}

          {onOpenShareModal && (
            <button
              onClick={() => {
                onClose();
                onOpenShareModal();
              }}
              className="btn-glass px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <span>مشاركة صورة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
