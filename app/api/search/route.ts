import { NextResponse } from "next/server";
import { searchMidad } from "@/lib/repositories/content-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  const results = await searchMidad(q);
  return NextResponse.json(results);
}
