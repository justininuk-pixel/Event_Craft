import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { APP_CONFIG } from "@/lib/config/app-config";
import { parseBuffer } from "music-metadata";
import { uploadStorageFile } from "@/lib/db/storage";

export async function POST(req: NextRequest) {
  try {
    const forwardHeader = req.headers.get("x-forwarded-for");
    const ip = forwardHeader ? forwardHeader.split(",")[0] : "127.0.0.1";

    const rateCheck = await checkRateLimit(ip, {
      endpoint: "POST /api/upload/voice",
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
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const maxSize = APP_CONFIG.uploads.maxVoiceSizeBytes;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Audio file exceeds ${Math.round(maxSize / 1024 / 1024)}MB size limit` }, { status: 400 });
    }

    if (!file.type.startsWith("audio/") && !file.name.endsWith(".webm") && !file.name.endsWith(".mp4") && !file.name.endsWith(".ogg") && !file.name.endsWith(".wav")) {
      return NextResponse.json({ error: "File must be an audio recording" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const metadata = await parseBuffer(buffer, { mimeType: file.type || "audio/webm" });
      const maxDuration = APP_CONFIG.uploads.maxVoiceDurationSec;
      if (metadata.format.duration && metadata.format.duration > maxDuration) {
        return NextResponse.json(
          { error: `Audio file exceeds the ${maxDuration}-second duration limit (actual: ${Math.round(metadata.format.duration)}s)` },
          { status: 400 }
        );
      }
    } catch (parseErr) {
      console.warn("Failed to parse audio metadata duration, proceeding anyway:", parseErr);
    }

    const fileExt = file.name.split(".").pop() || "webm";
    const prefix = userId ? `voice/${userId}/` : "voice/";
    const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    const { publicUrl, error } = await uploadStorageFile("card-media", fileName, buffer, file.type || "audio/webm");

    if (error || !publicUrl) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: `Upload failed: ${error?.message || "Unknown error"}` }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err) {
    console.error("API voice upload error:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
