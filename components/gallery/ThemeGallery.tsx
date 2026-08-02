"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Theme, ThemeCategory, ThemeMood } from "@/lib/themes/types";
import { ThemeCard } from "./ThemeCard";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { CultureFilter } from "./CultureFilter";
import { MoodFilter } from "./MoodFilter";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import clsx from "clsx";

type ThemeKind = "all" | "experiences" | "styles";

interface ThemeGalleryProps {
  themes: Theme[];
  showEmojis?: boolean;
  onToggleEmojis?: (val: boolean) => void;
  /** True while the theme catalog is still being fetched from the API. */
  loading?: boolean;
}

export function ThemeGallery({
  themes,
  showEmojis = false,
  onToggleEmojis,
  loading = false,
}: ThemeGalleryProps) {
  // Loading state on mount
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [kind, setKind] = useState<ThemeKind>("all");
  const [category, setCategory] = useState<ThemeCategory | "all">("all");
  const [culture, setCulture] = useState<string>("all");
  const [mood, setMood] = useState<ThemeMood | "all">("all");
  const [searchFiltered, setSearchFiltered] = useState<Theme[]>(themes);

  // Pagination / Infinite Scroll States
  const [visibleCount, setVisibleCount] = useState(24);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Simulate skeleton load on mount and read category parameter
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get("category");
      if (catParam) {
        setCategory(catParam.toLowerCase() as any);
      }
      const kindParam = params.get("kind");
      if (kindParam === "experiences" || kindParam === "styles") {
        setKind(kindParam);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Themes arrive asynchronously from the API, resync the search baseline when they load
  // (or change), otherwise the gallery would stay empty after the fetch resolves.
  useEffect(() => {
    setSearchFiltered(themes);
  }, [themes]);

  // Reset pagination when filter criteria changes
  useEffect(() => {
    setVisibleCount(24);
  }, [kind, category, culture, mood, searchFiltered]);

  // Compound filter evaluation
  const filteredThemes = useMemo(() => {
    let list = [...searchFiltered];

    if (kind === "experiences") {
      list = list.filter((t) => !!t.experienceId);
    } else if (kind === "styles") {
      list = list.filter((t) => !t.experienceId);
    }

    if (category !== "all") {
      list = list.filter((t) => t.category === category);
    }

    if (culture !== "all") {
      list = list.filter((t) => t.culture?.toLowerCase() === culture.toLowerCase());
    }

    if (mood !== "all") {
      list = list.filter((t) => t.mood === mood);
    }

    // Sort: unique experiences first, then featured & new, then alphabetically
    return list.sort((a, b) => {
      if (a.experienceId && !b.experienceId) return -1;
      if (!a.experienceId && b.experienceId) return 1;
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [kind, category, culture, mood, searchFiltered]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 24, filteredThemes.length));
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [filteredThemes, isLoading]);

  const visibleThemes = useMemo(() => {
    return filteredThemes.slice(0, visibleCount);
  }, [filteredThemes, visibleCount]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      kind !== "all" ||
      category !== "all" ||
      culture !== "all" ||
      mood !== "all" ||
      searchFiltered.length !== themes.length
    );
  }, [kind, category, culture, mood, searchFiltered.length, themes.length]);

  // Reset all filters to default
  const handleClearAll = () => {
    setKind("all");
    setCategory("all");
    setCulture("all");
    setMood("all");
    setSearchFiltered(themes);
    
    // Dispatch search clear to search bar components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("clear-search-query"));
    }
  };

  return (
    <div id="gallery-start" className="w-full space-y-10 pt-4">
      {/* Search & Compound Filter Grid panel */}
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 md:p-8 shadow-md space-y-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full max-w-xl">
            <SearchBar themes={themes} onSearch={setSearchFiltered} />
          </div>
          {onToggleEmojis && (
            <div className="flex items-center bg-secondary/50 border border-border px-4 py-2 rounded-2xl shadow-sm select-none shrink-0">
              <Toggle
                checked={showEmojis}
                onChange={onToggleEmojis}
                label="Show Emojis"
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Type filter: unique experiences vs style themes */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Type</span>
          {([
            { id: "all", label: "All" },
            { id: "experiences", label: "✦ Experiences" },
            { id: "styles", label: "Styles" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setKind(opt.id)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer focus-ring",
                kind === opt.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <CategoryFilter selectedCategory={category} onChange={setCategory} showEmojis={showEmojis} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CultureFilter selectedCulture={culture} onChange={setCulture} showEmojis={showEmojis} />
            <MoodFilter selectedMood={mood} onChange={setMood} showEmojis={showEmojis} />
          </div>
        </div>
      </div>

      {/* Active Filter Chips bar */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap items-center gap-2 px-4 md:px-6 select-none"
          >
            <span className="text-xs font-bold text-muted-foreground mr-1">Active filters:</span>

            {kind !== "all" && (
              <Badge variant="primary" size="md" dot>
                Type: <span className="capitalize ml-0.5">{kind}</span>
                <button
                  onClick={() => setKind("all")}
                  className="hover:text-foreground hover:bg-primary/20 rounded p-0.5 ml-1 transition-colors cursor-pointer"
                  title="Remove type filter"
                >
                  ✕
                </button>
              </Badge>
            )}

            {category !== "all" && (
              <Badge variant="primary" size="md" dot>
                Category: <span className="capitalize ml-0.5">{category}</span>
                <button
                  onClick={() => setCategory("all")}
                  className="hover:text-foreground hover:bg-primary/20 rounded p-0.5 ml-1 transition-colors cursor-pointer"
                  title="Remove category filter"
                >
                  ✕
                </button>
              </Badge>
            )}

            {culture !== "all" && (
              <Badge variant="primary" size="md" dot>
                Culture: <span className="ml-0.5">{culture}</span>
                <button
                  onClick={() => setCulture("all")}
                  className="hover:text-foreground hover:bg-primary/20 rounded p-0.5 ml-1 transition-colors cursor-pointer"
                  title="Remove culture filter"
                >
                  ✕
                </button>
              </Badge>
            )}

            {mood !== "all" && (
              <Badge variant="primary" size="md" dot>
                Mood: <span className="capitalize ml-0.5">{mood}</span>
                <button
                  onClick={() => setMood("all")}
                  className="hover:text-foreground hover:bg-primary/20 rounded p-0.5 ml-1 transition-colors cursor-pointer"
                  title="Remove mood filter"
                >
                  ✕
                </button>
              </Badge>
            )}

            {searchFiltered.length !== themes.length && (
              <Badge variant="primary" size="md" dot>
                Search Query Active
                <button
                  onClick={() => {
                    setSearchFiltered(themes);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("clear-search-query"));
                    }
                  }}
                  className="hover:text-foreground hover:bg-primary/20 rounded p-0.5 ml-1 transition-colors cursor-pointer"
                  title="Clear search query"
                >
                  ✕
                </button>
              </Badge>
            )}

            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-primary hover:text-accent hover:underline ml-2 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid count summary with animated result counter */}
      <div className="flex justify-between items-center px-4 font-mono text-xs md:text-sm text-muted-foreground select-none">
        <motion.span layout>
          Showing{" "}
          <motion.strong
            key={filteredThemes.length}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-primary font-extrabold"
          >
            {filteredThemes.length}
          </motion.strong>{" "}
          {kind === "experiences" ? "experiences" : kind === "styles" ? "styles" : "themes"}
        </motion.span>
        {!isLoading && !loading && filteredThemes.length > 0 && (
          <span>
            Rendered: {visibleThemes.length} / {filteredThemes.length}
          </span>
        )}
      </div>

      {/* Theme Card Grid Layout */}
      {isLoading || loading ? (
        /* Render Skeleton cards while loading */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ThemeCard key={`skeleton-${idx}`} skeleton />
          ))}
        </div>
      ) : visibleThemes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pointer-events-auto">
          {visibleThemes.map((theme, ti) => (
            <ThemeCard key={`${theme.id}-${ti}`} theme={theme} showEmojis={showEmojis} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<span className="text-3xl">🔍</span>}
          title="No matching templates found"
          description="No celebration styles match your current filter parameters or search queries. Try clearing filters."
          actionText="Reset Filters & Search"
          onAction={handleClearAll}
          className="w-full max-w-none border-dashed border-border py-20"
        />
      )}

      {/* Infinite Scroll Sentinel element */}
      {!isLoading && !loading && visibleCount < filteredThemes.length && (
        <div
          ref={observerTarget}
          className="w-full py-10 flex justify-center items-center text-xs text-muted-foreground select-none animate-pulse font-bold tracking-wider"
        >
          LOADING NEXT BATCH...
        </div>
      )}
    </div>
  );
}

export default ThemeGallery;
