import { NextRequest, NextResponse } from "next/server";
import { aiSearch } from "@/lib/ai-search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";

  if (!q || q.trim().length < 2) {
    return NextResponse.json({
      results: [],
      topSuggestion: null,
      totalFound: 0,
      processingTimeMs: 0,
    });
  }

  try {
    const result = await aiSearch(q.trim());
    return NextResponse.json(result);
  } catch (err) {
    console.error("[AI Search] Error:", err);
    return NextResponse.json(
      { error: "حدث خطأ في محرك البحث الذكي" },
      { status: 500 }
    );
  }
}
