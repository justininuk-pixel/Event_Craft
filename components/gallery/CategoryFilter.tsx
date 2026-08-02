"use client";

import React, { useRef, useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/themes/categories";
import { ThemeCategory } from "@/lib/themes/types";
import clsx from "clsx";

interface CategoryFilterProps {
  selectedCategory: ThemeCategory | "all";
  onChange: (category: ThemeCategory | "all") => void;
  showEmojis?: boolean;
}

export function CategoryFilter({
  selectedCategory,
  onChange,
  showEmojis = false,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll positions to show/hide navigation arrows on desktop
  const checkScrollPosition = () => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (el) {
        setShowLeftArrow(el.scrollLeft > 10);
        setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
      }
      ticking.current = false;
    });
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      checkScrollPosition();
      el.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = direction === "left" ? -240 : 240;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col gap-2.5 relative select-none">
      <span className="text-xs uppercase font-extrabold tracking-widest text-primary font-mono">
        Category
      </span>

      {/* Outer wrapper for placing navigation arrows */}
      <div className="relative w-full group">
        
        {/* Left Scroll Arrow (Desktop only) */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-nav w-8 h-8 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur shadow-md hover:bg-secondary text-foreground transition-all focus-ring cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Scroll Arrow (Desktop only) */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-nav w-8 h-8 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur shadow-md hover:bg-secondary text-foreground transition-all focus-ring cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scrollable Chips Container */}
        <div
          ref={scrollContainerRef}
          role="radiogroup"
          aria-label="Select celebration category"
          className="w-full flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-none snap-x pointer-events-auto scroll-smooth pr-10 pl-2"
        >
          {/* 'All' Chip */}
          <button
            type="button"
            role="radio"
            aria-checked={selectedCategory === "all"}
            onClick={() => onChange("all")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap snap-start shadow-sm hover:scale-[1.02] active:scale-95 focus-ring",
              selectedCategory === "all"
                ? "bg-primary border-primary/20 text-primary-foreground shadow-primary-glow"
                : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
            )}
          >
            {showEmojis && <span className="text-sm">✨</span>}
            <span>All Cards</span>
          </button>

          {/* Dynamic Category Chips */}
          {Object.entries(CATEGORIES).map(([key, meta]) => {
            const categoryKey = key as ThemeCategory;
            const isSelected = selectedCategory === categoryKey;

            return (
              <button
                key={categoryKey}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(categoryKey)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap snap-start shadow-sm hover:scale-[1.02] active:scale-95 focus-ring",
                  isSelected
                    ? "text-primary-foreground border-transparent shadow-md"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                )}
                style={{
                  backgroundColor: isSelected ? meta.color : undefined,
                  boxShadow: isSelected ? `${meta.color}35 0px 8px 20px -3px` : undefined,
                }}
              >
                {showEmojis && <span className="text-sm shrink-0">{meta.emoji}</span>}
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}

export default CategoryFilter;
