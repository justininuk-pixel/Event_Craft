"use client";

import { useState, useEffect, useCallback } from "react";
import {
  canVibrate,
  triggerVibrate,
  prefersReducedMotion,
  getHardwareTier,
  isTouchDevice,
  isMobileViewport,
} from "../utils/device";

/**
 * React hook for triggered haptic feedback.
 */
export function useHaptics() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(canVibrate());
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    triggerVibrate(pattern);
  }, []);

  return { vibrate, canVibrate: supported };
}

/**
 * React hook listening to prefers-reduced-motion media query.
 */
export function useMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());

    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return { prefersReducedMotion: reducedMotion };
}

/**
 * React hook providing hardware tier and touch viewport info.
 */
export function useDeviceTier() {
  const [tierInfo, setTierInfo] = useState({
    tier: "medium" as "low" | "medium" | "high",
    isTouch: false,
    isMobile: false,
  });

  useEffect(() => {
    setTierInfo({
      tier: getHardwareTier(),
      isTouch: isTouchDevice(),
      isMobile: isMobileViewport(),
    });
  }, []);

  return tierInfo;
}
