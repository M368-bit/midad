import { NextResponse } from "next/server";
import { fetchVerifiedHadith } from "@/lib/services/hadith-api";
import { getHadithById, getHadiths } from "@/lib/repositories/content-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const numberParam = searchParams.get("number");
  const collection = (searchParams.get("collection") as "ara-bukhari" | "ara-muslim") || "ara-bukhari";
  const query = searchParams.get("q") || "";

  if (numberParam) {
    const num = parseInt(numberParam, 10);
    if (!isNaN(num) && num > 0) {
      // 1. Try local verified store
      const local = await getHadithById(String(num));
      if (local) {
        return NextResponse.json(local);
      }
      // 2. Fetch from verified open API
      const remote = await fetchVerifiedHadith(collection, num);
      if (remote) {
        return NextResponse.json(remote);
      }
    }
  }

  const all = await getHadiths({ query });
  return NextResponse.json({ hadiths: all, count: all.length });
}
