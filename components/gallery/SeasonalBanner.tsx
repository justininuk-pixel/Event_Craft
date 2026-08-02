"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SeasonalEvent {
  name: string;
  emoji: string;
  month: number; // 1-indexed
  day: number;
  categoryFilter: string;
  color: string; // Thematic accent color
  bgStyle: string; // Tailwind gradient overlay
}

const HOLIDAYS: SeasonalEvent[] = [
  {
    name: "Valentine's Day",
    emoji: "💖",
    month: 2,
    day: 14,
    categoryFilter: "romance",
    color: "hsl(340, 85%, 60%)",
    bgStyle: "from-rose-500/10 to-pink-500/5 hover:border-rose-500/30",
  },
  {
    name: "Mother's Day",
    emoji: "👩‍🍼",
    month: 5,
    day: 10,
    categoryFilter: "family",
    color: "hsl(275, 80%, 65%)",
    bgStyle: "from-purple-500/10 to-indigo-500/5 hover:border-purple-500/30",
  },
  {
    name: "Halloween",
    emoji: "🎃",
    month: 10,
    day: 31,
    categoryFilter: "cultural-western",
    color: "hsl(25, 95%, 55%)",
    bgStyle: "from-orange-500/10 to-purple-900/5 hover:border-orange-500/30",
  },
  {
    name: "Diwali",
    emoji: "🪔",
    month: 11,
    day: 12,
    categoryFilter: "cultural-south-asian",
    color: "hsl(30, 90%, 55%)",
    bgStyle: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/30",
  },
  {
    name: "Christmas",
    emoji: "🎄",
    month: 12,
    day: 25,
    categoryFilter: "cultural-western",
    color: "hsl(145, 80%, 45%)",
    bgStyle: "from-green-600/10 to-red-500/5 hover:border-green-500/30",
  },
  {
    name: "New Year's Eve",
    emoji: "🥂",
    month: 12,
    day: 31,
    categoryFilter: "cultural-western",
    color: "hsl(45, 90%, 55%)",
    bgStyle: "from-yellow-500/10 to-zinc-800/5 hover:border-yellow-500/30",
  },
];

export function SeasonalBanner({ showEmojis = false }: { showEmojis?: boolean }) {
  
  // Calculate remaining days and sort by nearest event priority
  const eventsWithCountdown = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const mapped = HOLIDAYS.map((event) => {
      const targetDate = new Date(currentYear, event.month - 1, event.day);
      
      // If the date has already passed this year, point to next year
      if (targetDate.getTime() < today.getTime()) {
        targetDate.setFullYear(currentYear + 1);
      }

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Month name text formatter
      const dateString = targetDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });

      return {
        ...event,
        daysLeft: diffDays,
        dateText: dateString,
      };
    });

    // Sort ascending by days remaining (nearest first)
    const sorted = mapped.sort((a, b) => a.daysLeft - b.daysLeft);
    
    // Filter to events within next 30 days
    const upcoming = sorted.filter((e) => e.daysLeft <= 30);
    
    // Fallback to top 3 nearest events if none are within 30 days
    return upcoming.length > 0 ? upcoming : sorted.slice(0, 3);
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 select-none pointer-events-auto">
      {/* Cards Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsWithCountdown.map((event, eventIdx) => {
          const isToday = event.daysLeft === 0;
          const isTomorrow = event.daysLeft === 1;

          // Resolve countdown text
          const countdownText = isToday
            ? "Today! 🎉"
            : isTomorrow
            ? "Tomorrow! ⏳"
            : `${event.daysLeft} days left`;

          return (
            <div
              key={`${event.name}-${eventIdx}`}
              className={`relative rounded-3xl border border-border p-6 flex flex-col justify-between gap-5 bg-gradient-to-r ${event.bgStyle} bg-card backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-1`}
              style={{ borderLeftWidth: "4px", borderLeftColor: event.color }}
            >
              {/* Card Header (Emoji & Countdown Badge) */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {showEmojis && (
                    <span className="text-3xl p-2.5 rounded-2xl bg-secondary shrink-0">
                      {event.emoji}
                    </span>
                  )}
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-base text-foreground font-heading leading-tight">
                      {event.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono font-medium">
                      {event.dateText}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={isToday ? "success" : isTomorrow ? "warning" : "primary"}
                  size="sm"
                  className="font-bold shrink-0 shadow-sm"
                >
                  {countdownText}
                </Badge>
              </div>

              {/* Description body */}
              <p className="text-xs leading-relaxed text-muted-foreground font-medium flex-1">
                Design a gorgeous, custom {event.name} card. Create animations, attach audio presets, and schedule wishes.
              </p>

              {/* CTA creation button */}
              <Button
                as={Link}
                href={`/explore?category=${event.categoryFilter}`}
                variant="outline"
                size="sm"
                className="w-full font-bold transition-all border-border/70 hover:bg-secondary flex items-center justify-center gap-1.5"
              >
                <span>Browse {event.name} Styles</span>
                <span>➔</span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SeasonalBanner;
