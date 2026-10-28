"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  Radio,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAudioPlayer } from "./AudioPlayerContext";
import { formatMediaTime } from "@/lib/media-utils";

export function GlassFullPlayerModal() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    isLoading,
    error,
    isFullPlayerOpen,
    togglePlay,
    seek,
    skip,
    setPlaybackRate,
    setVolume,
    toggleMute,
    closeFullPlayer,
  } = useAudioPlayer();

  // Keyboard shortcut listener while modal is open
  useEffect(() => {
    if (!isFullPlayerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Guard against typing in forms
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        closeFullPlayer();
      } else if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        // In RTL, ArrowLeft typically steps forward in time
        skip(10);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        // In RTL, ArrowRight typically steps backward in time
        skip(-10);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullPlayerOpen, togglePlay, skip, closeFullPlayer]);

  if (!isFullPlayerOpen || !currentTrack) {
    return null;
  }

  const remainingTime = Math.max(0, duration - currentTime);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="المشغل الصوتي الكامل"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xl animate-fadeIn"
    >
      {/* Liquid Glass Modal Card */}
      <div className="relative w-full max-w-xl liquid-glass-elevated rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/15 shadow-2xl overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header bar with minimize button */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Radio className="w-4 h-4" />
            <span>مشغل الدروس المعتمد — مداد</span>
          </div>

          <button
            onClick={closeFullPlayer}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white liquid-glass-control rounded-full transition-all"
            title="تصغير المشغل"
            aria-label="تصغير المشغل"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Cover / Scholar Emblem Artwork */}
        <div className="relative mx-auto my-4 w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-900/60 to-emerald-950/40 border border-emerald-500/30 flex flex-col items-center justify-center text-center p-4 shadow-glass-emerald">
          <div className="w-20 h-20 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-white mb-2 shadow-inner">
            <span className="font-traditional text-4xl select-none">م</span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
            صوتيات موثقة
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            نقاء رقمي عالي الجودة
          </span>
        </div>

        {/* Track Metadata */}
        <div className="text-center my-4 space-y-2">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
            {currentTrack.title}
          </h2>

          {currentTrack.scholarName && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>{currentTrack.scholarName}</span>
            </div>
          )}

          {currentTrack.publisher && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3 h-3" />
              <span>الجهة الموثقة: {currentTrack.publisher}</span>
            </div>
          )}
        </div>

        {/* Error Notice if any */}
        {error && (
          <div className="p-3 my-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Interactive Scrubber Bar */}
        <div className="my-6 space-y-2">
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-label="شريط وقت التسجيل الصوتي"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") skip(10);
              if (e.key === "ArrowRight") skip(-10);
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              // RTL: right is 0%, left is 100%
              const ratio = 1 - clickX / rect.width;
              if (duration > 0) {
                seek(ratio * duration);
              }
            }}
            className="relative h-2 rounded-full bg-slate-200 dark:bg-white/10 cursor-pointer overflow-hidden group transition-all"
          >
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-100"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>{formatMediaTime(currentTime)}</span>
            <span>-{formatMediaTime(remainingTime)}</span>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-center gap-6 my-4">
          {/* Skip Back 15s */}
          <button
            onClick={() => skip(-15)}
            className="p-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-2xl active:scale-95 transition-all"
            title="رجوع 15 ثانية"
            aria-label="رجوع 15 ثانية"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-glass-emerald border border-emerald-400/40 transition-all"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isLoading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 mr-1" />
            )}
          </button>

          {/* Skip Forward 15s */}
          <button
            onClick={() => skip(15)}
            className="p-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-2xl active:scale-95 transition-all"
            title="تقديم 15 ثانية"
            aria-label="تقديم 15 ثانية"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary Options: Speed Pills & Volume Control */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Playback Speed selector */}
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="سرعة التشغيل">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1">السرعة:</span>
            {speeds.map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  playbackRate === rate
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "liquid-glass-control text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label="مستوى الصوت"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
