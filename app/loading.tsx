import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-xs text-slate-500 font-medium">جاري تحميل المحتوى الموثق...</p>
    </div>
  );
}
