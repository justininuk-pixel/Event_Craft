"use client";

import React from "react";
import { ThemeMood } from "@/lib/themes/types";
import clsx from "clsx";

interface MoodFilterProps {
  selectedMood: ThemeMood | "all";
  onChange: (mood: ThemeMood | "all") => void;
  showEmojis?: boolean;
}

interface MoodItem {
  id: ThemeMood | "all";
  label: string;
  emoji: string;
  color: string; // HSL color string
}

const MOODS: MoodItem[] = [
  { id: "all", label: "All Vibes", emoji: "🌟", color: "hsl(265, 80%, 55%)" },
  { id: "celebratory", label: "Celebratory", emoji: "🥳", color: "hsl(45, 95%, 50%)" },
  { id: "romantic", label: "Romantic", emoji: "💖", color: "hsl(330, 85%, 60%)" },
  { id: "funny", label: "Funny", emoji: "🤪", color: "hsl(15, 95%, 55%)" },
  { id: "inspirational", label: "Inspirational", emoji: "✨", color: "hsl(180, 85%, 45%)" },
  { id: "nostalgic", label: "Nostalgic", emoji: "⏳", color: "hsl(30, 40%, 55%)" },
  { id: "peaceful", label: "Peaceful", emoji: "🕊️", color: "hsl(145, 55%, 45%)" },
  { id: "solemn", label: "Solemn", emoji: "🕯️", color: "hsl(210, 20%, 50%)" },
  { id: "energetic", label: "Energetic", emoji: "⚡", color: "hsl(50, 95%, 45%)" },
  { id: "mysterious", label: "Mysterious", emoji: "🔮", color: "hsl(280, 60%, 55%)" },
  { id: "cute", label: "Cute", emoji: "🧸", color: "hsl(325, 75%, 68%)" },
];

export function MoodFilter({
  selectedMood,
  onChange,
  showEmojis = false,
}: MoodFilterProps) {
  return (
    <div className="w-full flex flex-col gap-2.5 relative select-none">
      <span className="text-xs uppercase font-extrabold tracking-widest text-primary font-mono">
        Vibe / Mood
      </span>
      
      {/* Scrollable Container */}
      <div
        role="radiogroup"
        aria-label="Select celebration mood vibe"
        className="w-full flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-none snap-x pointer-events-auto pl-2"
      >
        {MOODS.map((item) => {
          const isSelected = selectedMood === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(item.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap snap-start shadow-sm hover:scale-[1.02] active:scale-95 focus-ring",
                isSelected
                  ? "text-primary-foreground border-transparent"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              )}
              style={{
                backgroundColor: isSelected ? item.color : undefined,
                boxShadow: isSelected ? `${item.color}35 0px 8px 20px -3px` : undefined,
              }}
            >
              {/* Colored Dot Indicator */}
              <span
                className="h-2 w-2 rounded-full shrink-0 transition-transform duration-200"
                style={{
                  backgroundColor: isSelected ? "#ffffff" : item.color,
                  transform: isSelected ? "scale(1.2)" : "scale(1)",
                }}
              />
              
              {showEmojis && <span className="text-sm shrink-0">{item.emoji}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MoodFilter;
