"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  BookMarked,
  Filter,
  Check,
  Volume2,
} from "lucide-react";
import type { SurahMeta } from "@/lib/data/quran-surahs";

interface QuranIndexClientProps {
  surahs: SurahMeta[];
}

export function QuranIndexClient({ surahs }: QuranIndexClientProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Meccan" | "Medinan">("all");
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      // Revelation filter
      if (filterType !== "all" && s.revelationType !== filterType) return false;

      // Juz filter
      if (selectedJuz !== null && s.juz !== selectedJuz) return false;

      // Search filter
      if (search.trim()) {
        const clean = search.trim().toLowerCase();
        const matchesName = s.name.includes(clean);
        const matchesEng = s.englishName.toLowerCase().includes(clean);
        const matchesNum = String(s.number) === clean;
        if (!matchesName && !matchesEng && !matchesNum) return false;
      }

      return true;
    });
  }, [surahs, search, filterType, selectedJuz]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها (مثال: الفاتحة، الكهف، 67...)"
            className="w-full pl-10 pr-12 py-3 rounded-2xl liquid-glass border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-glass-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              مسح
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => {
              setFilterType("all");
              setSelectedJuz(null);
            }}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filterType === "all" && selectedJuz === null
                ? "btn-glass-emerald shadow-glass-emerald"
                : "glass-sm text-slate-600 dark:text-slate-400 hover:text-emerald-400"
            }`}
          >
            جميع السور (١١٤)
          </button>
          <button
            onClick={() => {
              setFilterType("Meccan");
              setSelectedJuz(null);
            }}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filterType === "Meccan"
                ? "btn-glass-emerald shadow-glass-emerald"
                : "glass-sm text-slate-600 dark:text-slate-400 hover:text-emerald-400"
            }`}
          >
            المكية (٨٦)
          </button>
          <button
            onClick={() => {
              setFilterType("Medinan");
              setSelectedJuz(null);
            }}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap font-semibold transition-all ${
              filterType === "Medinan"
                ? "btn-glass-emerald shadow-glass-emerald"
                : "glass-sm text-slate-600 dark:text-slate-400 hover:text-emerald-400"
            }`}
          >
            المدنية (٢٨)
          </button>
        </div>
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSurahs.map((surah) => {
          const isMeccan = surah.revelationType === "Meccan";

          return (
            <Link
              key={surah.number}
              href={`/quran/${surah.number}`}
              className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-emerald-500/50 hover:shadow-glass-emerald transition-all duration-300 group"
            >
              {/* Left: Info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Surah Number Badge */}
                <div className="relative w-11 h-11 rounded-xl glass-emerald flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {surah.number}
                  </span>
                </div>

                {/* Name & Details */}
                <div className="min-w-0">
                  <h3 className="font-traditional font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug truncate">
                    سورة {surah.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    ترتيب النزول {surah.revelationOrder} • {isMeccan ? "مكية نزلت بمكة" : "مدنية نزلت بالمدينة"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span className="text-emerald-400 font-semibold">
                      {surah.numberOfAyahs} آيات
                    </span>
                    <span>•</span>
                    <span>الجزء {surah.juz}</span>
                    <span>•</span>
                    <span>ص {surah.page}</span>
                  </div>
                </div>
              </div>

              {/* Right: Revelation Type Badge */}
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isMeccan
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  }`}
                >
                  {isMeccan ? "مكية" : "مدنية"}
                </span>
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-emerald-400">
                  <span>قراءة</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredSurahs.length === 0 && (
        <div className="glass-card rounded-3xl p-10 text-center space-y-3">
          <p className="text-sm text-slate-400">
            لم يُعثر على سورة تطابق &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterType("all");
              setSelectedJuz(null);
            }}
            className="btn-glass-emerald text-xs px-4 py-2 rounded-xl"
          >
            عرض جميع السور
          </button>
        </div>
      )}
    </div>
  );
}
