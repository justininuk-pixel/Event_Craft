"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Brush } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { Contribution } from "@/lib/themes/types";

const hairline = "color-mix(in srgb, var(--exp-text) 14%, transparent)";
const boardBg = "color-mix(in srgb, var(--exp-text) 4%, transparent)";

// Deterministic pseudo-random so each mark keeps a stable scattered position.
function rand(n: number): number {
  const x = Math.sin(n * 99.13) * 10000;
  return x - Math.floor(x);
}

const DEMO = ["✏️", "❤️", "★", "🌈", "🙂"];

export function LiveCanvasBoard({ theme, config, mode, palette, contributions = [] }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";
  const marks = contributions.filter((c) => (c as { status?: string }).status !== "hidden");

  const placeStyle = (i: number): React.CSSProperties => ({
    position: "absolute",
    left: `${8 + rand(i * 2 + 1) * 64}%`,
    top: `${14 + rand(i * 2 + 2) * 62}%`,
    transform: `rotate(${(rand(i * 3 + 3) - 0.5) * 22}deg)`,
  });

  return (
    <div className={clsx("w-full h-full flex flex-col", compact ? "p-3" : "p-5")}>
      <header className="text-center shrink-0">
        <h1
          className={clsx("font-bold inline-flex items-center gap-2", compact ? "text-sm" : "text-xl sm:text-2xl")}
          style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
        >
          {!compact && <Brush className="w-5 h-5" style={{ color: "var(--exp-accent)" }} />}
          {config.title || theme.content.title}
        </h1>
        {!compact && (
          <p className="text-xs mt-1" style={{ color: "var(--exp-text-secondary)" }}>
            {marks.length > 0 ? `${marks.length} ${marks.length === 1 ? "mark" : "marks"} on the wall` : config.subtitle || "Everyone draws on one canvas"}
          </p>
        )}
      </header>

      <div
        className={clsx("relative flex-1 min-h-0 rounded-2xl overflow-hidden", compact ? "mt-2" : "mt-3")}
        style={{
          background: boardBg,
          border: `1px solid ${hairline}`,
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--exp-text) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--exp-text) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Demo marks for the gallery preview */}
        {compact &&
          DEMO.map((d, i) => (
            <motion.span
              key={i}
              className="absolute text-lg"
              style={placeStyle(i)}
              animate={{ scale: [0.8, 1.1, 0.9] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              {d}
            </motion.span>
          ))}

        {/* Real contributions scattered on the board */}
        {!compact && marks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <Brush className="w-8 h-8 mb-2" style={{ color: "var(--exp-accent)" }} />
            <p className="text-sm font-bold" style={{ color: "var(--exp-text)" }}>
              The canvas is empty
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--exp-text-secondary)" }}>
              Be the first to leave your mark ✏️
            </p>
          </div>
        )}

        {!compact && (
          <AnimatePresence>
            {marks.map((c: Contribution, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute w-[34%] max-w-[150px] flex flex-col items-center"
                style={placeStyle(i)}
              >
                {c.signature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.signature} alt={`${c.display_name}'s drawing`} className="w-full object-contain drop-shadow-sm" />
                ) : c.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo_url} alt={`From ${c.display_name}`} className="w-full rounded-lg object-cover drop-shadow-sm" />
                ) : (
                  <span
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-center shadow-sm"
                    style={{ background: "color-mix(in srgb, var(--exp-accent) 22%, white)", color: "#1f2937" }}
                  >
                    {c.message}
                  </span>
                )}
                <span
                  className="mt-0.5 text-[9px] font-bold px-1.5 rounded"
                  style={{ color: "var(--exp-text-secondary)" }}
                >
                  {c.display_name || "Someone"}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default LiveCanvasBoard;
