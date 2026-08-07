import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { APP_CONFIG } from "@/lib/config/app-config";
import { uploadStorageFile } from "@/lib/db/storage";

export async function POST(req: NextRequest) {
  try {
    const forwardHeader = req.headers.get("x-forwarded-for");
    const ip = forwardHeader ? forwardHeader.split(",")[0] : "127.0.0.1";

    const rateCheck = await checkRateLimit(ip, {
      endpoint: "POST /api/upload/photo",
      windowMs: 60_000,
      maxRequests: APP_CONFIG.rateLimits.uploadsPerMinute,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute before uploading again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = (formData.get("userId") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = APP_CONFIG.uploads.maxPhotoSizeBytes;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File exceeds ${Math.round(maxSize / 1024 / 1024)}MB size limit` }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resizedBuffer = await sharp(buffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .toFormat("webp")
      .toBuffer();

    const fileExt = "webp";
    const prefix = userId ? `photos/${userId}/` : "photos/";
    const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    const { publicUrl, error } = await uploadStorageFile("card-media", fileName, resizedBuffer, "image/webp");

    if (error || !publicUrl) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: `Upload failed: ${error?.message || "Unknown error"}` }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err) {
    console.error("API photo upload error:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
