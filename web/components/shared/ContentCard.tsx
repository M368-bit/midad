"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, Library, Scroll, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "../ui/Badge";
import { FavoriteButton } from "./FavoriteButton";
import { SourceVerificationBadge } from "./SourceVerificationBadge";

interface ContentCardProps {
  type: "scholar" | "lesson" | "book" | "hadith";
  title: string;
  subtitle?: string | null;
  description?: string | null;
  href: string;
  id: string;
  badge?: string;
  isVerified?: boolean;
  metadata?: string;
  sourceUrl?: string | null;
}

const typeConfig = {
  scholar: {
    icon: GraduationCap,
    gradient: "from-emerald-500/15 to-emerald-600/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  lesson: {
    icon: BookOpen,
    gradient: "from-emerald-600/15 to-teal-600/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  book: {
    icon: Library,
    gradient: "from-emerald-700/15 to-emerald-800/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  hadith: {
    icon: Scroll,
    gradient: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
};

export function ContentCard({
  type,
  title,
  subtitle,
  description,
  href,
  id,
  badge,
  isVerified = true,
  metadata,
  sourceUrl,
}: ContentCardProps) {
  const { icon: Icon, gradient, iconColor } = typeConfig[type];

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col justify-between group">
      {/* Card inner content */}
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            {/* Animated icon box */}
            <div
              className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} glass-emerald flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
            >
              {/* Shimmer on icon hover */}
              <span className="absolute inset-0 rounded-xl animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
              <Icon className={`w-4 h-4 ${iconColor} relative z-10`} />
            </div>
            {badge && (
              <Badge variant="emerald" size="sm">
                {badge}
              </Badge>
            )}
          </div>
          <FavoriteButton
            contentType={type}
            contentId={id}
            title={title}
            subtitle={subtitle || undefined}
            url={href}
          />
        </div>

        {/* Title */}
        <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg block">
          <h3 className="font-bold text-base sm:text-[17px] text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2 leading-snug">
            {title}
          </h3>
        </Link>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block shrink-0" />
            {subtitle}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-200/50 dark:border-white/06 flex items-center justify-between text-xs text-slate-500">
        <div className="truncate max-w-[65%]">
          {metadata ? (
            <span className="flex items-center gap-1 glass-sm rounded-lg px-2 py-0.5">
              <Clock className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              <span>{metadata}</span>
            </span>
          ) : (
            <SourceVerificationBadge
              isVerified={isVerified}
              sourceUrl={sourceUrl}
            />
          )}
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold group-hover:-translate-x-1 transition-transform duration-200 shrink-0"
        >
          <span>عرض</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
