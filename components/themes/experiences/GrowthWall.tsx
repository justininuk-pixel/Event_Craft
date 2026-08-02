"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Ruler } from "lucide-react";

type HeightMark = {
  id: string;
  name: string;
  date: string;
  inches: number;
};

const defaultMarks: HeightMark[] = [
  { id: "h1", name: "Emma", date: "Jan 2018", inches: 24 },
  { id: "h2", name: "Emma", date: "Jan 2019", inches: 30 },
  { id: "h3", name: "Emma", date: "Jan 2020", inches: 36 },
  { id: "h4", name: "Emma", date: "Jan 2021", inches: 42 },
  { id: "h5", name: "Emma", date: "Jan 2022", inches: 48 },
  { id: "h6", name: "Emma", date: "Jan 2023", inches: 52 },
  { id: "h7", name: "Liam", date: "Jan 2020", inches: 34 },
  { id: "h8", name: "Liam", date: "Jan 2021", inches: 40 },
  { id: "h9", name: "Liam", date: "Jan 2022", inches: 47 },
  { id: "h10", name: "Liam", date: "Jan 2023", inches: 54 },
];

const PX_PER_INCH = 8;
const MAX_HEIGHT_INCHES = 72; // 6 feet

const nameColors: Record<string, string> = {};
const palette_colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];

export function GrowthWall({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#78552b"];

  const marks: HeightMark[] = (config.experience as any)?.marks || defaultMarks;
  const title = config.title || "The Growth Wall";

  // Assign colors to unique names
  const uniqueNames = Array.from(new Set(marks.map((m) => m.name)));
  uniqueNames.forEach((name, i) => {
    if (!nameColors[name]) nameColors[name] = palette_colors[i % palette_colors.length];
  });

  const totalHeight = MAX_HEIGHT_INCHES * PX_PER_INCH;

  return (
    <div
      className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* Wooden wall texture */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 42px), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: "multiply"
      }} />

      {/* Title */}
      <div className="sticky top-0 z-20 bg-amber-900/90 backdrop-blur-sm p-4 text-center border-b border-amber-950">
        <h2 className="text-xl font-black text-amber-100 uppercase tracking-widest flex items-center justify-center gap-2">
          <Ruler size={18} /> {title}
        </h2>
        <div className="flex gap-4 justify-center mt-2">
          {uniqueNames.map((name) => (
            <span key={name} className="flex items-center gap-1 text-xs text-amber-200">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: nameColors[name] }} />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable doorframe */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="relative w-full" style={{ height: `${totalHeight}px` }}>

          {/* Ruler ticks every 6 inches */}
          {Array.from({ length: Math.floor(MAX_HEIGHT_INCHES / 6) + 1 }).map((_: any, i: number) => {
            const inches = i * 6;
            const bottom = inches * PX_PER_INCH;
            return (
              <div key={i} className="absolute left-0 right-0 flex items-center" style={{ bottom: `${bottom}px` }}>
                <div className="w-8 h-px bg-amber-200/40" />
                <span className="text-[10px] text-amber-200/60 ml-1 font-bold">{inches}"</span>
                {inches > 0 && inches % 12 === 0 && (
                  <span className="text-[10px] text-amber-300/40 ml-2">({inches / 12}ft)</span>
                )}
              </div>
            );
          })}

          {/* Height marks */}
          {marks.map((mark) => {
            const bottom = mark.inches * PX_PER_INCH;
            const color = nameColors[mark.name] || "#fff";
            return (
              <motion.div
                key={mark.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute left-10 right-4 flex items-center gap-2"
                style={{ bottom: `${bottom}px` }}
              >
                <div className="w-16 h-[3px] rounded-full shadow-sm" style={{ backgroundColor: color }} />
                <div className="text-xs font-bold px-2 py-1 rounded shadow-sm" style={{ backgroundColor: color, color: "#fff" }}>
                  {mark.name}
                </div>
                <span className="text-[10px] text-amber-200/60">{mark.date} · {mark.inches}"</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
