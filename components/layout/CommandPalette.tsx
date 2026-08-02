"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import clsx from "clsx";
import { fetchThemeSummaries, type ThemeSummary } from "@/lib/themes/client";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavCommand {
  id: string;
  name: string;
  url: string;
  category: "navigation";
  emoji: string;
}

const NAVIGATION_COMMANDS: NavCommand[] = [
  { id: "nav-gallery", name: "Browse Theme Gallery", url: "/", category: "navigation", emoji: "🏠" },
  { id: "nav-editor", name: "Create New Card (Editor)", url: "/editor", category: "navigation", emoji: "🪄" },
  { id: "nav-dashboard", name: "My Cards & Statistics (Dashboard)", url: "/dashboard", category: "navigation", emoji: "📊" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Theme metadata is fetched from the API the first time the palette opens, so the catalog never
  // bundles into every page just because the palette lives in the Navbar.
  const [summaries, setSummaries] = useState<ThemeSummary[]>([]);
  useEffect(() => {
    if (isOpen && summaries.length === 0) {
      fetchThemeSummaries().then(setSummaries).catch(() => {});
    }
  }, [isOpen, summaries.length]);

  // Initialize Fuse.js for themes search
  const fuse = useMemo(() => {
    return new Fuse(summaries, {
      keys: ["name", "tags", "description", "culture", "category", "subcategory"],
      threshold: 0.35,
    });
  }, [summaries]);

  // Filter both themes and navigation paths based on search query
  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        navigation: NAVIGATION_COMMANDS,
        themes: summaries.slice(0, 5), // Show first 5 themes as suggestions
      };
    }

    const matchedNavs = NAVIGATION_COMMANDS.filter((cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase())
    );

    const themeResults = fuse.search(query).map((res) => res.item);

    return {
      navigation: matchedNavs,
      themes: themeResults,
    };
  }, [query, fuse, summaries]);

  const flatResults = useMemo(() => {
    return [...results.navigation, ...results.themes];
  }, [results]);

  const handleSelect = useCallback((item: NavCommand | ThemeSummary) => {
    onClose();
    if ("url" in item) {
      router.push(item.url);
    } else {
      router.push(`/editor/${item.id}`);
    }
  }, [onClose, router]);

  // Reset index when search query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            flatResults.length > 0 ? (prev + 1) % flatResults.length : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            flatResults.length > 0
              ? (prev - 1 + flatResults.length) % flatResults.length
              : 0
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults[activeIndex]) {
            handleSelect(flatResults[activeIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, flatResults, onClose, handleSelect]);

  // Scroll active element into view inside palette list
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[aria-selected="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-start justify-center p-4 pt-16 md:pt-28 overflow-hidden select-none">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Palette Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Search header box */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-secondary/10">
              <svg className="h-5 w-5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search 500+ themes, or jump anywhere..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border px-1.5 font-mono text-[10px] font-bold text-muted-foreground shadow-sm">
                ESC
              </kbd>
            </div>

            {/* Results sections */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-4">
              {flatResults.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No matches found for <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
                </div>
              ) : (
                <>
                  {/* Navigation Commands Group */}
                  {results.navigation.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Quick Navigation
                      </div>
                      {results.navigation.map((cmd, idx) => {
                        const isHighlighted = idx === activeIndex;
                        return (
                          <div
                            key={cmd.id}
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={clsx(
                              "px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors",
                              isHighlighted ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/40"
                            )}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <span className="text-base shrink-0">{cmd.emoji}</span>
                              <span className="text-sm font-semibold truncate">{cmd.name}</span>
                            </div>
                            <span className={clsx("text-[10px] font-bold font-mono tracking-wider", isHighlighted ? "text-primary-foreground/85" : "text-muted-foreground")}>
                              Go to Link
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Themes Group */}
                  {results.themes.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        Celebration Themes
                      </div>
                      {results.themes.map((theme, idx) => {
                        // Offset the index in flat results
                        const flatIdx = results.navigation.length + idx;
                        const isHighlighted = flatIdx === activeIndex;
                        return (
                          <div
                            key={theme.id}
                            role="option"
                            aria-selected={isHighlighted}
                            onClick={() => handleSelect(theme)}
                            onMouseEnter={() => setActiveIndex(flatIdx)}
                            className={clsx(
                              "px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors",
                              isHighlighted ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary/40"
                            )}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <span className="text-lg shrink-0">{theme.emoji}</span>
                              <div className="flex flex-col truncate">
                                <span className="text-sm font-semibold truncate">{theme.name}</span>
                                <span className={clsx("text-xs truncate max-w-sm", isHighlighted ? "text-primary-foreground/75" : "text-muted-foreground")}>
                                  {theme.description}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {theme.culture && (
                                <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-bold border", isHighlighted ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground" : "border-border bg-secondary text-muted-foreground")}>
                                  {theme.culture}
                                </span>
                              )}
                              <span className={clsx("text-[10px] font-bold uppercase", isHighlighted ? "text-primary-foreground/80" : "text-primary")}>
                                Load Theme
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer tips */}
            <div className="px-4 py-2 border-t border-border bg-secondary/20 flex justify-between items-center text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>↑↓</span> to navigate
                <span className="ml-2">↵</span> to select
              </span>
              <span>Search 500+ templates</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
