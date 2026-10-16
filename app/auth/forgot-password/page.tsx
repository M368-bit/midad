"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await resetPassword(email);
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("حدث خطأ أثناء إرسال رابط الاستعادة. يرجى المحاولة لاحقاً.");
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
            استعادة كلمة المرور
          </h1>
          <p className="text-xs text-slate-500">
            أدخل بريدك الإلكتروني المسجل وسنرسل إليك رابطاً آمناً لإعادة تعيين كلمة المرور
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
              تم إرسال الرابط بنجاح!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              إذا كان هذا البريد مسجلاً في منصة مداد، فستصلك رسالة تحتوي على تعليمات استعادة كلمة المرور في غضون لحظات.
            </p>
            <div className="pt-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  العودة لتسجيل الدخول
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="البريد الإلكتروني"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              <KeyRound className="w-4 h-4" />
              <span>إرسال رابط الاستعادة</span>
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى تسجيل الدخول</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
