"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Share2,
  Download,
  Sparkles,
} from "lucide-react";
import { SurahHeaderBanner } from "./SurahHeaderBanner";
import { SURAH_FRAME_DARK_DATA_URL } from "@/lib/data/surah-frames";


export interface AyahShareItem {
  numberInSurah: number;
  text: string;
}

export interface QuranShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  initialAyah?: number;
  initialAyahsData?: AyahShareItem[];
}

function toArabicNumerals(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num)
    .split("")
    .map((d) => arabicDigits[parseInt(d, 10)] ?? d)
    .join("");
}

export function QuranShareModal({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  totalAyahs,
  initialAyah = 1,
  initialAyahsData = [],
}: QuranShareModalProps) {
  const [startAyah, setStartAyah] = useState<number>(initialAyah);
  const [endAyah, setEndAyah] = useState<number>(initialAyah);
  const [ayahsList, setAyahsList] = useState<AyahShareItem[]>(initialAyahsData);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"card" | "text">("card");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial ayah when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartAyah(initialAyah);
      setEndAyah(initialAyah);
      setCopied(false);
      setPreviewImageUrl(null);
    }
  }, [isOpen, initialAyah]);

  // Fetch surah ayahs if not already provided or if incomplete
  useEffect(() => {
    if (!isOpen) return;

    if (
      initialAyahsData.length >= totalAyahs &&
      initialAyahsData[0]?.numberInSurah === 1
    ) {
      setAyahsList(initialAyahsData);
      return;
    }

    let isCancelled = false;
    async function loadSurahAyahs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/quran/surah/${surahNumber}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data && Array.isArray(data.ayahs)) {
            const mapped = data.ayahs.map((a: any) => ({
              numberInSurah: a.numberInSurah,
              text: a.text,
            }));
            setAyahsList(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to load surah ayahs for sharing:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadSurahAyahs();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, surahNumber, totalAyahs, initialAyahsData]);

  // Range validation
  const handleStartChange = (val: number) => {
    const s = Math.max(1, Math.min(val, totalAyahs));
    setStartAyah(s);
    if (s > endAyah) {
      setEndAyah(s);
    }
    setPreviewImageUrl(null);
  };

  const handleEndChange = (val: number) => {
    const e = Math.max(1, Math.min(val, totalAyahs));
    setEndAyah(e);
    if (e < startAyah) {
      setStartAyah(e);
    }
    setPreviewImageUrl(null);
  };

  // Selected ayahs in range
  const selectedAyahs = ayahsList.filter(
    (a) => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah
  );

  // Formatted citation text for clipboard & sharing
  const getShareableText = useCallback((): string => {
    if (selectedAyahs.length === 0) return "";
    const versesBody = selectedAyahs
      .map((a) => `${a.text} ﴿${toArabicNumerals(a.numberInSurah)}﴾`)
      .join(" ");

    const rangeLabel =
      startAyah === endAyah
        ? `الآية ${toArabicNumerals(startAyah)}`
        : `الآيات ${toArabicNumerals(startAyah)} - ${toArabicNumerals(endAyah)}`;

    const bismillahHeader =
      startAyah === 1 && surahNumber !== 1 && surahNumber !== 9
        ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n\n"
        : "";

    return `${bismillahHeader}﴿ ${versesBody} ﴾\n\n[سورة ${surahName} : ${rangeLabel}]\n— عبر تطبيق مِداد (MIDAD)`;
  }, [selectedAyahs, startAyah, endAyah, surahName, surahNumber]);

  // Copy to clipboard
  const handleCopyText = async () => {
    const text = getShareableText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Draw luxury Quran card on HTML5 Canvas
  const generateCanvasCard = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 0. Ensure King Fahd Complex font is loaded into browser font registry
    if (typeof document !== "undefined" && document.fonts) {
      try {
        await document.fonts.load("42px 'KFGQPC-Hafs'");
      } catch {
        // fallback
      }
    }

    const width = 1080;
    const paddingX = 90;
    const contentWidth = width - paddingX * 2;

    // Measure text & calculate height dynamically using King Fahd Complex Uthmanic Font
    const quranFont = "normal 42px 'KFGQPC-Hafs', 'Amiri Quran', 'Amiri', 'Traditional Arabic', serif";
    ctx.font = quranFont;
    const words: string[] = [];
    selectedAyahs.forEach((a) => {
      const parts = a.text.split(/\s+/);
      parts.forEach((p) => words.push(p));
      words.push(`﴿${toArabicNumerals(a.numberInSurah)}﴾`);
    });

    const lines: string[] = [];
    let currentLine = "";
    for (const w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > contentWidth && currentLine) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 86;
    const headerHeight = 340;
    const footerHeight = 220;
    const textHeight = lines.length * lineHeight;
    const calculatedHeight = Math.max(1080, headerHeight + textHeight + footerHeight);

    canvas.width = width;
    canvas.height = calculatedHeight;

    // 1. Dark Luxury Background with Emerald & Midnight Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, calculatedHeight);
    bgGrad.addColorStop(0, "#081318");
    bgGrad.addColorStop(0.5, "#0E1E26");
    bgGrad.addColorStop(1, "#071116");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, calculatedHeight);

    // Subtle Radial Glow in center
    const radialGlow = ctx.createRadialGradient(
      width / 2,
      calculatedHeight / 2,
      50,
      width / 2,
      calculatedHeight / 2,
      calculatedHeight * 0.6
    );
    radialGlow.addColorStop(0, "rgba(16, 185, 129, 0.09)");
    radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, calculatedHeight);

    // 2. Islamic Outer Border (Double Gold/Emerald Frame)
    ctx.strokeStyle = "rgba(212, 175, 55, 0.45)"; // Gold
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, width - 72, calculatedHeight - 72);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)"; // Emerald
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, width - 96, calculatedHeight - 96);

    // Decorative corner fleuron accents
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-15, -15);
      ctx.lineTo(25, -15);
      ctx.moveTo(-15, -15);
      ctx.lineTo(-15, 25);
      ctx.stroke();

      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(-15, -15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCorner(54, 54, 0);
    drawCorner(width - 54, 54, Math.PI / 2);
    drawCorner(width - 54, calculatedHeight - 54, Math.PI);
    drawCorner(54, calculatedHeight - 54, -Math.PI / 2);

    // 3. Authentic King Fahd Complex Surah Header Banner (طبعة مجمع الملك فهد)
    const bannerW = 860;
    const bannerH = Math.round(bannerW * (110 / 1004)); // ~94px authentic aspect ratio
    const bannerX = (width - bannerW) / 2;
    const bannerY = 75;

    // Load authentic King Fahd Complex frame image from data URL (instant 0ms, zero CORS risk)
    const frameImg = new Image();
    frameImg.src = SURAH_FRAME_DARK_DATA_URL;
    if (!frameImg.complete) {
      await new Promise<void>((resolve) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = () => resolve();
      });
    }

    // Draw the authentic King Fahd ornamental frame
    try {
      ctx.drawImage(frameImg, bannerX, bannerY, bannerW, bannerH);
    } catch {
      // Fallback border if drawImage encounters any issue
      ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
    }

    // Calligraphic Surah Name in Center Cartouche using official King Fahd Complex font
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "normal 50px 'surah-name', 'KFGQPC-Hafs', 'Amiri Quran', serif";
    // Official ligature glyphs: surahNameGlyph + surahPrefixGlyph (in canvas RTL order)
    const surahTitleGlyph = String.fromCharCode(0xe000 + surahNumber) + String.fromCharCode(0xe000);
    ctx.fillText(surahTitleGlyph, width / 2, bannerY + bannerH / 2 - 2);


    // Ayah range badge
    const rangeLabel =
      startAyah === endAyah
        ? `الآية الكريمة (${toArabicNumerals(startAyah)})`
        : `الآيات الكريمة (${toArabicNumerals(startAyah)} - ${toArabicNumerals(endAyah)})`;

    ctx.fillStyle = "rgba(212, 175, 55, 0.95)";
    ctx.font = "normal 22px 'Amiri', 'Traditional Arabic', serif";
    ctx.fillText(rangeLabel, width / 2, bannerY + bannerH + 34);

    // Bismillah (if starting from 1 and not Tawbah)
    let startY = bannerY + bannerH + 95;
    if (startAyah === 1 && surahNumber !== 1 && surahNumber !== 9) {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 34px 'KFGQPC-Hafs', 'Amiri Quran', 'Amiri', serif";
      ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", width / 2, startY - 20);
      startY += 45;
    }

    // 4. Quran Text Lines using Official King Fahd Complex Font
    ctx.fillStyle = "#FAF7EE"; // Parchment Ivory
    ctx.textAlign = "center";
    ctx.font = "normal 42px 'KFGQPC-Hafs', 'Amiri Quran', 'Amiri', serif";

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });

    // 5. Footer Decoration & Midad Watermark
    const footerY = calculatedHeight - 110;

    // Golden Divider Line with diamond in middle
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, footerY - 30);
    ctx.lineTo(width / 2 - 25, footerY - 30);
    ctx.moveTo(width / 2 + 25, footerY - 30);
    ctx.lineTo(width / 2 + 180, footerY - 30);
    ctx.stroke();

    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(width / 2, footerY - 30, 4, 0, Math.PI * 2);
    ctx.fill();

    // App Branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = "bold 24px 'Amiri', 'Traditional Arabic', sans-serif";
    ctx.fillText("مصحف المدينة النبوية • تطبيق مِداد", width / 2, footerY);

    ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
    ctx.font = "normal 18px monospace, sans-serif";
    ctx.fillText("midad.com", width / 2, footerY + 32);

    return canvas;
  }, [selectedAyahs, startAyah, endAyah, surahName, surahNumber]);

  // Generate image preview
  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvasCard();
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        setPreviewImageUrl(dataUrl);
      }
    } catch (err) {
      console.error("Error generating Quran card image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image directly
  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvasCard();
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `midad-surah-${surahNumber}-ayah-${startAyah}-${endAyah}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error downloading image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Native Web Share (Files or Text)
  const handleNativeShare = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateCanvasCard();
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      const rangeLabel =
        startAyah === endAyah
          ? `الآية ${toArabicNumerals(startAyah)}`
          : `الآيات ${toArabicNumerals(startAyah)} - ${toArabicNumerals(endAyah)}`;

      if (
        blob &&
        navigator.canShare &&
        navigator.canShare({
          files: [
            new File([blob], `ayah-${startAyah}.png`, { type: "image/png" }),
          ],
        })
      ) {
        const file = new File(
          [blob],
          `midad-surah-${surahNumber}-ayah-${startAyah}-${endAyah}.png`,
          { type: "image/png" }
        );
        await navigator.share({
          title: `سورة ${surahName} — ${rangeLabel}`,
          text: getShareableText(),
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback to text share
        await navigator.share({
          title: `سورة ${surahName} — ${rangeLabel}`,
          text: getShareableText(),
          url: window.location.href,
        });
      } else {
        // Fallback to image download
        handleDownloadImage();
      }
    } catch (err) {
      console.warn("Share cancelled or failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md anim-fade-in select-none">
      <div
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-white max-h-[92vh] flex flex-col space-y-4 anim-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>مشاركة ونشر الآيات الكريمة</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  سورة {surahName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                حدد نطاق الآيات وشاركه كنص موثق أو بطاقة صورة فاخرة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-glass p-2 rounded-xl text-slate-400 hover:text-white"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 1. Range Selectors (من آية كذا إلى آية كذا) ─────────────────── */}
        <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>نطاق الآيات المطلوب مشاركتها:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              إجمالي آيات السورة: {toArabicNumerals(totalAyahs)} آية
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Start Ayah Selector */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/10 space-y-1">
              <label className="text-[11px] text-slate-400 font-bold block">
                مِن الآية:
              </label>
              <div className="flex items-center justify-between gap-1">
                <button
                  onClick={() => handleStartChange(startAyah - 1)}
                  disabled={startAyah <= 1}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-sm font-bold active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="font-bold text-base sm:text-lg text-emerald-300 font-mono">
                  {toArabicNumerals(startAyah)}
                </span>
                <button
                  onClick={() => handleStartChange(startAyah + 1)}
                  disabled={startAyah >= totalAyahs}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-sm font-bold active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* End Ayah Selector */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/10 space-y-1">
              <label className="text-[11px] text-slate-400 font-bold block">
                إلى الآية:
              </label>
              <div className="flex items-center justify-between gap-1">
                <button
                  onClick={() => handleEndChange(endAyah - 1)}
                  disabled={endAyah <= startAyah}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-sm font-bold active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="font-bold text-base sm:text-lg text-emerald-300 font-mono">
                  {toArabicNumerals(endAyah)}
                </span>
                <button
                  onClick={() => handleEndChange(endAyah + 1)}
                  disabled={endAyah >= totalAyahs}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-sm font-bold active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Live Card Preview Area ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs anim-pulse">
              جاري تجهيز نص الآيات الكريمة...
            </div>
          ) : selectedAyahs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لم يتم العثور على آيات في هذا النطاق
            </div>
          ) : (
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0B1A22] to-[#071116] border-2 border-[#D4AF37]/40 shadow-inner relative overflow-hidden space-y-3">
              {/* Card Corner Ornaments */}
              <div className="absolute top-2 right-2 text-xs text-[#D4AF37]/50 pointer-events-none">
                ✦
              </div>
              <div className="absolute top-2 left-2 text-xs text-[#D4AF37]/50 pointer-events-none">
                ✦
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-[#D4AF37]/50 pointer-events-none">
                ✦
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-[#D4AF37]/50 pointer-events-none">
                ✦
              </div>

              {/* Authentic King Fahd Surah Header Inside Card Preview */}
              <div className="pt-1 pb-2">
                <SurahHeaderBanner
                  surahNumber={surahNumber}
                  surahName={surahName}
                  theme="dark"
                  numberOfAyahs={totalAyahs}
                />
                <div className="text-center text-xs text-[#D4AF37] font-semibold -mt-1">
                  {startAyah === endAyah
                    ? `الآية الكريمة (${toArabicNumerals(startAyah)})`
                    : `الآيات الكريمة (${toArabicNumerals(startAyah)} - ${toArabicNumerals(endAyah)})`}
                </div>
              </div>

              {/* Bismillah if start from 1 */}
              {startAyah === 1 && surahNumber !== 1 && surahNumber !== 9 && (
                <div className="text-center text-amber-300/90 font-quran text-base sm:text-lg font-bold pt-1">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </div>
              )}

              {/* Quran Verses Preview in Official King Fahd Complex Font */}
              <p
                style={{ fontFamily: "'KFGQPC-Hafs', 'Amiri Quran', 'Amiri', serif" }}
                className="text-xl sm:text-2xl text-[#FAF7EE] leading-[2.5] text-center py-3 px-2"
              >
                {selectedAyahs.map((a) => (
                  <span key={a.numberInSurah} className="inline">
                    {a.text}{" "}
                    <span className="text-emerald-400 font-bold inline-block mx-1">
                      ﴿{toArabicNumerals(a.numberInSurah)}﴾
                    </span>{" "}
                  </span>
                ))}
              </p>

              {/* Card Footer Reference */}
              <div className="pt-2 border-t border-white/10 text-center text-xs text-slate-400 font-traditional">
                طبعة مجمع الملك فهد لطباعة المصحف الشريف • تطبيق مِداد
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Actions Row (حفظ ونشر الصورة المصورة بدون أي زر نسخ) ───────── */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
          {/* Action 1: Download Card as PNG Image */}
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating || loading}
            className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            title="حفظ بطاقة الآيات كصورة عالية الدقة بخط طبعة مجمع الملك فهد"
          >
            <Download className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold">
              {isGenerating ? "جاري التوليد..." : "حفظ الصورة (PNG)"}
            </span>
          </button>

          {/* Action 2: Native Share Image */}
          <button
            onClick={handleNativeShare}
            disabled={isGenerating || loading}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 hover:scale-[1.02] text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-40"
            title="نشر ومشاركة بطاقة الآيات كصورة فاخرة"
          >
            <Share2 className="w-5 h-5 fill-current" />
            <span className="text-xs sm:text-sm font-bold">نشر ومشاركة الصورة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
