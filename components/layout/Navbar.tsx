"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  Bookmark,
  User,
  Shield,
  Menu,
  X,
  Compass,
  GraduationCap,
  Library,
  Scroll,
} from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useAuth } from "../auth/AuthProvider";
import { canAccessAdmin } from "@/lib/auth/rbac";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Compass },
    { href: "/scholars", label: "العلماء والدعاة", icon: GraduationCap },
    { href: "/lessons", label: "الدروس والمحاضرات", icon: BookOpen },
    { href: "/books", label: "المكتبة الإسلامية", icon: Library },
    { href: "/hadith", label: "الحديث الشريف", icon: Scroll },
    { href: "/search", label: "البحث", icon: Search },
  ];

  const hasAdminAccess = canAccessAdmin(profile?.role_id);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-midad-dark-bg/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                <span className="font-traditional font-bold text-lg select-none">م</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  مِــدَاد
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium -mt-1 tracking-wider">
                  MIDAD
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Tools & Auth */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Favorites link */}
            <Link
              href="/favorites"
              aria-label="المفضلة"
              title="المفضلة"
              className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                pathname === "/favorites"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : ""
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </Link>

            {/* Admin Dashboard shortcut for admins/editors */}
            {hasAdminAccess && (
              <Link
                href="/admin"
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>لوحة الإدارة</span>
              </Link>
            )}

            {/* Profile or Login */}
            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors ${
                  pathname === "/profile"
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                    : ""
                }`}
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {profile?.full_name?.split(" ")[0] || "حسابي"}
                </span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}

            {/* Mobile menu trigger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1 animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {hasAdminAccess && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
            >
              <Shield className="w-5 h-5" />
              <span>لوحة الإدارة والتحقق</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center px-1">
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600"
            >
              المفضلة المحفوظة
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600"
            >
              سجل المشاهدة
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600"
            >
              عن المنصة
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
