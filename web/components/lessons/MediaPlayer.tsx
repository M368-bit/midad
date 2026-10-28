"use client";

import React, { useEffect } from "react";
import { ShieldCheck, Video, Radio } from "lucide-react";
import { recordHistoryItem } from "@/lib/repositories/user-repository";
import { useAuth } from "../auth/AuthProvider";
import { GlassVideoPlayer } from "../media/GlassVideoPlayer";
import { GlassAudioHeroPlayer } from "../media/GlassAudioHeroPlayer";

interface MediaPlayerProps {
  mediaUrl?: string | null;
  mediaType?: "audio" | "video" | "text";
  lessonId: string;
  lessonTitle: string;
  scholarName?: string;
  posterUrl?: string;
  subtitlesUrl?: string;
  durationMinutes?: number | null;
}

export function MediaPlayer({
  mediaUrl,
  mediaType = "audio",
  lessonId,
  lessonTitle,
  scholarName,
  posterUrl,
  subtitlesUrl,
  durationMinutes,
}: MediaPlayerProps) {
  const { user } = useAuth();

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
      <div className="flex items-center gap-3 p-5 rounded-2xl liquid-glass border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400">
        <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            التسجيل ينتظر اكتمال التحقق من الرابط الأصلي
          </p>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed">
            تلتزم منصة مداد بعدم تضمين أي بث صوتي أو مرئي ما لم يكن مستنداً لرابط أصلي موثق ومعتمد من الجهة الناشرة.
          </p>
        </div>
      </div>
    );
  }

  // Render Video Player when mediaType is "video"
  if (mediaType === "video") {
    return (
      <GlassVideoPlayer
        videoUrl={mediaUrl}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        scholarName={scholarName}
        posterUrl={posterUrl}
        subtitlesUrl={subtitlesUrl}
        availableQualities={["1080p (FHD)", "720p (HD)", "480p (SD)"]}
      />
    );
  }

  // Render Audio Hero Player when mediaType is "audio"
  return (
    <GlassAudioHeroPlayer
      track={{
        id: lessonId,
        title: lessonTitle,
        scholarName,
        audioUrl: mediaUrl,
        duration: durationMinutes || undefined,
      }}
    />
  );
}
