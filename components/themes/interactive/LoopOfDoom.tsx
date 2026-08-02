"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerVibrate } from "../../../lib/utils/device";
import { useToast } from "../../../components/ui/ToastQueue";

interface InteractiveProps {
  yesText?: string;
  noText?: string;
  promptText?: string;
  onYes: () => void;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string | string[];
    text: string;
    textSecondary: string;
  };
}

export function LoopOfDoom({
  yesText = "Yes",
  noText = "No",
  promptText = "Will you go on a date with me? 🍕",
  onYes,
  palette,
}: InteractiveProps) {
  const toast = useToast();
  const [step, setStep] = useState<number>(0); // 0 = main decision, 1 to 5 = loop steps
  const [sliderValue, setSliderValue] = useState<number>(50);
  const [captchaAnswer, setCaptchaAnswer] = useState<boolean[]>([false, false, false, false]);
  const [essayText, setEssayText] = useState("");
  const [mathTimer, setMathTimer] = useState(5);
  const [mathAnswer, setMathAnswer] = useState("");
  const [progress, setProgress] = useState(0);

  // Timer for Step 4 (Math Quiz)
  useEffect(() => {
    if (step !== 4) return;

    const interval = setInterval(() => {
      setMathTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          triggerVibrate(150);
          setStep(1); // Reset to Step 1 on timeout
          return 5;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Loading progress bar for Step 5
  useEffect(() => {
    if (step !== 5) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          clearInterval(interval);
          setTimeout(() => {
            // Trigger Reset Error
            triggerVibrate(200);
            toast.error("Error: Connection timed out. Please try again.");
            setStep(1); // Reset loop
          }, 1500);
          return 92; // Stall at 92%
        }
        return p + Math.random() * 8;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step, toast]);

  const startDoom = () => {
    triggerVibrate(80);
    setStep(1);
  };

  const handleSliderSubmit = () => {
    if (sliderValue === 73) {
      setStep(2);
    } else {
      triggerVibrate(80);
      toast.warning("Error: Value must be exactly 73%!");
    }
  };

  const handleCaptchaSubmit = () => {
    // Correct indices: 0 and 2 (smiling cats)
    if (captchaAnswer[0] && !captchaAnswer[1] && captchaAnswer[2] && !captchaAnswer[3]) {
      setStep(3);
    } else {
      triggerVibrate(80);
      toast.warning("Incorrect! Select all smiling cats.");
      setCaptchaAnswer([false, false, false, false]);
    }
  };

  const handleEssaySubmit = () => {
    const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 200) {
      setMathTimer(5);
      setStep(4);
    } else {
      triggerVibrate(80);
      toast.warning(`Essay is too short! Current words: ${wordCount}/200`);
    }
  };

  const handleMathSubmit = () => {
    // 423 * 7 + 12 = 2961 + 12 = 2973
    if (mathAnswer === "2973") {
      setProgress(0);
      setStep(5);
    } else {
      triggerVibrate(80);
      toast.error("Incorrect math answer! Resetting request...");
      setStep(1);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[420px]"
    >
      {/* Subtle Bypassing YES Button (Always accessible to save the user) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={onYes}
          className="text-[10px] font-bold opacity-40 hover:opacity-100 transition-opacity pointer-events-auto cursor-pointer"
          style={{ color: palette.text }}
        >
          Skip and {yesText} ➔
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Main screen */}
        {step === 0 && (
          <motion.div
            key="step0"
            className="flex flex-col items-center justify-center h-full w-full pt-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3
              className="text-xl md:text-2xl font-black text-center mb-10 px-4"
              style={{ color: palette.text }}
            >
              {promptText}
            </h3>

            <div className="flex gap-4">
              <button
                onClick={onYes}
                className="px-6 py-3 rounded-full font-bold text-white shadow-md bg-emerald-600 hover:bg-emerald-500 cursor-pointer pointer-events-auto select-none"
                style={{ backgroundColor: palette.primary }}
              >
                {yesText}
              </button>
              <button
                onClick={startDoom}
                className="px-6 py-3 rounded-full font-bold text-white shadow-md bg-rose-600 hover:bg-rose-500 cursor-pointer pointer-events-auto select-none"
                style={{ backgroundColor: palette.secondary }}
              >
                {noText}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Slider */}
        {step === 1 && (
          <motion.div
            key="step1"
            className="flex flex-col items-center justify-center w-full h-full pt-8 text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h4 className="font-bold text-md mb-2">Step 1: Calibration</h4>
            <p className="text-xs text-zinc-400 mb-6 px-4">Set slider to EXACTLY 73% to submit your No response.</p>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-4/5 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-2 min-h-[48px]"
            />
            <span className="text-xl font-mono font-bold mb-6">{sliderValue}%</span>
            <button
              onClick={handleSliderSubmit}
              className="px-5 py-2.5 rounded-full font-bold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 min-h-[48px] cursor-pointer"
            >
              Verify Value
            </button>
          </motion.div>
        )}

        {/* Step 2: Captcha */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="flex flex-col items-center justify-center w-full h-full pt-8 text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h4 className="font-bold text-md mb-1">Step 2: Human Verification</h4>
            <p className="text-xs text-zinc-400 mb-4">Select all images with SMILING CATS.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { emoji: "🐱", label: "Smiling Cat" },
                { emoji: "🐶", label: "Puppy" },
                { emoji: "😸", label: "Grinning Cat" },
                { emoji: "🦁", label: "Lion" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const next = [...captchaAnswer];
                    next[idx] = !next[idx];
                    setCaptchaAnswer(next);
                  }}
                  className={`w-24 h-24 text-4xl flex items-center justify-center border-2 rounded-xl transition duration-200 min-h-[48px] cursor-pointer ${
                    captchaAnswer[idx]
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-700 bg-zinc-800"
                  }`}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
            <button
              onClick={handleCaptchaSubmit}
              className="px-5 py-2.5 rounded-full font-bold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 min-h-[48px] cursor-pointer"
            >
              Submit CAPTCHA
            </button>
          </motion.div>
        )}

        {/* Step 3: Essay */}
        {step === 3 && (
          <motion.div
            key="step3"
            className="flex flex-col items-center justify-center w-full h-full pt-8 text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h4 className="font-bold text-md mb-2">Step 3: Intent Essay</h4>
            <p className="text-xs text-zinc-400 mb-4">Write a 200-word essay explaining your motives.</p>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Start writing..."
              className="w-11/12 h-28 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs mb-3 text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[10px] text-zinc-500 mb-4 font-mono">
              Word count: {essayText.trim().split(/\s+/).filter(Boolean).length}/200
            </span>
            <button
              onClick={handleEssaySubmit}
              className="px-5 py-2.5 rounded-full font-bold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 min-h-[48px] cursor-pointer"
            >
              Verify Essay
            </button>
          </motion.div>
        )}

        {/* Step 4: Math Quiz */}
        {step === 4 && (
          <motion.div
            key="step4"
            className="flex flex-col items-center justify-center w-full h-full pt-8 text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h4 className="font-bold text-md mb-1">Step 4: Math Verification</h4>
            <p className="text-xs text-rose-400 font-bold mb-4 animate-pulse">TIMEOUT RESET IN: {mathTimer}s</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-4 font-mono text-lg font-bold w-11/12">
              423 * 7 + 12 = ?
            </div>
            <input
              type="text"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              placeholder="Your answer"
              className="w-11/12 bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-center text-sm mb-4 text-white focus:outline-none focus:border-rose-500 min-h-[48px]"
            />
            <button
              onClick={handleMathSubmit}
              className="px-5 py-2.5 rounded-full font-bold text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 min-h-[48px] cursor-pointer"
            >
              Verify Result
            </button>
          </motion.div>
        )}

        {/* Step 5: Loading Bar */}
        {step === 5 && (
          <motion.div
            key="step5"
            className="flex flex-col items-center justify-center w-full h-full pt-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h4 className="font-bold text-md mb-2">Step 5: Processing Request</h4>
            <p className="text-[11px] text-zinc-400 mb-6">Saving No choice... Time remaining: 47 years.</p>
            <div className="w-11/12 h-4 bg-zinc-800 border border-zinc-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-zinc-400">{Math.round(progress)}% completed</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LoopOfDoom;
