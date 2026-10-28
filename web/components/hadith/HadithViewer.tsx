"use client";

import React, { useState } from "react";
import { Hadith } from "@/types";
import { removeTashkeel } from "@/lib/arabic-utils";
import { Copy, Check, Share2, BookOpen, Layers, Eye, EyeOff } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { FavoriteButton } from "../shared/FavoriteButton";
import { SourceVerificationBadge } from "../shared/SourceVerificationBadge";

interface HadithViewerProps {
  hadith: Hadith;
}

export function HadithViewer({ hadith }: HadithViewerProps) {
  // Default = FALSE — plain text, no tashkeel overlap risk
  const [showTashkeel, setShowTashkeel] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only show tashkeel when user explicitly requests it
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
      navigator.share({
        title: `حديث شريف: ${hadith.chapter_title || ""}`,
        text: displayedText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const primarySource = hadith.sources?.[0];

  return (
    <div className="space-y-5">

      {/* ── Controls Bar ── */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="emerald" size="md">{hadith.grade}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            رقم الحديث: {hadith.hadith_number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tashkeel toggle — clearly labeled */}
          <button
            onClick={() => setShowTashkeel(!showTashkeel)}
            aria-pressed={showTashkeel}
            title={showTashkeel ? "إخفاء التشكيل" : "إظهار التشكيل"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
              showTashkeel
                ? "glass-emerald text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/50"
                : "glass-sm text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10"
            }`}
          >
            {showTashkeel ? (
              <><EyeOff className="w-3.5 h-3.5" /><span>بدون تشكيل</span></>
            ) : (
              <><Eye className="w-3.5 h-3.5" /><span>مع التشكيل</span></>
            )}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl glass-sm text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all hover:scale-110 active:scale-95"
            title="نسخ الحديث وتخريجه"
            aria-label="نسخ الحديث"
          >
            {copied
              ? <Check className="w-4 h-4 text-emerald-500" />
              : <Copy className="w-4 h-4" />
            }
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl glass-sm text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-all hover:scale-110 active:scale-95"
            title="مشاركة الحديث"
            aria-label="مشاركة"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Favorite */}
          <FavoriteButton
            contentType="hadith"
            contentId={hadith.id}
            title={`حديث: ${hadith.chapter_title || ""}`}
            subtitle={hadith.takhrij}
            url={`/hadith/${hadith.id}`}
          />
        </div>
      </div>

      {/* ── Tashkeel warning banner ── */}
      {showTashkeel && (
        <div className="glass-emerald rounded-xl px-4 py-2.5 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300 anim-slide-down">
          <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            التشكيل مُفعَّل — تمت زيادة المسافة بين الأسطر تلقائيًا لمنع التداخل.
            لرؤية أوضح، اضغط «بدون تشكيل».
          </span>
        </div>
      )}

      {/* ── Main Matn Card ── */}
      <Card className="relative overflow-hidden">
        {/* Corner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-48 h-48"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(16,185,129,0.08), transparent 70%)",
          }}
        />

        <div className="relative z-10 p-6 sm:p-8">
          {hadith.chapter_title && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-5 pb-3 border-b border-slate-200/50 dark:border-white/08">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>{hadith.chapter_title}</span>
            </div>
          )}

          {/*
            KEY FIX:
            - Without tashkeel: hadith-text-plain  → line-height: 2.0
            - With tashkeel:    hadith-text-tashkeel → line-height: 3.4 + padding
            This prevents tashkeel marks from overlapping adjacent lines.
          */}
          <div
            className={`text-slate-800 dark:text-slate-100 text-justify selection:bg-emerald-500/20 ${
              showTashkeel
                ? "hadith-text-tashkeel text-lg sm:text-2xl"
                : "hadith-text-plain text-xl sm:text-2xl"
            }`}
          >
            {displayedText}
          </div>

          {hadith.narrator && (
            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-white/08 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                الصحابي الراوي:{" "}
              </span>
              {hadith.narrator}
            </div>
          )}
        </div>
      </Card>

      {/* ── Takhrij & Sharh ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Takhrij */}
        <Card className="flex flex-col justify-between">
          <div className="p-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>التخريج وحكم الحديث</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-7 mb-2 font-medium">
              {hadith.takhrij}
            </p>
            {hadith.grade_source && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-6">
                <span className="font-semibold text-slate-700 dark:text-slate-300">توثيق درجة الصحة: </span>
                {hadith.grade_source}
              </p>
            )}
          </div>
          <div className="px-5 pb-5 pt-2 border-t border-slate-200/40 dark:border-white/06">
            <SourceVerificationBadge
              isVerified={primarySource?.is_verified ?? true}
              sourceTitle={primarySource?.reference_book}
              sourceUrl={primarySource?.verified_url}
              verifiedAt={primarySource?.verified_at}
            />
          </div>
        </Card>

        {/* Sharh */}
        <Card className="flex flex-col justify-between">
          <div className="p-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>الشرح والفوائد المستنبطة</span>
            </div>
            {hadith.explanation ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-7 text-justify">
                  {hadith.explanation}
                </p>
                {hadith.explanation_source && (
                  <div className="glass-emerald rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 leading-6">
                    <span className="font-bold">مرجع الشرح المعتمد: </span>
                    {hadith.explanation_source}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-sm rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 leading-6">
                لم يُدرج شرح موثق لهذا الحديث حتى الآن في المنصة. تلتزم مداد بعدم نسبة أي شرح دون عزو صريح ومفصل لمصدره المعتمد.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
