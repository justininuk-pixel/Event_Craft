"use client";

import React, { useRef, useState, useId } from "react";
import clsx from "clsx";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  showTicks?: boolean;
  className?: string;
  id?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  disabled = false,
  showTicks = false,
  className,
  id,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  const generatedId = useId();
  const sliderId = id || `slider-${generatedId}`;
  const percentage = ((value - min) / (max - min)) * 100;

  // Handle Home and End key events on top of standard range behavior
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  // Generate tick markers
  const ticks = React.useMemo(() => {
    if (!showTicks) return [];
    const stepCount = (max - min) / step;
    if (stepCount > 20 || stepCount <= 0) return []; // Limit density
    
    return Array.from({ length: stepCount + 1 }).map((_, idx) => {
      const val = min + idx * step;
      const pct = ((val - min) / (max - min)) * 100;
      return { value: val, pct };
    });
  }, [min, max, step, showTicks]);

  return (
    <div className={clsx("flex flex-col space-y-1.5 w-full relative", className)}>
      <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground select-none">
        {label && <label htmlFor={sliderId}>{label}</label>}
        <span>{value}</span>
      </div>

      <div className="relative pt-6 pb-2 flex items-center select-none w-full">
        {/* Floating Tooltip Value on Drag */}
        {isDragging && (
          <div
            className="absolute -top-1 px-2 py-1 bg-zinc-950 text-white dark:bg-zinc-800 dark:text-foreground text-[10px] font-bold rounded shadow-md pointer-events-none transform -translate-x-1/2 transition-all"
            style={{ left: `calc(${percentage}% - ${(percentage - 50) * 0.12}px)` }}
          >
            {value}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-950 dark:border-t-zinc-800" />
          </div>
        )}

        {/* Range Input with styled track & custom thumb dimensions */}
        <input
          ref={sliderRef}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--input) ${percentage}%, var(--input) 100%)`,
          }}
          className={clsx(
            "w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none",
            // Style the thumb for Chrome/Webkit & Firefox (44px target)
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:active:scale-110 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:cursor-pointer"
          )}
        />
      </div>

      {/* Discrete tick marks list */}
      {showTicks && ticks.length > 0 && (
        <div className="relative w-full h-2">
          {ticks.map((tick) => (
            <div
              key={tick.value}
              className={clsx(
                "absolute top-0 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-colors",
                tick.value <= value ? "bg-primary" : "bg-border"
              )}
              style={{ left: `${tick.pct}%` }}
              title={String(tick.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
