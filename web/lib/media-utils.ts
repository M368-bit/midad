/**
 * أدوات وحسابات مشغلات الوسائط (الصوت والفيديو)
 * MIDAD Media Player Utilities
 */

export const SUPPORTED_PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackRate = (typeof SUPPORTED_PLAYBACK_RATES)[number];

/**
 * تنسيق الثواني إلى صيغة رقمية واضحة (دقيقة:ثانية أو ساعة:دقيقة:ثانية)
 */
export function formatMediaTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * حساب النسبة المئوية للتقدم (0 إلى 100)
 */
export function calculateProgressPercent(currentTime: number, duration: number): number {
  if (!duration || duration <= 0 || isNaN(duration)) return 0;
  if (!currentTime || currentTime <= 0) return 0;
  const percent = (currentTime / duration) * 100;
  return Math.max(0, Math.min(100, percent));
}

/**
 * ضبط مستوى الصوت المحصور بين 0 و 1
 */
export function clampVolume(volume: number): number {
  if (isNaN(volume)) return 1;
  return Math.max(0, Math.min(1, volume));
}

/**
 * التحقق من صحة سرعة التشغيل المختارة
 */
export function isValidPlaybackRate(rate: number): rate is PlaybackRate {
  return (SUPPORTED_PLAYBACK_RATES as readonly number[]).includes(rate);
}
