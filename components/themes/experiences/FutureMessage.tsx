"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Lock, LockOpen, Eye } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import { fireConfetti, toneIntensity } from "./celebrate";

const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";
const surface = "color-mix(in srgb, var(--exp-text) 8%, transparent)";
const cellTint = "color-mix(in srgb, var(--exp-primary) 22%, transparent)";

function remainingParts(target: number, now: number) {
  const total = Math.max(0, target - now);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { total, days, hours, minutes, seconds };
}

export function FutureMessage({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const isEditor = mode === "editor-preview";

  // Resolve the unlock target. Empty/invalid date falls back to a demo target so
  // previews always show an enticing countdown; a real recipient with no date set
  // simply sees the message immediately.
  // Stable mount timestamp (lazy initializer runs once, off the render path).
  const mountNow = Date.now();
  const [now, setNow] = useState(() => Date.now());
  const [peek, setPeek] = useState(false); // editor-only "preview the reveal"

  const { target, isDemo } = useMemo(() => {
    const raw = config.experience?.unlockDate?.trim();
    const parsed = raw ? new Date(raw).getTime() : NaN;
    if (raw && !Number.isNaN(parsed)) return { target: parsed, isDemo: false };
    if (compact || isEditor) return { target: mountNow + 1000 * 60 * 60 * 50, isDemo: true };
    return { target: 0, isDemo: false }; // no date in full view → unlocked now
  }, [config.experience?.unlockDate, compact, isEditor, mountNow]);

  const live = remainingParts(target, now);
  const naturallyUnlocked = live.total <= 0 && !isDemo;
  const unlocked = naturallyUnlocked || (peek && isEditor);

  // Tick once a second while still sealed (covers both demo and real countdowns).
  useEffect(() => {
    if (unlocked) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [unlocked]);

  useEffect(() => {
    if (naturallyUnlocked) {
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturallyUnlocked]);

  const teaser = config.experience?.teaser || theme.experienceDefaults?.teaser || "A message is waiting for you.";

  const cells = [
    { label: "Days", val: live.days },
    { label: "Hrs", val: live.hours },
    { label: "Min", val: live.minutes },
    { label: "Sec", val: live.seconds },
  ];

  return (
    <div className={clsx("w-full h-full flex flex-col items-center justify-center text-center", compact ? "p-3" : "p-6")}>
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div
            key="sealed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex flex-col items-center w-full"
          >
            {/* Sealed vault */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className={clsx("rounded-2xl flex items-center justify-center", compact ? "w-10 h-10" : "w-16 h-16")}
              style={{ background: cellTint, border: `1.5px solid ${palette.accent}` }}
            >
              <Lock className={compact ? "w-4 h-4" : "w-7 h-7"} style={{ color: "var(--exp-accent)" }} />
            </motion.div>

            <h1
              className={clsx("font-bold", compact ? "text-sm mt-2" : "text-2xl sm:text-3xl mt-4")}
              style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
            >
              {config.title || theme.content.title}
            </h1>
            {!compact && (
              <p className="text-sm mt-2 max-w-xs" style={{ color: "var(--exp-text-secondary)" }}>
                {teaser}
              </p>
            )}

            {/* Countdown */}
            <div className={clsx("grid grid-cols-4", compact ? "gap-1.5 mt-3" : "gap-2.5 mt-6")}>
              {cells.map((c) => (
                <div
                  key={c.label}
                  className={clsx("rounded-xl flex flex-col items-center", compact ? "px-1.5 py-1" : "px-3 py-2.5 min-w-[58px]")}
                  style={{ background: surface, border: `1px solid ${hairline}` }}
                >
                  <span
                    className={clsx("font-bold tabular-nums", compact ? "text-xs" : "text-2xl")}
                    style={{ color: "var(--exp-text)", fontFamily: "var(--exp-font-heading)" }}
                  >
                    {String(c.val).padStart(2, "0")}
                  </span>
                  <span
                    className={clsx("uppercase tracking-wider", compact ? "text-[7px]" : "text-[10px] mt-1")}
                    style={{ color: "var(--exp-text-secondary)" }}
                  >
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            {isDemo && !compact && (
              <p className="text-[11px] mt-4 opacity-70" style={{ color: "var(--exp-text-secondary)" }}>
                Demo countdown, set the unlock date in the editor.
              </p>
            )}

            {isEditor && (
              <button
                type="button"
                onClick={() => setPeek(true)}
                className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                style={{ background: surface, border: `1px solid ${hairline}`, color: "var(--exp-text-secondary)" }}
              >
                <Eye className="w-3.5 h-3.5" /> Preview the reveal
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full max-w-md"
          >
            <div
              className={clsx("rounded-2xl flex items-center justify-center", compact ? "w-10 h-10" : "w-16 h-16")}
              style={{ background: cellTint, border: `1.5px solid ${palette.accent}` }}
            >
              <LockOpen className={compact ? "w-4 h-4" : "w-7 h-7"} style={{ color: "var(--exp-accent)" }} />
            </div>

            {config.recipient && !compact && (
              <p className="uppercase tracking-[0.3em] text-[11px] mt-4 opacity-70" style={{ color: "var(--exp-text-secondary)" }}>
                For {config.recipient}
              </p>
            )}
            <h1
              className={clsx("font-bold", compact ? "text-sm mt-2" : "text-2xl sm:text-3xl mt-1")}
              style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
            >
              {config.title || theme.content.title}
            </h1>
            {!compact && (
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--exp-text-secondary)" }}>
                {config.body || theme.content.body}
              </p>
            )}
            {config.sender && !compact && (
              <p className="text-xs mt-4 font-semibold" style={{ color: "var(--exp-accent)" }}>
               , {config.sender}
              </p>
            )}

            {isEditor && peek && (
              <button
                type="button"
                onClick={() => setPeek(false)}
                className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                style={{ background: surface, border: `1px solid ${hairline}`, color: "var(--exp-text-secondary)" }}
              >
                <Lock className="w-3.5 h-3.5" /> Back to sealed
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FutureMessage;
