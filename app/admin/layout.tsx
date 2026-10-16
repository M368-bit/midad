"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  GraduationCap,
  BookOpen,
  Library,
  Scroll,
  Link2,
  FileCheck2,
  Activity,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { canAccessAdmin, getRoleLabelAr } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        جاري التحقق من الصلاحيات الإدارية...
      </div>
    );
  }

  const role = profile?.role_id || "viewer";
  const hasAccess = canAccessAdmin(role);

  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          منطقة إدارية محمية
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          عذراً، هذه اللوحة مخصصة فقط لمديري المنصة والمحررين المعتمدين لمراجعة وتوثيق المحتوى الإسلامي.
        </p>
        <div className="pt-2">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              العودة إلى الملف الشخصي
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { href: "/admin", label: "نظرة عامة وإحصائيات", icon: Activity, exact: true },
    { href: "/admin/scholars", label: "إدارة العلماء", icon: GraduationCap },
    { href: "/admin/lessons", label: "إدارة الدروس", icon: BookOpen },
    { href: "/admin/books", label: "إدارة المكتبة", icon: Library },
    { href: "/admin/hadiths", label: "إدارة الأحاديث", icon: Scroll },
    { href: "/admin/sources", label: "فاحص الروابط والمصادر", icon: Link2 },
    { href: "/admin/audit-logs", label: "سجل العمليات والتدقيق", icon: FileCheck2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Banner */}
      <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>لوحة الإدارة والتوثيق</span>
              <Badge variant="emerald" size="sm">
                {getRoleLabelAr(role)}
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              بوابة مراجعة واعتماد المحتوى الشرعي قبل النشر
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <span>الواجهة الرئيسية</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Admin Content Area */}
        <main className="lg:col-span-3 min-w-0">{children}</main>
      </div>
    </div>
  );
}
