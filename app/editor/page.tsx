import { redirect } from "next/navigation";
import { getFeaturedThemes, THEMES } from "../../lib/themes/registry";

interface PageProps {
  searchParams: Promise<{ theme?: string }>;
}

export default async function EditorRootPage({ searchParams }: PageProps) {
  const params = await searchParams;
  if (params.theme) {
    redirect(`/editor/${params.theme}`);
  }
  // "Create" should drop the user straight into the editor with a sensible starter theme —
  // they can swap themes from the editor's Themes tab. Falls back to explore only if the
  // registry is somehow empty.
  const starter = getFeaturedThemes()[0] ?? THEMES[0];
  if (starter) {
    redirect(`/editor/${starter.id}`);
  }
  redirect(`/explore`);
}
