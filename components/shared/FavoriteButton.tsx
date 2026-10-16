"use client";

import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { ContentType } from "@/types";
import { isItemFavorited, toggleFavorite } from "@/lib/repositories/user-repository";
import { useAuth } from "../auth/AuthProvider";

interface FavoriteButtonProps {
  contentType: ContentType;
  contentId: string;
  title: string;
  subtitle?: string;
  url?: string;
  className?: string;
}

export function FavoriteButton({
  contentType,
  contentId,
  title,
  subtitle,
  url,
  className = "",
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    isItemFavorited(contentType, contentId, user?.id).then(setIsFavorited);
  }, [contentType, contentId, user?.id]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    // Optimistic toggle
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    try {
      const res = await toggleFavorite(
        contentType,
        contentId,
        { title, subtitle, url },
        user?.id
      );
      setIsFavorited(res);
    } catch {
      setIsFavorited(!nextState); // Rollback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorited ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      title={isFavorited ? "في المفضلة" : "حفظ في المفضلة"}
      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
        isFavorited
          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
          : "bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 transition-transform ${
          isFavorited ? "fill-current scale-110" : ""
        }`}
      />
    </button>
  );
}
