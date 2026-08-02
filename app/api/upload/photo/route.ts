import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { APP_CONFIG } from "@/lib/config/app-config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const userId = formData.get("userId") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validation: max size
    const maxSize = APP_CONFIG.uploads.maxPhotoSizeBytes;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File exceeds ${Math.round(maxSize / 1024 / 1024)}MB size limit` }, { status: 400 });
    }

    // Validation: image mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize image using sharp
    const resizedBuffer = await sharp(buffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .toFormat("webp")
      .toBuffer();

    const fileExt = "webp";
    const prefix = userId ? `photos/${userId}/` : "photos/";
    const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    // Ensure bucket exists
    const { data: buckets, error: getBucketsErr } = await supabaseAdmin.storage.listBuckets();
    if (getBucketsErr) {
      console.warn("Failed to list buckets:", getBucketsErr);
    } else if (buckets && !buckets.some(b => b.id === "card-media")) {
      const { error: createBucketErr } = await supabaseAdmin.storage.createBucket("card-media", {
        public: true,
      });
      if (createBucketErr) {
        console.error("Failed to create bucket 'card-media':", createBucketErr);
      }
    }

    // Upload to Supabase Storage bucket 'card-media'
    const { error } = await supabaseAdmin.storage
      .from("card-media")
      .upload(fileName, resizedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    // Get Public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("card-media")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 201 });
  } catch (err) {
    console.error("API photo upload error:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
