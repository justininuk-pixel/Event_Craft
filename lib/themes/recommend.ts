// Server-side recommendation engine. Pure functions: given the full theme catalog and a
// user's interaction history, produce Netflix-style rows. No React, no client bundle impact —
// this runs inside the /api/themes/recommend route handler.
import { Theme } from "./types";

export interface ThemeRow {
  id: string;
  title: string;
  subtitle?: string;
  themes: Theme[];
  viewAllHref?: string;
}

export interface UserInteractions {
  likes: string[]; // theme ids the user liked (taste signal)
  bookmarks: string[]; // theme ids saved for later
  views: string[]; // recently viewed/opened theme ids
}

export const EMPTY_INTERACTIONS: UserInteractions = { likes: [], bookmarks: [], views: [] };

const ROW_SIZE = 12;

function isExperience(t: Theme): boolean {
  return !!t.experienceId;
}

/** Tally how strongly the user leans toward each category / mood from their signals. */
function buildAffinity(themesById: Map<string, Theme>, ix: UserInteractions) {
  const category = new Map<string, number>();
  const mood = new Map<string, number>();
  const weighted: Array<[string, number]> = [
    ...ix.likes.map((id) => [id, 3] as [string, number]),
    ...ix.bookmarks.map((id) => [id, 2] as [string, number]),
    ...ix.views.map((id) => [id, 1] as [string, number]),
  ];
  for (const [id, w] of weighted) {
    const t = themesById.get(id);
    if (!t) continue;
    category.set(t.category, (category.get(t.category) ?? 0) + w);
    mood.set(t.mood, (mood.get(t.mood) ?? 0) + w);
  }
  return { category, mood };
}

function topKey(map: Map<string, number>): string | undefined {
  let best: string | undefined;
  let bestVal = -Infinity;
  for (const [k, v] of map) {
    if (v > bestVal) {
      bestVal = v;
      best = k;
    }
  }
  return best;
}

/** Deterministic-ish hash so we can predictably shuffle arrays if needed */
function seededScore(id: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h ^ id.charCodeAt(i), 0x01000193) >>> 0);
  return (h % 1000) / 1000;
}

/** Randomize an array slightly by adjusting scores with a random factor */
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function scoreTheme(t: Theme, affinity: ReturnType<typeof buildAffinity>, seenIds: Set<string>): number {
  let score = 0;
  score += (affinity.category.get(t.category) ?? 0) * 4;
  score += (affinity.mood.get(t.mood) ?? 0) * 2;
  if (isExperience(t)) score += 3; // experiences are the product's identity
  if (t.isFeatured) score += 2;
  if (t.isNew) score += 1.5;
  if (seenIds.has(t.id)) score -= 6; // de-prioritize things they've already engaged with
  return score;
}

function take(list: Theme[], n: number, used: Set<string>): Theme[] {
  const out: Theme[] = [];
  for (const t of list) {
    if (out.length >= n) break;
    if (used.has(t.id)) continue;
    out.push(t);
    used.add(t.id);
  }
  return out;
}

/**
 * Build the home rows. Always returns engaging rows even for a brand-new user
 * (no interactions) so the home never looks empty.
 */
export function buildThemeRows(allThemes: Theme[], ix: UserInteractions, upcomingEvents: any[] = []): ThemeRow[] {
  const themesById = new Map(allThemes.map((t) => [t.id, t]));
  const affinity = buildAffinity(themesById, ix);
  const seenIds = new Set([...ix.likes, ...ix.bookmarks, ...ix.views]);
  const hasSignal = seenIds.size > 0;

  const experiences = allThemes.filter(isExperience);
  const ranked = [...allThemes].sort(
    (a, b) => scoreTheme(b, affinity, seenIds) - scoreTheme(a, affinity, seenIds)
  );
  const rankedExperiences = [...experiences].sort(
    (a, b) => scoreTheme(b, affinity, seenIds) - scoreTheme(a, affinity, seenIds)
  );

  const used = new Set<string>();
  const rows: ThemeRow[] = [];

  // 1. Recommended for you (personalized when we have signal, else top experiences)
  rows.push({
    id: "for-you",
    title: hasSignal ? "Recommended for you" : "Unique experiences to try",
    subtitle: hasSignal
      ? "Tuned to what you’ve liked and saved"
      : "Mini-apps with a real mechanic — not just fonts and colours",
    themes: take(shuffle(rankedExperiences.slice(0, ROW_SIZE * 2)), ROW_SIZE, used),
    viewAllHref: "/explore?kind=experiences",
  });

  // 1.5. Event-Specific Row (if they have an upcoming event)
  if (upcomingEvents && upcomingEvents.length > 0) {
    // take the most imminent event
    const upcoming = upcomingEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())[0];
    const eventCategory = upcoming.event_type?.toLowerCase(); // 'birthday', 'wedding', etc
    if (eventCategory) {
      const eventThemes = ranked.filter(t => t.category === eventCategory || t.tags.includes(eventCategory));
      const eventRow = take(shuffle(eventThemes), ROW_SIZE, used);
      if (eventRow.length > 0) {
        rows.push({
          id: `event-${upcoming.id}`,
          title: `For ${upcoming.title}`,
          subtitle: `Since it's coming up soon!`,
          themes: eventRow,
          viewAllHref: `/explore?category=${eventCategory}`
        });
      }
    }
  }

  // 2. Because you liked … (top affinity category)
  const topCat = topKey(affinity.category);
  if (hasSignal && topCat) {
    const catThemes = ranked.filter((t) => t.category === topCat);
    const row = take(shuffle(catThemes.slice(0, ROW_SIZE * 2)), ROW_SIZE, used);
    if (row.length >= 4) {
      rows.push({
        id: `more-${topCat}`,
        title: `More ${topCat.replace(/-/g, " ")} you might like`,
        themes: row,
        viewAllHref: `/explore?category=${topCat}`,
      });
    }
  }

  // 3. Your bookmarks
  if (ix.bookmarks.length > 0) {
    const bookmarked = ix.bookmarks
      .map((id) => themesById.get(id))
      .filter((t): t is Theme => !!t);
    if (bookmarked.length > 0) {
      rows.push({
        id: "bookmarks",
        title: "Your bookmarks",
        subtitle: "Saved to revisit later",
        themes: bookmarked.slice(0, ROW_SIZE),
        viewAllHref: "/explore?view=bookmarks",
      });
    }
  }

  // 4. Trending experiences (featured + new)
  const trending = rankedExperiences.filter((t) => t.isFeatured || t.isNew);
  const trendingRow = take(shuffle(trending.length >= 4 ? trending : rankedExperiences.slice(0, ROW_SIZE * 2)), ROW_SIZE, used);
  if (trendingRow.length >= 4) {
    rows.push({
      id: "trending",
      title: "Trending experiences",
      themes: trendingRow,
      viewAllHref: "/explore?kind=experiences",
    });
  }

  // 5. Fresh picks (seeded variety so it changes between visits)
  const seed = Math.floor(Math.random() * 1000000); // changes every reload!
  const fresh = [...allThemes].sort((a, b) => seededScore(b.id, seed) - seededScore(a.id, seed));
  const freshRow = take(fresh, ROW_SIZE, used);
  if (freshRow.length >= 4) {
    rows.push({
      id: "fresh",
      title: "Fresh picks",
      subtitle: "A new mix every visit",
      themes: freshRow,
      viewAllHref: "/explore",
    });
  }

  return rows.filter((r) => r.themes.length > 0);
}
