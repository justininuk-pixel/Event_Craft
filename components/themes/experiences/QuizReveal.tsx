"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Check, X, Trophy } from "lucide-react";
import type { ExperienceViewProps } from "./ExperienceHost";
import type { QuizQuestion } from "@/lib/themes/types";
import { fireConfetti, toneIntensity } from "./celebrate";

const surface = "color-mix(in srgb, var(--exp-text) 7%, transparent)";
const hairline = "color-mix(in srgb, var(--exp-text) 16%, transparent)";

export function QuizReveal({ theme, config, mode, palette, tone, onComplete }: ExperienceViewProps) {
  const compact = mode === "gallery-mini";

  const questions: QuizQuestion[] = useMemo(
    () =>
      config.experience?.questions?.length
        ? config.experience.questions
        : theme.experienceDefaults?.questions ?? [],
    [config.experience?.questions, theme.experienceDefaults?.questions]
  );

  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Auto-demo for gallery: cycle questions showing the correct answer.
  useEffect(() => {
    if (!compact || total === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 1500);
    return () => clearInterval(t);
  }, [compact, total]);

  const q = questions[index];
  if (!q) return null;

  const choose = (i: number) => {
    if (compact || picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index < total - 1) {
      setIndex(index + 1);
      setPicked(null);
    } else if (!finished) {
      setFinished(true);
      fireConfetti([palette.primary, palette.accent, palette.secondary], toneIntensity(tone));
      onComplete?.();
    }
  };

  const remark = (pct: number) =>
    pct >= 0.99 ? "Perfect score! 🏆" : pct >= 0.6 ? "Pretty good! 😄" : "Room to study up 😅";

  if (finished) {
    const pct = total ? score / total : 0;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
        <Trophy className="w-10 h-10" style={{ color: "var(--exp-accent)" }} />
        <h1 className="font-bold text-2xl mt-3" style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}>
          You scored {score}/{total}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--exp-accent)" }}>{remark(pct)}</p>
        <p className="text-sm mt-4 leading-relaxed max-w-sm" style={{ color: "var(--exp-text-secondary)" }}>
          {config.body || theme.content.body}
        </p>
        {config.sender && (
          <p className="text-xs mt-3 font-semibold" style={{ color: "var(--exp-accent)" }}>— {config.sender}</p>
        )}
      </div>
    );
  }

  return (
    <div className={clsx("w-full h-full flex flex-col", compact ? "p-3" : "p-5 sm:p-6")}>
      <header className="text-center shrink-0">
        <h1
          className={clsx("font-bold", compact ? "text-sm" : "text-lg sm:text-xl")}
          style={{ fontFamily: "var(--exp-font-heading)", color: "var(--exp-text)" }}
        >
          {config.title || theme.content.title}
        </h1>
        {!compact && (
          <p className="text-[11px] mt-1 font-bold uppercase tracking-wider" style={{ color: "var(--exp-accent)" }}>
            Question {index + 1} of {total}
          </p>
        )}
      </header>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className={clsx("font-bold text-center mb-3", compact ? "text-[11px]" : "text-base")}
              style={{ color: "var(--exp-text)" }}
            >
              {q.q}
            </p>
            <div className={clsx("grid gap-2", compact ? "" : "grid-cols-1")}>
              {q.options.map((opt, i) => {
                const isCorrect = i === q.answer;
                const isPicked = picked === i;
                const reveal = picked !== null || (compact && true);
                const showCorrect = reveal && isCorrect;
                const showWrong = reveal && isPicked && !isCorrect;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={compact || picked !== null}
                    className={clsx(
                      "rounded-xl text-left transition-all flex items-center justify-between gap-2",
                      compact ? "px-2 py-1 text-[9px]" : "px-4 py-3 text-sm",
                      !compact && picked === null && "cursor-pointer hover:-translate-y-0.5"
                    )}
                    style={{
                      background: showCorrect
                        ? "color-mix(in srgb, #22c55e 22%, transparent)"
                        : showWrong
                        ? "color-mix(in srgb, #ef4444 22%, transparent)"
                        : surface,
                      border: `1px solid ${showCorrect ? "#22c55e" : showWrong ? "#ef4444" : hairline}`,
                      color: "var(--exp-text)",
                    }}
                  >
                    <span>{opt}</span>
                    {showCorrect && <Check className={compact ? "w-2.5 h-2.5" : "w-4 h-4"} style={{ color: "#22c55e" }} />}
                    {showWrong && <X className={compact ? "w-2.5 h-2.5" : "w-4 h-4"} style={{ color: "#ef4444" }} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {!compact && (
        <footer className="shrink-0 h-10 flex items-center justify-center">
          {picked !== null && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              type="button"
              onClick={next}
              className="px-5 py-2 rounded-full text-sm font-bold cursor-pointer"
              style={{ background: palette.primary, color: "#fff" }}
            >
              {index < total - 1 ? "Next question →" : "See result →"}
            </motion.button>
          )}
        </footer>
      )}
    </div>
  );
}

export default QuizReveal;
