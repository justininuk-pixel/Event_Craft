"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

type LineData = {
  id: string;
  name: string;
  color: string;
  points: number[]; // e.g. heights at ages 5, 10, 15, 20
};

const defaultData: LineData[] = [
  { id: "L1", name: "Mark", color: "#3b82f6", points: [42, 55, 66, 70] },
  { id: "L2", name: "Sarah", color: "#ef4444", points: [40, 58, 64, 65] },
  { id: "L3", name: "David", color: "#22c55e", points: [38, 52, 68, 73] },
];

export function SiblingHeightRace({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#ffffff"];
  const title = config.title || "The Growth Spurt Race";
  const data: LineData[] = (config.experience as any)?.data || defaultData;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const maxVal = Math.max(...data.flatMap(d => d.points));
  const minVal = Math.min(...data.flatMap(d => d.points)) - 5;
  const range = maxVal - minVal;

  const xLabels = ["Age 5", "Age 10", "Age 15", "Age 20"];

  useEffect(() => {
    if (isPlaying) {
      const duration = 5000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(1, elapsed / duration);
        setProgress(p);
        
        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          if (onComplete) onComplete();
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isPlaying]);

  const generatePath = (points: number[]) => {
    return points.map((val, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - (((val - minVal) / range) * 100);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 pb-2 border-b border-gray-100 flex justify-between items-end z-20 bg-white">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Height over time (inches)</p>
        </div>
        {!isPlaying && progress === 0 && (
          <button 
            onClick={() => setIsPlaying(true)}
            className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Play size={18} className="ml-1" />
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-6 py-4 bg-gray-50/50 z-20">
        {data.map(line => (
          <div key={line.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
            <span className="text-xs font-bold text-gray-600">{line.name}</span>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative p-6 pb-12">
        {/* Y-Axis labels */}
        <div className="absolute left-2 top-6 bottom-12 flex flex-col justify-between text-[10px] text-gray-400 font-mono">
          <span>{maxVal}"</span>
          <span>{Math.round((maxVal+minVal)/2)}"</span>
          <span>{minVal}"</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-6 top-6 bottom-12 border-l border-b border-gray-300">
           <div className="absolute w-full h-px bg-gray-100 top-0" />
           <div className="absolute w-full h-px bg-gray-100 top-1/2" />
        </div>

        {/* SVG Drawing Canvas */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute left-10 right-6 top-6 bottom-12 w-[calc(100%-4rem)] h-[calc(100%-4.5rem)] overflow-visible">
          {data.map(line => {
            const pathData = generatePath(line.points);
            return (
              <g key={line.id}>
                {/* The glowing trail line */}
                <motion.path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress }}
                  transition={{ duration: 0 }}
                  style={{ filter: `drop-shadow(0px 4px 6px ${line.color}40)` }}
                />
                
                {/* Data points that appear as line passes */}
                {line.points.map((val, i) => {
                  const pointProgress = i / (line.points.length - 1);
                  const showPoint = progress >= pointProgress;
                  const x = (i / (line.points.length - 1)) * 100;
                  const y = 100 - (((val - minVal) / range) * 100);

                  return showPoint && (
                    <motion.circle
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      cx={x} cy={y} r="3"
                      fill="white"
                      stroke={line.color}
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* X-Axis labels */}
        <div className="absolute bottom-4 left-10 right-6 flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          {xLabels.map(label => (
            <span key={label} className="-ml-4">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
