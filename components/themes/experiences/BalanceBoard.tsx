"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Move } from "lucide-react";

export function BalanceBoard({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDesktopFallback, setIsDesktopFallback] = useState(false);
  
  // Render state
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [inZoneProgress, setInZoneProgress] = useState(0); // 0 to 1

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Physics state
  const physicsRef = useRef({
    x: 0, y: 0,
    vx: 0, vy: 0,
    ax: 0, ay: 0,
    lastTime: 0,
    timeInZone: 0
  });

  const SAFE_RADIUS = 40;
  const HOLD_TIME_MS = 3000;
  const BALL_RADIUS = 20;

  useEffect(() => {
    // Check permission requirements
    if (typeof window !== 'undefined' && typeof (window as any).DeviceOrientationEvent !== 'undefined') {
      if (typeof (window.DeviceOrientationEvent as any).requestPermission !== "function") {
        setPermissionGranted(true);
      }
    } else {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted || isRevealed) return;

    let hasOrientationData = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // beta: front/back tilt (-180 to 180). Positive = tilting forward (away from user).
      // gamma: left/right tilt (-90 to 90). Positive = tilting right.
      if (e.beta !== null && e.gamma !== null) {
        hasOrientationData = true;
        setIsDesktopFallback(false);
        // Map tilt to acceleration
        // Invert beta so tilting towards you brings ball down
        physicsRef.current.ax = e.gamma / 90; 
        physicsRef.current.ay = (e.beta - 45) / 90; // offset by 45deg for comfortable holding angle
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);

    // After 1s, if no data, fallback to mouse tracking
    const timer = setTimeout(() => {
      if (!hasOrientationData) {
        setIsDesktopFallback(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(timer);
    };
  }, [permissionGranted, isRevealed]);

  // Main Physics Loop
  useEffect(() => {
    if (isRevealed || !permissionGranted) return;

    physicsRef.current.lastTime = performance.now();
    let reqId: number;

    const loop = (time: number) => {
      if (isRevealed) return;

      const dt = Math.min(time - physicsRef.current.lastTime, 32); // cap dt
      physicsRef.current.lastTime = time;

      const phys = physicsRef.current;
      const container = containerRef.current;
      
      let width = 300;
      let height = 500;
      if (container) {
        const rect = container.getBoundingClientRect();
        width = rect.width / 2;
        height = rect.height / 2;
      }

      // Integration
      const ACCEL_MULT = 0.05;
      const FRICTION = 0.95;

      phys.vx += phys.ax * ACCEL_MULT * dt;
      phys.vy += phys.ay * ACCEL_MULT * dt;
      
      phys.vx *= FRICTION;
      phys.vy *= FRICTION;

      phys.x += phys.vx * dt;
      phys.y += phys.vy * dt;

      // Bounds checking (bounce)
      const maxX = width - BALL_RADIUS;
      const maxY = height - BALL_RADIUS;

      if (phys.x > maxX) { phys.x = maxX; phys.vx *= -0.5; }
      if (phys.x < -maxX) { phys.x = -maxX; phys.vx *= -0.5; }
      if (phys.y > maxY) { phys.y = maxY; phys.vy *= -0.5; }
      if (phys.y < -maxY) { phys.y = -maxY; phys.vy *= -0.5; }

      // Update render state
      setBallPos({ x: phys.x, y: phys.y });

      // Check Safe Zone
      const distToCenter = Math.sqrt(phys.x * phys.x + phys.y * phys.y);
      if (distToCenter < SAFE_RADIUS) {
        phys.timeInZone += dt;
        if (phys.timeInZone >= HOLD_TIME_MS) {
          setIsRevealed(true);
          onComplete?.();
        }
      } else {
        phys.timeInZone = 0;
      }

      setInZoneProgress(Math.min(1, phys.timeInZone / HOLD_TIME_MS));

      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [isRevealed, permissionGranted, onComplete]);

  const requestPermission = async () => {
    if (typeof (window as any).DeviceOrientationEvent !== 'undefined' && typeof (window.DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permissionState = await (window.DeviceOrientationEvent as any).requestPermission();
        if (permissionState === "granted") {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (err) {
        console.error(err);
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDesktopFallback || isRevealed || !containerRef.current) return;
    // On desktop, the ball accelerates towards the cursor
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    // Normalized distance from center to cursor (-1 to 1)
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    
    physicsRef.current.ax = nx * 1.5;
    physicsRef.current.ay = ny * 1.5;
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-zinc-900 touch-none select-none flex items-center justify-center p-8"
      ref={containerRef}
      onPointerMove={handlePointerMove}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-1000 z-10"
        style={{ 
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? 'scale(1)' : 'scale(0.9)',
          backgroundColor: palette.primary as string
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Revealed" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-secondary)] drop-shadow-md">
          {config.title}
        </h1>
        <p className="text-lg font-body text-white whitespace-pre-wrap max-w-sm drop-shadow-md">
          {config.body}
        </p>
      </div>

      {/* Foreground Balance Board Layer */}
      <AnimatePresence>
        {!isRevealed && permissionGranted && (
          <motion.div 
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1 }}
          >
            {/* Board Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="absolute top-12 left-0 w-full text-center">
              <p className="text-white/60 font-heading animate-pulse text-lg tracking-widest">
                {isDesktopFallback ? "Use mouse to balance" : "Balance to unlock"}
              </p>
            </div>

            {/* Safe Zone Indicator */}
            <div 
              className="absolute rounded-full border-4 transition-colors duration-300 flex items-center justify-center"
              style={{ 
                width: SAFE_RADIUS * 2 + BALL_RADIUS * 2,
                height: SAFE_RADIUS * 2 + BALL_RADIUS * 2,
                borderColor: inZoneProgress > 0 ? palette.accent as string : 'rgba(255,255,255,0.1)',
                boxShadow: inZoneProgress > 0 ? `0 0 ${inZoneProgress * 50}px ${palette.accent}` : 'none'
              }}
            >
              {/* Progress Ring */}
              <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90">
                <circle 
                  cx="50%" 
                  cy="50%" 
                  r="calc(50% - 2px)" 
                  fill="none" 
                  stroke={palette.accent as string}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * (SAFE_RADIUS + BALL_RADIUS)}`}
                  strokeDashoffset={`${2 * Math.PI * (SAFE_RADIUS + BALL_RADIUS) * (1 - inZoneProgress)}`}
                  className="transition-all duration-75"
                />
              </svg>
            </div>

            {/* The Ball */}
            <div 
              className="absolute rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),_0_10px_20px_rgba(0,0,0,0.5)]"
              style={{
                width: BALL_RADIUS * 2,
                height: BALL_RADIUS * 2,
                transform: `translate(${ballPos.x}px, ${ballPos.y}px)`,
                backgroundColor: palette.secondary as string,
              }}
            >
              <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full" />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Mask / Gate */}
      {permissionGranted === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-center backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 p-8 rounded-3xl border border-white/20 max-w-sm shadow-2xl"
          >
            <Move size={48} className="mx-auto mb-6 text-white" />
            <h2 className="text-2xl text-white font-bold mb-4 font-heading">Calibrate Sensors</h2>
            <p className="text-white/70 mb-8 font-body">We need access to your device's motion sensors to balance the board.</p>
            <button 
              onClick={requestPermission}
              className="px-8 py-4 bg-white text-black font-bold font-body rounded-full hover:bg-gray-200 transition-colors w-full"
            >
              Start Calibration
            </button>
          </motion.div>
        </div>
      )}
      
    </div>
  );
}
