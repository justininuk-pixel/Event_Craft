"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

type MatchPair = {
  matchId: string;
  personLabel: string;
  objectLabel: string;
  memory: string;
};

const defaultPairs: MatchPair[] = [
  { matchId: "m1", personLabel: "Mom", objectLabel: "☕ Coffee Mug", memory: "Every morning, no matter what, she'd have her blue mug. 'Don't talk to me until I've finished this,' she'd say." },
  { matchId: "m2", personLabel: "Dad", objectLabel: "🔧 Wrench", memory: "He could fix anything. The car, the sink, a broken heart. Always with that rusty wrench in his back pocket." },
  { matchId: "m3", personLabel: "Grandpa", objectLabel: "📻 Radio", memory: "AM talk radio, always. He said it was the only honest medium left." },
  { matchId: "m4", personLabel: "Sister", objectLabel: "📖 Novel", memory: "She'd read under the covers with a flashlight until 2am. We shared a room. I pretended not to notice." },
];

type Card = {
  id: string;
  matchId: string;
  label: string;
  type: "person" | "object";
};

export function AssociativeMemoryMatch({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#6366f1";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1e1b4b"];

  const pairs: MatchPair[] = (config.experience as any)?.pairs || defaultPairs;
  const title = config.title || "Memory Match";

  // Build card deck
  const buildDeck = (): Card[] => {
    const deck: Card[] = [];
    pairs.forEach((p) => {
      deck.push({ id: `p-${p.matchId}`, matchId: p.matchId, label: p.personLabel, type: "person" });
      deck.push({ id: `o-${p.matchId}`, matchId: p.matchId, label: p.objectLabel, type: "object" });
    });
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [revealedMemory, setRevealedMemory] = useState<string | null>(null);

  const handleCardClick = (card: Card) => {
    if (flipped.length >= 2) return;
    if (flipped.includes(card.id)) return;
    if (matched.includes(card.matchId)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const first = cards.find((c) => c.id === newFlipped[0]);
      const second = cards.find((c) => c.id === newFlipped[1]);

      if (first && second && first.matchId === second.matchId && first.type !== second.type) {
        // Match!
        const pair = pairs.find((p) => p.matchId === first.matchId);
        setTimeout(() => {
          setMatched((prev) => [...prev, first.matchId]);
          setRevealedMemory(pair?.memory || null);
          setFlipped([]);
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([50, 50, 50]);
          if (matched.length + 1 === pairs.length && onComplete) setTimeout(onComplete, 3000);
        }, 600);
      } else {
        // No match
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isFlipped = (id: string) => flipped.includes(id);
  const isMatched = (matchId: string) => matched.includes(matchId);

  const cols = pairs.length <= 4 ? 4 : 5;

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none items-center" style={{ backgroundColor: bgColors[0] }}>

      <div className="pt-8 pb-4 text-center z-10">
        <h2 className="text-xl font-black text-white uppercase tracking-widest">{title}</h2>
        <p className="text-xs text-indigo-300/50 mt-1">Match each person to their object</p>
      </div>

      {/* Card Grid */}
      <div className={`grid grid-cols-${cols} gap-3 p-4 max-w-md w-full z-10`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card) => {
          const flippedState = isFlipped(card.id);
          const matchedState = isMatched(card.matchId);

          return (
            <motion.div
              key={card.id}
              className={`aspect-square rounded-lg cursor-pointer relative ${matchedState ? "opacity-30 pointer-events-none" : ""}`}
              style={{ perspective: "600px" }}
              onClick={() => handleCardClick(card)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flippedState || matchedState ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Card Back */}
                <div
                  className="absolute inset-0 rounded-lg flex items-center justify-center text-2xl shadow-lg border-2 border-indigo-500/30"
                  style={{ backfaceVisibility: "hidden", backgroundColor: primaryColor }}
                >
                  <span className="text-white/30 text-3xl">?</span>
                </div>

                {/* Card Front */}
                <div
                  className="absolute inset-0 rounded-lg flex items-center justify-center p-2 text-center shadow-lg border-2 border-white/20 bg-white"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-sm font-bold text-gray-800 leading-tight">{card.label}</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Memory reveal */}
      <AnimatePresence>
        {revealedMemory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-indigo-950/95 backdrop-blur-md border-t border-indigo-500/30 p-6"
          >
            <p className="text-indigo-200 text-sm leading-relaxed text-center max-w-sm mx-auto">{revealedMemory}</p>
            <button onClick={() => setRevealedMemory(null)} className="mt-3 text-xs text-indigo-400 underline block mx-auto">Continue</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score */}
      <div className="absolute top-4 right-4 z-20 text-xs text-indigo-300/50 font-mono">
        {matched.length}/{pairs.length}
      </div>
    </div>
  );
}
