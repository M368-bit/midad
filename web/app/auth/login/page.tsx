"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/profile");
      }
    } catch {
      setError("حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-traditional font-bold text-xl mx-auto shadow-md">
            م
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            تسجيل الدخول إلى مِــدَاد
          </h1>
          <p className="text-xs text-slate-500">
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى مفضلتك وسجل تصفحك
          </p>
        </div>

        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">وضع التجربة والتطوير المحلي (قاعدة البيانات السحابية غير متصلة)</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  يمكنك الدخول بأي بريد، أو تجربة أحد الحسابين أدناه لاختبار الصلاحيات:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@midad.org");
                  setPassword("admin123");
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800 transition-colors"
              >
                تعبئة بيانات المدير (admin@midad.org)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("user@midad.org");
                  setPassword("user123");
                }}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 border border-slate-300 dark:border-slate-600 transition-colors"
              >
                تعبئة بيانات مستخدم عادي (user@midad.org)
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <div className="space-y-1">
            <Input
              label="كلمة المرور"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="text-left">
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          ليس لديك حساب بعد؟{" "}
          <Link
            href="/auth/register"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </Card>
    </div>
  );
}
