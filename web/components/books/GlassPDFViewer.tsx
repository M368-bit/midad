"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Download,
  BookOpen,
  List,
  ExternalLink,
  ShieldCheck,
  Share2,
  Check,
  FileText,
  FileCheck,
} from "lucide-react";

interface GlassPDFViewerProps {
  title: string;
  pdfUrl?: string | null;
  readUrl?: string | null;
  downloadUrl?: string | null;
  totalPages?: number;
  toc?: { title: string; page: number }[];
  initialPage?: number;
  onClose?: () => void;
}

export function GlassPDFViewer({
  title,
  pdfUrl,
  readUrl,
  downloadUrl,
  totalPages = 500,
  toc = [],
  initialPage = 1,
}: GlassPDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [themeMode, setThemeMode] = useState<"dark" | "sepia" | "light">("dark");
  const [copied, setCopied] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Determine true PDF source
  const directPdfUrl =
    (pdfUrl && pdfUrl.endsWith(".pdf")) || (downloadUrl && downloadUrl.endsWith(".pdf"))
      ? pdfUrl || downloadUrl
      : null;

  const isArchiveEmbed = readUrl && readUrl.includes("archive.org/embed");
  const isDirectPdf = !!directPdfUrl;

  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeClasses = {
    dark: "bg-[#070a12] text-slate-100",
    sepia: "bg-[#fbf0d9] text-[#433422]",
    light: "bg-slate-50 text-slate-900",
  }[themeMode];

  return (
    <div
      ref={viewerContainerRef}
      className={`relative rounded-3xl overflow-hidden glass-elevated border border-emerald-500/20 shadow-glass-dark transition-all duration-300 flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : "h-[750px] w-full"
      } ${themeClasses}`}
    >
      {/* ── Top Glass Toolbar ────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/10 glass-elevated flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Title and Verified Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl glass-emerald flex items-center justify-center shrink-0 text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>قارئ PDF المعتمد لمكتبة التراث</span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Table of Contents Toggle */}
          {toc.length > 0 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showToc ? "bg-emerald-600 text-white" : "glass-sm text-slate-300 hover:text-white"
              }`}
              title="فهرس الأبواب"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">الفهرس</span>
            </button>
          )}

          {/* Theme Selector */}
          <div className="flex items-center p-1 glass-sm rounded-xl">
            <button
              onClick={() => setThemeMode("dark")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                themeMode === "dark" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="الوضع الليلي"
            >
              ليلي
            </button>
            <button
              onClick={() => setThemeMode("sepia")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                themeMode === "sepia" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
              title="الوضع الورقي المريح"
            >
              ورقي
            </button>
          </div>

          {/* Zoom In/Out */}
          <div className="hidden sm:flex items-center gap-1 p-1 glass-sm rounded-xl">
            <button
              onClick={() => setZoom((z) => Math.min(z + 15, 175))}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-300">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.max(z - 15, 70))}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Download PDF button */}
          {(downloadUrl || directPdfUrl) && (
            <a
              href={downloadUrl || directPdfUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl btn-glass-emerald text-xs font-semibold flex items-center gap-1.5"
              title="تحميل نسخة PDF الأصلية"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تحميل PDF</span>
            </a>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl glass-sm text-slate-400 hover:text-emerald-400 transition-colors"
            title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Main Body with Optional TOC Sidebar ───────────────────────────── */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Table of Contents Drawer */}
        {showToc && toc.length > 0 && (
          <aside className="w-64 sm:w-80 shrink-0 border-l border-white/10 glass-elevated overflow-y-auto p-4 z-20 anim-slide-down">
            <h3 className="text-xs font-bold text-emerald-400 mb-3 flex items-center justify-between">
              <span>فهرس أبواب الكتاب المعتمد</span>
              <span className="text-[10px] text-slate-400">{toc.length} باب</span>
            </h3>
            <ul className="space-y-1.5">
              {toc.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      handlePageChange(item.page);
                      setShowToc(false);
                    }}
                    className={`w-full text-right p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentPage === item.page
                        ? "bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30"
                        : "hover:bg-white/5 text-slate-300"
                    }`}
                  >
                    <span className="truncate flex-1">{item.title}</span>
                    <span className="text-[10px] font-mono opacity-60 mr-2">ص {item.page}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* ── PDF Reader Canvas ───────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-auto flex items-center justify-center p-2 sm:p-4">
          {isDirectPdf ? (
            /* True Native PDF Viewer / Embed */
            <div
              className="w-full h-full transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            >
              <object
                data={directPdfUrl!}
                type="application/pdf"
                className="w-full h-full rounded-2xl border border-white/10 shadow-glass-dark bg-slate-900"
              >
                {/* Fallback if browser does not support native PDF object */}
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    directPdfUrl!
                  )}&embedded=true`}
                  title={title}
                  className="w-full h-full rounded-2xl border border-white/10 shadow-glass-dark bg-white"
                />
              </object>
            </div>
          ) : isArchiveEmbed ? (
            /* Open Verified Archive.org Book Reader */
            <div
              className="w-full h-full transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
            >
              <iframe
                src={readUrl!}
                title={title}
                className="w-full h-full rounded-2xl border border-white/10 shadow-glass-dark bg-white"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            /* In-Site Verified Heritage Book Reader View (NO external ads or websites) */
            <div className="text-center p-8 max-w-lg space-y-6 anim-fade-up">
              <div className="w-16 h-16 rounded-3xl glass-emerald flex items-center justify-center mx-auto text-emerald-400">
                <FileCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-traditional text-white">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  هذه النسخة موثقة في خزانة التراث الإسلامي المفتوح ومحققة بالأسانيد. يمكنك تصفح فهرس الأبواب بالجانب أو فتح ملف الـ PDF المصور كاملاً.
                </p>
              </div>

              {toc.length > 0 && (
                <div className="glass-card rounded-2xl p-4 text-right max-h-48 overflow-y-auto space-y-2 border border-white/05 text-xs">
                  <span className="font-bold text-emerald-400 block mb-2">أبواب الكتاب المفهرسة:</span>
                  {toc.slice(0, 6).map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300 py-1 border-b border-white/05">
                      <span>• {t.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ص {t.page}</span>
                    </div>
                  ))}
                </div>
              )}

              {(downloadUrl || pdfUrl) && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={downloadUrl || pdfUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-emerald px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>فتح وتحميل النسخة المصورة الأصلية (PDF)</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Page Jump Bar ─────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-white/10 glass-elevated z-30 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">الصفحة الحالية:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const p = parseInt(e.target.value, 10);
                if (!isNaN(p)) handlePageChange(p);
              }}
              className="w-16 glass-card text-center font-mono rounded-lg py-1 px-2 border border-white/10 text-xs focus:outline-none focus:border-emerald-500 text-white"
            />
            <span className="text-slate-500 text-[11px]">من {totalPages.toLocaleString("ar-EG")} صفحة</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "تم النسخ" : "مشاركة الكتاب"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
