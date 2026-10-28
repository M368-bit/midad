"use client";

import React, { useState, useEffect } from "react";
import {
  SURAH_FRAME_LIGHT_DATA_URL,
  SURAH_FRAME_DARK_DATA_URL,
} from "@/lib/data/surah-frames";

export interface SurahHeaderBannerProps {
  surahNumber: number;
  surahName: string;
  theme?: "sepia" | "dark" | "white";
  numberOfAyahs?: number;
  revelationType?: string;
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
}

export function SurahHeaderBanner({
  surahNumber,
  surahName,
  theme = "sepia",
  numberOfAyahs,
  revelationType,
  className = "",
  onClick,
  showSubtitle = false,
}: SurahHeaderBannerProps) {
  const isDark = theme === "dark";
  const [fontLoaded, setFontLoaded] = useState(true);

  // Check if surah-name font is ready
  useEffect(() => {
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts
        .load("32px surah-name")
        .then(() => setFontLoaded(true))
        .catch(() => setFontLoaded(true));
    }
  }, []);

  // Frame graphic: dark theme uses the authentic obsidian King Fahd frame, sepia/white uses the ivory parchment frame
  const frameSrc = isDark ? SURAH_FRAME_DARK_DATA_URL : SURAH_FRAME_LIGHT_DATA_URL;

  // Official King Fahd Complex font glyphs:
  // 0xe000 = "سُورَةُ"
  // 0xe000 + surahNumber = Calligraphic Name of the Surah
  const surahPrefixGlyph = String.fromCharCode(0xe000);
  const surahNameGlyph = String.fromCharCode(0xe000 + surahNumber);

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto select-none transition-all duration-300 ${
        onClick ? "cursor-pointer group hover:scale-[1.01] active:scale-[0.99]" : ""
      } ${className}`}
      dir="rtl"
      aria-label={`ترويسة سورة ${surahName} طبعة مجمع الملك فهد لطباعة المصحف الشريف`}
      title={onClick ? "انقر لعرض بطاقة ومعلومات السورة الشريفة" : undefined}
    >
      {/* ── 1. The Authentic King Fahd Complex Symmetrical Border Frame ── */}
      <div className="relative w-full aspect-[1004/110] drop-shadow-sm transition-transform duration-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc}
          alt={`إطار سورة ${surahName}`}
          className="w-full h-full object-contain pointer-events-none select-none"
          loading="eager"
          decoding="sync"
        />

        {/* ── 2. The Center Cartouche Calligraphic Surah Name ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`inline-flex items-center justify-center flex-row-reverse gap-1 sm:gap-2 font-surah-name tracking-normal leading-none transition-colors duration-200 ${
              isDark
                ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                : "text-[#1F170D] drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.15)]"
            }`}
            style={{
              fontSize: "clamp(22px, 4.4vw, 36px)",
            }}
          >
            {fontLoaded ? (
              <>
                <span className="leading-none">{surahPrefixGlyph}</span>
                <span className="leading-none">{surahNameGlyph}</span>
              </>
            ) : (
              <span className="font-traditional font-bold leading-none">
                سُورَةُ {surahName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Optional Subtle Metadata Pill (if requested) ── */}
      {showSubtitle && (numberOfAyahs || revelationType) && (
        <div className="flex items-center justify-center gap-2 mt-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
          {revelationType && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {revelationType === "Medinan" || revelationType === "مدنية" ? "مدنية" : "مكية"}
            </span>
          )}
          {numberOfAyahs && (
            <span className="px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50">
              {numberOfAyahs} آيات
            </span>
          )}
        </div>
      )}
    </div>
  );
}
