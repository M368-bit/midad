import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  children,
  hoverEffect = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-card dark:shadow-card-dark transition-all duration-200 ${
        hoverEffect
          ? "hover:border-emerald-500/40 dark:hover:border-emerald-500/30 hover:shadow-glow hover:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
