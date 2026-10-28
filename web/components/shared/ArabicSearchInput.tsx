"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { AISearchEnhanced } from "@/components/ai/AISearchEnhanced";

interface ArabicSearchInputProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  showAI?: boolean;
  redirectOnFocus?: boolean;
}

export function ArabicSearchInput({
  initialQuery = "",
  placeholder = "ابحث بالقرآن، الحديث، العالم، الدرس، أو الكتاب (مثال: إنما الأعمال بالنيات، ابن عثيمين، كتاب التوحيد...)",
  className = "",
  autoFocus = false,
  onSearch,
  showAI = true,
  redirectOnFocus = true,
}: ArabicSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    // If user clicks on search input from a non-search page, navigate directly to /search
    if (redirectOnFocus && pathname !== "/search") {
      router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      return;
    }
    if (query.trim().length >= 2) {
      setDropdownOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    setDropdownOpen(false);

    if (onSearch) {
      onSearch(clean);
    } else {
      router.push(`/search?q=${encodeURIComponent(clean)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setDropdownOpen(false);
    if (onSearch) onSearch("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setDropdownOpen(true);
  };

  const handleNavigate = () => {
    setDropdownOpen(false);
    setQuery("");
  };

  // Close dropdown on click outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (
        containerRef.current &&
        !containerRef.current.contains(target as Node) &&
        !target?.closest("#ai-search-dropdown-portal")
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full z-20 ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onClick={handleFocus}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="حقل البحث"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            className="w-full pl-10 pr-12 py-3.5 sm:py-4 rounded-2xl liquid-glass border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-glass dark:shadow-glass-dark focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm sm:text-base transition-all cursor-text"
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
            className="absolute left-2 px-4 py-2 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-glass-emerald border border-emerald-400/30 active:scale-95"
          >
            بحث
          </button>
        </div>
      </form>

      {/* AI Search Dropdown — rendered via portal to escape stacking contexts */}
      {showAI && dropdownOpen && (
        <AISearchEnhanced
          query={query}
          anchorRef={containerRef}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
