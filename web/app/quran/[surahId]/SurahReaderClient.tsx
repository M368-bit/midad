"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  BookOpen,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Repeat,
  X,
  Search,
  Compass,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  MapPin,
  Music,
  Info,
} from "lucide-react";
import {
  QuranSurahDetail,
  QuranAyah,
  QuranReciter,
  getAyahAudioUrl,
} from "@/lib/services/quran-service";
import { SurahMeta, QURAN_SURAHS, getSurahByNumber } from "@/lib/data/quran-surahs";
import { getPageForAyah } from "@/lib/data/quran-page-ranges";
import { QuranShareModal } from "@/components/quran/QuranShareModal";
import { SurahHeaderBanner } from "@/components/quran/SurahHeaderBanner";
import { SurahInfoModal } from "@/components/quran/SurahInfoModal";


interface SurahReaderClientProps {
  surah: QuranSurahDetail;
  reciters: QuranReciter[];
  initialReciterId: string;
  initialAyah?: number;
  prevSurah: SurahMeta | null;
  nextSurah: SurahMeta | null;
}

function toArabicNumerals(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => arabicDigits[parseInt(d, 10)] ?? d)
    .join("");
}

type MushafTheme = "sepia" | "dark" | "white";
type RepeatMode = "none" | "single" | "page" | "surah";

interface PageAyahItem {
  surah: number;
  ayah: number;
  text: string;
  tafsir?: string;
  tafsirSaadi?: string;
}

interface PlayingTrack {
  surah: number;
  ayah: number;
  page: number;
  surahName: string;
  totalAyahs: number;
}

function getNextAyahTarget(surah: number, ayah: number): { surah: number; ayah: number } | null {
  const meta = getSurahByNumber(surah);
  if (!meta) return null;
  if (ayah < meta.numberOfAyahs) {
    return { surah, ayah: ayah + 1 };
  }
  if (surah < 114) {
    return { surah: surah + 1, ayah: 1 };
  }
  return null;
}

function getPrevAyahTarget(surah: number, ayah: number): { surah: number; ayah: number } | null {
  if (ayah > 1) {
    return { surah, ayah: ayah - 1 };
  }
  if (surah > 1) {
    const prevMeta = getSurahByNumber(surah - 1);
    if (prevMeta) {
      return { surah: surah - 1, ayah: prevMeta.numberOfAyahs };
    }
  }
  return null;
}

// ── Synthetic Web Audio Paper Flutter Sound (صوت تقليب الورق الواقعي) ────
function playPaperTurnSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.75;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.18);
  } catch {
    // Ignore audio permission restrictions before first user gesture
  }
}

export function SurahReaderClient({
  surah,
  reciters,
  initialReciterId,
  initialAyah = 1,
  prevSurah,
  nextSurah,
}: SurahReaderClientProps) {
  const router = useRouter();

  // ── 1. Page Viewing State (مستقل تماماً عن التلاوة) ───────────────────────
  // viewedPage: الصفحة التي يشاهدها المستخدم حالياً (1 إلى 604)
  const [viewedPage, setViewedPage] = useState<number>(surah.meta.page);
  const [pageData, setPageData] = useState<{
    page: number;
    juz: number;
    surahs: { number: number; name: string; revelationType: string; numberOfAyahs: number }[];
    ayahs: PageAyahItem[];
  } | null>(null);

  // SVG Artwork of King Fahd Complex
  const [currentSvg, setCurrentSvg] = useState<string>("");
  const [incomingSvg, setIncomingSvg] = useState<string>("");
  const svgCache = useRef<Map<number, string>>(new Map());

  // 3D Page Turn Transition
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  // Display & Themes
  const [theme, setTheme] = useState<MushafTheme>("sepia");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── 2. Independent Audio Playback Engine (نظام تلاوة مستقل ومتصل بلا فجوات) ──
  // playingTrack: الآية التي يتلوها الشيخ حالياً (لا تتأثر بتقليب الصفحات أبداً)
  const [playingTrack, setPlayingTrack] = useState<PlayingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedReciterId, setSelectedReciterId] = useState(initialReciterId);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("00:00");

  // Dual-Buffer Audio Elements (تشغيل مستمر بدون أي ثانية صمت فاضية بين الآيات)
  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);
  const activeAudioPlayerRef = useRef<"A" | "B">("A");

  // ── 3. Interactive Ayah Bottom Sheet (درج الخيارات من تحت) ───────────────
  const [selectedAyah, setSelectedAyah] = useState<PageAyahItem | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetTafsirTab, setBottomSheetTafsirTab] = useState<"muyassar" | "saadi">("muyassar");
  const [showTafsirInsideSheet, setShowTafsirInsideSheet] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef(false);

  // ── 4. Pickers & Modals ──────────────────────────────────────────────────
  const [showRecitersModal, setShowRecitersModal] = useState(false);
  const [reciterSearch, setReciterSearch] = useState("");
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [surahSearch, setSurahSearch] = useState("");
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareConfig, setShareConfig] = useState<{
    surahNumber: number;
    surahName: string;
    totalAyahs: number;
    initialAyah: number;
  }>({
    surahNumber: surah.meta.number,
    surahName: surah.meta.name,
    totalAyahs: surah.meta.numberOfAyahs,
    initialAyah: 1,
  });

  // ── 5. Bookmark Ribbon & Feedback ────────────────────────────────────────
  const [bookmarkKey, setBookmarkKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // ── Load Bookmark & Preferences ─────────────────────────────────────────
  useEffect(() => {
    try {
      const savedBm = localStorage.getItem("midad_quran_bookmark_ayah");
      if (savedBm) setBookmarkKey(savedBm);

      const savedTheme = localStorage.getItem("midad_mushaf_theme") as MushafTheme | null;
      if (savedTheme) setTheme(savedTheme);

      const savedReciter = localStorage.getItem("midad_quran_reciter");
      if (savedReciter && reciters.some((r) => r.id === savedReciter)) {
        setSelectedReciterId(savedReciter);
      }
    } catch {
      // ignore
    }
  }, [reciters]);

  // ── Fetch Page Data for Viewed Page (Metadata, Surahs, Ayahs, Tafsirs) ────
  useEffect(() => {
    let isCancelled = false;

    async function loadPageInfo() {
      try {
        const res = await fetch(`/api/quran/page-data/${viewedPage}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setPageData(data);
        }
      } catch (err) {
        console.warn(`Error loading page ${viewedPage} data:`, err);
      }
    }

    loadPageInfo();
    return () => {
      isCancelled = true;
    };
  }, [viewedPage]);

  // ── Fetch Official King Fahd Complex SVG for Viewed Page ─────────────────
  const fetchPageSvg = useCallback(async (pageNum: number): Promise<string> => {
    if (svgCache.current.has(pageNum)) {
      return svgCache.current.get(pageNum)!;
    }
    try {
      const res = await fetch(`/api/quran/page-svg/${pageNum}`);
      if (res.ok) {
        let svgText = await res.text();
        svgText = svgText.replace(
          /<svg([^>]*)>/i,
          `<svg$1 class="w-full h-auto max-h-[78vh] sm:max-h-[82vh] mx-auto block select-none pointer-events-auto" preserveAspectRatio="xMidYMid meet">`
        );
        svgCache.current.set(pageNum, svgText);
        return svgText;
      }
    } catch (err) {
      console.warn(`Failed to fetch page SVG ${pageNum}:`, err);
    }
    return "";
  }, []);

  // Pre-load viewed and neighboring SVGs into cache
  useEffect(() => {
    let isCancelled = false;

    fetchPageSvg(viewedPage).then((svg) => {
      if (!isCancelled && svg) {
        setCurrentSvg(svg);
      }
    });

    // Background pre-cache next & previous pages for 0ms transitions
    if (viewedPage < 604) fetchPageSvg(viewedPage + 1);
    if (viewedPage > 1) fetchPageSvg(viewedPage - 1);
    if (viewedPage < 603) fetchPageSvg(viewedPage + 2);

    return () => {
      isCancelled = true;
    };
  }, [viewedPage, fetchPageSvg]);

  // ── PROFESSIONAL 3D PAGE TURN (تقليب الصفحة المستقل تماماً عن التلاوة) ────
  const turnToPage = useCallback(
    async (targetPage: number, direction: "next" | "prev" = "next") => {
      if (isFlipping) return;
      if (targetPage < 1 || targetPage > 604) return;

      // 1. Play realistic paper sound
      playPaperTurnSound();

      // 2. Pre-load incoming page SVG for instant swap
      const targetSvg = await fetchPageSvg(targetPage);
      setIncomingSvg(targetSvg);

      // 3. Close manual bottom sheet if open
      setSelectedAyah(null);
      setShowBottomSheet(false);

      // 4. Trigger the professional 3D peel & glide animation
      // NOTICE: We do NOT stop or reset audio! Audio keeps playing peacefully!
      setIsFlipping(true);
      setFlipDirection(direction);

      setTimeout(() => {
        setViewedPage(targetPage);
        setCurrentSvg(targetSvg);
        setIncomingSvg("");
        setIsFlipping(false);
        setFlipDirection(null);
      }, 310);
    },
    [isFlipping, fetchPageSvg]
  );

  const flipNextPage = useCallback(() => {
    if (viewedPage < 604) {
      turnToPage(viewedPage + 1, "next");
    }
  }, [viewedPage, turnToPage]);

  const flipPrevPage = useCallback(() => {
    if (viewedPage > 1) {
      turnToPage(viewedPage - 1, "prev");
    }
  }, [viewedPage, turnToPage]);

  // ── Keyboard Navigation (Arrow Keys) ────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        flipNextPage();
      } else if (e.key === "ArrowRight") {
        flipPrevPage();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // ── Touch Swipe Physics ─────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0) {
        flipPrevPage();
      } else {
        flipNextPage();
      }
    }
  };

  // ── ZERO-GAP DUAL-BUFFER AUDIO ENGINE (تشغيل تلاوة مستمر بدون أي ثانية فراغ) ──
  const activeReciter = reciters.find((r) => r.id === selectedReciterId) || reciters[0];

  // Synchronized refs to guarantee zero-closure-staleness across asynchronous audio events
  const viewedPageRef = useRef<number>(viewedPage);
  useEffect(() => {
    viewedPageRef.current = viewedPage;
  }, [viewedPage]);

  const playingTrackRef = useRef<PlayingTrack | null>(playingTrack);
  useEffect(() => {
    playingTrackRef.current = playingTrack;
  }, [playingTrack]);

  const playbackSpeedRef = useRef<number>(playbackSpeed);
  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  const selectedReciterIdRef = useRef<string>(selectedReciterId);
  useEffect(() => {
    selectedReciterIdRef.current = selectedReciterId;
  }, [selectedReciterId]);

  // Play a specific verse with rock-solid dual buffering
  const playVerse = useCallback(
    (surahNum: number, ayahNum: number, autoTurnPageIfFollowing = true) => {
      const targetSurahMeta = getSurahByNumber(surahNum);
      if (!targetSurahMeta) return;

      const ayahPage = getPageForAyah(surahNum, ayahNum);

      // 1. Explicitly stop and reset BOTH players to prevent any overlap or stale audio!
      if (audioRefA.current) {
        audioRefA.current.pause();
      }
      if (audioRefB.current) {
        audioRefB.current.pause();
      }

      // 2. Track state update
      const track: PlayingTrack = {
        surah: surahNum,
        ayah: ayahNum,
        page: ayahPage,
        surahName: targetSurahMeta.name,
        totalAyahs: targetSurahMeta.numberOfAyahs,
      };
      setPlayingTrack(track);
      playingTrackRef.current = track;

      // 3. Clear manual selection so only reciting ayah is highlighted
      setSelectedAyah(null);
      setShowBottomSheet(false);

      // 4. Reset to Player A as master active player
      activeAudioPlayerRef.current = "A";
      const activeEl = audioRefA.current;
      const standbyEl = audioRefB.current;

      const currentUrl = getAyahAudioUrl(selectedReciterIdRef.current, surahNum, ayahNum);

      if (activeEl) {
        activeEl.src = currentUrl;
        activeEl.playbackRate = playbackSpeedRef.current;
        activeEl.load();
        activeEl
          .play()
          .then(() => {
            setIsPlaying(true);

            // Auto turn page smoothly if user is following recitation
            if (autoTurnPageIfFollowing && viewedPageRef.current !== ayahPage) {
              turnToPage(ayahPage, ayahPage > viewedPageRef.current ? "next" : "prev");
            }

            // 5. ZERO-GAP PRELOAD: Immediately buffer true next ayah into Player B!
            const nextTarget = getNextAyahTarget(surahNum, ayahNum);
            if (nextTarget && standbyEl) {
              const nextUrl = getAyahAudioUrl(
                selectedReciterIdRef.current,
                nextTarget.surah,
                nextTarget.ayah
              );
              standbyEl.src = nextUrl;
              standbyEl.preload = "auto";
              standbyEl.load();
            }
          })
          .catch((err) => {
            console.warn("Audio play error:", err);
            setIsPlaying(false);
          });
      }
    },
    [turnToPage]
  );

  // Transition to next ayah with 0ms gap (strictly handles only the active player)
  const onPlayerEnded = useCallback(
    (endedPlayerId: "A" | "B") => {
      // CRITICAL CHECK: Ignore if the ending player is NOT the currently active player!
      if (activeAudioPlayerRef.current !== endedPlayerId) return;

      const current = playingTrackRef.current;
      if (!current) return;

      // Repeat current ayah mode (تحفيظ)
      if (repeatModeRef.current === "single") {
        playVerse(current.surah, current.ayah, false);
        return;
      }

      // Repeat current page mode
      if (repeatModeRef.current === "page") {
        if (pageData && pageData.ayahs.length > 0) {
          const lastAyahOnPage = pageData.ayahs[pageData.ayahs.length - 1];
          if (current.surah === lastAyahOnPage.surah && current.ayah === lastAyahOnPage.ayah) {
            playVerse(pageData.ayahs[0].surah, pageData.ayahs[0].ayah, false);
            return;
          }
        }
      }

      const nextTarget = getNextAyahTarget(current.surah, current.ayah);
      if (!nextTarget) {
        setIsPlaying(false);
        return;
      }

      const nextAyahPage = getPageForAyah(nextTarget.surah, nextTarget.ayah);
      const nextSurahMeta = getSurahByNumber(nextTarget.surah);

      // Swap active and standby players (Dual Buffering!)
      const nextPlayerId = endedPlayerId === "A" ? "B" : "A";
      activeAudioPlayerRef.current = nextPlayerId;

      const activeEl = nextPlayerId === "A" ? audioRefA.current : audioRefB.current;
      const standbyEl = nextPlayerId === "A" ? audioRefB.current : audioRefA.current;

      const newTrack: PlayingTrack = {
        surah: nextTarget.surah,
        ayah: nextTarget.ayah,
        page: nextAyahPage,
        surahName: nextSurahMeta?.name || `سورة ${nextTarget.surah}`,
        totalAyahs: nextSurahMeta?.numberOfAyahs || 1,
      };
      setPlayingTrack(newTrack);
      playingTrackRef.current = newTrack;

      // Play pre-buffered audio IMMEDIATELY with 0ms gap!
      if (activeEl) {
        activeEl.playbackRate = playbackSpeedRef.current;
        activeEl
          .play()
          .then(() => {
            setIsPlaying(true);

            // Auto-turn page IF user was on the reciting page and we reached a new page!
            if (viewedPageRef.current === current.page && nextAyahPage !== viewedPageRef.current) {
              turnToPage(nextAyahPage, "next");
            }

            // Preload the ayah after next into the standby player!
            const afterNext = getNextAyahTarget(nextTarget.surah, nextTarget.ayah);
            if (afterNext && standbyEl) {
              const afterNextUrl = getAyahAudioUrl(
                selectedReciterIdRef.current,
                afterNext.surah,
                afterNext.ayah
              );
              standbyEl.src = afterNextUrl;
              standbyEl.preload = "auto";
              standbyEl.load();
            }
          })
          .catch(() => {
            // Fallback: force set src and play
            playVerse(nextTarget.surah, nextTarget.ayah, true);
          });
      }
    },
    [pageData, turnToPage, playVerse]
  );

  // Toggle master Play / Pause
  const togglePlayPause = () => {
    const isPlayerA = activeAudioPlayerRef.current === "A";
    const activeEl = isPlayerA ? audioRefA.current : audioRefB.current;

    if (isPlaying) {
      activeEl?.pause();
      setIsPlaying(false);
    } else {
      if (playingTrackRef.current) {
        activeEl?.play().then(() => setIsPlaying(true)).catch(() => {
          playVerse(playingTrackRef.current!.surah, playingTrackRef.current!.ayah, false);
        });
      } else if (pageData && pageData.ayahs.length > 0) {
        playVerse(pageData.ayahs[0].surah, pageData.ayahs[0].ayah, false);
      } else {
        playVerse(surah.meta.number, initialAyah, false);
      }
    }
  };

  const skipNextTrack = () => {
    if (!playingTrackRef.current) {
      if (pageData && pageData.ayahs.length > 0) {
        playVerse(pageData.ayahs[0].surah, pageData.ayahs[0].ayah, true);
      }
      return;
    }
    const next = getNextAyahTarget(playingTrackRef.current.surah, playingTrackRef.current.ayah);
    if (next) {
      playVerse(next.surah, next.ayah, true);
    }
  };

  const skipPrevTrack = () => {
    if (!playingTrackRef.current) return;
    const prev = getPrevAyahTarget(playingTrackRef.current.surah, playingTrackRef.current.ayah);
    if (prev) {
      playVerse(prev.surah, prev.ayah, true);
    }
  };

  const handleAudioTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const el = e.currentTarget;
    if (el.duration > 0) {
      setAudioProgress((el.currentTime / el.duration) * 100);
      setAudioDuration(el.duration);
      const curM = Math.floor(el.currentTime / 60);
      const curS = Math.floor(el.currentTime % 60);
      setCurrentTimeFormatted(`${curM}:${curS < 10 ? "0" : ""}${curS}`);
    }
  };

  // ── Jump to Currently Reciting Page ─────────────────────────────────────
  const jumpToRecitingPage = () => {
    if (playingTrack && playingTrack.page !== viewedPage) {
      turnToPage(playingTrack.page, playingTrack.page > viewedPage ? "next" : "prev");
    }
  };

  // ── Open Share Modal with Range for Selected Ayah ───────────────────────
  const openShareModalForAyah = (surahNum: number, ayahNum: number) => {
    const sMeta = getSurahByNumber(surahNum);
    setShareConfig({
      surahNumber: surahNum,
      surahName: sMeta?.name || primarySurah.name,
      totalAyahs: sMeta?.numberOfAyahs || primarySurah.numberOfAyahs,
      initialAyah: ayahNum,
    });
    setShowShareModal(true);
    setShowBottomSheet(false);
  };

  // ── Ayah Bottom Sheet Handlers ──────────────────────────────────────────
  const handleSelectAyahByNumbers = useCallback(
    (surahNum: number, ayahNum: number) => {
      if (!pageData) return;
      const found = pageData.ayahs.find(
        (a) => a.surah === surahNum && a.ayah === ayahNum
      );

      if (found) {
        setSelectedAyah(found);
      } else {
        setSelectedAyah({
          surah: surahNum,
          ayah: ayahNum,
          text: `الآية ${toArabicNumerals(ayahNum)}`,
        });
      }
      setShowBottomSheet(true);
      setShowTafsirInsideSheet(false);
    },
    [pageData]
  );

  const onSvgContainerClick = (e: React.MouseEvent) => {
    const target = (e.target as Element).closest(".ayahPolygon");
    if (!target) {
      setShowBottomSheet(false);
      setSelectedAyah(null);
      return;
    }
    const s = parseInt(target.getAttribute("surah") || "0", 10);
    const a = parseInt(target.getAttribute("ayah") || "0", 10);
    if (s && a) {
      handleSelectAyahByNumbers(s, a);
    }
  };

  const onSvgTouchStart = (e: React.TouchEvent) => {
    const target = (e.target as Element).closest(".ayahPolygon");
    if (!target) return;
    const s = parseInt(target.getAttribute("surah") || "0", 10);
    const a = parseInt(target.getAttribute("ayah") || "0", 10);
    if (!s || !a) return;

    isLongPressActiveRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      handleSelectAyahByNumbers(s, a);
      if (typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate(45);
      }
    }, 300);
  };

  const onSvgTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (!isLongPressActiveRef.current) {
      const target = (e.target as Element).closest(".ayahPolygon");
      if (target) {
        const s = parseInt(target.getAttribute("surah") || "0", 10);
        const a = parseInt(target.getAttribute("ayah") || "0", 10);
        if (s && a) handleSelectAyahByNumbers(s, a);
      }
    }
  };

  // ── Bookmark Ribbon ─────────────────────────────────────────────────────
  const toggleBookmark = (surahNum: number, ayahNum: number) => {
    const key = `${surahNum}:${ayahNum}`;
    if (bookmarkKey === key) {
      setBookmarkKey(null);
      try {
        localStorage.removeItem("midad_quran_bookmark_ayah");
      } catch {}
    } else {
      setBookmarkKey(key);
      try {
        localStorage.setItem("midad_quran_bookmark_ayah", key);
      } catch {}
    }
  };

  const copyAyah = (ayah: PageAyahItem, surahName: string) => {
    const citation = `﴿ ${ayah.text} ﴾ [سورة ${surahName} : آية ${toArabicNumerals(ayah.ayah)}]`;
    navigator.clipboard.writeText(citation);
    setCopiedKey(`${ayah.surah}:${ayah.ayah}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const shareAyah = (ayah: PageAyahItem, surahName: string) => {
    const citation = `﴿ ${ayah.text} ﴾ [سورة ${surahName} : آية ${toArabicNumerals(ayah.ayah)}]`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `سورة ${surahName} — آية ${toArabicNumerals(ayah.ayah)}`,
          text: citation,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      copyAyah(ayah, surahName);
    }
  };

  // ── STRICT SINGLE-AYAH HIGHLIGHT IDENTIFIER ──────────────────────────────
  // (متعملش تظليل علي ايتين أبداً):
  // لو وقفت التسجيل يظل التظليل موجوداً على الآية التي يقرأها الشيخ
  const isRecitingOnViewedPage =
    playingTrack !== null && playingTrack.page === viewedPage;

  const currentHighlightedAyah = selectedAyah
    ? { surah: selectedAyah.surah, ayah: selectedAyah.ayah }
    : isRecitingOnViewedPage
    ? { surah: playingTrack!.surah, ayah: playingTrack!.ayah }
    : null;

  // Metadata of currently viewed page
  const primarySurah = pageData?.surahs?.[0] || {
    number: surah.meta.number,
    name: surah.meta.name,
    revelationType: surah.meta.revelationType === "Meccan" ? "مكية" : "مدنية",
    numberOfAyahs: surah.meta.numberOfAyahs,
  };
  const currentJuz = pageData?.juz || surah.meta.juz;

  // Is user browsing a different page than the active recitation? (works even when paused)
  const isBrowsingDifferentPage =
    playingTrack !== null && playingTrack.page !== viewedPage;

  // ── Appearance Themes ────────────────────────────────────────────────────
  const themeStyles = {
    sepia: {
      wrapper: "bg-[#F4EFE2]",
      card: "bg-[#FAF7EE] border-[#C8B68E] shadow-[0_25px_60px_rgba(80,60,30,0.18)]",
      header: "bg-[#F3EEDF] border-[#D6C7A1] text-[#3E301D]",
      spine: "from-black/15 via-transparent to-black/15",
      filter: "none",
      highlightFill: isRecitingOnViewedPage ? "rgba(16, 185, 129, 0.38)" : "rgba(245, 158, 11, 0.35)",
      highlightShadow: isRecitingOnViewedPage ? "rgba(16, 185, 129, 0.65)" : "rgba(245, 158, 11, 0.6)",
    },
    dark: {
      wrapper: "bg-[#090D12]",
      card: "bg-[#0E1318] border-emerald-500/35 shadow-[0_25px_60px_rgba(0,0,0,0.85)]",
      header: "bg-[#141B22] border-white/10 text-emerald-300",
      spine: "from-black/50 via-transparent to-black/50",
      filter: "invert(0.92) hue-rotate(180deg) brightness(1.1) contrast(1.15)",
      highlightFill: isRecitingOnViewedPage ? "rgba(16, 185, 129, 0.42)" : "rgba(245, 158, 11, 0.42)",
      highlightShadow: isRecitingOnViewedPage ? "rgba(16, 185, 129, 0.75)" : "rgba(245, 158, 11, 0.7)",
    },
    white: {
      wrapper: "bg-slate-100",
      card: "bg-white border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.12)]",
      header: "bg-slate-50 border-slate-200 text-slate-800",
      spine: "from-black/10 via-transparent to-black/10",
      filter: "none",
      highlightFill: isRecitingOnViewedPage ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
      highlightShadow: isRecitingOnViewedPage ? "rgba(16, 185, 129, 0.55)" : "rgba(245, 158, 11, 0.5)",
    },
  }[theme];

  return (
    <div
      className={`min-h-[88vh] transition-colors duration-300 space-y-4 select-none pb-36 ${
        isFullscreen ? "fixed inset-0 z-50 p-2 sm:p-5 overflow-y-auto " + themeStyles.wrapper : ""
      }`}
    >
      {/* ── DUAL AUDIO PLAYERS (تشغيل فوري متناوب بدون أي فجوة زمنية) ──────── */}
      <audio
        ref={audioRefA}
        onEnded={() => onPlayerEnded("A")}
        onTimeUpdate={(e) => {
          if (activeAudioPlayerRef.current === "A") handleAudioTimeUpdate(e);
        }}
        className="hidden"
      />
      <audio
        ref={audioRefB}
        onEnded={() => onPlayerEnded("B")}
        onTimeUpdate={(e) => {
          if (activeAudioPlayerRef.current === "B") handleAudioTimeUpdate(e);
        }}
        className="hidden"
      />

      {/* ── DYNAMIC INJECTED CSS FOR LIVE SINGLE-AYAH HIGHLIGHTING & RESPONSIVENESS ── */}
      <style jsx global>{`
        .mushaf-kfqc-frame svg {
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
          display: block !important;
          margin: 0 auto !important;
        }

        .mushaf-kfqc-frame svg path:not(.ayahPolygon) {
          pointer-events: none !important;
        }

        .mushaf-kfqc-frame .ayahPolygon {
          fill-opacity: 0;
          cursor: pointer !important;
          pointer-events: auto !important;
          transition: fill 0.18s ease, fill-opacity 0.18s ease;
        }

        .mushaf-kfqc-frame .ayahPolygon:hover {
          fill: #10b981 !important;
          fill-opacity: 0.18 !important;
        }

        /* STRICT SINGLE HIGHLIGHT (تظليل آية واحدة فقط لا غير) */
        ${currentHighlightedAyah
          ? `
          .mushaf-kfqc-frame .ayahPolygon[surah="${currentHighlightedAyah.surah}"][ayah="${currentHighlightedAyah.ayah}"] {
            fill: ${themeStyles.highlightFill} !important;
            fill-opacity: 1 !important;
            filter: drop-shadow(0 0 10px ${themeStyles.highlightShadow}) !important;
          }
        `
          : ""}

        /* ── PRO 3D PAGE TURN ANIMATIONS (ترانزيشن احترافي وجامد) ── */
        .page-stage-container {
          perspective: 2400px;
          perspective-origin: center center;
        }

        .page-turning-next {
          animation: proPagePeelNext 310ms cubic-bezier(0.2, 0.8, 0.25, 1) forwards;
          transform-origin: right center;
        }

        @keyframes proPagePeelNext {
          0% {
            transform: translate3d(0, 0, 0) rotateY(0deg);
            opacity: 1;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
          }
          40% {
            transform: translate3d(-35px, 0, 80px) rotateY(-25deg) skewY(-2deg);
            opacity: 0.9;
            box-shadow: -35px 25px 60px rgba(0,0,0,0.4);
          }
          100% {
            transform: translate3d(-100%, 0, 0) rotateY(-65deg) skewY(-3deg);
            opacity: 0;
            box-shadow: -50px 30px 80px rgba(0,0,0,0.5);
          }
        }

        .page-turning-prev {
          animation: proPagePeelPrev 310ms cubic-bezier(0.2, 0.8, 0.25, 1) forwards;
          transform-origin: left center;
        }

        @keyframes proPagePeelPrev {
          0% {
            transform: translate3d(0, 0, 0) rotateY(0deg);
            opacity: 1;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
          }
          40% {
            transform: translate3d(35px, 0, 80px) rotateY(25deg) skewY(2deg);
            opacity: 0.9;
            box-shadow: 35px 25px 60px rgba(0,0,0,0.4);
          }
          100% {
            transform: translate3d(100%, 0, 0) rotateY(65deg) skewY(3deg);
            opacity: 0;
            box-shadow: 50px 30px 80px rgba(0,0,0,0.5);
          }
        }
      `}</style>

      {/* ── TOP TOOLBAR (شريط التحكم العلوي) ─────────────────────────────── */}
      <div className="glass-elevated rounded-2xl p-2.5 sm:p-3 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-2.5 shadow-glass">
        {/* Surah & Juz Pickers */}
        <div className="flex items-center gap-2">
          <Link
            href="/quran"
            className="btn-glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-500"
            title="فهرس سور القرآن الكريم"
          >
            <Compass className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">فهرس المصحف</span>
          </Link>

          <button
            onClick={() => setShowSurahPicker(true)}
            className="btn-glass-emerald px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>سورة {primarySurah.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            onClick={() => setShowJuzPicker(true)}
            className="btn-glass px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-500"
          >
            <span>الجزء {toArabicNumerals(currentJuz)}</span>
          </button>
        </div>

        {/* Themes Selector (عاجي / ليلي / ناصع) */}
        <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => {
              setTheme("sepia");
              try { localStorage.setItem("midad_mushaf_theme", "sepia"); } catch {}
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              theme === "sepia"
                ? "bg-[#EFE8D6] text-[#4A3C28] shadow-sm font-extrabold ring-1 ring-[#D6C7A1]"
                : "text-slate-600 dark:text-slate-400"
            }`}
            title="مصحف المدينة الورقي العاجي"
          >
            <span>📜</span>
            <span className="hidden md:inline">عاجي</span>
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              try { localStorage.setItem("midad_mushaf_theme", "dark"); } catch {}
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              theme === "dark"
                ? "bg-[#1B232D] text-emerald-300 shadow-sm font-extrabold ring-1 ring-emerald-500/40"
                : "text-slate-600 dark:text-slate-400"
            }`}
            title="الوضع الليلي الفاخر"
          >
            <span>🌙</span>
            <span className="hidden md:inline">ليلي</span>
          </button>

          <button
            onClick={() => {
              setTheme("white");
              try { localStorage.setItem("midad_mushaf_theme", "white"); } catch {}
            }}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
              theme === "white"
                ? "bg-white text-slate-900 shadow-sm font-extrabold ring-1 ring-slate-300"
                : "text-slate-600 dark:text-slate-400"
            }`}
            title="الوضع الناصع"
          >
            <span>☀️</span>
            <span className="hidden md:inline">ناصع</span>
          </button>
        </div>

        {/* Reciter & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRecitersModal(true)}
            className="btn-glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-500"
            title="اختيار القارئ"
          >
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold truncate max-w-[110px] sm:max-w-[150px]">
              {activeReciter.name}
            </span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-glass p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-500"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "وضع ملء الشاشة الخاشع"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── THE PRO 3D MUSHAF STAGE (طبعة مجمع الملك فهد الرسمية) ─────────── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="page-stage-container relative max-w-4xl mx-auto select-none"
      >
        {/* Fast Flip Edge Buttons (visible on tablets, iPads, and desktops; on mobile natural swipe & footer arrows are used) */}
        <button
          onClick={flipNextPage}
          disabled={viewedPage >= 604}
          className="hidden md:flex absolute -left-5 lg:-left-7 top-1/2 -translate-y-1/2 z-30 w-11 lg:w-12 h-24 lg:h-28 rounded-2xl glass-elevated border border-emerald-500/30 items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30 disabled:pointer-events-none"
          title="الصفحة التالية (يسار — ◄)"
        >
          <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>

        <button
          onClick={flipPrevPage}
          disabled={viewedPage <= 1}
          className="hidden md:flex absolute -right-5 lg:-right-7 top-1/2 -translate-y-1/2 z-30 w-11 lg:w-12 h-24 lg:h-28 rounded-2xl glass-elevated border border-emerald-500/30 items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30 disabled:pointer-events-none"
          title="الصفحة السابقة (يمين — ►)"
        >
          <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7" />
        </button>

        {/* ── Page Leaf Container ────────────────────────────────────────── */}
        <div
          className={`rounded-3xl sm:rounded-[2.5rem] border-2 sm:border-4 ${
            themeStyles.card
          } relative overflow-hidden transition-all duration-300 transform-gpu ${
            isFlipping
              ? flipDirection === "next"
                ? "page-turning-next"
                : "page-turning-prev"
              : ""
          }`}
        >
          {/* Authentic Center Spine Shadow (كعب المصحف) */}
          <div
            className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 pointer-events-none z-20 bg-gradient-to-r ${themeStyles.spine} opacity-50 hidden md:block`}
          />

          {/* ── Top Madinah Page Header Bar ───────────────────────────────── */}
          <div
            className={`flex items-center justify-between px-4 sm:px-8 py-2.5 text-xs sm:text-sm font-bold border-b ${themeStyles.header}`}
          >
            <span className="font-traditional text-base sm:text-lg font-extrabold tracking-wide">
              سُورَةُ {primarySurah.name}
            </span>

            {/* Bookmark Ribbon Indicator */}
            <div className="flex items-center gap-1.5">
              {bookmarkKey && pageData?.ayahs.some((a) => `${a.surah}:${a.ayah}` === bookmarkKey) ? (
                <div
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold bg-red-500/15 px-3 py-0.5 rounded-full border border-red-500/35 anim-pulse text-xs"
                  title="فاصلة القراءة محفوظة عند هذه الصفحة"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>فاصلة {bookmarkKey}</span>
                </div>
              ) : (
                <span className="text-xs opacity-75 font-semibold">
                  {primarySurah.revelationType} • صفحة {toArabicNumerals(viewedPage)}
                </span>
              )}
            </div>

            <span className="font-traditional text-base sm:text-lg font-extrabold tracking-wide">
              الجُزْءُ {toArabicNumerals(currentJuz)}
            </span>
          </div>

          {/* ── Authentic King Fahd Complex Surah Header Banner (طبعة مجمع الملك فهد) ── */}
          {(viewedPage === 1 || pageData?.ayahs.some((a) => a.ayah === 1)) && (
            <div className="px-3 sm:px-8 pt-3 anim-fade-up">
              <SurahHeaderBanner
                surahNumber={primarySurah.number}
                surahName={primarySurah.name}
                theme={theme}
                numberOfAyahs={primarySurah.numberOfAyahs}
                revelationType={primarySurah.revelationType}
              />
            </div>
          )}

          {/* ── Middle: King Fahd Complex Vector Artwork Stage ─────────────── */}
          <div className="relative p-2 sm:p-5 flex items-center justify-center min-h-[520px] sm:min-h-[720px] md:min-h-[820px]">
            <div
              onClick={onSvgContainerClick}
              onTouchStart={onSvgTouchStart}
              onTouchEnd={onSvgTouchEnd}
              style={{ filter: themeStyles.filter }}
              className="mushaf-kfqc-frame w-full h-auto flex items-center justify-center cursor-pointer transition-all duration-200"
              dangerouslySetInnerHTML={{ __html: currentSvg }}
            />
          </div>

          {/* ── Bottom Madinah Page Footer ─────────────────────────────────── */}
          <div
            className={`flex items-center justify-between px-2.5 sm:px-8 py-2 text-xs font-bold border-t ${themeStyles.header}`}
          >
            <span className="opacity-75 font-semibold text-[10px] sm:text-xs">
              الحزب {toArabicNumerals(Math.ceil((viewedPage / 604) * 60) || 1)}
            </span>

            {/* Central Page Number Cartouche with quick flip on mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={flipNextPage}
                disabled={viewedPage >= 604}
                className="p-1 sm:hidden rounded-lg hover:bg-emerald-500/15 text-slate-700 dark:text-slate-300 disabled:opacity-20 active:scale-90 transition-all"
                title="الصفحة التالية (يسار — ◄)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="font-traditional text-sm sm:text-base md:text-lg font-extrabold px-3 sm:px-5 py-0.5 rounded-full border border-emerald-500/35 bg-black/5 dark:bg-white/5">
                — {toArabicNumerals(viewedPage)} —
              </div>
              <button
                onClick={flipPrevPage}
                disabled={viewedPage <= 1}
                className="p-1 sm:hidden rounded-lg hover:bg-emerald-500/15 text-slate-700 dark:text-slate-300 disabled:opacity-20 active:scale-90 transition-all"
                title="الصفحة السابقة (يمين — ►)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="opacity-75 font-traditional text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none text-left">
              مجمع الملك فهد لطباعة المصحف
            </span>
          </div>
        </div>
      </div>

      {/* ── THE BOTTOM SHEET (درج خيارات الآية المنبثق من تحت) ─────────────── */}
      {showBottomSheet && selectedAyah && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm anim-fade-in">
          <div
            onClick={() => {
              setShowBottomSheet(false);
              setSelectedAyah(null);
            }}
            className="absolute inset-0"
          />

          <div className="relative z-10 w-full max-w-2xl bg-slate-900 text-white rounded-t-[2.5rem] p-5 sm:p-7 border-t-2 border-emerald-500/40 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 anim-slide-up">
            <div className="w-14 h-1.5 bg-slate-600 rounded-full mx-auto -mt-1 mb-2 opacity-80" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg text-emerald-400">
                    سورة {primarySurah.name}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    الآية {toArabicNumerals(selectedAyah.ayah)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  الجزء {toArabicNumerals(currentJuz)} • صفحة {toArabicNumerals(viewedPage)}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowBottomSheet(false);
                  setSelectedAyah(null);
                }}
                className="btn-glass p-2 rounded-2xl text-slate-400 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ayah Text Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <p className="font-quran text-xl sm:text-2xl text-emerald-200 leading-relaxed text-right">
                ﴿ {selectedAyah.text} ﴾
              </p>
            </div>

            {/* Action Buttons Row (تلاوة، تفسير، فاصلة، تكرار، مشاركة — بدون زر نسخ) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {/* 1. Play Verse */}
              <button
                onClick={() => {
                  playVerse(selectedAyah.surah, selectedAyah.ayah, false);
                  setShowBottomSheet(false);
                }}
                className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span className="text-[11px] font-bold">تلاوة</span>
              </button>

              {/* 2. Tafsir Drawer */}
              <button
                onClick={() => setShowTafsirInsideSheet(!showTafsirInsideSheet)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  showTafsirInsideSheet
                    ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-[11px] font-bold">التفسير</span>
              </button>

              {/* 3. Bookmark Ribbon */}
              <button
                onClick={() => toggleBookmark(selectedAyah.surah, selectedAyah.ayah)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  bookmarkKey === `${selectedAyah.surah}:${selectedAyah.ayah}`
                    ? "bg-red-500/25 border-red-500/50 text-red-300 font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200"
                }`}
              >
                <Bookmark className="w-5 h-5 fill-current" />
                <span className="text-[11px] font-bold">فاصلة</span>
              </button>

              {/* 4. Repeat Toggle */}
              <button
                onClick={() => {
                  const next = repeatMode === "none" ? "single" : repeatMode === "single" ? "page" : "none";
                  setRepeatMode(next);
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  repeatMode !== "none"
                    ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300 font-bold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200"
                }`}
                title="تكرار الآية للتحفيظ"
              >
                <Repeat className="w-5 h-5" />
                <span className="text-[11px] font-bold">
                  {repeatMode === "single" ? "تكرار الآية" : repeatMode === "page" ? "تكرار الصفحة" : "تكرار"}
                </span>
              </button>

              {/* 5. Share Verse with Range and Image in King Fahd Font */}
              <button
                onClick={() => openShareModalForAyah(selectedAyah.surah, selectedAyah.ayah)}
                className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="مشاركة الآيات كبطاقة صورة فاخرة بخط مجمع الملك فهد مع تحديد النطاق"
              >
                <Share2 className="w-5 h-5 text-white" />
                <span className="text-[11px] font-bold">مشاركة ونشر</span>
              </button>
            </div>

            {/* Tafsir Inside the Bottom Sheet */}
            {showTafsirInsideSheet && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 anim-fade-up">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <button
                    onClick={() => setBottomSheetTafsirTab("muyassar")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bottomSheetTafsirTab === "muyassar"
                        ? "bg-emerald-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    التفسير الميسر (مجمع الملك فهد)
                  </button>
                  <button
                    onClick={() => setBottomSheetTafsirTab("saadi")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bottomSheetTafsirTab === "saadi"
                        ? "bg-emerald-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    تفسير السعدي (تيسير الكريم الرحمن)
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-traditional">
                  {bottomSheetTafsirTab === "muyassar"
                    ? selectedAyah.tafsir || "جاري جلب التفسير الميسر لهذه الآية الكريمة..."
                    : selectedAyah.tafsirSaadi || selectedAyah.tafsir || "جاري جلب تفسير السعدي لهذه الآية الكريمة..."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 6. THE REDESIGNED LUXURY PLAYER DOCK (مشغل فائق التميز والأناقة) ── */}
      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[96%] sm:w-auto sm:min-w-[540px] anim-fade-up">
        <div className="glass-elevated bg-slate-900/95 dark:bg-[#070b10]/95 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-full py-2 px-2.5 sm:py-2.5 sm:px-5 shadow-[0_20px_60px_rgba(0,0,0,0.65),0_0_35px_rgba(16,185,129,0.18)] text-white">
          {/* Master Controller Row */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-4">
            {/* Left Cluster: Audio Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              <button
                onClick={skipPrevTrack}
                className="btn-glass p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-emerald-400"
                title="الآية السابقة"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Large Master Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95 transition-all shrink-0"
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل التلاوة"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-current" />
                )}
              </button>

              <button
                onClick={skipNextTrack}
                className="btn-glass p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-emerald-400"
                title="الآية التالية"
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Equalizer Waveform bars */}
              {isPlaying && (
                <div className="hidden sm:flex items-end gap-1 h-5 px-1">
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-5"></span>
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4"></span>
                </div>
              )}
            </div>

            {/* Center Cluster: Reciter & Current Reciting Ayah Info */}
            <div className="text-right flex-1 min-w-0 px-1 sm:px-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white truncate">
                {playingTrack ? (
                  <>
                    <span className="text-emerald-400">سورة {playingTrack.surahName}</span>
                    <span>•</span>
                    <span>الآية {toArabicNumerals(playingTrack.ayah)}</span>
                  </>
                ) : (
                  <span>جاهز للاستماع</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setShowRecitersModal(true)}
                  className="text-[10px] sm:text-[11px] text-slate-300 hover:text-emerald-400 font-semibold truncate flex items-center gap-0.5 sm:gap-1 max-w-[110px] sm:max-w-[180px]"
                >
                  <span>الشيخ {activeReciter.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
                </button>

                {/* SMART JUMP BUTTON (إذا انتقل المستخدم لصفحة أخرى أثناء التلاوة) */}
                {isBrowsingDifferentPage && (
                  <button
                    onClick={jumpToRecitingPage}
                    className="bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-500 hover:text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-1 anim-pulse transition-all shrink-0"
                    title="العودة للصفحة التي يقرأها الشيخ حالياً"
                  >
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>العودة لصفحة {toArabicNumerals(playingTrack!.page)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Cluster: Repeat & Speed Switcher */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  const modes: RepeatMode[] = ["none", "single", "page", "surah"];
                  const curIdx = modes.indexOf(repeatMode);
                  setRepeatMode(modes[(curIdx + 1) % modes.length]);
                }}
                className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all ${
                  repeatMode !== "none"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "btn-glass text-slate-300 hover:text-white"
                }`}
                title={
                  repeatMode === "single"
                    ? "تكرار الآية الحالية (تحفيظ)"
                    : repeatMode === "page"
                    ? "تكرار الصفحة كاملة"
                    : repeatMode === "surah"
                    ? "تكرار السورة كاملة"
                    : "تفعيل التكرار"
                }
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  const speeds = [1, 1.25, 1.5, 0.75];
                  const curIdx = speeds.indexOf(playbackSpeed);
                  const nextSpeed = speeds[(curIdx + 1) % speeds.length];
                  setPlaybackSpeed(nextSpeed);
                  if (audioRefA.current) audioRefA.current.playbackRate = nextSpeed;
                  if (audioRefB.current) audioRefB.current.playbackRate = nextSpeed;
                }}
                className="btn-glass px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold text-slate-200 hover:text-emerald-400"
                title="سرعة التلاوة"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 18 RECITERS MODAL (اختيار القارئ من بين ١٨ قارئاً) ────────────── */}
      {showRecitersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md anim-fade-in">
          <div className="glass-elevated rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 border border-emerald-500/30 shadow-2xl max-h-[88vh] flex flex-col bg-slate-900/95 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                  <span>مشاهير القراء وأئمة الحرمين الشريفين</span>
                </h3>
                <p className="text-xs text-slate-400">
                  اختر من بين ١٨ قارئاً معتمداً من كبار شيوخ الإقراء
                </p>
              </div>
              <button
                onClick={() => setShowRecitersModal(false)}
                className="btn-glass p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث باسم القارئ (مثل: الحصري، المنشاوي، السديس...)"
                  value={reciterSearch}
                  onChange={(e) => setReciterSearch(e.target.value)}
                  className="w-full glass-card text-xs rounded-xl py-2.5 pr-10 pl-4 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto space-y-2 py-2 pr-1">
              {reciters
                .filter(
                  (r) =>
                    !reciterSearch ||
                    r.name.includes(reciterSearch) ||
                    r.subname.includes(reciterSearch)
                )
                .map((r) => {
                  const isCur = r.id === selectedReciterId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelectedReciterId(r.id);
                        setShowRecitersModal(false);
                        try {
                          localStorage.setItem("midad_quran_reciter", r.id);
                        } catch {}
                        if (isPlaying && playingTrack) {
                          playVerse(playingTrack.surah, playingTrack.ayah, false);
                        }
                      }}
                      className={`w-full text-right p-3 rounded-2xl flex items-center justify-between transition-all ${
                        isCur
                          ? "bg-emerald-500/25 border border-emerald-500/40 text-emerald-200"
                          : "bg-white/[0.03] hover:bg-white/[0.08] border border-white/05 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCur ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {r.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm">{r.name}</div>
                          <div className="text-[11px] text-slate-400">{r.subname}</div>
                        </div>
                      </div>

                      {isCur && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ── SURAH PICKER MODAL (114 SURAHS) ─────────────────────────────── */}
      {showSurahPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md anim-fade-in">
          <div className="glass-elevated rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-6 border border-emerald-500/30 shadow-2xl max-h-[88vh] flex flex-col bg-slate-900/95 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span>فهرس سور القرآن الكريم (١١٤ سورة)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  انتقل فورياً إلى أي سورة في المصحف الشريف
                </p>
              </div>
              <button
                onClick={() => setShowSurahPicker(false)}
                className="btn-glass p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث باسم السورة (مثل: الكهف، مريم، يوسف...)"
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className="w-full glass-card text-xs rounded-xl py-2.5 pr-10 pl-4 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 py-2 pr-1">
              {QURAN_SURAHS.filter(
                (s) =>
                  !surahSearch ||
                  s.name.includes(surahSearch) ||
                  String(s.number).includes(surahSearch)
              ).map((s) => (
                <button
                  key={s.number}
                  onClick={() => {
                    setShowSurahPicker(false);
                    turnToPage(s.page, s.page > viewedPage ? "next" : "prev");
                  }}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                    s.number === primarySurah.number
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/05 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">سورة {s.name}</div>
                    <div className="text-[10px] text-slate-400">
                      ص {toArabicNumerals(s.page)} • {toArabicNumerals(s.numberOfAyahs)} آية
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-500 font-bold">
                    {toArabicNumerals(s.number)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── JUZ PICKER MODAL (30 JUZ) ────────────────────────────────────── */}
      {showJuzPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md anim-fade-in">
          <div className="glass-elevated rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 border border-emerald-500/30 shadow-2xl max-h-[88vh] flex flex-col bg-slate-900/95 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-base text-white">
                فهرس الأجزاء الشريفة (٣٠ جزءاً)
              </h3>
              <button
                onClick={() => setShowJuzPicker(false)}
                className="btn-glass p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 pr-1">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((jNum) => {
                const approxPage = Math.min(604, Math.max(1, (jNum - 1) * 20 + 2));
                const targetPage = jNum === 1 ? 1 : approxPage;
                return (
                  <button
                    key={jNum}
                    onClick={() => {
                      setShowJuzPicker(false);
                      turnToPage(targetPage, targetPage > viewedPage ? "next" : "prev");
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      jNum === currentJuz
                        ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-200 font-bold"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/05 text-slate-300"
                    }`}
                  >
                    <div className="font-bold text-sm">الجزء {toArabicNumerals(jNum)}</div>
                    <div className="text-[11px] text-slate-400">
                      صفحة {toArabicNumerals(targetPage)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ADVANCED AYAH RANGE & IMAGE SHARE MODAL ───────────────────────── */}
      <QuranShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        surahNumber={shareConfig.surahNumber}
        surahName={shareConfig.surahName}
        totalAyahs={shareConfig.totalAyahs}
        initialAyah={shareConfig.initialAyah}
        initialAyahsData={
          shareConfig.surahNumber === surah.meta.number
            ? surah.ayahs.map((a) => ({
                numberInSurah: a.numberInSurah,
                text: a.text,
              }))
            : undefined
        }
      />
    </div>
  );
}
