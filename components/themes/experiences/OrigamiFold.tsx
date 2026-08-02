"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

export function OrigamiFold({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [step, setStep] = useState(0);

  const handleTap = () => {
    if (step < 2) {
      setStep(s => s + 1);
    } else if (step === 2) {
      setStep(3);
      onComplete?.();
    }
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] flex items-center justify-center p-4 cursor-pointer"
      onClick={handleTap}
      style={{ perspective: 1200 }}
    >
      <div className="relative w-full max-w-sm aspect-[3/4]" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Background / Inner Content (The actual letter) */}
        <motion.div 
          className="absolute inset-0 bg-white shadow-2xl p-8 flex flex-col items-center justify-center text-center rounded-sm z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: step >= 2 ? 0 : 20, opacity: step >= 1 ? 1 : 0, scale: step >= 2 ? 1.05 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Memory" 
              className="w-32 h-32 object-cover rounded-md shadow-md mb-6"
            />
          )}
          <h1 className="text-3xl font-heading mb-4 text-black">
            {config.title}
          </h1>
          <p className="text-md font-body text-gray-800 whitespace-pre-wrap">
            {config.body}
          </p>
        </motion.div>

        {/* Bottom Flap (Folds down) */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-[50%] origin-bottom z-20 flex items-end justify-center pb-4 text-white/50 border-t border-black/10 shadow-lg"
          style={{ 
            backgroundColor: palette.primary as string,
            backfaceVisibility: 'hidden',
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: step >= 2 ? -179 : 0 }} // 179 to prevent clipping
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>

        {/* Top Flap (Folds up) */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-[55%] origin-top z-30 flex items-start justify-center pt-12 shadow-2xl border-b border-black/20"
          style={{ 
            backgroundColor: palette.secondary as string,
            backfaceVisibility: 'hidden',
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: step >= 1 ? 179 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <p className="font-heading text-2xl text-[var(--exp-background)] drop-shadow-md">
            {step === 0 ? "Tap to open..." : ""}
          </p>
        </motion.div>

      </div>
    </div>
  );
}
