"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Clock } from "lucide-react";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Theme } from "@/lib/themes/types";

interface SearchBarProps {
  themes: Theme[];
  onSearch: (results: Theme[]) => void;
  placeholder?: string;
}

export function SearchBar({
  themes,
  onSearch,
  placeholder = "Search templates (e.g. Birthday, proposal, Desi, funny...)",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear query via custom event (e.g. click "Clear All" in ThemeGallery)
  useEffect(() => {
    const handleClear = () => {
      setQuery("");
      setDebouncedQuery("");
    };
    window.addEventListener("clear-search-query", handleClear);
    return () => window.removeEventListener("clear-search-query", handleClear);
  }, []);

  // Debounce query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cc-search-history");
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch {
      // safe fallbacks
    }
  }, []);

  // Save unique history searches
  const saveSearchToHistory = (search: string) => {
    const trimmed = search.trim();
    if (!trimmed || trimmed.length < 2) return;
    
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const nextHistory = [trimmed, ...filtered].slice(0, 5); // Max 5 items
      localStorage.setItem("cc-search-history", JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  // Perform search when debouncedQuery or themes changes — in an effect, not a memo,
  // so we never call the parent's state setter during render (React rules violation).
  const [searchResultsCount, setSearchResultsCount] = useState(themes.length);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      onSearch(themes);
      setSearchResultsCount(themes.length);
      return;
    }

    const fuse = new Fuse(themes, {
      keys: [
        { name: "name", weight: 1.0 },
        { name: "tags", weight: 0.8 },
        { name: "category", weight: 0.6 },
        { name: "culture", weight: 0.6 },
        { name: "subcategory", weight: 0.5 },
        { name: "mood", weight: 0.4 },
        { name: "description", weight: 0.3 },
      ],
      threshold: 0.35,
      minMatchCharLength: 2,
    });

    const results = fuse.search(debouncedQuery).map((r) => r.item);
    onSearch(results);
    setSearchResultsCount(results.length);

    if (results.length > 0) {
      saveSearchToHistory(debouncedQuery);
    }
  }, [debouncedQuery, themes, onSearch]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteHistoryItem = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const nextHistory = prev.filter((_, idx) => idx !== index);
      localStorage.setItem("cc-search-history", JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (activeHistoryIndex >= 0 && searchHistory[activeHistoryIndex]) {
        setQuery(searchHistory[activeHistoryIndex]);
        setIsFocused(false);
      } else {
        saveSearchToHistory(query);
        setIsFocused(false);
      }
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveHistoryIndex((prev) =>
        searchHistory.length > 0 ? (prev + 1) % searchHistory.length : -1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveHistoryIndex((prev) =>
        searchHistory.length > 0
          ? (prev - 1 + searchHistory.length) % searchHistory.length
          : -1
      );
    }
  };

  return (
    <div ref={containerRef} className="w-full relative flex flex-col items-center select-none pointer-events-auto">
      {/* Input container with focus rings and animations */}
      <div
        className={clsx(
          "w-full relative flex items-center rounded-2xl border bg-card/60 backdrop-blur-md transition-all duration-300",
          isFocused ? "border-primary shadow-md ring-2 ring-primary/10 scale-[1.01]" : "border-border shadow-sm"
        )}
      >
        {/* Search magnifying icon */}
        <span className="absolute left-4 text-muted-foreground select-none pointer-events-none">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          value={query}
          onFocus={() => {
            setIsFocused(true);
            setActiveHistoryIndex(-1);
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3 bg-transparent text-foreground placeholder-muted-foreground/60 focus:outline-none text-sm font-semibold h-11"
        />

        {/* Action Indicators (Clear / Match Count / Cmd+K) */}
        <div className="absolute right-3 flex items-center gap-2">
          {query ? (
            <>
              {/* Inline matches count */}
              <span className="text-[10px] font-mono font-black text-muted-foreground/90 bg-secondary px-2 py-0.5 rounded-full border border-border">
                {searchResultsCount} matches
              </span>
              
              {/* Reset Clear trigger button */}
              <button
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  inputRef.current?.focus();
                }}
                className="w-5 h-5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            /* Ctrl+K shortcut reminder badge */
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border px-1.5 font-mono text-[9px] font-bold text-muted-foreground shadow-sm bg-secondary">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Search History Dropdown */}
      <AnimatePresence>
        {isFocused && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-floating rounded-xl border border-border bg-card shadow-xl overflow-hidden flex flex-col py-1"
          >
            <div className="px-3 py-1.5 text-[9px] font-bold tracking-widest text-muted-foreground uppercase select-none border-b border-border mb-1 bg-secondary/10">
              Recent Searches
            </div>
            
            {searchHistory.map((item, idx) => {
              const isHighlighted = idx === activeHistoryIndex;
              return (
                <div
                  key={item}
                  onClick={() => {
                    setQuery(item);
                    setIsFocused(false);
                  }}
                  onMouseEnter={() => setActiveHistoryIndex(idx)}
                  className={clsx(
                    "px-4 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors",
                    isHighlighted ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistoryItem(e, idx)}
                    className="p-1 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title="Remove from history"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;
