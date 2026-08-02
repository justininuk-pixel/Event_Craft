"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface MorphSVGProps {
  paths: string[]; // List of SVG path 'd' attribute strings
  duration?: number; // seconds between morphs
  colors?: string[]; // array of colors corresponding to each path state or general cycle
  viewBox?: string;
  className?: string;
  loop?: boolean;
}

export function MorphSVG({
  paths,
  duration = 3,
  colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"],
  viewBox = "0 0 100 100",
  className,
  loop = true,
}: MorphSVGProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (paths.length <= 1 || prefersReducedMotion()) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === paths.length - 1) {
          return loop ? 0 : prev;
        }
        return prev + 1;
      });
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [paths, duration, loop]);

  if (!paths || paths.length === 0) return null;

  const currentPath = paths[currentIndex];
  const currentColor = colors[currentIndex % colors.length];

  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <svg
        viewBox={viewBox}
        className="w-full h-full max-w-full max-h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={currentPath}
          fill={currentColor}
          animate={{ d: currentPath, fill: currentColor }}
          transition={{
            duration: prefersReducedMotion() ? 0 : duration * 0.4,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}

export default MorphSVG;
