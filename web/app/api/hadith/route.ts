import { NextResponse } from "next/server";
import { fetchVerifiedHadith } from "@/lib/services/hadith-api";
import { getHadithById, getHadiths } from "@/lib/repositories/content-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const numberParam = searchParams.get("number");
  const rawCollection = searchParams.get("collection");
  const collection = (rawCollection as "ara-bukhari" | "ara-muslim") || "ara-bukhari";
  const query = searchParams.get("q") || "";
  const typeParam = searchParams.get("type");
  const type = typeParam === "qudsi" || typeParam === "prophetic" ? typeParam : undefined;
  
  let collectionId = searchParams.get("collectionId") || undefined;
  if (!collectionId && rawCollection) {
    if (rawCollection === "ara-muslim" || rawCollection === "coll-muslim" || rawCollection === "muslim") {
      collectionId = "coll-muslim";
    } else if (rawCollection === "ara-bukhari" || rawCollection === "coll-bukhari" || rawCollection === "bukhari") {
      collectionId = "coll-bukhari";
    }
  }

  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

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

  const all = await getHadiths({
    query,
    collectionId,
    type,
    limit,
    offset,
  });

  return NextResponse.json({ hadiths: all, count: all.length, total: all.length });
}

