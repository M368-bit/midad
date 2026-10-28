"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { recordHistoryItem } from "@/lib/repositories/user-repository";
import { useAuth } from "../auth/AuthProvider";

export interface AudioTrack {
  id: string;
  title: string;
  scholarName?: string;
  scholarSlug?: string;
  audioUrl: string;
  duration?: number;
  coverUrl?: string;
  originalUrl?: string;
  publisher?: string;
}

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  isFullPlayerOpen: boolean;
  isMiniPlayerVisible: boolean;

  playTrack: (track: AudioTrack, startTime?: number) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skip: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  dismissMiniPlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);

  // Initialize singleton audio element on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setError(null);
    };

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      // Dispatch notification that audio started so video players pause
      window.dispatchEvent(new CustomEvent("midad:audio-started"));
    };

    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError("تعذر تشغيل الملف الصوتي من المصدر المعتمد. قد يكون الرابط مؤقتاً غير متاح.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Listen for external video play events to pause audio automatically
    const onVideoStarted = () => {
      if (audio && !audio.paused) {
        audio.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("midad:video-started", onVideoStarted);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      window.removeEventListener("midad:video-started", onVideoStarted);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Periodic history / progress recording every 10s while playing
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;

    const interval = setInterval(() => {
      if (audioRef.current && currentTrack) {
        recordHistoryItem(
          {
            contentType: "lesson",
            contentId: currentTrack.id,
            title: currentTrack.title,
            url: `/lessons/${currentTrack.id}`,
            progressSeconds: Math.floor(audioRef.current.currentTime),
          },
          user?.id
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, user?.id]);

  const playTrack = useCallback(
    (track: AudioTrack, startTime = 0) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (currentTrack?.id === track.id && audio.src.includes(track.audioUrl)) {
        // Same track: just resume or seek
        if (startTime > 0) {
          audio.currentTime = startTime;
        }
        audio.play().catch(() => {});
        setIsPlaying(true);
        setIsMiniPlayerVisible(true);
        return;
      }

      // New track
      setCurrentTrack(track);
      setIsLoading(true);
      setError(null);
      audio.src = track.audioUrl;
      audio.playbackRate = playbackRate;
      audio.volume = isMuted ? 0 : volume;

      audio.load();
      if (startTime > 0) {
        audio.currentTime = startTime;
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMiniPlayerVisible(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });

      // Record visit
      recordHistoryItem(
        {
          contentType: "lesson",
          contentId: track.id,
          title: track.title,
          url: `/lessons/${track.id}`,
          progressSeconds: Math.floor(startTime),
        },
        user?.id
      );
    },
    [currentTrack, playbackRate, volume, isMuted, user?.id]
  );

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
      setIsMiniPlayerVisible(true);
    }
  }, [isPlaying, currentTrack]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = (audio.currentTime || 0) + seconds;
    const clamped = Math.max(0, Math.min(target, audio.duration || target));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
    }
    setPlaybackRateState(rate);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, vol));
    if (audio) {
      audio.volume = clamped;
      if (clamped > 0 && audio.muted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
    setVolumeState(clamped);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

  const openFullPlayer = useCallback(() => {
    setIsFullPlayerOpen(true);
  }, []);

  const closeFullPlayer = useCallback(() => {
    setIsFullPlayerOpen(false);
  }, []);

  const dismissMiniPlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsMiniPlayerVisible(false);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
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
        isMiniPlayerVisible,
        playTrack,
        pauseTrack,
        togglePlay,
        seek,
        skip,
        setPlaybackRate,
        setVolume,
        toggleMute,
        openFullPlayer,
        closeFullPlayer,
        dismissMiniPlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
