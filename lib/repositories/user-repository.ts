import { Favorite, UserHistoryItem, ContentType } from "@/types";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/client";

const LOCAL_FAVORITES_KEY = "midad_favorites_local";
const LOCAL_HISTORY_KEY = "midad_history_local";

/**
 * جلب مفضلة المستخدم
 */
export async function getUserFavorites(userId?: string): Promise<Favorite[]> {
  if (typeof window === "undefined") return [];

  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) return data as Favorite[];
    } catch (e) {
      console.warn("[UserRepository] Supabase fetch error, fallback to local storage", e);
    }
  }

  // Fallback to browser local storage
  try {
    const raw = localStorage.getItem(LOCAL_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * تبديل حالة المفضلة (إضافة / حذف)
 */
export async function toggleFavorite(
  contentType: ContentType,
  contentId: string,
  meta?: { title?: string; subtitle?: string; url?: string },
  userId?: string
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const currentFavorites = await getUserFavorites(userId);
  const existsIndex = currentFavorites.findIndex(
    (f) => f.content_type === contentType && f.content_id === contentId
  );

  const isAdding = existsIndex === -1;

  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = createClient();
      if (isAdding) {
        await supabase.from("favorites").insert({
          user_id: userId,
          content_type: contentType,
          content_id: contentId,
        });
      } else {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("content_type", contentType)
          .eq("content_id", contentId);
      }
    } catch (e) {
      console.warn("[UserRepository] Supabase toggle favorite error", e);
    }
  }

  // Update local storage
  let updated: Favorite[];
  if (isAdding) {
    const newFav: Favorite = {
      id: `fav-${Date.now()}`,
      user_id: userId || "local-user",
      content_type: contentType,
      content_id: contentId,
      created_at: new Date().toISOString(),
      title: meta?.title,
      subtitle: meta?.subtitle,
      url: meta?.url,
    };
    updated = [newFav, ...currentFavorites];
  } else {
    updated = currentFavorites.filter((_, idx) => idx !== existsIndex);
  }

  try {
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updated));
  } catch {}

  return isAdding;
}

/**
 * فحص ما إذا كان العنصر في المفضلة
 */
export async function isItemFavorited(
  contentType: ContentType,
  contentId: string,
  userId?: string
): Promise<boolean> {
  const favorites = await getUserFavorites(userId);
  return favorites.some(
    (f) => f.content_type === contentType && f.content_id === contentId
  );
}

/**
 * تسجيل عنصر في سجل النشاط والتصفح
 */
export async function recordHistoryItem(
  item: {
    contentType: ContentType;
    contentId: string;
    title: string;
    url?: string;
    progressSeconds?: number;
  },
  userId?: string
): Promise<void> {
  if (typeof window === "undefined") return;

  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = createClient();
      await supabase.from("user_history").upsert({
        user_id: userId,
        content_type: item.contentType,
        content_id: item.contentId,
        title: item.title,
        progress_seconds: item.progressSeconds || 0,
        last_viewed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("[UserRepository] Supabase history write error", e);
    }
  }

  // Local storage history
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    const history: UserHistoryItem[] = raw ? JSON.parse(raw) : [];

    const existingIdx = history.findIndex(
      (h) =>
        h.content_type === item.contentType && h.content_id === item.contentId
    );

    const newItem: UserHistoryItem = {
      id: `hist-${Date.now()}`,
      user_id: userId || "local-user",
      content_type: item.contentType,
      content_id: item.contentId,
      title: item.title,
      url: item.url,
      progress_seconds: item.progressSeconds || 0,
      last_viewed_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      history.splice(existingIdx, 1);
    }

    const updated = [newItem, ...history].slice(0, 50); // الاحتفاظ بآخر 50 عنصراً
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * جلب سجل نشاط المستخدم
 */
export async function getUserHistory(userId?: string): Promise<UserHistoryItem[]> {
  if (typeof window === "undefined") return [];

  if (isSupabaseConfigured() && userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_history")
        .select("*")
        .order("last_viewed_at", { ascending: false });

      if (!error && data) return data as UserHistoryItem[];
    } catch (e) {
      console.warn("[UserRepository] Supabase history fetch error", e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
