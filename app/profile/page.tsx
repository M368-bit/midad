"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Bookmark,
  History,
  LogOut,
  Sparkles,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getRoleLabelAr, canAccessAdmin } from "@/lib/auth/rbac";
import { UserRole } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut, setDevRole, isConfigured } = useAuth();

  if (!user && !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          لم تسجل دخولك بعد
        </h2>
        <p className="text-xs text-slate-500">
          سجل دخولك أو أنشئ حساباً جديداً للوصول إلى ملفك الشخصي ومفضلتك
        </p>
        <Link href="/auth/login">
          <Button variant="primary" size="md">
            تسجيل الدخول
          </Button>
        </Link>
      </div>
    );
  }

  const role = profile?.role_id || "viewer";
  const hasAdmin = canAccessAdmin(role);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {profile?.full_name?.charAt(0) || "م"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.full_name || "مستخدم مداد"}
                </h1>
                <Badge variant={role === "admin" ? "emerald" : "slate"}>
                  {getRoleLabelAr(role)}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || profile?.email}</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>

        {/* Dev Mode Role Switcher (Visible when testing locally or for demonstration) */}
        {!isConfigured && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>أداة تبديل الأدوار والصلاحيات (بيئة العرض والتطوير)</span>
            </div>
            <p className="text-xs text-slate-500">
              يمكنك تجربة المنصة بمختلف الصلاحيات (مدير المنصة، محرر موثق، مستخدم عادي):
            </p>
            <div className="flex flex-wrap gap-2">
              {(["admin", "editor", "viewer"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDevRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    role === r
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                  }`}
                >
                  {getRoleLabelAr(r)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Nav Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/favorites"
            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-500/40 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                المفضلة
              </h3>
              <p className="text-xs text-slate-500">الأحاديث والكتب المحفوظة</p>
            </div>
          </Link>

          <Link
            href="/history"
            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-500/40 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                سجل النشاط
              </h3>
              <p className="text-xs text-slate-500">المحتوى الذي تصفحته مؤخراً</p>
            </div>
          </Link>

          {hasAdmin && (
            <Link
              href="/admin"
              className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 hover:border-emerald-500 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  لوحة الإدارة
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  إدارة المحتوى والتحقق
                </p>
              </div>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
