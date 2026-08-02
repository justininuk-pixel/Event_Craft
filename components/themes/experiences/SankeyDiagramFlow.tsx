"use client";

import React, { useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";

type FlowData = {
  source: string;
  target: string;
  value: number;
  color: string;
};

const defaultFlows: FlowData[] = [
  { source: "Salary", target: "Checking", value: 5000, color: "#3b82f6" },
  { source: "Side Hustle", target: "Checking", value: 800, color: "#10b981" },
  { source: "Checking", target: "Rent", value: 2000, color: "#ef4444" },
  { source: "Checking", target: "Savings", value: 1500, color: "#8b5cf6" },
  { source: "Checking", target: "Food", value: 800, color: "#f59e0b" },
  { source: "Checking", target: "Fun", value: 1500, color: "#ec4899" },
];

export function SankeyDiagramFlow({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // slate-900

  const flows = (config.experience as any)?.flows || defaultFlows;
  const title = config.title || "Monthly Cashflow";

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
     setTimeout(() => {
        setRevealed(true);
        if (onComplete) setTimeout(onComplete, 4000);
     }, 500);
  }, [onComplete]);

  // Simplified custom SVG Sankey drawer for 3 tiers: Incomes -> Pool -> Expenses
  // We'll hardcode the assumption of a central node ("Checking") to make it look good on mobile
  const incomes = flows.filter((f: FlowData) => f.target === "Checking");
  const expenses = flows.filter((f: FlowData) => f.source === "Checking");

  const totalIn = incomes.reduce((acc: number, f: FlowData) => acc + f.value, 0);
  const totalOut = expenses.reduce((acc: number, f: FlowData) => acc + f.value, 0);

  const drawSankeyPath = (x1: number, y1: number, w1: number, x2: number, y2: number, w2: number) => {
     const cx1 = x1 + (x2 - x1) * 0.5;
     const cy1 = y1;
     const cx2 = x1 + (x2 - x1) * 0.5;
     const cy2 = y2;
     return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2} L ${x2} ${y2 + w2} C ${cx2} ${cy2 + w2}, ${cx1} ${cy1 + w1}, ${x1} ${y1 + w1} Z`;
  };

  let currentYLeft = 10;
  let currentYRight = 10;

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-900 text-slate-200" style={{ backgroundColor: bgColors[0] }}>
      
      <div className="p-6 pb-2 z-10 flex justify-between items-center">
         <h2 className="text-xl font-bold">{title}</h2>
         <GitCommit className="text-slate-500" />
      </div>

      <div className="flex-1 relative flex items-center p-4">
         
         {/* SVG Paths */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 500" preserveAspectRatio="none">
            {revealed && incomes.map((inc: FlowData, i: number) => {
               const startY = currentYLeft;
               const weight = (inc.value / Math.max(totalIn, totalOut)) * 200; // max 200px thick
               currentYLeft += weight + 10; // 10px gap
               
               const endY = 100 + (totalIn - inc.value) / totalIn * 50; // converge in middle
               
               return (
                  <motion.path
                     key={i}
                     initial={{ opacity: 0, pathLength: 0 }}
                     animate={{ opacity: 0.4, pathLength: 1 }}
                     transition={{ duration: 1, delay: i * 0.2 }}
                     d={drawSankeyPath(40, startY, weight, 180, endY, weight)}
                     fill={inc.color}
                  />
               );
            })}

            {revealed && expenses.map((exp: FlowData, i: number) => {
               const endY = currentYRight;
               const weight = (exp.value / Math.max(totalIn, totalOut)) * 200;
               currentYRight += weight + 10;

               const startY = 100 + (totalOut - exp.value) / totalOut * 50;

               return (
                  <motion.path
                     key={`e-${i}`}
                     initial={{ opacity: 0, pathLength: 0 }}
                     animate={{ opacity: 0.4, pathLength: 1 }}
                     transition={{ duration: 1, delay: 1 + i * 0.2 }}
                     d={drawSankeyPath(220, startY, weight, 360, endY, weight)}
                     fill={exp.color}
                  />
               );
            })}
         </svg>

         {/* Nodes Layout */}
         <div className="w-full flex justify-between relative z-10 h-[300px]">
            {/* Left Col */}
            <div className="flex flex-col gap-[10px] w-24 relative z-20">
               {incomes.map((inc: FlowData, i: number) => {
                  const weight = (inc.value / Math.max(totalIn, totalOut)) * 200;
                  return (
                     <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={revealed ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: i * 0.2 }}
                        className="bg-slate-800 rounded-sm border-l-4 p-1 flex flex-col justify-center"
                        style={{ height: `${weight}px`, minHeight: '24px', borderLeftColor: inc.color }}
                     >
                        <span className="text-[10px] font-bold truncate">{inc.source}</span>
                        <span className="text-[10px] text-slate-400">${inc.value}</span>
                     </motion.div>
                  )
               })}
            </div>

            {/* Center Col */}
            <div className="flex flex-col justify-center items-center relative z-20">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={revealed ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.8 }}
                  className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700 shadow-xl"
               >
                  <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Pool</span>
                  <span className="text-lg font-bold text-white">${totalIn}</span>
               </motion.div>
            </div>

            {/* Right Col */}
            <div className="flex flex-col gap-[10px] w-24 relative z-20">
               {expenses.map((exp: FlowData, i: number) => {
                  const weight = (exp.value / Math.max(totalIn, totalOut)) * 200;
                  return (
                     <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={revealed ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 1 + i * 0.2 }}
                        className="bg-slate-800 rounded-sm border-r-4 p-1 flex flex-col justify-center text-right"
                        style={{ height: `${weight}px`, minHeight: '24px', borderRightColor: exp.color }}
                     >
                        <span className="text-[10px] font-bold truncate">{exp.target}</span>
                        <span className="text-[10px] text-slate-400">${exp.value}</span>
                     </motion.div>
                  )
               })}
            </div>
         </div>

      </div>

    </div>
  );
}
