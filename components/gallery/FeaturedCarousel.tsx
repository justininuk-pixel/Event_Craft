"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Link from "next/link";
import { Theme } from "@/lib/themes/types";
import { ThemeStage } from "@/components/themes/renders/ThemeStage";
import { getDefaultConfig } from "@/lib/editor/defaults";
import { triggerVibrate } from "@/lib/utils/device";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

interface FeaturedCarouselProps {
  themes: Theme[];
  showEmojis?: boolean;
}

export function FeaturedCarousel({ themes, showEmojis = false }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter featured cards or fallback to a gorgeous subset
  const featuredThemes = React.useMemo(() => {
    const featured = themes.filter((t) => t.isFeatured);
    if (featured.length > 0) return featured.slice(0, 8);
    return themes.slice(0, 6);
  }, [themes]);

  if (featuredThemes.length === 0) return null;

  const currentTheme = featuredThemes[currentIndex];
  const previewConfig = getDefaultConfig(currentTheme);

  const handleNext = () => {
    triggerVibrate(30);
    setCurrentIndex((prev) => (prev === featuredThemes.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    triggerVibrate(30);
    setCurrentIndex((prev) => (prev === 0 ? featuredThemes.length - 1 : prev - 1));
  };

  // Keyboard Navigation inside Carousel when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Framer Motion drag end handler
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Celebration Themes"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full relative select-none rounded-3xl overflow-hidden border border-border bg-card shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center min-h-[380px] pointer-events-auto focus-ring"
    >
      {/* 3D Visual Preview (Left Half) - acts as slide container */}
      <div 
        className="w-full md:w-3/5 h-56 md:h-80 relative overflow-hidden rounded-2xl border border-border flex items-center justify-center bg-secondary/10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${currentIndex + 1} of ${featuredThemes.length}`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <ThemeStage
              theme={currentTheme}
              config={previewConfig}
              mode="gallery-mini"
            />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrow Controls */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all pointer-events-auto cursor-pointer focus-ring shadow-md"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-4 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all pointer-events-auto cursor-pointer focus-ring shadow-md"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Promotional info text (Right Half) */}
      <div className="w-full md:w-2/5 flex flex-col justify-between h-full text-left self-stretch py-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {showEmojis && <span className="text-2xl">{currentTheme.emoji}</span>}
            <span className="text-[10px] bg-primary/10 text-primary font-mono tracking-widest border border-primary/20 px-2.5 py-1 rounded-full font-bold uppercase shadow-sm">
              Featured Card
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTheme.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-3.5"
            >
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight font-heading leading-tight">
                {currentTheme.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {currentTheme.description}
              </p>
              <div className="flex gap-1.5 flex-wrap pt-1.5">
                {currentTheme.tags.slice(0, 4).map((tag, ti) => (
                  <span
                    key={`${tag}-${ti}`}
                    className="text-[10px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground font-mono font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Dots & CTA */}
        <div className="flex items-center justify-between mt-8 md:mt-0 pt-4 border-t border-border">
          {/* Pagination Indicators */}
          <div role="tablist" aria-label="Carousel pagination slides" className="flex gap-2">
            {featuredThemes.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={currentIndex === idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => {
                  triggerVibrate(20);
                  setCurrentIndex(idx);
                }}
                className={clsx(
                  "h-2 rounded-full transition-all duration-300 cursor-pointer focus-ring",
                  currentIndex === idx ? "bg-primary w-5" : "bg-border w-2 hover:bg-muted-foreground"
                )}
              />
            ))}
          </div>

          {/* Use Theme CTA */}
          <Button
            as={Link}
            href={`/editor/${currentTheme.id}`}
            variant="primary"
            size="sm"
            className="font-bold flex items-center gap-1 shadow-sm"
          >
            Create Card ➔
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedCarousel;
