import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { APP_CONFIG } from "@/lib/config/app-config";
import { parseBuffer } from "music-metadata";
import { uploadStorageFile, sanitizePathSegment } from "@/lib/db/storage";
import { getClientIp } from "@/lib/utils/request";
import { randomUUID } from "node:crypto";

// Only these audio containers may be stored, keyed to the extension we will write. Deriving
// the extension from the uploaded filename let a caller store e.g. ".html", which the public
// storage bucket would then serve back as an HTML document (stored XSS on the bucket origin).
const ALLOWED_AUDIO: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
};

export async function POST(req: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(getClientIp(req), {
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
    const fileEntry = formData.get("file");
    const userId = (formData.get("userId") as string) || "";

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }
    const file = fileEntry;

    const maxSize = APP_CONFIG.uploads.maxVoiceSizeBytes;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Audio file exceeds ${Math.round(maxSize / 1024 / 1024)}MB size limit` }, { status: 400 });
    }

    const declaredType = (file.type || "").toLowerCase().split(";")[0].trim();
    const fileExt = ALLOWED_AUDIO[declaredType];
    if (!fileExt) {
      return NextResponse.json(
        { error: "Unsupported audio format. Use webm, ogg, mp3, m4a, aac or wav." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the container to confirm it really is audio and to enforce the duration cap.
    // A file that can't be parsed at all is rejected rather than waved through, otherwise the
    // duration limit (and the audio-ness check) is optional from the client's point of view.
    const maxDuration = APP_CONFIG.uploads.maxVoiceDurationSec;
    try {
      const metadata = await parseBuffer(buffer, { mimeType: declaredType });
      const duration = metadata.format.duration;
      if (duration !== undefined && duration > maxDuration) {
        return NextResponse.json(
          { error: `Audio file exceeds the ${maxDuration}-second duration limit (actual: ${Math.round(duration)}s)` },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: "File is not a readable audio recording" }, { status: 400 });
    }

    const safeUserId = sanitizePathSegment(userId, "anonymous");
    const fileName = `voice/${safeUserId}/${Date.now()}-${randomUUID()}.${fileExt}`;

    const { publicUrl, error } = await uploadStorageFile("card-media", fileName, buffer, declaredType);

    if (error || !publicUrl) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err) {
    console.error("API voice upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
