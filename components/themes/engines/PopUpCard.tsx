"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface PopUpElement {
  element: React.ReactNode;
  x: number; // percentage from left, 0-100
  y: number; // percentage from top, 0-100
  zIndex?: number;
}

interface PopUpCardProps {
  coverContent?: React.ReactNode;
  insideLeftContent?: React.ReactNode;
  insideRightContent?: React.ReactNode;
  popUpElements?: PopUpElement[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function PopUpCard({
  coverContent,
  insideLeftContent,
  insideRightContent,
  popUpElements = [],
  isOpen: controlledOpen,
  onOpenChange,
  className,
}: PopUpCardProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : localOpen;

  const toggleOpen = () => {
    const nextState = !isOpen;
    if (controlledOpen === undefined) {
      setLocalOpen(nextState);
    }
    if (onOpenChange) {
      onOpenChange(nextState);
    }
  };

  const isReduced = prefersReducedMotion();

  // Book spine opening/closing angles
  const coverRotateY = isOpen ? -180 : 0;

  return (
    <div
      className={className ? `flex items-center justify-center select-none ${className}` : "relative flex items-center justify-center select-none"}
      style={{ perspective: "2000px" }}
    >
      {/* 3D Card Book Frame */}
      <motion.div
        className="relative w-80 h-96 md:w-96 md:h-[420px] transform-style-3d cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isOpen
            ? "rotateX(25deg) rotateY(0deg) translateZ(0px)"
            : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
        }}
        animate={{
          rotateX: isOpen ? 25 : 0,
          rotateY: isOpen ? 0 : 0,
        }}
        transition={{ duration: isReduced ? 0 : 0.8, ease: "easeOut" }}
        onClick={toggleOpen}
      >
        {/* INSIDE LAYER (Revealed when card is open) */}
        <div
          className="absolute inset-0 flex w-full h-full rounded-2xl bg-zinc-50 border border-zinc-200/50 shadow-2xl overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(-1px)",
          }}
        >
          {/* Inside Left Page */}
          <div className="w-1/2 h-full border-r border-zinc-200/60 p-4 flex flex-col justify-between bg-gradient-to-r from-zinc-100 to-zinc-50">
            {insideLeftContent || (
              <div className="flex flex-col justify-center items-center h-full text-zinc-400 text-xs">
                <span>Left Page</span>
              </div>
            )}
          </div>

          {/* Inside Right Page */}
          <div className="relative w-1/2 h-full p-4 bg-gradient-to-l from-zinc-100 to-zinc-50 overflow-visible">
            {insideRightContent}

            {/* Pop-up Standees */}
            <AnimatePresence>
              {isOpen &&
                !isReduced &&
                popUpElements.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute origin-bottom"
                    style={{
                      left: `${item.x}%`,
                      bottom: `${100 - item.y}%`,
                      transformStyle: "preserve-3d",
                      zIndex: item.zIndex || 10,
                      transform: "translate(-50%, 0) rotateX(-90deg)",
                    }}
                    initial={{ scale: 0, rotateX: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      rotateX: -70, // Lean slightly forward towards the camera
                      opacity: 1,
                    }}
                    exit={{ scale: 0, rotateX: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 12,
                      delay: 0.4 + idx * 0.15,
                    }}
                  >
                    <div className="drop-shadow-lg filter">{item.element}</div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>

        {/* COVER LAYER (Acts as a door rotating on the Y axis spine) */}
        <motion.div
          className="absolute inset-y-0 left-0 w-full h-full origin-left bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl shadow-xl flex flex-col justify-between p-6 overflow-hidden text-white"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          animate={{
            rotateY: coverRotateY,
          }}
          transition={{ duration: isReduced ? 0 : 0.8, ease: "easeInOut" }}
        >
          {coverContent || (
            <div className="flex flex-col justify-between h-full">
              <div className="text-xl font-bold">A Special Card For You</div>
              <div className="text-sm opacity-90 text-right">Click to Open ➔</div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default PopUpCard;
