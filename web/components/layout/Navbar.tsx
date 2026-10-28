"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  BookMarked,
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Compass },
    { href: "/quran", label: "المصحف الشريف", icon: BookMarked },
    { href: "/hadith", label: "الحديث الشريف", icon: Scroll },
    { href: "/books", label: "المكتبة الإسلامية", icon: Library },
    { href: "/lessons", label: "الدروس والمحاضرات", icon: BookOpen },
    { href: "/scholars", label: "العلماء والدعاة", icon: GraduationCap },
    { href: "/search", label: "البحث", icon: Search },
  ];

  const hasAdminAccess = canAccessAdmin(profile?.role_id);

  return (
    <header
      className={`sticky top-3 z-50 w-full px-3 sm:px-6 lg:px-8 mb-2 sm:mb-4 transition-all duration-300`}
    >
      {/* Main Navbar Bar */}
      <div
        className={`max-w-7xl mx-auto glass-elevated rounded-2xl px-3 sm:px-5 border transition-all duration-300 ${
          scrolled
            ? "border-white/20 dark:border-white/12 shadow-glass dark:shadow-glass-dark"
            : "border-slate-200/70 dark:border-white/08 shadow-glass-sm"
        }`}
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl p-1 transition-all"
          >
            {/* Logo Icon with glass treatment */}
            <div className="relative w-9 h-9 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="relative flex items-center justify-center w-full h-full">
                <span className="font-traditional font-bold text-lg text-white select-none drop-shadow-sm">
                  م
                </span>
              </div>
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="font-bold text-[17px] tracking-tight text-slate-900 dark:text-white leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                مِــدَاد
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-[0.2em] uppercase opacity-80">
                MIDAD
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
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
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  {/* Active/hover background */}
                  <span
                    className={`absolute inset-0 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "glass-sm"
                        : "opacity-0 group-hover:opacity-100 bg-slate-100/70 dark:bg-white/05"
                    }`}
                  />
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse-glow" />
                  )}
                  <Icon className="relative w-4 h-4 opacity-80" />
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            {/* Favorites */}
            <Link
              href="/favorites"
              aria-label="المفضلة"
              title="المفضلة"
              className={`p-2 rounded-xl transition-all duration-200 ${
                pathname === "/favorites"
                  ? "text-emerald-600 dark:text-emerald-400 glass-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-white/05"
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </Link>

            {/* Admin */}
            {hasAdminAccess && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-emerald text-emerald-700 dark:text-emerald-300 transition-all hover:scale-105"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>الإدارة</span>
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  pathname === "/profile"
                    ? "glass-emerald text-emerald-700 dark:text-emerald-300"
                    : "glass-sm text-slate-700 dark:text-slate-200 hover:border-emerald-400/40"
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
                className="btn-glass-emerald text-sm px-3.5 py-1.5 hover:scale-105 transition-all"
              >
                <span>دخول</span>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl glass-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none transition-all"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 glass-elevated rounded-2xl px-4 pt-4 pb-6 space-y-1 anim-slide-down border border-white/20 dark:border-white/10 shadow-glass dark:shadow-glass-dark">
          {navLinks.map((link, i) => {
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
                style={{ animationDelay: `${i * 40}ms` }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all anim-fade-up ${
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 glass-emerald"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/05"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium glass-emerald text-emerald-700 dark:text-emerald-300 transition-all animate-fade-up"
            >
              <Shield className="w-5 h-5" />
              <span>لوحة الإدارة والتحقق</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200/60 dark:border-white/08 flex justify-between items-center px-1 animate-fade-up delay-300">
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>المفضلة</span>
            </Link>
            <Link
              href="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              سجل المشاهدة
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              عن المنصة
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
