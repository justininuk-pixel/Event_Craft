"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { ScratchReveal } from "../engines/ScratchReveal";
import { audioManager } from "../../../lib/audio/manager";
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

export function ScratchToReveal({
  yesText = "Absolutely Yes!",
  noText = "No...",
  promptText = "Will you marry me? 💖",
  onYes,
  palette,
}: InteractiveProps) {
  const toast = useToast();
  const [noCount, setNoCount] = useState(0);

  const handleRevealed = () => {
    triggerVibrate([100, 50, 100]);
    audioManager.playSfx("/sfx/confetti-pop.mp3");

    // Burst confetti
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleNoClick = () => {
    triggerVibrate(60);
    setNoCount((c) => c + 1);
    toast.warning("Incorrect answer! Please select the primary button. 😉");
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-4 rounded-2xl shadow-xl relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[350px] flex items-center justify-center"
    >
      <ScratchReveal
        scratchColor="gold"
        revealThreshold={0.55} // 55% to 60% threshold
        onRevealed={handleRevealed}
        className="w-full h-full min-h-[300px] flex flex-col items-center justify-center rounded-xl overflow-hidden"
      >
        {/* Hidden Content Revealed Underneath */}
        <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full">
          <h3
            className="text-xl md:text-2xl font-black mb-10 select-none"
            style={{ color: palette.text }}
          >
            {promptText}
          </h3>

          <div className="flex flex-row items-center justify-center gap-6 w-full z-20 pointer-events-auto">
            {/* YES BUTTON */}
            <button
              onClick={onYes}
              className="px-6 py-3 rounded-full font-bold text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition"
              style={{
                backgroundColor: palette.primary,
              }}
            >
              {yesText}
            </button>

            {/* NO BUTTON */}
            <button
              onClick={handleNoClick}
              className="px-6 py-3 rounded-full font-bold text-white shadow-md cursor-pointer hover:scale-95 active:scale-90 transition opacity-80"
              style={{
                backgroundColor: palette.secondary,
              }}
            >
              {noText} {noCount > 0 && `(${noCount})`}
            </button>
          </div>
        </div>
      </ScratchReveal>
    </div>
  );
}

export default ScratchToReveal;
