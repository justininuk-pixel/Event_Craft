import React, { useState, useEffect } from "react";
import { getTimeRemaining, isCountdownComplete } from "../../../lib/utils/countdown";

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
  styleType?: "flip-clock" | "minimal" | "circular";
}

export function CountdownTimer({
  targetDate,
  onComplete,
  styleType = "flip-clock",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    if (isCountdownComplete(targetDate)) {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTimeLeft(remaining);

      if (remaining.total <= 0) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const renderFlipDigit = (value: number, label: string) => {
    const stringValue = String(value).padStart(2, "0");
    return (
      <div className="flex flex-col items-center mx-1 md:mx-3">
        <div className="flex space-x-0.5">
          {stringValue.split("").map((digit, idx) => (
            <div
              key={idx}
              className="relative w-8 h-12 md:w-12 md:h-18 bg-zinc-900 text-purple-400 dark:bg-zinc-800 dark:text-purple-300 rounded-lg shadow-lg flex items-center justify-center font-bold text-2xl md:text-4xl border border-zinc-700/30 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
              <span>{digit}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-2">
          {label}
        </span>
      </div>
    );
  };

  const renderMinimal = () => {
    const { days, hours, minutes, seconds } = timeLeft;
    return (
      <div className="flex space-x-4 text-center font-semibold text-lg md:text-2xl text-foreground">
        <div>
          <span>{String(days).padStart(2, "0")}</span>
          <span className="text-xs block text-zinc-500 uppercase">Days</span>
        </div>
        <span className="text-zinc-400">:</span>
        <div>
          <span>{String(hours).padStart(2, "0")}</span>
          <span className="text-xs block text-zinc-500 uppercase">Hours</span>
        </div>
        <span className="text-zinc-400">:</span>
        <div>
          <span>{String(minutes).padStart(2, "0")}</span>
          <span className="text-xs block text-zinc-500 uppercase">Mins</span>
        </div>
        <span className="text-zinc-400">:</span>
        <div>
          <span>{String(seconds).padStart(2, "0")}</span>
          <span className="text-xs block text-zinc-500 uppercase">Secs</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center py-6 w-full">
      {styleType === "flip-clock" ? (
        <div className="flex justify-center items-center">
          {renderFlipDigit(timeLeft.days, "Days")}
          {renderFlipDigit(timeLeft.hours, "Hours")}
          {renderFlipDigit(timeLeft.minutes, "Minutes")}
          {renderFlipDigit(timeLeft.seconds, "Seconds")}
        </div>
      ) : (
        renderMinimal()
      )}
    </div>
  );
}
export default CountdownTimer;
