"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Hand } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import { fireConfetti, toneIntensity } from "./celebrate";
import { triggerVibrate } from "@/lib/utils/device";

const surface = "color-mix(in srgb, var(--exp-text) 7%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

export function GiftUnwrap({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const layers = Math.max(1, Math.min(6, config.experience?.wrapLayers ?? theme.experienceDefaults?.wrapLayers ?? 3));

  const [taps, setTaps] = useState(0);
  const opened = taps >= layers;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Auto-demo loop for gallery previews.
  useEffect(() => {
    if (!compact) return;
    const run = () => {
      let n = 0;
      const step = () => {
        n += 1;
        setTaps(n);
        if (n < layers) timers.current.push(setTimeout(step, 450));
        else timers.current.push(setTimeout(() => setTaps(0), 1600));
      };
      timers.current.push(setTimeout(step, 450));
    };
    run();
    const loop = setInterval(() => {
      setTaps(0);
      run();
    }, 3600);
    return () => {
      clearInterval(loop);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [compact, layers]);

  useEffect(() => {
    if (opened && !compact) {
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const tap = () => {
    if (compact || opened) return;
    triggerVibrate(40);
    setTaps((t) => Math.min(layers, t + 1));
  };

  return (
    <div className={clsx("w-full h-full flex flex-col items-center justify-center text-center", compact ? "p-3" : "p-6")}>
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

      <button
        type="button"
        onClick={tap}
        disabled={compact || opened}
        className={clsx(
          "relative flex items-center justify-center my-4 rounded-3xl",
          compact ? "w-24 h-24" : "w-44 h-44",
          !compact && !opened && "cursor-pointer active:scale-95 transition-transform"
        )}
        style={{ background: surface, border: `1.5px solid ${hairline}` }}
        aria-label="Unwrap the gift"
      >
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.span
              key={`gift-${taps}`}
              className={compact ? "text-5xl" : "text-7xl"}
              style={{ display: "inline-block", lineHeight: 1 }}
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 0.4 }}
            >
              🎁
            </motion.span>
          ) : (
            <motion.span
              key="opened"
              className={compact ? "text-5xl" : "text-7xl"}
              style={{ display: "inline-block", lineHeight: 1 }}
              initial={{ scale: 0.4, y: 14, opacity: 0 }}
              animate={{ scale: [0.4, 1.35, 1.2], y: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              🎉
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* progress / message */}
      {!opened ? (
        !compact && (
          <>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--exp-accent)" }}>
              <Hand className="w-4 h-4" /> Tap to unwrap
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {Array.from({ length: layers }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{ width: 6, height: 6, background: i < taps ? palette.accent : hairline }}
                />
              ))}
            </div>
          </>
        )
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm px-2">
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
    </div>
  );
}

export default GiftUnwrap;
