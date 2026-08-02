import { Theme, ThemeCategory, ThemeMood, ExperienceId } from "./types";
import { EXPERIENCE_THEMES } from "./definitions/experiences";
import { INTERACTIVE_THEMES } from "./definitions/interactive";
import { ROMANCE_WEDDING_THEMES } from "./definitions/romance-wedding";
import { BIRTHDAY_ACHIEVEMENT_THEMES } from "./definitions/birthday-achievement";
import { FAMILY_GENERAL_THEMES } from "./definitions/family-general";
import { CULTURAL_MEMORIAL_THEMES } from "./definitions/cultural-memorial";
import { RELIGIOUS_THEMES } from "./definitions/religious";
import { GENERATED_THEMES } from "./definitions/generated";
import { PLAN_THEMES } from "./definitions/plan-themes";

/**
 * De-duplicate themes by id, keeping the first occurrence. Theme ids are used as
 * React keys throughout the gallery; a duplicate id silently crashes rendering
 * ("Encountered two children with the same key"). This guard makes that class of
 * bug impossible no matter what the generated definition files contain.
 */
function uniqueById(themes: Theme[]): Theme[] {
  const seen = new Set<string>();
  const out: Theme[] = [];
  for (const theme of themes) {
    if (seen.has(theme.id)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[themes] Duplicate theme id "${theme.id}" ignored, fix the source definition.`);
      }
      continue;
    }
    seen.add(theme.id);
    out.push(theme);
  }
  return out;
}

export const THEMES: Theme[] = uniqueById([
  // Experience themes lead, each is a unique mini-app, not a style swap.
  ...EXPERIENCE_THEMES,
  ...INTERACTIVE_THEMES,
  ...ROMANCE_WEDDING_THEMES,
  ...BIRTHDAY_ACHIEVEMENT_THEMES,
  ...FAMILY_GENERAL_THEMES,
  ...CULTURAL_MEMORIAL_THEMES,
  ...RELIGIOUS_THEMES,
  ...GENERATED_THEMES,
  ...PLAN_THEMES,
]);

export function getThemeById(id: string): Theme | undefined {
  return THEMES.find((theme) => theme.id === id);
}

/** Themes that render as a dedicated experience mini-app (unique mechanic). */
export function getExperienceThemes(): Theme[] {
  return THEMES.filter((theme) => !!theme.experienceId);
}

/** Whether a theme renders via the experience engine rather than the style renderer. */
export function isExperienceTheme(theme: Theme): theme is Theme & { experienceId: ExperienceId } {
  return !!theme.experienceId;
}

export function getThemesByCategory(category: ThemeCategory): Theme[] {
  return THEMES.filter((theme) => theme.category === category);
}

export function getThemesByCulture(culture: string): Theme[] {
  return THEMES.filter(
    (theme) => theme.culture?.toLowerCase() === culture.toLowerCase()
  );
}

export function getThemesByMood(mood: ThemeMood): Theme[] {
  return THEMES.filter((theme) => theme.mood === mood);
}

export function getFeaturedThemes(): Theme[] {
  // Return themes marked featured, or a set of representative engaging themes
  const featured = THEMES.filter((theme) => theme.isFeatured);
  if (featured.length > 0) return featured;

  // Fallback featured items
  return THEMES.filter(
    (theme) =>
      theme.id === "funny-date-evade-neon" ||
      theme.id === "proposal-rose-garden" ||
      theme.id === "birthday-kid-confetti" ||
      theme.id === "thank-you-elegant" ||
      theme.id === "new-year-countdown" ||
      theme.id === "wedding-day-desi"
  );
}

export function getSeasonalThemes(month: number): Theme[] {
  return THEMES.filter((theme) => {
    if (theme.isSeasonal) return true;

    // Approximate seasonal checks based on theme IDs and metadata
    if (month === 12 && (theme.id.includes("christmas") || theme.id.includes("new-year"))) {
      return true;
    }
    if (month === 10 && theme.id.includes("halloween")) {
      return true;
    }
    if (month === 5 && theme.id.includes("mothers-day")) {
      return true;
    }
    if (month === 2 && (theme.id.includes("rose") || theme.id.includes("love"))) {
      return true;
    }
    return false;
  });
}
