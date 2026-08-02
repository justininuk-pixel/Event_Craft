"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { PenTool, Eraser, Download, Trash2, Users } from "lucide-react";

export function SharedCanvasWhiteboard({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#3b82f6"; // blue-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Fake active users for demo
  const [activeUsers] = useState(3);

  useEffect(() => {
     if (canvasRef.current) {
        const canvas = canvasRef.current;
        // Set actual internal canvas resolution to match display size to prevent blurring
        // For a true infinite canvas, this requires complex matrix transforms. 
        // For this demo, we'll make it the size of the container.
        const updateCanvasSize = () => {
           const parent = canvas.parentElement;
           if (parent) {
              canvas.width = parent.clientWidth;
              canvas.height = parent.clientHeight;
              
              const ctx = canvas.getContext("2d");
              if (ctx) {
                 ctx.lineCap = "round";
                 ctx.lineJoin = "round";
                 setContext(ctx);
              }
           }
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);
        return () => window.removeEventListener("resize", updateCanvasSize);
     }
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (!context) return;
     const { offsetX, offsetY } = e.nativeEvent;
     
     context.beginPath();
     context.moveTo(offsetX, offsetY);
     setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
     if (!isDrawing || !context) return;
     const { offsetX, offsetY } = e.nativeEvent;
     
     if (tool === "pen") {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = primaryColor;
        context.lineWidth = 4;
     } else {
        context.globalCompositeOperation = "destination-out";
        context.lineWidth = 20; // Eraser size
     }

     context.lineTo(offsetX, offsetY);
     context.stroke();
  };

  const stopDrawing = () => {
     if (!context) return;
     context.closePath();
     setIsDrawing(false);
     
     // In a real app, this is where we'd batch emit the stroke vectors via WebSockets
  };

  const clearCanvas = () => {
     if (!context || !canvasRef.current) return;
     context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Simulate an incoming remote stroke for demo purposes
  useEffect(() => {
     if (mode === "editor-preview") return;

     const interval = setInterval(() => {
        if (!context || !canvasRef.current) return;
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = "#10b981"; // Another user's color
        context.lineWidth = 4;
        
        context.beginPath();
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        context.moveTo(startX, startY);
        context.lineTo(startX + (Math.random() * 50 - 25), startY + (Math.random() * 50 - 25));
        context.stroke();
        context.closePath();
     }, 3000);

     return () => clearInterval(interval);
  }, [context, mode]);

  return (
    <div 
      className="w-full h-full relative flex flex-col font-sans overflow-hidden text-slate-800"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200">
         <div>
            <h2 className="text-lg font-black tracking-tight mb-0.5">
               {config.title || "Shared Whiteboard"}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Live
            </div>
         </div>
         
         <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Users size={16} className="text-slate-500" />
            <span className="text-sm font-bold">{activeUsers}</span>
         </div>
      </div>

      {/* The Canvas */}
      <div 
         className="flex-1 w-full h-full relative cursor-crosshair touch-none"
         style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
         }}
      >
         <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="absolute inset-0 w-full h-full block"
         />
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200">
         
         <button
            onClick={() => setTool("pen")}
            className={`p-3 rounded-xl transition-colors ${tool === "pen" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"}`}
         >
            <PenTool size={20} />
         </button>
         
         <button
            onClick={() => setTool("eraser")}
            className={`p-3 rounded-xl transition-colors ${tool === "eraser" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"}`}
         >
            <Eraser size={20} />
         </button>

         <div className="w-px h-8 bg-slate-200 mx-1" />

         <button
            onClick={clearCanvas}
            className="p-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
         >
            <Trash2 size={20} />
         </button>

      </div>

      {/* Complete Button (if part of a flow) */}
      {onComplete && (
         <div className="absolute top-4 right-4 z-20">
            <button
               onClick={onComplete}
               className="bg-black text-white px-4 py-2 rounded-full font-bold text-sm shadow-md"
            >
               Finish
            </button>
         </div>
      )}

    </div>
  );
}
