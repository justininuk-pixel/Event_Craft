"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delayMs = 200,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetStyle, setOffsetStyle] = useState<React.CSSProperties>({});
  
  const generatedId = useId();
  const tooltipId = `tooltip-${generatedId}`;

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delayMs);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Viewport Collision Detection & Correction
  useEffect(() => {
    if (!visible) {
      setOffsetStyle({});
      return;
    }

    const adjustPosition = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      const rect = tooltip.getBoundingClientRect();
      const margin = 12; // safety margin from screen edge
      let shiftX = 0;
      let shiftY = 0;

      // Check left/right viewport boundaries
      if (rect.left < margin) {
        shiftX = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        shiftX = window.innerWidth - margin - rect.right;
      }

      // Check top/bottom viewport boundaries
      if (rect.top < margin) {
        shiftY = margin - rect.top;
      } else if (rect.bottom > window.innerHeight - margin) {
        shiftY = window.innerHeight - margin - rect.bottom;
      }

      if (shiftX !== 0 || shiftY !== 0) {
        // Base translation maps to positioning
        if (position === "top" || position === "bottom") {
          setOffsetStyle({
            transform: `translate(calc(-50% + ${shiftX}px), ${shiftY}px)`,
          });
        } else {
          setOffsetStyle({
            transform: `translate(${shiftX}px, calc(-50% + ${shiftY}px))`,
          });
        }
      }
    };

    // Run adjustment frame
    const frame = requestAnimationFrame(adjustPosition);
    window.addEventListener("resize", adjustPosition);
    
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", adjustPosition);
    };
  }, [visible, position]);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* Trigger element needs to hook description to tooltip */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            "aria-describedby": tooltipId,
          })
        : children}

      <AnimatePresence>
        {visible && (
          <motion.div
            id={tooltipId}
            ref={tooltipRef}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.92, y: position === "top" ? 4 : position === "bottom" ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={offsetStyle}
            className={clsx(
              "absolute z-toast px-3 py-2 text-xs font-semibold text-white bg-zinc-950/95 dark:bg-zinc-900/95 rounded-lg shadow-xl border border-zinc-800/80 backdrop-blur-sm pointer-events-none select-none max-w-[250px] w-max break-words",
              {
                "bottom-full left-1/2 -translate-x-1/2 mb-2.5": position === "top",
                "top-full left-1/2 -translate-x-1/2 mt-2.5": position === "bottom",
                "right-full top-1/2 -translate-y-1/2 mr-2.5": position === "left",
                "left-full top-1/2 -translate-y-1/2 ml-2.5": position === "right",
              },
              className
            )}
          >
            {content}
            
            {/* Arrow indicator */}
            <div
              className={clsx(
                "absolute w-2 h-2 bg-zinc-950 dark:bg-zinc-900 rotate-45 border border-zinc-800/80 pointer-events-none",
                {
                  "top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b border-l-0 border-t-0": position === "top",
                  "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t border-r-0 border-b-0": position === "bottom",
                  "left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-r border-t border-l-0 border-b-0": position === "left",
                  "right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-l border-b border-r-0 border-t-0": position === "right",
                }
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
