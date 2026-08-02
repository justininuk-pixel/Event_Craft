"use client";

import React, { useState } from "react";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface FlipCard3DProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipDirection?: "horizontal" | "vertical";
  isFlipped?: boolean; // programmatic override
  onFlip?: (flipped: boolean) => void;
  className?: string;
  trigger?: "click" | "hover" | "manual";
}

export function FlipCard3D({
  front,
  back,
  flipDirection = "horizontal",
  isFlipped: controlledFlipped,
  onFlip,
  className,
  trigger = "click",
}: FlipCard3DProps) {
  const [localFlipped, setLocalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : localFlipped;

  const handleFlip = () => {
    if (trigger === "manual") return;
    const nextState = !isFlipped;
    if (controlledFlipped === undefined) {
      setLocalFlipped(nextState);
    }
    if (onFlip) {
      onFlip(nextState);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };

  const isReduced = prefersReducedMotion();

  // Determine transition styles
  const transitionClass = isReduced
    ? "transition-none"
    : "transition-transform duration-700 ease-out";

  return (
    <div
      className={`group cursor-pointer perspective-1000 ${className || ""}`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={isFlipped}
      aria-label="3D Card, select to flip"
      style={{ perspective: "1000px" }}
    >
      <div
        className={`relative w-full h-full transform-style-3d ${transitionClass} ${
          isFlipped
            ? flipDirection === "horizontal"
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateX(180deg)]"
            : "[transform:rotateX(0deg)_rotateY(0deg)]"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden z-10"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>

        {/* Back Face */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden ${
            flipDirection === "horizontal"
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateX(180deg)]"
          }`}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

export default FlipCard3D;
