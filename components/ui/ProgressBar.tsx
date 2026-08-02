"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface ProgressBarProps {
  value?: number; // percentage value if determinate
  max?: number;
  variant?: "determinate" | "indeterminate";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({
  value = 0,
  max = 100,
  variant = "determinate",
  size = "md",
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const percentage = variant === "determinate" 
    ? Math.min(100, Math.max(0, (value / max) * 100))
    : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={variant === "determinate" ? Math.round(percentage) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx("w-full flex flex-col space-y-1.5", className)}
    >
      {/* Label and value readout */}
      {(label || (showValue && variant === "determinate")) && (
        <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground select-none">
          {label && <span>{label}</span>}
          {showValue && variant === "determinate" && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div
        className={clsx("w-full bg-secondary rounded-full overflow-hidden relative", {
          "h-1": size === "sm",
          "h-2": size === "md",
          "h-3": size === "lg",
        })}
      >
        {variant === "determinate" ? (
          /* Determinate Bar - animated width using framer-motion */
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full bg-primary rounded-full"
          />
        ) : (
          /* Indeterminate Bar - loop translation sweep */
          <motion.div
            initial={{ left: "-40%", width: "40%" }}
            animate={{ left: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="absolute top-0 bottom-0 bg-primary rounded-full"
          />
        )}
      </div>
    </div>
  );
}
