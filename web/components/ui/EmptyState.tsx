import React from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionText?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "لا توجد نتائج موثقة مطابقة",
  description = "لم نتمكن من العثور على محتوى موثق يطابق بحثك حالياً. نحرص في مداد على عدم إظهار نتائج غير مكتملة التوثيق.",
  actionHref,
  actionText,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 my-6">
      <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
        {icon || <SearchX className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionHref && actionText && (
        <Link href={actionHref}>
          <Button variant="outline" size="sm">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
}
