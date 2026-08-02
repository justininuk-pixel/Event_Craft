export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function isTabletViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function hasGyroscope(): boolean {
  if (typeof window === "undefined") return false;
  return "DeviceOrientationEvent" in window;
}

export function hasAccelerometer(): boolean {
  if (typeof window === "undefined") return false;
  return "DeviceMotionEvent" in window;
}

export function getHardwareTier(): "low" | "medium" | "high" {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "medium";

  const cores = navigator.hardwareConcurrency;
  if (cores === undefined) return "medium";
  if (cores < 2) return "low";
  if (cores <= 4) return "medium";
  return "high";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function canVibrate(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return "vibrate" in navigator;
}

export function triggerVibrate(pattern: number | number[]): void {
  if (canVibrate()) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Vibration failed", e);
    }
  }
}
