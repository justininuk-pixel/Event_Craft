"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { triggerVibrate } from "../../../lib/utils/device";

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

export function ShrinkingNo({
  yesText = "Yes",
  noText = "No",
  promptText = "Will you be my Valentine? 🌹",
  onYes,
  palette,
}: InteractiveProps) {
  const [noScale, setNoScale] = useState(1.0);
  const [yesScale, setYesScale] = useState(1.0);
  const [clickCount, setClickCount] = useState(0);

  const shrinkNo = () => {
    triggerVibrate(60);
    setClickCount((c) => c + 1);

    // Halve the scale of No, limit to 0.01
    setNoScale((s) => Math.max(s * 0.5, 0.01));

    // Grow Yes, cap at 3.0
    setYesScale((s) => Math.min(s + 0.25, 3.0));
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[300px]"
    >
      <h3
        className="text-xl md:text-2xl font-black text-center mb-8 select-none px-4"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      <div className="flex flex-row items-center justify-center gap-6 w-full relative min-h-[120px]">
        {/* YES BUTTON (Grows up to 3x) */}
        <motion.button
          onClick={onYes}
          className="px-8 py-3 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-pointer z-10 select-none"
          style={{
            backgroundColor: palette.primary,
            fontSize: "16px",
          }}
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          whileHover={{ scale: yesScale * 1.05 }}
          whileTap={{ scale: yesScale * 0.95 }}
        >
          {yesText}
        </motion.button>

        {/* NO BUTTON (Shrinks down to 0.01) */}
        {noScale > 0.015 && (
          <motion.button
            onClick={shrinkNo}
            onMouseEnter={shrinkNo}
            className="px-6 py-3 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-pointer select-none"
            style={{
              backgroundColor: palette.secondary,
              fontSize: "16px",
            }}
            animate={{ scale: noScale }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            whileTap={{ scale: noScale * 0.9 }}
          >
            {noText}
          </motion.button>
        )}
      </div>

      {clickCount > 0 && (
        <span className="text-[10px] opacity-40 absolute bottom-4 text-center select-none font-medium">
          Dodge attempts: {clickCount} | {noScale <= 0.015 ? "Resistance is futile! 😈" : "Catch it if you can!"}
        </span>
      )}
    </div>
  );
}

export default ShrinkingNo;
