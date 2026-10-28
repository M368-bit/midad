import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./config";

/**
 * عميل Supabase للواجهة الأمامية (Browser Client)
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    // إرجاع عميل بمفاتيح احتياطية آمنة تمنع انهيار الواجهة في بيئة التطوير المحلية
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
