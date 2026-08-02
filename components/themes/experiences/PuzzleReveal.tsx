"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Delete, RotateCcw, Lightbulb, PartyPopper } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import { fireConfetti, toneIntensity } from "./celebrate";

const hairline = "color-mix(in srgb, var(--exp-text) 18%, transparent)";
const surface = "color-mix(in srgb, var(--exp-text) 8%, transparent)";
const tileTint = "color-mix(in srgb, var(--exp-primary) 28%, transparent)";
const slotTint = "color-mix(in srgb, var(--exp-text) 5%, transparent)";

interface Tile {
  id: number;
  char: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PuzzleReveal({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";

  const answer = (
    config.experience?.puzzleAnswer ||
    theme.experienceDefaults?.puzzleAnswer ||
    "CELEBRATE"
  )
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const prompt =
    config.experience?.puzzlePrompt ||
    theme.experienceDefaults?.puzzlePrompt ||
    "Unscramble the word";
  const hint = config.experience?.puzzleHint || theme.experienceDefaults?.puzzleHint;

  const [placed, setPlaced] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>([]);

  // Shuffle off the render path (Math.random is impure during render). Reshuffles
  // and resets whenever the answer changes (e.g. the creator edits it).
  useEffect(() => {
    const base = answer.split("").map((char, id) => ({ id, char }));
    let s = shuffle(base);
    if (s.map((t) => t.char).join("") === answer && base.length > 1) s = shuffle(base);
    setTiles(s);
    setPlaced([]);
    setSolved(false);
  }, [answer]);

  const placedSet = useMemo(() => new Set(placed), [placed]);
  const assembled = placed.map((id) => tiles.find((t) => t.id === id)?.char ?? "").join("");

  // Auto-demo loop for gallery previews.
  useEffect(() => {
    if (!compact) return;
    let n = 0;
    const t = setInterval(() => {
      n = (n + 1) % (answer.length + 3);
      if (n <= answer.length) setPlaced(tiles.slice(0, n).map((tl) => tl.id));
      setSolved(n === answer.length);
    }, 650);
    return () => clearInterval(t);
  }, [compact, answer.length, tiles]);

  useEffect(() => {
    if (compact || solved) return;
    if (placed.length === answer.length && answer.length > 0) {
      if (assembled === answer) {
        setSolved(true);
        fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
        onComplete?.();
      } else {
        setWrong(true);
        const t = setTimeout(() => {
          setWrong(false);
          setPlaced([]);
        }, 750);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed]);

  const tapTile = (id: number) => {
    if (compact || solved || placedSet.has(id)) return;
    setPlaced((p) => [...p, id]);
  };
  const backspace = () => !compact && setPlaced((p) => p.slice(0, -1));
  const reset = () => !compact && setPlaced([]);

  return (
    <div className={clsx("w-full h-full flex flex-col items-center justify-center text-center", compact ? "p-3" : "p-6")}>
      <AnimatePresence mode="wait">
        {!solved ? (
          <motion.div key="puzzle" exit={{ opacity: 0, scale: 0.96 }} className="w-full flex flex-col items-center">
            <h1
              className={clsx("font-bold", compact ? "text-sm" : "text-xl sm:text-2xl")}
              style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
            >
              {config.title || theme.content.title}
            </h1>
            {!compact && (
              <p className="text-xs mt-1.5 max-w-xs" style={{ color: "var(--exp-text-secondary)" }}>
                {prompt}
              </p>
            )}

            {/* Answer slots */}
            <motion.div
              animate={wrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
              transition={{ duration: 0.45 }}
              className={clsx("flex flex-wrap justify-center", compact ? "gap-1 mt-2" : "gap-1.5 mt-5")}
            >
              {answer.split("").map((_, i) => {
                const id = placed[i];
                const char = id !== undefined ? tiles.find((t) => t.id === id)?.char ?? "" : "";
                return (
                  <div
                    key={i}
                    className={clsx("rounded-lg flex items-center justify-center font-bold", compact ? "w-4 h-5 text-[9px]" : "w-8 h-10 text-lg")}
                    style={{
                      background: char ? tileTint : slotTint,
                      border: `1.5px solid ${wrong ? "#ef4444" : char ? palette.accent : hairline}`,
                      color: "var(--exp-text)",
                      fontFamily: "var(--exp-font-heading)",
                    }}
                  >
                    {char}
                  </div>
                );
              })}
            </motion.div>

            {/* Tile pool */}
            <div className={clsx("flex flex-wrap justify-center", compact ? "gap-1 mt-2" : "gap-1.5 mt-5 max-w-xs")}>
              {tiles.map((t) => {
                const used = placedSet.has(t.id);
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    onClick={() => tapTile(t.id)}
                    disabled={compact || used}
                    whileTap={{ scale: 0.9 }}
                    className={clsx(
                      "rounded-lg flex items-center justify-center font-bold transition-opacity",
                      compact ? "w-4 h-5 text-[9px]" : "w-8 h-10 text-lg",
                      !compact && !used && "cursor-pointer"
                    )}
                    style={{
                      background: surface,
                      border: `1.5px solid ${hairline}`,
                      color: "var(--exp-text)",
                      fontFamily: "var(--exp-font-heading)",
                      opacity: used ? 0.25 : 1,
                    }}
                  >
                    {t.char}
                  </motion.button>
                );
              })}
            </div>

            {/* Controls */}
            {!compact && (
              <div className="flex items-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={backspace}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                  style={{ background: surface, border: `1px solid ${hairline}`, color: "var(--exp-text-secondary)" }}
                >
                  <Delete className="w-3.5 h-3.5" /> Undo
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                  style={{ background: surface, border: `1px solid ${hairline}`, color: "var(--exp-text-secondary)" }}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                {hint && (
                  <button
                    type="button"
                    onClick={() => setShowHint((s) => !s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                    style={{ background: surface, border: `1px solid ${hairline}`, color: "var(--exp-accent)" }}
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Hint
                  </button>
                )}
              </div>
            )}

            <AnimatePresence>
              {showHint && hint && !compact && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs mt-3 italic"
                  style={{ color: "var(--exp-text-secondary)" }}
                >
                  {hint}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center max-w-md"
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 0.6 }}
              className={compact ? "text-2xl" : "text-4xl"}
            >
              <PartyPopper style={{ color: "var(--exp-accent)" }} className={compact ? "w-6 h-6" : "w-10 h-10"} />
            </motion.span>
            <h1
              className={clsx("font-bold", compact ? "text-sm mt-2" : "text-2xl mt-3")}
              style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
            >
              {compact ? answer : config.title || theme.content.title}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PuzzleReveal;
