import { ThemePalette } from "../themes/types";

export interface BrandKit {
  id: string;
  name: string;
  palette: ThemePalette;
  fontHeading: string;
  fontBody: string;
}

const KEY = "celebrationcraft-brand-kits";

export function getBrandKits(): BrandKit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(kits: BrandKit[]): BrandKit[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(kits.slice(0, 12)));
    } catch {
      /* storage full / unavailable, ignore */
    }
  }
  return kits;
}

export function saveBrandKit(kit: Omit<BrandKit, "id">): BrandKit[] {
  const kits = getBrandKits();
  const entry: BrandKit = {
    ...kit,
    id: `bk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  };
  return persist([entry, ...kits]);
}

export function deleteBrandKit(id: string): BrandKit[] {
  return persist(getBrandKits().filter((k) => k.id !== id));
}
