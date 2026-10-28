"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Library,
  Scroll,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Database,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminOverviewPage() {
  const { isConfigured, profile } = useAuth();

  const metrics = [
    { label: "الأحاديث المحققة", value: "3+", icon: Scroll, href: "/admin/hadiths" },
    { label: "العلماء المسجلون", value: "4", icon: GraduationCap, href: "/admin/scholars" },
    { label: "الدروس الصوتية", value: "3", icon: BookOpen, href: "/admin/lessons" },
    { label: "أمهات الكتب", value: "3", icon: Library, href: "/admin/books" },
    { label: "مركز الذكاء الاصطناعي", value: "AI", icon: Zap, href: "/admin/ai-tasks" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Status */}
      <Card className="p-6 bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-[#08111e] border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              مرحباً، {profile?.full_name || "المشرف المعتمد"}
            </h2>
            <p className="text-xs text-slate-500">
              لوحة التحكم المركزية لمراجعة واعتماد المحتوى الإسلامي والتحقق من مصادره
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isConfigured ? "emerald" : "amber"}>
              <Database className="w-3.5 h-3.5 ml-1" />
              {isConfigured ? "قاعدة بيانات Supabase متصلة" : "البيئة الموثقة المحلية"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.label} href={m.href}>
              <Card hoverEffect className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <ArrowLeft className="w-3.5 h-3.5 opacity-60" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {m.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Workflow & Verification Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Rules */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>ضوابط وسياسة النشر في مداد</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>لا يُنشر أي حديث دون ذكر مخرجه وصحته ورقم الحديث في المصدر.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>فحص روابط الدروس الصوتية عبر أداة التحقق للتأكد من استجابتها برمز HTTP 200.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>الكتب المنشورة تقتصر على النطاق العام (Public Domain) أو الأوقاف المصرح بنشرها.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>حفظ سجل تدقيق (Audit Log) آلي لكل عملية إضافة أو تعديل أو تغيير حالة.</span>
            </li>
          </ul>
        </Card>

        {/* Database Connection Instructions */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>حالة تكامل Supabase PostgreSQL</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isConfigured
              ? "الاتصال نشط مع سوبابيز. تعمل سياسات الأمان RLS والصلاحيات الخادمية تلقائياً لحماية بيانات المحتوى والمستخدمين."
              : "لم يتم تزويد بيانات اعتماد Supabase في .env.local بعد. المنصة تعمل حالياً في وضع الحماية والتطوير المحلي مع طبقة البيانات الموثقة تلقائياً."}
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-600 dark:text-slate-400">
            supabase/migrations/20260101000000_midad_initial_schema.sql
          </div>
          <p className="text-[11px] text-slate-500">
            ملف الهجرة الكامل جاهز للتطبيق في لوحة Supabase SQL Editor.
          </p>
        </Card>
      </div>
    </div>
  );
}
