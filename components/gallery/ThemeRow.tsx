"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeCard } from "./ThemeCard";
import type { ThemeRow as ThemeRowData } from "@/lib/themes/client";

interface ThemeRowProps {
  row: ThemeRowData;
}

/**
 * A horizontally-scrollable rail of theme cards (Netflix style). Cards lazy-load their previews
 * via the ThemeCard IntersectionObserver, so a rail only renders the few cards in view.
 */
export function ThemeRow({ row }: ThemeRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (!row.themes.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground/90 truncate">{row.title}</h3>
          {row.subtitle && (
            <p className="text-sm text-muted-foreground font-medium truncate">{row.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {row.viewAllHref && (
            <Link href={row.viewAllHref} className="text-sm text-primary font-bold hover:underline whitespace-nowrap">
              View all
            </Link>
          )}
          <div className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              className="p-1.5 rounded-full border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors focus-ring"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              className="p-1.5 rounded-full border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors focus-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin"
      >
        {row.themes.map((theme) => (
          <div key={theme.id} className="w-[240px] sm:w-[260px] shrink-0 snap-start flex">
            <ThemeCard theme={theme} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ThemeRow;
