"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { recordHistoryItem } from "@/lib/repositories/user-repository";
import { useAuth } from "../auth/AuthProvider";

interface MediaPlayerProps {
  mediaUrl?: string | null;
  mediaType?: "audio" | "video" | "text";
  lessonId: string;
  lessonTitle: string;
}

export function MediaPlayer({
  mediaUrl,
  mediaType = "audio",
  lessonId,
  lessonTitle,
}: MediaPlayerProps) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    // Record visit in user history
    recordHistoryItem(
      {
        contentType: "lesson",
        contentId: lessonId,
        title: lessonTitle,
        url: `/lessons/${lessonId}`,
        progressSeconds: 0,
      },
      user?.id
    );
  }, [lessonId, lessonTitle, user?.id]);

  if (!mediaUrl) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            التسجيل الصوتي ينتظر اكتمال التحقق من الرابط الأصلي
          </p>
          <p className="mt-0.5 text-slate-500">
            تلتزم منصة مداد بعدم تضمين أي تسجيل صوتي أو مرئي ما لم يكن مستنداً لرابط أصلي موثق ومعتمد من الجهة الناشرة.
          </p>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const skipSeconds = (sec: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + sec);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx] ?? 1;
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl">
      <audio
        ref={audioRef}
        src={mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span>مشغل الدرس الصوتي المعتمد</span>
        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>

      {/* Progress Bar */}
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-4"
        aria-label="شريط تقدم الدرس"
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 rounded-md text-emerald-400"
            title="سرعة التشغيل"
          >
            {playbackRate}x
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => skipSeconds(-15)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="رجوع 15 ثانية"
            aria-label="رجوع 15 ثانية"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 mr-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(15)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="تقديم 15 ثانية"
            aria-label="تقديم 15 ثانية"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <div className="w-16 text-right">
          <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
            صوتي نقي
          </span>
        </div>
      </div>
    </div>
  );
}
