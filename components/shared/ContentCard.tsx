import React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, Library, Scroll, Clock, ArrowLeft } from "lucide-react";
import { Card } from "../ui/Card";
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
  const typeIcons = {
    scholar: GraduationCap,
    lesson: BookOpen,
    book: Library,
    hadith: Scroll,
  };

  const Icon = typeIcons[type];

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full group relative">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
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
        <Link href={href} className="focus:outline-none">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {subtitle}
          </p>
        )}

        {/* Description / snippet */}
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Footer info & link */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="truncate max-w-[70%]">
          {metadata ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
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
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium group-hover:-translate-x-1 transition-transform"
        >
          <span>عرض</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
