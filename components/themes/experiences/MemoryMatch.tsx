"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { ExperienceViewProps } from "./ExperienceHost";
import { fireConfetti, toneIntensity } from "./celebrate";
import { triggerVibrate } from "@/lib/utils/device";

const surface = "color-mix(in srgb, var(--exp-text) 7%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

const POOL = ["🎉", "🎂", "🎈", "🎁", "⭐", "❤️", "🌟", "🍰"];

interface Card {
  id: number;
  key: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MemoryMatch({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const pairs = Math.max(3, Math.min(8, config.experience?.matchPairs ?? theme.experienceDefaults?.matchPairs ?? 4));

  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Build + shuffle deck off the render path.
  useEffect(() => {
    const picks = POOL.slice(0, pairs);
    const cards = shuffle([...picks, ...picks].map((key, id) => ({ id, key })));
    setDeck(cards);
    setFlipped([]);
    setMatched(new Set());
  }, [pairs]);

  const allMatched = deck.length > 0 && matched.size >= deck.length;

  useEffect(() => {
    if (allMatched && !compact) {
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  // Auto-demo for gallery previews: flip cards over progressively, then reset.
  useEffect(() => {
    if (!compact || deck.length === 0) return;
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      if (i > deck.length) {
        i = 0;
        setMatched(new Set());
      } else {
        setMatched(new Set(deck.slice(0, i).map((c) => c.id)));
      }
    }, 700);
    return () => clearInterval(t);
  }, [compact, deck]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clickCard = (i: number) => {
    if (compact || busy.current || matched.has(i) || flipped.includes(i) || flipped.length === 2) return;
    triggerVibrate(20);
    const nf = [...flipped, i];
    setFlipped(nf);
    if (nf.length === 2) {
      busy.current = true;
      const same = deck[nf[0]].key === deck[nf[1]].key;
      timers.current.push(
        setTimeout(
          () => {
            if (same) {
              setMatched((m) => {
                const n = new Set(m);
                n.add(nf[0]);
                n.add(nf[1]);
                return n;
              });
            }
            setFlipped([]);
            busy.current = false;
          },
          same ? 350 : 800
        )
      );
    }
  };

  const cols = deck.length <= 6 ? 3 : 4;

  return (
    <div className={clsx("w-full h-full flex flex-col items-center justify-center", compact ? "p-2" : "p-5")}>
      <h1
        className={clsx("font-bold text-center", compact ? "text-sm" : "text-xl sm:text-2xl")}
        style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
      >
        {config.title || theme.content.title}
      </h1>

      {!allMatched ? (
        <>
          {!compact && (
            <p className="text-xs mt-1 mb-3" style={{ color: "var(--exp-text-secondary)" }}>
              Match every pair to reveal your message
            </p>
          )}
          <div
            className={clsx("grid", compact ? "gap-1 mt-2" : "gap-2 mt-1")}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {deck.map((card, i) => {
              const faceUp = flipped.includes(i) || matched.has(i);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => clickCard(i)}
                  disabled={compact}
                  className={clsx(
                    "rounded-lg flex items-center justify-center transition-transform",
                    compact ? "w-7 h-7 text-base" : "w-12 h-12 sm:w-14 sm:h-14 text-2xl",
                    !compact && !faceUp && "cursor-pointer active:scale-95"
                  )}
                  style={{
                    background: faceUp ? surface : `color-mix(in srgb, ${palette.primary} 30%, transparent)`,
                    border: `1.5px solid ${faceUp ? palette.accent : hairline}`,
                    opacity: matched.has(i) ? 0.55 : 1,
                  }}
                  aria-label={faceUp ? card.key : "Hidden card"}
                >
                  {faceUp ? card.key : ""}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm px-2 mt-3 text-center">
          <span className={compact ? "text-2xl" : "text-4xl"}>🎉</span>
          {!compact && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--exp-text-secondary)" }}>
              {config.body || theme.content.body}
            </p>
          )}
          {config.sender && !compact && (
            <p className="text-xs mt-3 font-semibold" style={{ color: "var(--exp-accent)" }}>
              — {config.sender}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default MemoryMatch;
