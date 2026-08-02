// Maps emotional tone (0 playful – 100 heartfelt) to a celebration intensity:
// playful tones burst bigger, heartfelt tones stay gentle.
export function toneIntensity(tone: number | undefined): number {
  const t = Math.max(0, Math.min(100, tone ?? 50));
  return 0.45 + (1 - t / 100); // tone 0 → 1.45, 50 → 0.95, 100 → 0.45
}

// Small shared helper so each experience can fire a celebratory confetti burst
// without re-importing the engine. Safe to call on the server (no-ops).
export async function fireConfetti(colors?: string[], intensity = 1): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    confetti({
      particleCount: Math.round(110 * intensity),
      spread: Math.round(60 + 25 * intensity),
      startVelocity: 38,
      origin: { y: 0.62 },
      colors,
      disableForReducedMotion: true,
      // Above experience end-screens (z-40/50), sticker layer (55) and message overlay (60).
      zIndex: 9999,
    });
  } catch {
    /* confetti is non-essential, ignore failures */
  }
}
