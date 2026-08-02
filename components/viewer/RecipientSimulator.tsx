"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Eye } from "lucide-react";
import { Theme, CardConfig, DeliveryStyle } from "@/lib/themes/types";
import { ThemeStage } from "@/components/themes/renders/ThemeStage";
import { DeliveryRenderer } from "./DeliveryRenderer";
import { SurpriseGate } from "./SurpriseGate";

type Phase = "surprise" | "delivery" | "reveal";

interface RecipientSimulatorProps {
  theme: Theme;
  config: CardConfig;
  open: boolean;
  onClose: () => void;
}

function firstPhase(config: CardConfig): Phase {
  if (config.surpriseMode) return "surprise";
  if (config.deliveryStyle && config.deliveryStyle !== "none") return "delivery";
  return "reveal";
}

/**
 * Plays the full recipient journey (surprise gate → delivery → card reveal) using
 * the live editor config, without saving, so a creator can experience exactly
 * what the recipient will see before sharing.
 */
export function RecipientSimulator({ theme, config, open, onClose }: RecipientSimulatorProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("reveal");

  useEffect(() => setMounted(true), []);

  // Restart the journey from the top each time the simulator is opened.
  useEffect(() => {
    if (open) setPhase(firstPhase(config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Allow Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const deliveryStyle = (config.deliveryStyle || "none") as DeliveryStyle;
  const afterSurprise = () => setPhase(deliveryStyle !== "none" ? "delivery" : "reveal");
  const replay = () => setPhase(firstPhase(config));

  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      {/* Header controls */}
      <div className="w-full max-w-[340px] flex items-center justify-between mb-3 text-zinc-300">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Recipient preview
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[320px] aspect-[9/18] max-h-[80vh] relative shadow-2xl rounded-[44px] overflow-hidden border-[8px] border-[#18181b] bg-black ring-1 ring-white/10"
      >
        <AnimatePresence mode="wait">
          {phase === "surprise" && (
            <motion.div key="surprise" exit={{ opacity: 0 }} className="absolute inset-0">
              <SurpriseGate sender={config.sender} palette={config.palette} onOpen={afterSurprise} />
            </motion.div>
          )}
          {phase === "delivery" && (
            <motion.div key="delivery" className="absolute inset-0">
              <DeliveryRenderer
                style={deliveryStyle}
                palette={config.palette}
                onComplete={() => setPhase("reveal")}
              />
            </motion.div>
          )}
          {phase === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              <ThemeStage theme={theme} config={config} mode="full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-3 text-[11px] text-zinc-500 max-w-[320px] text-center">
        This is a simulation, nothing is saved. Tap Replay to watch the journey again.
      </p>
    </div>,
    document.body
  );
}

export default RecipientSimulator;
