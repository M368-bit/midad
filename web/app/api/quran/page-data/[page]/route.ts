import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { QURAN_SURAHS } from "@/lib/data/quran-surahs";

// In-memory cache for page data
let pagesIndexCache: { [key: string]: any } | null = null;

function loadPagesIndex() {
  if (pagesIndexCache) return pagesIndexCache;
  try {
    const indexPath = path.join(process.cwd(), "data", "quran", "pages-index.json");
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, "utf-8");
      pagesIndexCache = JSON.parse(raw);
    }
  } catch (err) {
    console.error("[QuranPageDataAPI] Error loading pages index:", err);
  }
  return pagesIndexCache;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { page: string } }
) {
  const pageNum = parseInt(params.page, 10);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return NextResponse.json({ error: "رقم صفحة غير صالح" }, { status: 400 });
  }

  const allPages = loadPagesIndex();
  const pageData = allPages ? allPages[String(pageNum)] : null;

  if (!pageData) {
    return NextResponse.json({ error: "لم يتم العثور على الصفحة" }, { status: 404 });
  }

  // Enrich surahs metadata
  const enrichedSurahs = (pageData.surahIds || []).map((sId: number) => {
    const meta = QURAN_SURAHS.find((s) => s.number === sId);
    return {
      number: sId,
      name: meta?.name || `سورة ${sId}`,
      revelationType: meta?.revelationType === "Meccan" ? "مكية" : "مدنية",
      numberOfAyahs: meta?.numberOfAyahs || 0,
    };
  });

  return NextResponse.json({
    page: pageNum,
    juz: pageData.juz,
    surahs: enrichedSurahs,
    ayahs: pageData.ayahs || [],
  });
}
