import { NextResponse } from "next/server";
import { THEMES } from "@/lib/themes/registry";

// Full theme catalog as JSON. Importing the registry here keeps the 1.3MB of theme data in
// the SERVER bundle only, clients fetch it on demand (and cache it) instead of parsing it as
// part of every page's JavaScript. Used by /explore and the editor theme switcher.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(THEMES, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
