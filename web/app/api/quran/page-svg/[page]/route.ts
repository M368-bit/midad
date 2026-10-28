import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  const pageNum = parseInt(params.page, 10);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return NextResponse.json({ error: "رقم الصفحة غير صالح (١ - ٦٠٤)" }, { status: 400 });
  }

  const pagePad = String(pageNum).padStart(3, "0");
  const localSvgPath = path.join(process.cwd(), "data", "quran", "svg", `${pagePad}.svg`);

  try {
    // 1. Try local disk cache first (0ms instant response)
    if (fs.existsSync(localSvgPath)) {
      const svgContent = fs.readFileSync(localSvgPath, "utf8");
      return new NextResponse(svgContent, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Fallback to primary CDN (quran.ws)
    const primaryUrl = `https://cdn.quran.ws/svg/pages/v1.1.1/hafs-kfqc/${pagePad}.svg`;
    let res = await fetch(primaryUrl);

    // 3. Fallback to secondary CDN (jsdelivr)
    if (!res.ok) {
      const fallbackUrl = `https://cdn.jsdelivr.net/gh/quran-ws/quran-svg@main/mushafs/hafs/kfqc/svg/${pagePad}.svg`;
      res = await fetch(fallbackUrl);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `تعذر جلب ملف الصفحة المتجهي ${pageNum}` },
        { status: 502 }
      );
    }

    const svgText = await res.text();

    // Cache locally asynchronously
    try {
      const dir = path.dirname(localSvgPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(localSvgPath, svgText, "utf8");
    } catch {
      // ignore write errors in read-only environment
    }

    return new NextResponse(svgText, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحميل صفحة المصحف المتجهية", details: message },
      { status: 500 }
    );
  }
}

export async function generateStaticParams() { return Array.from({ length: 604 }, (_, i) => ({ page: String(i + 1) })); }
