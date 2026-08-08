import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { APP_CONFIG } from "@/lib/config/app-config";
import { uploadStorageFile, sanitizePathSegment } from "@/lib/db/storage";
import { getClientIp } from "@/lib/utils/request";
import { randomUUID } from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(getClientIp(req), {
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
    const fileEntry = formData.get("file");
    const userId = (formData.get("userId") as string) || "";

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const file = fileEntry;

    const maxSize = APP_CONFIG.uploads.maxPhotoSizeBytes;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File exceeds ${Math.round(maxSize / 1024 / 1024)}MB size limit` }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // sharp is what actually decides this is an image, the client-supplied MIME type above is
    // only a cheap pre-filter. Re-encoding to webp also strips EXIF (including GPS location)
    // and neutralises any polyglot/SVG payload.
    let resizedBuffer: Buffer;
    try {
      resizedBuffer = await sharp(buffer, { animated: false })
        .rotate() // honour EXIF orientation before the metadata is dropped
        .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
        .toFormat("webp")
        .toBuffer();
    } catch {
      return NextResponse.json({ error: "File is not a valid image" }, { status: 400 });
    }

    // userId is a form field, so it must be sanitised before it becomes a path segment,
    // otherwise "../.." escapes the photos/ prefix.
    const safeUserId = sanitizePathSegment(userId, "anonymous");
    const fileName = `photos/${safeUserId}/${Date.now()}-${randomUUID()}.webp`;

    const { publicUrl, error } = await uploadStorageFile("card-media", fileName, resizedBuffer, "image/webp");

    if (error || !publicUrl) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err) {
    console.error("API photo upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
