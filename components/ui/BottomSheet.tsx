"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import clsx from "clsx";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: ("half" | "full")[]; // Custom snaps e.g. ["half", "full"]
  defaultSnap?: "half" | "full";
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = ["half", "full"],
  defaultSnap = "half",
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const generatedId = useId();
  const titleId = `sheet-title-${generatedId}`;
  
  // Track current snap level
  const [currentSnap, setCurrentSnap] = useState<"half" | "full">(defaultSnap);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined" && window.visualViewport) {
      const handleResize = () => {
        const viewport = window.visualViewport;
        if (viewport) {
          const offset = window.innerHeight - viewport.height;
          setKeyboardHeight(offset > 0 ? offset : 0);
        }
      };
      window.visualViewport.addEventListener("resize", handleResize);
      return () => {
        window.visualViewport?.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  // Focus Trap and Focus Restoration for Accessibility
  useEffect(() => {
    if (!isOpen) return;

    const sheetElement = containerRef.current;
    if (!sheetElement) return;

    const previousActiveElement = document.activeElement;

    const getFocusableElements = () => {
      return Array.from(
        sheetElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        return (
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          el.tabIndex !== -1
        );
      });
    };

    // Focus first element on open
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleTab);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleTab);
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  // Update controls when sheet opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Snap to initial position
      controls.start(defaultSnap);
      setCurrentSnap(defaultSnap);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, defaultSnap, controls]);

  if (!mounted) return null;

  // Set height positions for snaps
  const variants = {
    hidden: { y: "100%" },
    half: { y: "40vh" },
    full: { y: "0vh" },
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 150;
    const velocityThreshold = 500; // Momentum swipe close
    
    const dragDistance = info.offset.y;
    const dragVelocity = info.velocity.y;

    // Momentum dismiss
    if (dragVelocity > velocityThreshold) {
      onClose();
      return;
    }

    if (currentSnap === "full") {
      if (dragDistance > threshold) {
        if (snapPoints.includes("half")) {
          controls.start("half");
          setCurrentSnap("half");
        } else {
          onClose();
        }
      } else {
        controls.start("full");
      }
    } else if (currentSnap === "half") {
      if (dragDistance > threshold) {
        onClose();
      } else if (dragDistance < -threshold && snapPoints.includes("full")) {
        controls.start("full");
        setCurrentSnap("full");
      } else {
        controls.start("half");
      }
    }
  };

  const container = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Drawer Panel Container */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial="hidden"
            animate={controls}
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{ paddingBottom: `${keyboardHeight}px` }}
            className={clsx(
              "relative w-full bg-card text-card-foreground rounded-t-3xl border-t border-border shadow-2xl z-base flex flex-col focus:outline-none select-none",
              {
                "h-[85vh]": currentSnap === "full",
                "h-[55vh]": currentSnap === "half",
              }
            )}
          >
            {/* Grab handle bar */}
            <div className="w-full flex justify-center py-3.5 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50 transition-colors" />
            </div>

            {/* Title block */}
            {title && (
              <div className="px-6 pb-4 border-b border-border flex justify-between items-center select-none">
                <h3 id={titleId} className="text-lg font-bold font-heading text-foreground">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary focus-ring transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Scrollable content section */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 focus:outline-none">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(container, document.body);
}
