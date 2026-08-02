"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Lock, Sparkles } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { TimelineMilestone } from "@/lib/themes/types";
import { fireConfetti, toneIntensity } from "./celebrate";

const surface = "color-mix(in srgb, var(--exp-text) 6%, transparent)";
const surfaceStrong = "color-mix(in srgb, var(--exp-text) 10%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";
const sealedTint = "color-mix(in srgb, var(--exp-primary) 16%, transparent)";

export function MemoryTimeline({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";

  const milestones: TimelineMilestone[] = useMemo(
    () =>
      config.experience?.milestones?.length
        ? config.experience.milestones
        : theme.experienceDefaults?.milestones ?? [],
    [config.experience?.milestones, theme.experienceDefaults?.milestones]
  );

  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [autoIndex, setAutoIndex] = useState(0);
  const allOpen = opened.size >= milestones.length && milestones.length > 0;

  // Auto-cycle teaser for gallery previews so the mechanic reads at a glance.
  useEffect(() => {
    if (!compact || milestones.length === 0) return;
    const t = setInterval(() => {
      setAutoIndex((i) => (i + 1) % (milestones.length + 1));
    }, 1400);
    return () => clearInterval(t);
  }, [compact, milestones.length]);

  useEffect(() => {
    if (allOpen && !compact) {
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOpen, compact]);

  const isOpen = (m: TimelineMilestone, i: number) =>
    compact ? i < autoIndex : opened.has(m.id);

  const toggle = (id: string) => {
    if (compact) return;
    setOpened((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div
      className={clsx(
        "w-full h-full overflow-y-auto overflow-x-hidden",
        compact ? "px-3 py-3" : "px-5 py-7 sm:px-8"
      )}
      style={{ scrollbarWidth: "thin" }}
    >
      <div className={clsx("mx-auto", compact ? "max-w-full" : "max-w-md")}>
        {/* Header */}
        <header className={clsx("text-center", compact ? "mb-3" : "mb-7")}>
          {config.recipient && !compact && (
            <p
              className="uppercase tracking-[0.3em] mb-2 opacity-70"
              style={{ color: "var(--exp-text-secondary)", fontSize: 11 }}
            >
              For {config.recipient}
            </p>
          )}
          <h1
            className={clsx("font-bold leading-tight", compact ? "text-base" : "text-3xl sm:text-4xl")}
            style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
          >
            {config.title || theme.content.title}
          </h1>
          {config.subtitle && (
            <p
              className={clsx(compact ? "text-[10px] mt-1" : "text-sm mt-2")}
              style={{ color: "var(--exp-text-secondary)" }}
            >
              {config.subtitle}
            </p>
          )}
          {!compact && (
            <div
              className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: surfaceStrong, color: "var(--exp-text-secondary)" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--exp-accent)" }} />
              {opened.size} of {milestones.length} memories opened
            </div>
          )}
        </header>

        {/* Timeline rail */}
        <div className="relative">
          <div
            className="absolute top-1 bottom-1 rounded-full"
            style={{
              left: compact ? 11 : 15,
              width: 2,
              background: `linear-gradient(var(--exp-primary), color-mix(in srgb, var(--exp-accent) 70%, transparent))`,
              opacity: 0.55,
            }}
          />

          <ul className={clsx("relative", compact ? "space-y-2.5" : "space-y-4")}>
            {milestones.map((m, i) => {
              const open = isOpen(m, i);
              return (
                <li key={m.id} className={clsx("relative", compact ? "pl-7" : "pl-10")}>
                  {/* Node */}
                  <motion.span
                    aria-hidden
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      left: compact ? 4 : 6,
                      top: compact ? 4 : 8,
                      width: compact ? 16 : 20,
                      height: compact ? 16 : 20,
                      fontSize: compact ? 9 : 11,
                      background: open ? "var(--exp-primary)" : "var(--exp-bg, var(--exp-secondary))",
                      border: `2px solid var(--exp-accent)`,
                      color: "#fff",
                    }}
                    animate={open ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {open ? m.emoji || "✓" : ""}
                  </motion.span>

                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    disabled={compact}
                    className={clsx(
                      "w-full text-left rounded-2xl transition-all",
                      compact ? "p-2.5" : "p-4",
                      !compact && !open && "hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]"
                    )}
                    style={{
                      background: open ? surface : sealedTint,
                      border: `1px solid ${hairline}`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={clsx("font-semibold", compact ? "text-[10px]" : "text-xs")}
                        style={{ color: "var(--exp-accent)", letterSpacing: "0.04em" }}
                      >
                        {m.date || `Moment ${i + 1}`}
                      </span>
                      {!open && (
                        <span
                          className={clsx("inline-flex items-center gap-1", compact ? "text-[8px]" : "text-[10px]")}
                          style={{ color: "var(--exp-text-secondary)" }}
                        >
                          <Lock className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                          {!compact && "Tap to open"}
                        </span>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className={compact ? "pt-1" : "pt-2"}>
                            <h3
                              className={clsx("font-bold", compact ? "text-[11px]" : "text-base")}
                              style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
                            >
                              {m.emoji} {m.title}
                            </h3>
                            {m.mediaUrl && !compact && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={m.mediaUrl}
                                alt={m.title}
                                className="w-full rounded-xl mt-2 object-cover max-h-44"
                              />
                            )}
                            <p
                              className={clsx("leading-relaxed", compact ? "text-[9px] mt-0.5" : "text-sm mt-1.5")}
                              style={{ color: "var(--exp-text-secondary)" }}
                            >
                              {m.body}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Closing flourish */}
        {!compact && allOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-7"
          >
            <p
              className="text-sm italic"
              style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
            >
              {config.body || "…and the story keeps going."}
            </p>
            {config.sender && (
              <p className="text-xs mt-2 font-semibold" style={{ color: "var(--exp-accent)" }}>
                — {config.sender}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MemoryTimeline;
