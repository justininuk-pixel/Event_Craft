"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "success";
  className?: string;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  color = "primary",
  className,
  id,
}: ToggleProps) {
  const generatedId = useId();
  const toggleId = id || `toggle-${generatedId}`;

  const handleToggle = () => {
    if (disabled) return;
    
    // Subtle haptic vibration for supported mobile devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe check
      }
    }
    
    onChange(!checked);
  };

  return (
    <div className={clsx("flex items-center gap-3 select-none", className)}>
      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        aria-readonly="false"
        disabled={disabled}
        onClick={handleToggle}
        className={clsx(
          "relative inline-flex shrink-0 cursor-pointer rounded-full transition-all duration-200 focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none border border-border active:scale-95",
          {
            // Color states
            "bg-primary border-primary/20": checked && color === "primary",
            "bg-accent border-accent/20": checked && color === "accent",
            "bg-emerald-500 border-emerald-500/20": checked && color === "success",
            "bg-secondary": !checked,
            
            // Sizes (width & height)
            "h-5 w-9": size === "sm",
            "h-7 w-12": size === "md",
            "h-9 w-16": size === "lg",
          }
        )}
      >
        {/* Animated Thumb */}
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={clsx(
            "pointer-events-none inline-block rounded-full bg-white shadow-md transition-transform mt-[0.5px]",
            {
              // Small sizes
              "h-4 w-4": size === "sm",
              "translate-x-[17px]": size === "sm" && checked,

              // Medium sizes
              "h-6 w-6": size === "md",
              "translate-x-[21px]": size === "md" && checked,

              // Large sizes
              "h-8 w-8": size === "lg",
              "translate-x-[29px]": size === "lg" && checked,

              // Unchecked transition position (shared across all sizes)
              "translate-x-[1px]": !checked,
            }
          )}
        />
      </button>

      {label && (
        <label
          htmlFor={toggleId}
          onClick={handleToggle}
          className={clsx(
            "font-medium text-foreground cursor-pointer select-none",
            {
              "text-sm": size === "sm" || size === "md",
              "text-base": size === "lg",
              "opacity-50 pointer-events-none": disabled,
            }
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
