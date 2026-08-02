import { useEffect } from "react";
import confetti from "canvas-confetti";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface ConfettiBlastProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export function ConfettiBlast({ trigger, onComplete }: ConfettiBlastProps) {
  useEffect(() => {
    if (trigger) {
      if (prefersReducedMotion()) {
        if (onComplete) onComplete();
        return;
      }

      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [trigger, onComplete]);

  return null;
}
export default ConfettiBlast;
