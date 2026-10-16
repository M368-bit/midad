"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface ArabicSearchInputProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export function ArabicSearchInput({
  initialQuery = "",
  placeholder = "ابحث بالحديث، العالم، الدرس، أو الكتاب (مثال: إنما الأعمال بالنيات، ابن عثيمين، كتاب التوحيد...)",
  className = "",
  autoFocus = false,
  onSearch,
}: ArabicSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    if (onSearch) {
      onSearch(clean);
    } else {
      router.push(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-12 py-3.5 sm:py-4 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 dark:focus:border-emerald-500 text-sm sm:text-base transition-all"
        />
        <div className="absolute right-4 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-16 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute left-2 px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm"
        >
          بحث
        </button>
      </div>
    </form>
  );
}
