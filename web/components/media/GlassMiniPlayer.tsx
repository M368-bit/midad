"use client";

import React from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Radio,
  Loader2,
} from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { formatMediaTime } from "@/lib/media-utils";
import { usePathname } from "next/navigation";

export function GlassMiniPlayer() {
  const pathname = usePathname();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    isMuted,
    isMiniPlayerVisible,
    togglePlay,
    skip,
    seek,
    toggleMute,
    openFullPlayer,
    dismissMiniPlayer,
  } = useAudioPlayer();

  // Hide generic audio player when on Quran reader page to avoid dock overlap
  if (!isMiniPlayerVisible || !currentTrack || pathname?.startsWith("/quran/")) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="مشغل الصوت المصغر"
      className="fixed bottom-4 inset-x-3 sm:inset-x-6 max-w-3xl mx-auto z-40 animate-fadeIn"
    >
      <div className="relative overflow-hidden liquid-glass-elevated rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-glass dark:shadow-glass-dark p-3 sm:p-3.5 backdrop-blur-2xl">
        {/* Subtle Top Progress Scrubber Bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-label="تقدم الاستماع"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // RTL calculation: right side is 0, left side is 100%
            const clickX = e.clientX - rect.left;
            const ratio = 1 - clickX / rect.width;
            if (duration > 0) {
              seek(ratio * duration);
            }
          }}
          className="absolute top-0 inset-x-0 h-1 bg-slate-200/60 dark:bg-white/10 cursor-pointer group"
        >
          <div
            className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-150 relative group-hover:h-1.5"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
              <Radio className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/lessons/${currentTrack.id}`}
                className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </Link>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentTrack.scholarName && (
                  <span className="truncate">{currentTrack.scholarName}</span>
                )}
                <span>•</span>
                <span className="font-mono text-[10px]">
                  {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Skip Back 15s */}
            <button
              onClick={() => skip(-15)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-xl transition-all"
              title="رجوع 15 ثانية"
              aria-label="رجوع 15 ثانية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-glass-emerald border border-emerald-400/30 transition-all"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 mr-0.5" />
              )}
            </button>

            {/* Skip Forward 15s */}
            <button
              onClick={() => skip(15)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-xl transition-all"
              title="تقديم 15 ثانية"
              aria-label="تقديم 15 ثانية"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Mute Toggle (desktop) */}
            <button
              onClick={toggleMute}
              className="hidden sm:inline-flex p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-xl transition-all"
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
              aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Expand to Full Player */}
            <button
              onClick={openFullPlayer}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-xl transition-all"
              title="تكبير المشغل"
              aria-label="تكبير المشغل الصوتي الكامل"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Dismiss / Close Mini Player */}
            <button
              onClick={dismissMiniPlayer}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="إغلاق المشغل"
              aria-label="إغلاق المشغل"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
