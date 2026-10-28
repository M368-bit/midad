import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 dark:focus:border-emerald-500 ${
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-300 dark:border-slate-700"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
