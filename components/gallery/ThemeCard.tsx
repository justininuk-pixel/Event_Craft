"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Theme } from "@/lib/themes/types";
import { ThemeStage } from "@/components/themes/renders/ThemeStage";
import { getDefaultConfig } from "@/lib/editor/defaults";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Bookmark, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/ToastQueue";
import { useThemeInteractions } from "@/lib/hooks/useThemeInteractions";
import clsx from "clsx";

interface ThemeCardProps {
  theme?: Theme;
  showEmojis?: boolean;
  skeleton?: boolean;
}

export function ThemeCard({ theme, showEmojis = false, skeleton = false }: ThemeCardProps) {
  const toast = useToast();
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const { isLiked, isBookmarked, toggleLike, toggleBookmark } = useThemeInteractions(theme?.id ?? "");

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = toggleLike();
    toast.success(nowLiked ? "Added to your likes ❤️" : "Removed from likes");
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleBookmark();
    toast.success(nowSaved ? "Saved to bookmarks 🔖" : "Removed from bookmarks");
  };

  // Lazy load preview block
  useEffect(() => {
    if (skeleton || !theme) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" } // Pre-load 150px before scrolling in
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [skeleton, theme]);

  // Render Skeleton Card Placeholder
  if (skeleton || !theme) {
    return (
      <div className="flex flex-col rounded-3xl border border-border/70 bg-card overflow-hidden h-full select-none pointer-events-none">
        <Skeleton variant="image" className="aspect-[3/2] w-full rounded-none" />
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex gap-2">
            <Skeleton variant="text" width={60} height={20} className="rounded-full" />
            <Skeleton variant="text" width={40} height={20} className="rounded-full" />
          </div>
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
          </div>
          <Skeleton variant="text" width="100%" height={44} className="rounded-xl mt-2" />
        </div>
      </div>
    );
  }

  const previewConfig = getDefaultConfig(theme);

  return (
    <Link
      ref={cardRef}
      href={`/editor/${theme.id}`}
      aria-label={`Create a card using the ${theme.name} theme`}
      className="group flex flex-col rounded-3xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-primary-glow hover:border-primary/45 transition-all duration-300 hover:-translate-y-2 active:scale-[0.98] active:brightness-95 animate-fade-in flex-1 self-stretch focus-ring"
    >
      {/* 3:2 Aspect Ratio Locked Mini Card Preview Box */}
      <div className="w-full aspect-[3/2] relative overflow-hidden pointer-events-none border-b border-border bg-secondary/10">
        {isInView ? (
          <ThemeStage
            theme={theme}
            config={previewConfig}
            mode="gallery-mini"
          />
        ) : (
          <Skeleton variant="image" className="w-full h-full rounded-none opacity-40" />
        )}
        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
      </div>

      {/* Info Details Section */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4 text-left">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden shrink" style={{ WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)', maskImage: 'linear-gradient(to right, black 80%, transparent 100%)' }}>

              {theme.mechanic && (
                <Badge variant="accent" className="text-[10px] py-0.5 px-2 font-extrabold inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Experience
                </Badge>
              )}

              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                <Badge variant="outline" className="capitalize text-[10px] py-0.5 px-2 border-border font-bold">
                  {theme.category}
                </Badge>
              </motion.div>
              
              {theme.isNew && (
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                  <Badge variant="accent" className="text-[10px] py-0.5 px-2 font-extrabold">
                    New
                  </Badge>
                </motion.div>
              )}
              
              {theme.culture && theme.culture !== "Universal" && (
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
                  <Badge variant="secondary" className="text-[10px] py-0.5 px-2 border-none">
                    {theme.culture}
                  </Badge>
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-0.5 -mt-1 -mr-1 shrink-0">
              <button
                type="button"
                onClick={handleLike}
                aria-label={isLiked ? "Remove from likes" : "Add to likes"}
                aria-pressed={isLiked}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  isLiked ? "text-accent hover:bg-accent/10" : "text-muted-foreground hover:text-accent hover:bg-accent/10"
                )}
              >
                <Heart className={clsx("w-4 h-4", isLiked && "fill-current")} />
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                aria-label={isBookmarked ? "Remove bookmark" : "Save to bookmarks"}
                aria-pressed={isBookmarked}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  isBookmarked ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
              >
                <Bookmark className={clsx("w-4 h-4", isBookmarked && "fill-current")} />
              </button>
            </div>
          </div>
          
          <h4 className="font-extrabold text-base md:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {theme.name}
          </h4>
          
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
            {theme.mechanic ? theme.mechanic.summary : theme.description}
          </p>

          {theme.mechanic && (theme.bestFor?.length ?? 0) > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {(theme.bestFor ?? []).slice(0, 2).map((b, bi) => (
                <span
                  key={`${b}-${bi}`}
                  className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-primary/10 text-primary/90 border border-primary/15"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Link Button Visual */}
        <div className="w-full py-3 rounded-xl text-center text-xs md:text-sm font-bold bg-primary text-primary-foreground group-hover:brightness-110 shadow-sm transition-all duration-200 pointer-events-none mt-2 flex items-center justify-center gap-1.5">
          <span>Use Theme</span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">➔</span>
        </div>
      </div>
    </Link>
  );
}

export default ThemeCard;
