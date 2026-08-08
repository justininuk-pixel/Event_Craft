"use client";

import React, { useEffect } from "react";
import { motion, type PanInfo } from "framer-motion";
import clsx from "clsx";

export interface ToastProps {
  id?: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 4000,
  action,
}: ToastProps) {
  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  // Swipe gesture handler
  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onClose();
    }
  };

  return (
    <motion.div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={{ left: 0.1, right: 0.8 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={clsx(
        "relative flex flex-col rounded-xl shadow-xl border text-sm max-w-sm w-full pointer-events-auto overflow-hidden glass-panel select-none",
        {
          "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300":
            type === "success",
          "border-red-200 dark:border-red-900/50 bg-red-50/90 dark:bg-red-950/20 text-red-800 dark:text-red-300":
            type === "error",
          "border-blue-200 dark:border-blue-900/50 bg-blue-50/90 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300":
            type === "info",
          "border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300":
            type === "warning",
        }
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {/* SVG Icons */}
        <div className="flex-shrink-0">
          {type === "success" && (
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === "error" && (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === "info" && (
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === "warning" && (
            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 font-medium">{message}</div>

        {/* Action Button */}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={clsx(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors border",
              {
                "bg-emerald-600/10 border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300": type === "success",
                "bg-red-600/10 border-red-500/20 hover:bg-red-600/20 text-red-700 dark:text-red-300": type === "error",
                "bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300": type === "info",
                "bg-amber-600/10 border-amber-500/20 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300": type === "warning",
              }
            )}
          >
            {action.label}
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Auto-dismiss duration progress indicator */}
      {duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={clsx("h-full", {
              "bg-emerald-500": type === "success",
              "bg-red-500": type === "error",
              "bg-blue-500": type === "info",
              "bg-amber-500": type === "warning",
            })}
          />
        </div>
      )}
    </motion.div>
  );
}
