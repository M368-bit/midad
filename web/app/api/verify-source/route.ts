import { NextResponse } from "next/server";
import { verifySourceUrl, isTrustedIslamicDomain } from "@/lib/services/source-verifier";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "الرابط مطلوب ويجب أن يكون نصاً صالحاً" },
        { status: 400 }
      );
    }

    const verificationResult = await verifySourceUrl(url);
    const isTrusted = isTrustedIslamicDomain(url);

    return NextResponse.json({
      ...verificationResult,
      isTrustedDomain: isTrusted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "فشل التحقق من الرابط" },
      { status: 500 }
    );
  }
}
