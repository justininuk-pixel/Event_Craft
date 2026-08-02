import { NextResponse } from "next/server";
import { THEMES } from "@/lib/themes/registry";

// Lightweight theme metadata (no visual/audio/delivery config). Used by surfaces that only need
// names, categories and search tags — the command palette, project/collab labels, event picker —
// so they don't pull the full catalog into the client.
export const dynamic = "force-static";

export interface ThemeSummary {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  subcategory: string;
  mood: string;
  culture?: string;
  tags: string[];
  experienceId?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export async function GET() {
  const summaries: ThemeSummary[] = THEMES.map((t) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    description: t.description,
    category: t.category,
    subcategory: t.subcategory,
    mood: t.mood,
    culture: t.culture,
    tags: t.tags,
    experienceId: t.experienceId,
    isNew: t.isNew,
    isFeatured: t.isFeatured,
  }));
  return NextResponse.json(summaries, {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
