import { NextRequest, NextResponse } from "next/server";
import { parseElectricityBillWithAI } from "@/lib/gemini-ocr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing bill image data" }, { status: 400 });
    }

    const supportedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (typeof imageBase64 !== "string" || typeof mimeType !== "string" || !supportedTypes.includes(mimeType)) {
      return NextResponse.json({ error: "Upload a JPG, PNG, WebP or PDF bill." }, { status: 400 });
    }
    if (imageBase64.length > 14_000_000) {
      return NextResponse.json({ error: "Bill file is too large. Choose a file under 10 MB." }, { status: 413 });
    }

    const extraction = await parseElectricityBillWithAI(imageBase64, mimeType || "image/jpeg");

    return NextResponse.json({
      success: true,
      extraction,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process bill image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
