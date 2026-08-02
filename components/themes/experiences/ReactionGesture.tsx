"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Hand } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { GestureType } from "@/lib/themes/types";
import { fireConfetti, toneIntensity } from "./celebrate";
import { triggerVibrate } from "@/lib/utils/device";

const surface = "color-mix(in srgb, var(--exp-text) 7%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

const GESTURES: Record<
  GestureType,
  { emoji: string; cta: string; rotate: number[]; confetti: boolean }
> = {
  "flip-off": { emoji: "🖕", cta: "Tap if they deserve it", rotate: [0, -10, 6, 0], confetti: false },
  "high-five": { emoji: "🙌", cta: "Tap for a high five", rotate: [0, -6, 6, 0], confetti: true },
  hug: { emoji: "🤗", cta: "Tap for a big hug", rotate: [0, 0, 0], confetti: false },
  applause: { emoji: "👏", cta: "Tap to applaud", rotate: [0, -8, 8, -8, 0], confetti: true },
  "fist-bump": { emoji: "👊", cta: "Tap to fist bump", rotate: [0, -4, 4, 0], confetti: false },
  "blow-kiss": { emoji: "😘", cta: "Tap to blow a kiss", rotate: [0, -4, 4, 0], confetti: true },
};

export function ReactionGesture({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const gesture = (config.experience?.gesture ??
    theme.experienceDefaults?.gesture ??
    "high-five") as GestureType;
  const g = GESTURES[gesture] ?? GESTURES["high-five"];
  const prompt = config.experience?.gesturePrompt ?? theme.experienceDefaults?.gesturePrompt ?? g.cta;

  const [phase, setPhase] = useState<"ready" | "reacting" | "done">("ready");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Auto-demo loop for gallery previews.
  useEffect(() => {
    if (!compact) return;
    const run = () => {
      setPhase("reacting");
      timers.current.push(setTimeout(() => setPhase("done"), 850));
      timers.current.push(setTimeout(() => setPhase("ready"), 2200));
    };
    run();
    const loop = setInterval(run, 3200);
    return () => {
      clearInterval(loop);
      clearTimers();
    };
  }, [compact]);

  useEffect(() => () => clearTimers(), []);

  const react = () => {
    if (compact || phase !== "ready") return;
    triggerVibrate(gesture === "flip-off" ? 120 : 50);
    setPhase("reacting");
    timers.current.push(
      setTimeout(() => {
        setPhase("done");
        if (g.confetti) fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
        onComplete?.();
      }, 850)
    );
  };

  const reacting = phase === "reacting";
  const done = phase === "done";

  return (
    <motion.div
      className={clsx("w-full h-full flex flex-col items-center justify-center text-center", compact ? "p-3" : "p-6")}
      animate={reacting ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.5 }}
    >
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

      {/* Gesture stage */}
      <button
        type="button"
        onClick={react}
        disabled={compact || phase !== "ready"}
        className={clsx(
          "relative flex items-center justify-center my-4 rounded-full",
          compact ? "w-24 h-24" : "w-44 h-44",
          phase === "ready" && !compact && "cursor-pointer active:scale-95 transition-transform"
        )}
        style={{ background: surface, border: `1.5px solid ${hairline}` }}
        aria-label={prompt}
      >
        <motion.span
          className={compact ? "text-5xl" : "text-7xl"}
          style={{ display: "inline-block", lineHeight: 1 }}
          animate={
            reacting
              ? { scale: [0.6, 1.8, 1.3], y: [28, -18, 0], rotate: g.rotate }
              : done
              ? { scale: 1.3, y: 0, rotate: 0 }
              : { scale: 1, y: 0, rotate: 0 }
          }
          transition={reacting ? { duration: 0.85, ease: "easeOut" } : { duration: 0.3 }}
        >
          {g.emoji}
        </motion.span>
      </button>

      {/* CTA / message */}
      {!done ? (
        !compact && (
          <span
            className="inline-flex items-center gap-1.5 text-sm font-bold"
            style={{ color: "var(--exp-accent)" }}
          >
            <Hand className="w-4 h-4" /> {prompt}
          </span>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(compact ? "px-2" : "max-w-sm px-2")}
        >
          {!compact && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--exp-text-secondary)" }}>
              {config.body || theme.content.body}
            </p>
          )}
          {config.sender && !compact && (
            <p className="text-xs mt-3 font-semibold" style={{ color: "var(--exp-accent)" }}>
             , {config.sender}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default ReactionGesture;
