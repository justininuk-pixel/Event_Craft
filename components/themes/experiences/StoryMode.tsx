"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { StoryPage } from "@/lib/themes/types";
import { fireConfetti, toneIntensity } from "./celebrate";

const surface = "color-mix(in srgb, var(--exp-text) 6%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

export function StoryMode({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";

  const pages: StoryPage[] = useMemo(
    () =>
      config.experience?.pages?.length
        ? config.experience.pages
        : theme.experienceDefaults?.pages ?? [],
    [config.experience?.pages, theme.experienceDefaults?.pages]
  );

  const total = pages.length;
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [finished, setFinished] = useState(false);

  const go = (next: number, d: number) => {
    if (next < 0 || next >= total) return;
    setState([next, d]);
    if (next === total - 1 && !finished && !compact) {
      setFinished(true);
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
  };

  // Auto-advance for gallery previews.
  useEffect(() => {
    if (!compact || total === 0) return;
    const t = setInterval(() => {
      setState(([i]) => [(i + 1) % total, 1]);
    }, 1600);
    return () => clearInterval(t);
  }, [compact, total]);

  // Single-page stories count as finished once viewed.
  useEffect(() => {
    if (!compact && total === 1 && !finished) {
      setFinished(true);
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const page = pages[index];
  if (!page) return null;

  return (
    <div className={clsx("w-full h-full flex flex-col", compact ? "p-3" : "p-5 sm:p-7")}>
      {/* Book header */}
      <header className="text-center shrink-0">
        <h1
          className={clsx("font-bold leading-tight inline-flex items-center gap-2", compact ? "text-sm" : "text-xl sm:text-2xl")}
          style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
        >
          {!compact && <BookOpen className="w-5 h-5" style={{ color: "var(--exp-accent)" }} />}
          {config.title || theme.content.title}
        </h1>
      </header>

      {/* Page */}
      <div className={clsx("relative flex-1 min-h-0 my-3", compact ? "" : "my-4")}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.article
            key={page.id}
            custom={dir}
            initial={{ opacity: 0, x: dir >= 0 ? 40 : -40, rotateY: dir >= 0 ? 8 : -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: dir >= 0 ? -40 : 40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
              "absolute inset-0 rounded-2xl overflow-y-auto flex flex-col",
              compact ? "p-3" : "p-5"
            )}
            style={{ background: surface, border: `1px solid ${hairline}` }}
          >
            {page.title && (
              <h2
                className={clsx("font-bold", compact ? "text-[11px]" : "text-base")}
                style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
              >
                {page.title}
              </h2>
            )}
            {page.mediaUrl && !compact && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.mediaUrl} alt={page.title || "story"} className="w-full rounded-xl my-2 object-cover max-h-40" />
            )}
            <p
              className={clsx("leading-relaxed", compact ? "text-[9px] mt-1" : "text-sm mt-2")}
              style={{ color: "var(--exp-text-secondary)" }}
            >
              {page.body}
            </p>
            {!compact && index === total - 1 && (
              <p className="mt-auto pt-4 text-xs italic text-center" style={{ color: "var(--exp-accent)" }}>
                {config.sender ? `— ${config.sender}` : "The end ♥"}
              </p>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <footer className="shrink-0 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(index - 1, -1)}
          disabled={compact || index === 0}
          className={clsx(
            "rounded-full flex items-center justify-center transition-opacity disabled:opacity-25",
            compact ? "w-6 h-6" : "w-9 h-9 cursor-pointer hover:opacity-80"
          )}
          style={{ background: surface, border: `1px solid ${hairline}`, color: "var(--exp-text)" }}
          aria-label="Previous page"
        >
          <ChevronLeft className={compact ? "w-3 h-3" : "w-4 h-4"} />
        </button>

        <div className="flex items-center gap-1.5">
          {pages.map((p, i) => (
            <span
              key={p.id}
              className="rounded-full transition-all"
              style={{
                width: i === index ? (compact ? 10 : 16) : compact ? 4 : 6,
                height: compact ? 4 : 6,
                background: i === index ? palette.accent : hairline,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index + 1, 1)}
          disabled={compact || index >= total - 1}
          className={clsx(
            "rounded-full flex items-center justify-center transition-opacity disabled:opacity-25",
            compact ? "w-6 h-6" : "w-9 h-9 cursor-pointer hover:opacity-80"
          )}
          style={{ background: palette.primary, border: `1px solid ${hairline}`, color: "#fff" }}
          aria-label="Next page"
        >
          <ChevronRight className={compact ? "w-3 h-3" : "w-4 h-4"} />
        </button>
      </footer>
    </div>
  );
}

export default StoryMode;
