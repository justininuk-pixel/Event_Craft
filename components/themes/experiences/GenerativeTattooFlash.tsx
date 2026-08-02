"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Loader2, Sparkles } from "lucide-react";

// Map common words to a classic tattoo-flash symbol so the "sheet" reflects what was typed.
const SYMBOL_MAP: Record<string, string> = {
  heart: "❤", love: "❤", rose: "🌹", flower: "🌹", skull: "💀", death: "💀",
  star: "★", luck: "🍀", clover: "🍀", anchor: "⚓", sea: "⚓", snake: "🐍",
  dragon: "🐉", tiger: "🐯", eagle: "🦅", bird: "🕊", moon: "🌙", sun: "☀",
  dagger: "🗡", knife: "🗡", crown: "♛", king: "♛", queen: "♛", fire: "🔥",
  music: "♪", diamond: "◆", eye: "👁", butterfly: "🦋", wolf: "🐺", lion: "🦁",
};

function symbolFor(word: string, i: number): string {
  const key = word.trim().toLowerCase().split(/\s+/)[0];
  if (SYMBOL_MAP[key]) return SYMBOL_MAP[key];
  const fallback = ["★", "◆", "❦", "☘", "✦", "❂"];
  return fallback[i % fallback.length];
}

export function GenerativeTattooFlash({
  theme,
  config,
  palette,
}: ExperienceViewProps) {
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fdf8f5"];
  const [concepts, setConcepts] = useState(["", "", ""]);
  const [phase, setPhase] = useState<"design" | "inking" | "done">("design");

  const canGenerate = concepts.filter((c) => c.trim()).length >= 1;
  const filled = concepts.map((c, i) => (c.trim() ? c.trim() : ["Loyalty", "Forever", "Family"][i]));

  const handleGenerate = () => {
    if (!canGenerate || phase === "inking") return;
    setPhase("inking");
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => setPhase("done"), 1600);
  };

  const updateConcept = (index: number, value: string) => {
    const arr = [...concepts];
    arr[index] = value;
    setConcepts(arr);
  };

  const title = config.title || theme.content.title;

  return (
    <div
      className="w-full h-full relative flex flex-col font-serif overflow-hidden select-none bg-[#fdf8f5] text-[#2c2c2c]"
      style={{ backgroundColor: bgColors[0] }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply" />

      <div className="p-4 border-b-2 border-[#2c2c2c] flex justify-between items-center z-10 shrink-0">
        <h2 className="text-lg md:text-xl font-black uppercase tracking-[0.2em] flex items-center gap-2">
          <PenTool size={20} /> Tattoo Flash Studio
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative flex flex-col lg:flex-row gap-10">
        {/* Left: friendly designer */}
        <div className="flex-1 max-w-sm space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">Design their flash</h1>
            <p className="text-sm font-sans text-[#2c2c2c]/70 leading-relaxed">
              Type up to three things that remind you of them, a word, a symbol, an inside joke. We&apos;ll
              ink them onto a classic vintage flash sheet.
            </p>
          </div>

          <div className="space-y-4 bg-white border-2 border-[#2c2c2c] p-6 shadow-[8px_8px_0_#2c2c2c]">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                value={concepts[i]}
                onChange={(e) => updateConcept(i, e.target.value)}
                placeholder={`e.g. ${["Rose", "Anchor", "Lucky"][i]}`}
                className="w-full bg-transparent border-b-2 border-[#2c2c2c]/30 py-2 outline-none focus:border-[#2c2c2c] text-lg font-bold placeholder:font-normal placeholder:opacity-40 tracking-wider transition-colors"
              />
            ))}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || phase === "inking"}
              className="w-full mt-4 py-4 bg-[#2c2c2c] text-white hover:bg-black disabled:opacity-50 font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              {phase === "inking" ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {phase === "done" ? "Re-ink" : "Ink the sheet"}
            </button>
          </div>
        </div>

        {/* Right: the flash sheet */}
        <div className="flex-1 flex items-center justify-center min-h-[360px]">
          <AnimatePresence mode="wait">
            {phase === "design" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center opacity-30 flex flex-col items-center">
                <PenTool size={56} className="mb-4" />
                <div className="font-black uppercase tracking-[0.3em] text-sm">Your sheet appears here</div>
              </motion.div>
            )}

            {phase === "inking" && (
              <motion.div key="inking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 size={44} />
                </motion.div>
                <div className="mt-5 text-sm font-black uppercase tracking-[0.2em]">Inking…</div>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="sheet"
                initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="bg-white p-5 border-4 border-[#2c2c2c] shadow-[14px_14px_0_rgba(0,0,0,0.12)] w-full max-w-md"
              >
                <div className="border-2 border-[#2c2c2c] p-5">
                  {/* Banner with the card's title */}
                  <div className="text-center mb-5">
                    <div className="inline-block bg-[#2c2c2c] text-white px-4 py-1 text-xs font-black uppercase tracking-[0.25em] -rotate-1">
                      {title}
                    </div>
                  </div>
                  {/* The three flash pieces */}
                  <div className="grid grid-cols-3 gap-3">
                    {filled.map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 * i }}
                        className="flex flex-col items-center justify-center gap-2 border-2 border-[#2c2c2c] py-4 px-1 text-center"
                      >
                        <span className="text-4xl leading-none">{symbolFor(c, i)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest break-words">{c}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-5 text-center text-[9px] font-black uppercase tracking-[0.3em] opacity-60">
                    Hand-inked · One of one
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
