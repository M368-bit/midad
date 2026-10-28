import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { page: string } }
) {
  const pageNum = parseInt(params.page, 10);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return new NextResponse("رقم صفحة غير صالح", { status: 400 });
  }

  const localFile = path.join(
    process.cwd(),
    "data",
    "quran",
    "pages",
    `page-${pageNum}.png`
  );

  // 1. Return from disk if available
  if (fs.existsSync(localFile)) {
    try {
      const buffer = fs.readFileSync(localFile);
      return new Response(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (e) {
      console.warn(`[QuranPageAPI] Error reading page ${pageNum}:`, e);
    }
  }

  // 2. Fetch from high-res CDN if not on disk yet
  try {
    const pageStr = String(pageNum).padStart(3, "0");
    const remoteUrl = `https://android.quran.com/data/width_1260/page${pageStr}.png`;
    const res = await fetch(remoteUrl, { next: { revalidate: 31536000 } });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save to disk asynchronously for future instant requests
      try {
        fs.writeFileSync(localFile, buffer);
      } catch (writeErr) {
        // ignore write error
      }

      return new Response(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (err) {
    console.error(`[QuranPageAPI] Error fetching remote page ${pageNum}:`, err);
  }

  return new NextResponse("تعذر تحميل صفحة المصحف", { status: 502 });
}
