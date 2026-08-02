"use client";

import React, { useState, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mic, CheckCircle } from "lucide-react";

export function AudioGuestbook({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#ef4444"; // red-500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fbbf24"]; // amber-400
  
  const targetNumber = (config.experience as any)?.targetNumber || "5550199";
  const title = config.title || "The Wedding Guestbook";

  const [dialedDigits, setDialedDigits] = useState<string>("");
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isDialing, setIsDialing] = useState(false);
  const [status, setStatus] = useState<"idle" | "ringing" | "recording" | "done">("idle");
  
  const dialRef = useRef<HTMLDivElement>(null);
  const startAngleRef = useRef<number>(0);
  const currentDigitRef = useRef<number | null>(null);

  // Positions of holes 1-9, 0 (rough mapping for visual)
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const getAngle = (e: React.TouchEvent | React.MouseEvent, cx: number, cy: number) => {
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const me = e as React.MouseEvent;
      clientX = me.clientX;
      clientY = me.clientY;
    }
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent, digit: number) => {
    if (status !== "idle") return;
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDialing(true);
    currentDigitRef.current = digit;
    startAngleRef.current = getAngle(e, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDialing || status !== "idle") return;
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;

    let currentAngle = getAngle(e, rect.left + rect.width / 2, rect.top + rect.height / 2);
    let delta = currentAngle - startAngleRef.current;
    
    // Normalize delta
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;
    
    // Only allow positive (clockwise) rotation up to a max (finger stop)
    if (delta > 0) {
      setCurrentRotation(Math.min(delta, 160)); // 160 deg approx max to finger stop
    }
  };

  const handleEnd = () => {
    if (!isDialing || status !== "idle") return;
    setIsDialing(false);
    
    // If pulled far enough, register digit
    if (currentRotation > 40 && currentDigitRef.current !== null) {
      const newDigits = dialedDigits + currentDigitRef.current.toString();
      setDialedDigits(newDigits);
      
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
      
      if (newDigits === targetNumber || newDigits.length >= 7) {
        // Dial complete
        setStatus("ringing");
        setTimeout(() => {
          setStatus("recording");
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }, 3000);
      }
    }
    
    // Spring back
    setCurrentRotation(0);
    currentDigitRef.current = null;
  };

  const finishRecording = () => {
    setStatus("done");
    onComplete?.();
    if (onComplete) setTimeout(onComplete, 2000);
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-mono overflow-hidden select-none items-center justify-center p-6" 
      style={{ backgroundColor: bgColors[0] }}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div className="absolute top-10 text-center z-10">
        <h2 className="text-2xl font-black text-amber-900 uppercase tracking-widest">{title}</h2>
        <p className="text-amber-800/60 text-sm mt-2">Dial {targetNumber.replace(/(\d{3})(\d{4})/, "$1-$2")}</p>
      </div>

      {/* Retro Phone Body */}
      <div className="relative w-72 h-72 rounded-full bg-amber-100 shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_5px_15px_rgba(255,255,255,0.8),inset_0_-10px_20px_rgba(0,0,0,0.1)] border border-amber-200 flex items-center justify-center mt-12">
        
        {/* Number base (static) */}
        <div className="absolute inset-4 rounded-full bg-amber-50 shadow-inner flex items-center justify-center">
          {digits.map((d, i) => {
            const angle = -120 + i * 28; // Start bottom left, go around
            const rad = angle * (Math.PI / 180);
            const x = Math.cos(rad) * 100;
            const y = Math.sin(rad) * 100;
            return (
              <div 
                key={d} 
                className="absolute w-8 h-8 flex items-center justify-center text-xl font-black text-amber-900"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* Rotary Dial (rotates) */}
        <motion.div 
          ref={dialRef}
          className="absolute inset-2 rounded-full border-4 border-amber-900/10 mix-blend-multiply"
          animate={{ rotate: currentRotation }}
          transition={isDialing ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
        >
          {digits.map((d, i) => {
            const angle = -120 + i * 28;
            const rad = angle * (Math.PI / 180);
            const x = Math.cos(rad) * 105;
            const y = Math.sin(rad) * 105;
            return (
              <div 
                key={`hole-${d}`} 
                className="absolute w-12 h-12 rounded-full border-[3px] border-amber-900/20 shadow-inner bg-transparent left-1/2 top-1/2 -ml-6 -mt-6 cursor-pointer"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                onMouseDown={(e) => handleStart(e, d)}
                onTouchStart={(e) => handleStart(e, d)}
              />
            );
          })}
        </motion.div>

        {/* Center label */}
        <div className="w-24 h-24 rounded-full bg-white shadow-md border border-amber-200 flex flex-col items-center justify-center relative z-20">
          <Phone size={20} className="text-amber-900 mb-1" />
          <span className="text-[10px] font-bold text-amber-800">LOCAL CALL</span>
        </div>

        {/* Finger stop (static metal bracket) */}
        <div className="absolute right-6 bottom-16 w-12 h-4 bg-gray-400 rounded-l-full shadow-lg border border-gray-300 z-30 transform -rotate-12 origin-right" />
      </div>

      {/* Screen / Status */}
      <div className="absolute bottom-10 left-10 right-10 bg-amber-900 text-amber-100 p-4 rounded-xl shadow-xl flex items-center justify-between border-2 border-amber-950">
        <div className="flex flex-col">
          <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest">Status</span>
          <span className="font-bold text-lg h-7">
            {status === "idle" && (dialedDigits || "Awaiting Input...")}
            {status === "ringing" && "Calling..."}
            {status === "recording" && "Recording..."}
            {status === "done" && "Message Saved."}
          </span>
        </div>
        
        {status === "recording" && (
          <button 
            onClick={finishRecording}
            className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse"
          >
            <Mic size={18} />
          </button>
        )}
        {status === "done" && (
          <CheckCircle size={24} className="text-green-400" />
        )}
      </div>

    </div>
  );
}
