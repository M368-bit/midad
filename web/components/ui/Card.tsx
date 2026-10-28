import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

export function Card({
  children,
  hoverEffect = false,
  glass = false,
  className = "",
  ...props
}: CardProps) {
  const baseClasses = glass
    ? "glass-card rounded-2xl p-6"
    : "glass-card rounded-2xl p-5";

  const hoverClasses = hoverEffect ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
