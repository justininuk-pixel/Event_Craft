import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/utils/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const mediaList: any[] = [];

    // 1. List photo files from photos/<userId>/
    const { data: photoFiles, error: photoErr } = await supabaseAdmin.storage
      .from("card-media")
      .list(`photos/${userId}`, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (photoErr && photoErr.message !== "The resource was not found") {
      console.warn("Error listing photos from admin:", photoErr);
    } else if (photoFiles) {
      photoFiles.forEach((file) => {
        if (file.name !== ".emptyFolderPlaceholder") {
          const { data: urlData } = supabaseAdmin.storage
            .from("card-media")
            .getPublicUrl(`photos/${userId}/${file.name}`);
          mediaList.push({
            name: file.name,
            url: urlData.publicUrl,
            type: "photo",
            created_at: file.created_at || new Date().toISOString(),
          });
        }
      });
    }

    // 2. List voice files from voice/<userId>/
    const { data: voiceFiles, error: voiceErr } = await supabaseAdmin.storage
      .from("card-media")
      .list(`voice/${userId}`, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (voiceErr && voiceErr.message !== "The resource was not found") {
      console.warn("Error listing voice from admin:", voiceErr);
    } else if (voiceFiles) {
      voiceFiles.forEach((file) => {
        if (file.name !== ".emptyFolderPlaceholder") {
          const { data: urlData } = supabaseAdmin.storage
            .from("card-media")
            .getPublicUrl(`voice/${userId}/${file.name}`);
          mediaList.push({
            name: file.name,
            url: urlData.publicUrl,
            type: "voice",
            created_at: file.created_at || new Date().toISOString(),
          });
        }
      });
    }

    // Sort by created_at descending
    mediaList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(mediaList);
  } catch (err) {
    console.error("API media GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");
    const type = searchParams.get("type"); // photo | voice

    if (!userId || !name || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Path traversal protection
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const folder = type === "photo" ? "photos" : "voice";
    const path = `${folder}/${userId}/${name}`;

    const { error } = await supabaseAdmin.storage
      .from("card-media")
      .remove([path]);

    if (error) {
      console.error("Admin delete file storage error:", error);
      return NextResponse.json({ error: `Delete failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API media DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
