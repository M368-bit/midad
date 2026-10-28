"use client";

import React from "react";
import { BookOpen, ShieldCheck, Sparkles, Bookmark } from "lucide-react";

interface BookCoverProps {
  title: string;
  author?: string;
  categoryName?: string;
  volumesCount?: number;
  coverImage?: string | null;
  className?: string;
  aspectRatio?: "book" | "square";
  size?: "sm" | "md" | "lg";
  leatherColor?: "emerald" | "maroon" | "navy" | "obsidian";
}

export function BookCover({
  title,
  author,
  categoryName,
  volumesCount = 1,
  coverImage,
  className = "",
  size = "md",
  leatherColor = "emerald",
}: BookCoverProps) {
  // If there's an actual external cover image provided
  if (coverImage && !coverImage.includes("waqfeya.net/cover")) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl glass-elevated border border-emerald-500/20 shadow-glass-dark group aspect-[3/4.2] ${className}`}
      >
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 right-3 left-3 text-right">
          <p className="font-traditional text-sm font-bold text-white drop-shadow-md line-clamp-2">
            {title}
          </p>
          {author && <p className="text-[11px] text-emerald-300 font-medium truncate">{author}</p>}
        </div>
      </div>
    );
  }

  // Size configurations
  const sizeClasses = {
    sm: "h-48 text-xs",
    md: "h-64 sm:h-72 text-sm",
    lg: "h-88 sm:h-96 text-base",
  }[size];

  // Leather color themes with realistic embossed depth
  const leatherGradients = {
    emerald: "from-[#022c22] via-[#064e3b] to-[#011a14] border-emerald-500/30 text-emerald-100",
    maroon: "from-[#3b0712] via-[#500724] to-[#1f020a] border-rose-500/30 text-rose-100",
    navy: "from-[#0a192f] via-[#102a45] to-[#040d1a] border-blue-500/30 text-blue-100",
    obsidian: "from-[#090d16] via-[#121826] to-[#04060a] border-emerald-500/20 text-slate-100",
  }[leatherColor];

  const foilColor = "text-emerald-300 dark:text-emerald-400";
  const frameBorder = "border-emerald-500/40";

  return (
    <div
      className={`relative w-full ${sizeClasses} rounded-2xl overflow-hidden shadow-2xl group flex flex-col justify-between p-3.5 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-glass-emerald select-none ${className}`}
      style={{
        boxShadow:
          "inset -8px 0 16px -6px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Background Leather Gradient with Specular Sheen */}
      <div className={`absolute inset-0 bg-gradient-to-br ${leatherGradients}`} />

      {/* Book Spine Simulation (Left Spine Strip with Ribbed Embossing) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-3 sm:w-4 border-l border-black/40 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)",
        }}
      >
        {/* Spine Raised Gilded Ribs (حلقات كعب الكتاب المذهب) */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/40 via-emerald-200/60 to-transparent" />
        <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/40 via-emerald-200/60 to-transparent" />
        <div className="absolute bottom-24 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/40 via-emerald-200/60 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/40 via-emerald-200/60 to-transparent" />
      </div>

      {/* Decorative Outer Double Inlaid Gilded Frame */}
      <div
        className={`absolute inset-2 sm:inset-3 border ${frameBorder} rounded-xl pointer-events-none`}
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 10px rgba(16,185,129,0.15)",
        }}
      >
        {/* Ornate Corner Elements (زخارف أركان الإطار المذهب) */}
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400/70" />
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400/70" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400/70" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400/70" />
      </div>

      {/* ── Top Header: Category & Waqf Seal ───────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between text-[10px] sm:text-[11px] pr-2">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/40 border border-emerald-500/30 text-emerald-300 font-bold backdrop-blur-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>نسخة معتمدة ومحققة</span>
        </div>

        {categoryName && (
          <span className="text-slate-300/80 font-medium truncate max-w-[110px] bg-black/30 px-2 py-0.5 rounded">
            {categoryName}
          </span>
        )}
      </div>

      {/* ── Center: Royal Islamic Shamsah & Calligraphic Title ───────────── */}
      <div className="relative z-10 text-center my-auto px-3 sm:px-4 py-2">
        {/* Embossed Islamic Shamsah (الشمسة المركزية المذهبة) */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-emerald-400/40 animate-pulse opacity-60" />
          <div className="absolute inset-1 rounded-full border border-emerald-500/20" />
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Master Calligraphic Title */}
        <h3 className="font-traditional font-bold text-base sm:text-xl lg:text-2xl text-white leading-tight sm:leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-3">
          {title}
        </h3>

        {/* Traditional Author Inscription */}
        {author && (
          <div className="mt-2 pt-1 border-t border-emerald-500/20 max-w-[200px] mx-auto">
            <p className="text-[11px] sm:text-xs text-emerald-300 font-semibold truncate drop-shadow-sm">
              تأليف: {author}
            </p>
          </div>
        )}
      </div>

      {/* ── Footer: Volume Number & Royal Waqf Ribbon ────────────────────── */}
      <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300/90 pt-2 border-t border-emerald-500/25 pr-2">
        <span className="font-semibold text-emerald-300">
          {volumesCount > 1 ? `${volumesCount} مجلدات كاملة` : "مجلد واحد"}
        </span>

        <span className="text-[9px] text-slate-400 tracking-wider">
          خزانة التراث الإسلامي
        </span>
      </div>
    </div>
  );
}
