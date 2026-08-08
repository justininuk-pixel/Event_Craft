import { NextRequest, NextResponse } from "next/server";
import { listStorageFiles, deleteStorageFile, sanitizePathSegment } from "@/lib/db/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get("userId");

    if (!rawUserId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // Sanitised so a crafted id can't traverse out of the per-user prefix and enumerate the
    // whole bucket (e.g. userId="..").
    const userId = sanitizePathSegment(rawUserId, "");
    if (!userId) {
      return NextResponse.json({ error: "Invalid userId parameter" }, { status: 400 });
    }

    const { files: photoFiles } = await listStorageFiles("card-media", `photos/${userId}`);
    const { files: voiceFiles } = await listStorageFiles("card-media", `voice/${userId}`);

    const mediaList = [
      ...photoFiles.filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => ({ ...f, type: "photo" })),
      ...voiceFiles.filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => ({ ...f, type: "voice" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(mediaList);
  } catch (err) {
    console.error("API media GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get("userId");
    const name = searchParams.get("name");
    const type = searchParams.get("type"); // photo | voice

    if (!rawUserId || !name || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (type !== "photo" && type !== "voice") {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    const userId = sanitizePathSegment(rawUserId, "");
    if (!userId) {
      return NextResponse.json({ error: "Invalid userId parameter" }, { status: 400 });
    }

    const folder = type === "photo" ? "photos" : "voice";
    const path = `${folder}/${userId}/${name}`;

    const { success, error } = await deleteStorageFile("card-media", path);

    if (error || !success) {
      console.error("Admin delete file storage error:", error);
      return NextResponse.json({ error: `Delete failed: ${error?.message || "Unknown error"}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API media DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
