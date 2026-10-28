"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  Loader2,
  AlertCircle,
  Video,
} from "lucide-react";
import { recordHistoryItem } from "@/lib/repositories/user-repository";
import { useAuth } from "../auth/AuthProvider";
import { formatMediaTime } from "@/lib/media-utils";

interface GlassVideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  lessonTitle: string;
  scholarName?: string;
  posterUrl?: string;
  subtitlesUrl?: string;
  availableQualities?: string[];
}

export function GlassVideoPlayer({
  videoUrl,
  lessonId,
  lessonTitle,
  scholarName,
  posterUrl,
  subtitlesUrl,
  availableQualities,
}: GlassVideoPlayerProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>(
    availableQualities && availableQualities.length > 0 ? availableQualities[0]! : "تلقائية (Auto)"
  );
  const [isSubtitlesActive, setIsSubtitlesActive] = useState(false);

  // Auto-hide controls timer
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Only auto-hide if playing and settings popup is closed
    if (isPlaying && !isSettingsOpen) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isSettingsOpen]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      resetHideTimer();
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  // Periodic history recording
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (videoRef.current) {
        recordHistoryItem(
          {
            contentType: "lesson",
            contentId: lessonId,
            title: lessonTitle,
            url: `/lessons/${lessonId}`,
            progressSeconds: Math.floor(videoRef.current.currentTime),
          },
          user?.id
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, lessonId, lessonTitle, user?.id]);

  // Stop video if external audio player starts
  useEffect(() => {
    const handleAudioStarted = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("midad:audio-started", handleAudioStarted);
    return () => window.removeEventListener("midad:audio-started", handleAudioStarted);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      // Notify audio player to pause
      window.dispatchEvent(new CustomEvent("midad:video-started"));
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const skip = useCallback((secs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + secs, video.duration || 0));
  }, []);

  const seek = useCallback((secs: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(secs, video.duration || secs));
    setCurrentTime(video.currentTime);
  }, []);

  const setVolume = useCallback((val: number) => {
    const video = videoRef.current;
    const clamped = Math.max(0, Math.min(1, val));
    if (video) {
      video.volume = clamped;
      if (clamped > 0 && video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
    }
    setVolumeState(clamped);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
    }
    setPlaybackRateState(rate);
    setIsSettingsOpen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Check if user is in our video container or document body
      if (
        containerRef.current &&
        (containerRef.current.contains(activeEl) || activeEl === document.body)
      ) {
        if (e.key === " " || e.key === "k" || e.key === "K") {
          e.preventDefault();
          togglePlay();
          resetHideTimer();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          // RTL forward
          skip(10);
          resetHideTimer();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          // RTL backward
          skip(-10);
          resetHideTimer();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          resetHideTimer();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          resetHideTimer();
        } else if (e.key === "m" || e.key === "M") {
          e.preventDefault();
          toggleMute();
          resetHideTimer();
        } else if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          toggleFullscreen();
          resetHideTimer();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [volume, resetHideTimer, togglePlay, skip, setVolume, toggleMute, toggleFullscreen]);

  // Track fullscreen changes from ESC or native events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      onTouchStart={resetHideTimer}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black select-none border border-slate-800/80 shadow-2xl group transition-all"
    >
      {/* HTML5 Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        playsInline
        preload="metadata"
        onTimeUpdate={() => {
          if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
          setIsLoading(false);
          setError(null);
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setError("تعذر تشغيل البث المرئي من الرابط الأصلي. قد يكون المصدر غير متاح مؤقتاً.");
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      >
        {subtitlesUrl && isSubtitlesActive && (
          <track kind="subtitles" src={subtitlesUrl} srcLang="ar" label="العربية" default />
        )}
      </video>

      {/* Loading Spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none z-20">
          <div className="p-4 rounded-3xl liquid-glass-elevated border border-emerald-500/30 flex items-center gap-3 text-white">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <span className="text-xs font-bold font-sans">جاري تحميل البث المرئي المعتمد...</span>
          </div>
        </div>
      )}

      {/* Error State overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md z-30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <h4 className="text-base font-bold text-white">خطأ في جلب التسجيل المرئي</h4>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Big Center Play/Pause Indicator on tap/pause */}
      {!isPlaying && !isLoading && !error && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer z-10 transition-opacity"
        >
          <div className="w-20 h-20 rounded-3xl liquid-glass-elevated border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-glass-emerald hover:scale-105 active:scale-95 transition-all">
            <Play className="w-9 h-9 mr-1 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Top Bar (Title & Scholar) */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 transition-opacity duration-300 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="min-w-0 pr-1">
            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate drop-shadow-md">
              {lessonTitle}
            </h3>
            {scholarName && (
              <p className="text-[11px] text-emerald-400 truncate drop-shadow-sm font-medium">
                فضيلة الشيخ: {scholarName}
              </p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full liquid-glass-control text-[11px] text-white/90">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>بث مرئي أصيل</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Liquid Glass Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 sm:p-5 z-20 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="liquid-glass-elevated rounded-2xl p-3 border border-white/10 shadow-glass-dark backdrop-blur-2xl space-y-2">
          {/* Scrubber Progress Bar */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-label="شريط وقت المحاضرة المرئية"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              // RTL calculation: right is 0, left is 100%
              const ratio = 1 - clickX / rect.width;
              if (duration > 0) {
                seek(ratio * duration);
              }
            }}
            className="relative h-2 rounded-full bg-white/20 cursor-pointer overflow-hidden group transition-all"
          >
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-100 relative group-hover:brightness-125"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Left side: Play, Skip, Volume, Time */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-glass-emerald border border-emerald-400/30 transition-all"
                aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
              </button>

              <button
                onClick={() => skip(-10)}
                className="p-2 text-white/80 hover:text-white liquid-glass-control rounded-xl active:scale-95 transition-all"
                title="رجوع 10 ثوانٍ"
                aria-label="رجوع 10 ثوانٍ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => skip(10)}
                className="p-2 text-white/80 hover:text-white liquid-glass-control rounded-xl active:scale-95 transition-all"
                title="تقديم 10 ثوانٍ"
                aria-label="تقديم 10 ثوانٍ"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1.5 pr-1">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white/80 hover:text-white transition-colors"
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
                  className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  aria-label="مستوى الصوت"
                />
              </div>

              {/* Time display */}
              <div className="text-[11px] sm:text-xs font-mono text-white/80 pr-2">
                <span>{formatMediaTime(currentTime)}</span>
                <span className="mx-1 text-white/40">/</span>
                <span>{formatMediaTime(duration)}</span>
              </div>
            </div>

            {/* Right side: Subtitles, Settings, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2 relative">
              {/* Subtitles Button (Only active when subtitlesUrl provided) */}
              {subtitlesUrl && (
                <button
                  onClick={() => setIsSubtitlesActive(!isSubtitlesActive)}
                  className={`p-2 rounded-xl transition-all ${
                    isSubtitlesActive
                      ? "bg-emerald-600 text-white"
                      : "liquid-glass-control text-white/80 hover:text-white"
                  }`}
                  title={isSubtitlesActive ? "إلغاء الترجمة" : "تفعيل الترجمة"}
                  aria-label="الترجمة النصية"
                >
                  <Subtitles className="w-4 h-4" />
                </button>
              )}

              {/* Settings Button */}
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-xl transition-all ${
                    isSettingsOpen
                      ? "bg-emerald-600 text-white"
                      : "liquid-glass-control text-white/80 hover:text-white"
                  }`}
                  title="الإعدادات"
                  aria-label="إعدادات المشغل"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Settings Popover */}
                {isSettingsOpen && (
                  <div className="absolute bottom-12 left-0 sm:left-auto sm:right-0 w-56 liquid-glass-elevated rounded-2xl p-3 border border-white/15 shadow-2xl text-xs space-y-3 z-30 animate-fadeIn">
                    {/* Playback speed */}
                    <div>
                      <span className="block font-bold text-white mb-1.5">سرعة التشغيل:</span>
                      <div className="grid grid-cols-5 gap-1 font-mono">
                        {speeds.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setPlaybackRate(rate)}
                            className={`py-1 text-center rounded-lg transition-all ${
                              playbackRate === rate
                                ? "bg-emerald-600 text-white font-bold"
                                : "liquid-glass-control text-white/70 hover:text-white"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality selection (when available) */}
                    {availableQualities && availableQualities.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="block font-bold text-white mb-1.5">جودة البث:</span>
                        <div className="space-y-1">
                          {availableQualities.map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                setSelectedQuality(q);
                                setIsSettingsOpen(false);
                              }}
                              className={`w-full text-right px-2 py-1 rounded-lg transition-all ${
                                selectedQuality === q
                                  ? "bg-emerald-600/40 text-emerald-300 font-bold"
                                  : "hover:bg-white/10 text-white/70"
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white/80 hover:text-white liquid-glass-control rounded-xl active:scale-95 transition-all"
                title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
                aria-label={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
