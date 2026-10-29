import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./config";

interface CookieItem {
  name: string;
  value: string;
  options?: any;
}

/**
 * عميل Supabase للبيانات العامة (لا يحتاج إلى ملفات تعريف الارتباط / cookies)
 * آمن تماماً للاستخدام أثناء التوليد الثابت (Static Generation / Build) دون التسبب في خطأ Dynamic Server Usage
 */
export function createPublicSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * عميل Supabase للخادم ومكونات React Server Components مع حماية من استدعاء cookies خارج نطاق الطلب
 */
export async function createServerSupabaseClient() {
  let cookieStore: ReturnType<typeof cookies> | null = null;
  try {
    cookieStore = cookies();
  } catch {
    // تم الاستدعاء خارج نطاق الطلب (مثل وقت الـ Build أو التوليد الثابت)
    cookieStore = null;
  }

  const url = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : "https://placeholder-project.supabase.co";
  const anonKey = isSupabaseConfigured()
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    : "placeholder-anon-key";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet: CookieItem[]) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore!.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
        }
      },
    },
  });
}
