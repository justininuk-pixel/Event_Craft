import { redirect } from "next/navigation";
import { getThemeById } from "../../../lib/themes/registry";
import { EditorClient } from "./EditorClient";

// Server component: resolves the theme by id on the server so the theme registry (1.3MB) stays
// out of the client bundle. The interactive editor lives in EditorClient.
export async function generateMetadata({ params }: { params: Promise<{ themeId: string }> }) {
  const { themeId } = await params;
  const theme = themeId ? getThemeById(themeId) : undefined;
  
  if (!theme) return { title: "Editor | CelebrationCraft" };
  return {
    title: `Create ${theme.name} Card | CelebrationCraft`,
    description: `Customize your ${theme.name} celebration card on CelebrationCraft.`,
  };
}
export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ themeId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { themeId } = await params;
  const sp = await searchParams;
  const theme = themeId ? getThemeById(themeId) : undefined;

  if (!theme) {
    redirect("/");
  }

  const isCollabParam = sp?.collab === "true";
  const isDraftParam = sp?.draft === "true";

  return <EditorClient theme={theme} isCollabParam={isCollabParam} isDraftParam={isDraftParam} />;
}
