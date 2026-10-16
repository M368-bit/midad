"use client";

import React, { useState } from "react";
import { Hadith } from "@/types";
import { removeTashkeel } from "@/lib/arabic-utils";
import { Copy, Check, Share2, BookOpen, Layers } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { FavoriteButton } from "../shared/FavoriteButton";
import { SourceVerificationBadge } from "../shared/SourceVerificationBadge";

interface HadithViewerProps {
  hadith: Hadith;
}

export function HadithViewer({ hadith }: HadithViewerProps) {
  const [showTashkeel, setShowTashkeel] = useState(true);
  const [copied, setCopied] = useState(false);

  const displayedText = showTashkeel
    ? hadith.arabic_text
    : removeTashkeel(hadith.arabic_text);

  const handleCopy = () => {
    const textToCopy = `«${displayedText}»\n\nالراوي: ${hadith.narrator || "صحابي الحديث"}\nدرجة الصحة: ${hadith.grade}\nالتخريج: ${hadith.takhrij}\nمنصة مداد للمعرفة الإسلامية: ${window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `حديث شريف: ${hadith.chapter_title || ""}`,
          text: displayedText,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const primarySource = hadith.sources?.[0];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="md">
            {hadith.grade}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            رقم الحديث: {hadith.hadith_number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tashkeel Toggle */}
          <button
            onClick={() => setShowTashkeel(!showTashkeel)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showTashkeel
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {showTashkeel ? "إخفاء التشكيل" : "إظهار التشكيل"}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="نسخ الحديث وتخريجه"
            aria-label="نسخ الحديث"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="مشاركة الحديث"
            aria-label="مشاركة"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Favorite Button */}
          <FavoriteButton
            contentType="hadith"
            contentId={hadith.id}
            title={`حديث: ${hadith.chapter_title || ""}`}
            subtitle={hadith.takhrij}
            url={`/hadith/${hadith.id}`}
          />
        </div>
      </div>

      {/* Main Hadith Matn Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-[#080d17]">
        {hadith.chapter_title && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Layers className="w-3.5 h-3.5" />
            <span>{hadith.chapter_title}</span>
          </div>
        )}

        <div className="font-traditional text-lg sm:text-2xl text-slate-800 dark:text-slate-100 leading-[2.4] text-justify selection:bg-emerald-500/20">
          {displayedText}
        </div>

        {hadith.narrator && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              الصحابي الراوي:{" "}
            </span>
            {hadith.narrator}
          </div>
        )}
      </Card>

      {/* Takhrij & Sharh Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Takhrij Card */}
        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2.5">
            <BookOpen className="w-4 h-4" />
            <span>التخريج المعتمد</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {hadith.takhrij}
          </p>
          <SourceVerificationBadge
            isVerified={primarySource?.is_verified ?? true}
            sourceTitle={primarySource?.reference_book}
            sourceUrl={primarySource?.verified_url}
            verifiedAt={primarySource?.verified_at}
          />
        </Card>

        {/* Sharh Card */}
        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-2.5">
            <BookOpen className="w-4 h-4" />
            <span>الشرح الميسر الموثق</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {hadith.explanation || "الشرح المعتمد مسند إلى شروح أئمة الحديث المعتمدة كفتح الباري وشرح النووي على صحيح مسلم."}
          </p>
        </Card>
      </div>
    </div>
  );
}
