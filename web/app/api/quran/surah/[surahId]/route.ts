import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSurahByNumber } from "@/lib/data/quran-surahs";
import { getAyahAudioUrl } from "@/lib/services/quran-service";
import { removeTashkeel } from "@/lib/arabic-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { surahId: string } }
) {
  const surahNum = parseInt(params.surahId, 10);
  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    return NextResponse.json({ error: "رقم السورة غير صالح (١ - ١١٤)" }, { status: 400 });
  }

  const reciter = request.nextUrl.searchParams.get("reciter") || "husary";
  const meta = getSurahByNumber(surahNum);
  if (!meta) {
    return NextResponse.json({ error: "السورة غير موجودة" }, { status: 404 });
  }

  const localFile = path.join(process.cwd(), "data", "quran", `surah-${surahNum}.json`);

  try {
    if (fs.existsSync(localFile)) {
      const raw = fs.readFileSync(localFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.ayahs)) {
        const ayahs = parsed.ayahs.map((a: any) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: a.text,
          cleanText: a.cleanText || removeTashkeel(a.text),
          page: a.page,
          juz: a.juz,
          tafsir: a.tafsir,
          tafsirSaadi: a.tafsirSaadi,
          audioUrl: getAyahAudioUrl(reciter, surahNum, a.numberInSurah),
        }));

        return NextResponse.json({
          meta,
          bismillahPre: surahNum !== 1 && surahNum !== 9,
          ayahs,
        }, {
          headers: {
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    return NextResponse.json({ error: "ملف السورة غير متوفر محلياً" }, { status: 404 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
    return NextResponse.json({ error: "فشل تحميل بيانات السورة", details: msg }, { status: 500 });
  }
}
