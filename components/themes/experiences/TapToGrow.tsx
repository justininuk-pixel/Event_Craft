"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Hand } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import { fireConfetti, toneIntensity } from "./celebrate";
import { triggerVibrate } from "@/lib/utils/device";

const surface = "color-mix(in srgb, var(--exp-text) 7%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

const DEFAULT_STAGES = ["🌱", "🌿", "🌷", "🌸", "🌺"];

export function TapToGrow({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";

  const stages = useMemo(() => {
    const s = config.experience?.growStages?.length
      ? config.experience.growStages
      : theme.experienceDefaults?.growStages;
    return s && s.length > 0 ? s : DEFAULT_STAGES;
  }, [config.experience?.growStages, theme.experienceDefaults?.growStages]);

  const last = stages.length - 1;
  const [stage, setStage] = useState(0);
  const bloomed = stage >= last;

  // Auto-demo for gallery previews.
  useEffect(() => {
    if (!compact) return;
    const t = setInterval(() => {
      setStage((s) => (s >= last ? 0 : s + 1));
    }, 900);
    return () => clearInterval(t);
  }, [compact, last]);

  const firedRef = useRef(false);
  useEffect(() => {
    if (bloomed && !compact && !firedRef.current) {
      firedRef.current = true;
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloomed]);

  const grow = () => {
    if (compact || bloomed) return;
    triggerVibrate(30);
    setStage((s) => Math.min(last, s + 1));
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
        onClick={grow}
        disabled={compact || bloomed}
        className={clsx(
          "relative flex items-end justify-center my-4 rounded-3xl overflow-hidden",
          compact ? "w-24 h-24" : "w-44 h-44",
          !compact && !bloomed && "cursor-pointer active:scale-95 transition-transform"
        )}
        style={{ background: surface, border: `1.5px solid ${hairline}` }}
        aria-label="Tap to grow"
      >
        <motion.span
          key={stage}
          className={clsx("mb-3", compact ? "text-4xl" : "text-6xl")}
          style={{ display: "inline-block", lineHeight: 1 }}
          initial={{ scale: 0.6, y: 12, opacity: 0 }}
          animate={{ scale: bloomed ? [0.6, 1.4, 1.2] : 1, y: 0, opacity: 1 }}
          transition={{ duration: bloomed ? 0.6 : 0.35, ease: "easeOut" }}
        >
          {stages[Math.min(stage, last)]}
        </motion.span>
      </button>

      {!bloomed ? (
        !compact && (
          <>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--exp-accent)" }}>
              <Hand className="w-4 h-4" /> Tap to help it grow
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {stages.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all"
                  style={{ width: i <= stage ? 14 : 6, height: 6, background: i <= stage ? palette.accent : hairline }}
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

export default TapToGrow;
