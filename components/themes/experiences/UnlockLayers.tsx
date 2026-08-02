"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { ChevronDown, Hand } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { MessageLayer } from "@/lib/themes/types";
import { fireConfetti, toneIntensity } from "./celebrate";

const hairline = "color-mix(in srgb, var(--exp-text) 18%, transparent)";
const sealedTint = "color-mix(in srgb, var(--exp-primary) 26%, transparent)";
const surface = "color-mix(in srgb, var(--exp-text) 8%, transparent)";

export function UnlockLayers({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";

  const layers: MessageLayer[] = useMemo(
    () =>
      config.experience?.layers?.length
        ? config.experience.layers
        : theme.experienceDefaults?.layers ?? [],
    [config.experience?.layers, theme.experienceDefaults?.layers]
  );

  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const isLast = current >= layers.length - 1;

  // Auto-demo loop for gallery previews.
  useEffect(() => {
    if (!compact || layers.length === 0) return;
    let step = 0;
    const t = setInterval(() => {
      step = (step + 1) % (layers.length * 2 + 1);
      setCurrent(Math.min(Math.floor(step / 2), layers.length - 1));
      setRevealed(step % 2 === 1);
    }, 1100);
    return () => clearInterval(t);
  }, [compact, layers.length]);

  const handleReveal = () => {
    if (compact) return;
    if (!revealed) {
      setRevealed(true);
      return;
    }
    if (isLast) {
      if (!done) {
        setDone(true);
        fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
        onComplete?.();
      }
      return;
    }
    setCurrent((c) => c + 1);
    setRevealed(false);
  };

  const layer = layers[current];
  const remaining = layers.length - current - 1;

  if (!layer) return null;

  return (
    <div className={clsx("w-full h-full flex flex-col items-center justify-center", compact ? "p-3" : "p-6")}>
      {/* Header */}
      <div className={clsx("text-center", compact ? "mb-2" : "mb-5")}>
        <h1
          className={clsx("font-bold", compact ? "text-sm" : "text-2xl sm:text-3xl")}
          style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
        >
          {config.title || theme.content.title}
        </h1>
        {config.recipient && !compact && (
          <p className="text-xs mt-1" style={{ color: "var(--exp-text-secondary)" }}>
            for {config.recipient}
          </p>
        )}
      </div>

      {/* Layer stack */}
      <div className={clsx("relative w-full", compact ? "max-w-[170px] h-28" : "max-w-sm h-60")}>
        {/* Decorative depth — remaining sealed layers behind */}
        {Array.from({ length: Math.min(remaining, 3) }).map((_, idx) => (
          <div
            key={idx}
            className="absolute inset-x-0 mx-auto rounded-3xl"
            style={{
              bottom: -(idx + 1) * (compact ? 5 : 9),
              width: `${92 - idx * 6}%`,
              height: "100%",
              background: sealedTint,
              border: `1px solid ${hairline}`,
              opacity: 0.5 - idx * 0.12,
            }}
          />
        ))}

        <AnimatePresence mode="popLayout">
          {!done && (
            <motion.button
              type="button"
              key={current + (revealed ? "-r" : "-s")}
              onClick={handleReveal}
              disabled={compact}
              initial={{ opacity: 0, y: 16, rotateX: -12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -40, rotate: -6, scale: 0.92 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={clsx(
                "absolute inset-0 rounded-3xl flex flex-col items-center justify-center text-center",
                compact ? "p-3" : "p-6",
                !compact && "cursor-pointer active:scale-[0.98]"
              )}
              style={{
                background: revealed ? surface : sealedTint,
                border: `1.5px solid ${revealed ? palette.accent : hairline}`,
                boxShadow: "0 18px 40px -20px rgba(0,0,0,0.55)",
              }}
            >
              <span className={compact ? "text-lg" : "text-3xl"} aria-hidden>
                {layer.emoji || (revealed ? "💬" : "✉️")}
              </span>

              <AnimatePresence mode="wait">
                {!revealed ? (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={clsx("font-semibold mt-2", compact ? "text-[10px]" : "text-base")}
                    style={{ color: "var(--exp-text)", fontFamily: "var(--exp-font-heading)" }}
                  >
                    {layer.label}
                  </motion.span>
                ) : (
                  <motion.span
                    key="body"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={clsx("mt-2 leading-relaxed", compact ? "text-[9px]" : "text-sm")}
                    style={{ color: "var(--exp-text-secondary)" }}
                  >
                    {layer.body}
                  </motion.span>
                )}
              </AnimatePresence>

              {!compact && (
                <span
                  className="inline-flex items-center gap-1 mt-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--exp-accent)" }}
                >
                  {!revealed ? (
                    <>
                      <Hand className="w-3.5 h-3.5" /> Tap to reveal
                    </>
                  ) : isLast ? (
                    "Tap to finish ✨"
                  ) : (
                    <>
                      Peel next layer <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Final sign-off */}
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center text-center p-6"
            style={{ background: surface, border: `1.5px solid ${palette.accent}` }}
          >
            <span className="text-3xl">💛</span>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--exp-text)", fontFamily: "var(--exp-font-heading)" }}
            >
              {config.body || theme.content.body}
            </p>
            {config.sender && (
              <p className="text-xs mt-2 font-semibold" style={{ color: "var(--exp-accent)" }}>
                — {config.sender}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Progress dots */}
      <div className={clsx("flex items-center gap-1.5", compact ? "mt-2" : "mt-6")}>
        {layers.map((l, i) => (
          <span
            key={l.id}
            className="rounded-full transition-all"
            style={{
              width: i === current && !done ? (compact ? 10 : 16) : compact ? 4 : 6,
              height: compact ? 4 : 6,
              background:
                i < current || done ? palette.accent : i === current ? palette.primary : hairline,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default UnlockLayers;
