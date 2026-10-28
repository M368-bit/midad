"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError("كلمة المرور يجب أن لا تقل عن 6 أحرف.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await signUp(email, password, fullName);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      }
    } catch {
      setError("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة لاحقاً.");
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
            إنشاء حساب جديد
          </h1>
          <p className="text-xs text-slate-500">
            انضم إلى منصة مداد لحفظ المفضلة ومتابعة الأحاديث والدروس المسندة
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>تم إنشاء الحساب بنجاح! جاري تحويلك...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: عبد الله بن أحمد"
          />

          <Input
            label="البريد الإلكتروني"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <Input
            label="كلمة المرور"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            helperText="6 أحرف على الأقل"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            <UserPlus className="w-4 h-4" />
            <span>تسجيل حساب جديد</span>
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/auth/login"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            تسجيل الدخول
          </Link>
        </div>
      </Card>
    </div>
  );
}
