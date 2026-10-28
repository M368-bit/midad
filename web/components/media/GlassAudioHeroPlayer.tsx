"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Radio,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAudioPlayer, AudioTrack } from "./AudioPlayerContext";
import { formatMediaTime } from "@/lib/media-utils";

interface GlassAudioHeroPlayerProps {
  track: AudioTrack;
}

export function GlassAudioHeroPlayer({ track }: GlassAudioHeroPlayerProps) {
  const {
    currentTrack,
    isPlaying: isGlobalPlaying,
    currentTime: globalTime,
    duration: globalDuration,
    playbackRate,
    volume,
    isMuted,
    isLoading: isGlobalLoading,
    error,
    playTrack,
    togglePlay,
    seek,
    skip,
    setPlaybackRate,
    setVolume,
    toggleMute,
    openFullPlayer,
  } = useAudioPlayer();

  const isCurrent = currentTrack?.id === track.id;
  const isPlaying = isCurrent && isGlobalPlaying;
  const isLoading = isCurrent && isGlobalLoading;
  const currentTime = isCurrent ? globalTime : 0;
  const duration = isCurrent && globalDuration > 0 ? globalDuration : (track.duration || 0) * 60;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  const handleToggle = () => {
    if (!isCurrent) {
      playTrack(track);
    } else {
      togglePlay();
    }
  };

  return (
    <div className="relative overflow-hidden liquid-glass-elevated rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-glass dark:shadow-glass-dark">
      {/* Decorative ambient liquid light */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-l from-emerald-500/10 to-transparent blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-glass-emerald shrink-0">
            <Radio className={`w-6 h-6 ${isPlaying ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                تسجيل صوتي معتمد
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                MIDAD LIQUID AUDIO
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {track.title}
            </h3>
          </div>
        </div>

        {/* Live Audio Equalizer indicator (lightweight CSS) */}
        <div className="flex items-center gap-1 h-5 self-start sm:self-auto px-3 py-1 rounded-full liquid-glass-control">
          {[60, 100, 40, 80, 50].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-emerald-500 transition-all duration-300 ${
                isPlaying ? "animate-pulse" : "opacity-30"
              }`}
              style={{
                height: isPlaying ? `${h}%` : "30%",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mr-2">
            {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
          </span>
        </div>
      </div>

      {/* Error message */}
      {isCurrent && error && (
        <div className="my-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
          {error}
        </div>
      )}

      {/* Progress Bar / Scrubber */}
      <div className="my-6 space-y-2">
        <div
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          aria-label="شريط تقدم الدرس الصوتي"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") skip(10);
            if (e.key === "ArrowRight") skip(-10);
          }}
          onClick={(e) => {
            if (!isCurrent) {
              playTrack(track);
              return;
            }
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            // RTL calculation
            const ratio = 1 - clickX / rect.width;
            if (duration > 0) {
              seek(ratio * duration);
            }
          }}
          className="relative h-2.5 rounded-full bg-slate-200/80 dark:bg-white/10 cursor-pointer overflow-hidden group transition-all"
        >
          <div
            className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-100 relative group-hover:brightness-110"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>{formatMediaTime(currentTime)}</span>
          <span>-{formatMediaTime(Math.max(0, duration - currentTime))}</span>
        </div>
      </div>

      {/* Primary Player Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
        {/* Speed Pills */}
        <div className="flex items-center gap-1.5 order-2 sm:order-1" role="radiogroup" aria-label="سرعة التشغيل">
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">السرعة:</span>
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

        {/* Center: Play/Pause and Skip buttons */}
        <div className="flex items-center gap-4 order-1 sm:order-2">
          <button
            onClick={() => {
              if (!isCurrent) playTrack(track);
              else skip(-15);
            }}
            className="p-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-2xl active:scale-95 transition-all"
            title="رجوع 15 ثانية"
            aria-label="رجوع 15 ثانية"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggle}
            disabled={isLoading}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-glass-emerald border border-emerald-400/40 transition-all"
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

          <button
            onClick={() => {
              if (!isCurrent) playTrack(track);
              else skip(15);
            }}
            className="p-3 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 liquid-glass-control rounded-2xl active:scale-95 transition-all"
            title="تقديم 15 ثانية"
            aria-label="تقديم 15 ثانية"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Right side: Volume and Expand to Full Modal */}
        <div className="flex items-center gap-3 order-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
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
              className="w-16 sm:w-20 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label="مستوى الصوت"
            />
          </div>

          <button
            onClick={() => {
              if (!isCurrent) playTrack(track);
              openFullPlayer();
            }}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 liquid-glass-control rounded-xl transition-all"
            title="تكبير المشغل الصوتي"
            aria-label="تكبير المشغل الصوتي"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
