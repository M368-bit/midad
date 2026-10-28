import React from "react";
import { CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Badge } from "../ui/Badge";

interface SourceVerificationBadgeProps {
  isVerified?: boolean;
  sourceTitle?: string;
  sourceUrl?: string | null;
  verifiedAt?: string | null;
  className?: string;
}

export function SourceVerificationBadge({
  isVerified = true,
  sourceTitle,
  sourceUrl,
  verifiedAt,
  className = "",
}: SourceVerificationBadgeProps) {
  if (!isVerified) {
    return (
      <Badge variant="amber" className={className}>
        <Clock className="w-3.5 h-3.5 ml-1 text-amber-600 dark:text-amber-400" />
        قيد المراجعة والتوثيق
      </Badge>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Badge variant="emerald">
        <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-600 dark:text-emerald-400" />
        مرجع موثق ومطابق
      </Badge>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={sourceTitle ? `فحص المصدر: ${sourceTitle}` : "فحص المصدر الأصلي"}
          className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 inline-flex items-center gap-0.5 underline transition-colors"
        >
          {sourceTitle ? `المصدر: ${sourceTitle.length > 25 ? sourceTitle.substring(0, 25) + '...' : sourceTitle}` : "المصدر الأصلي"}
          <ExternalLink className="w-3 h-3 mr-0.5" />
        </a>
      )}
    </div>
  );
}
