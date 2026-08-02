"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";

export function CompassLock({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [heading, setHeading] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDesktopDrag, setIsDesktopDrag] = useState(false); // Enable manual drag if no sensor
  
  const containerRef = useRef<HTMLDivElement>(null);
  const matchDurationRef = useRef(0);
  const lastTimeRef = useRef(0);
  const reqRef = useRef(0);

  const TARGET_HEADING = 0; // North
  const TOLERANCE = 15; // degrees

  useEffect(() => {
    // Check if we need permission for deviceorientation
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
      let h = 0;
      if ((e as any).webkitCompassHeading !== undefined) {
        // iOS
        h = (e as any).webkitCompassHeading;
        hasOrientationData = true;
      } else if (e.absolute && e.alpha !== null) {
        // Android
        h = 360 - e.alpha;
        hasOrientationData = true;
      } else if (e.alpha !== null && !hasOrientationData) {
        // Non-absolute fallback
        h = 360 - e.alpha;
        hasOrientationData = true;
      }
      if (hasOrientationData) {
        setHeading(h);
        setIsDesktopDrag(false);
      }
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation as any);
    window.addEventListener("deviceorientation", handleOrientation);

    // After 1 second, if no data, assume desktop
    const timer = setTimeout(() => {
      if (!hasOrientationData) {
        setIsDesktopDrag(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation as any);
      window.removeEventListener("deviceorientation", handleOrientation);
      clearTimeout(timer);
    };
  }, [permissionGranted, isRevealed]);

  useEffect(() => {
    if (isRevealed || !permissionGranted) return;

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Check if current heading matches target
      let diff = Math.abs(heading - TARGET_HEADING);
      if (diff > 180) diff = 360 - diff; // Wrap around

      if (diff <= TOLERANCE) {
        matchDurationRef.current += dt;
        if (matchDurationRef.current >= 2000) { // 2 seconds
          setIsRevealed(true);
          onComplete?.();
        }
      } else {
        matchDurationRef.current = 0;
      }

      if (!isRevealed) {
        reqRef.current = requestAnimationFrame(loop);
      }
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [heading, isRevealed, permissionGranted, onComplete]);

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

  const getAngle = (e: React.PointerEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const [dragState, setDragState] = useState({ isDragging: false, lastAngle: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isDesktopDrag || isRevealed) return;
    setDragState({ isDragging: true, lastAngle: getAngle(e) });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDesktopDrag || isRevealed || !dragState.isDragging) return;
    const currentAngle = getAngle(e);
    let delta = currentAngle - dragState.lastAngle;
    
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    
    let newHeading = heading - delta; // reverse drag
    if (newHeading < 0) newHeading += 360;
    if (newHeading >= 360) newHeading -= 360;

    setHeading(newHeading);
    setDragState({ isDragging: true, lastAngle: currentAngle });
  };

  const handlePointerUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  // Visual match ratio for the glowing effect
  let diff = Math.abs(heading - TARGET_HEADING);
  if (diff > 180) diff = 360 - diff;
  const isAligned = diff <= TOLERANCE;
  const matchRatio = Math.min(1, matchDurationRef.current / 2000);

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] touch-none select-none flex items-center justify-center p-8"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
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

      {/* Foreground Compass Layer */}
      <AnimatePresence>
        {!isRevealed && permissionGranted && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#111]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1 }}
          >
            
            <p className="text-white/60 font-heading mb-12 animate-pulse text-lg">
              {isDesktopDrag ? "Drag compass to point North" : "Turn your device to face North"}
            </p>

            <div 
              className="relative w-72 h-72 rounded-full border-4 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors duration-300 touch-none"
              style={{ 
                borderColor: isAligned ? palette.accent as string : '#333',
                boxShadow: isAligned ? `0 0 ${20 + matchRatio * 40}px ${palette.accent}` : '0 0 50px rgba(0,0,0,0.5)'
              }}
              onPointerDown={handlePointerDown}
            >
              
              {/* The Rotating Dial */}
              <div 
                className="absolute inset-2 rounded-full border border-white/10"
                style={{ 
                  transform: `rotate(${-heading}deg)`,
                  transition: isDesktopDrag ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                {/* N, S, E, W Markers */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-red-500 font-bold font-heading text-xl">N</div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 font-bold font-heading">S</div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-bold font-heading">E</div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold font-heading">W</div>
                
                {/* Tick marks */}
                {Array.from({ length: 72 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 origin-bottom"
                    style={{ 
                      height: '50%',
                      transform: `rotate(${i * 5}deg)`,
                      background: i % 18 === 0 ? 'transparent' : i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    }}
                  />
                ))}
              </div>

              {/* Fixed Needle targeting Top (North) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1 h-full flex flex-col justify-between py-6">
                  <div className="w-full h-8 bg-red-500 rounded-t-full shadow-lg" />
                  <div className="w-full h-8 bg-white rounded-b-full shadow-lg" />
                </div>
                <div className="absolute w-4 h-4 rounded-full bg-zinc-800 border-2 border-white" />
              </div>

            </div>

            <div className="mt-12 text-white/40 font-mono text-sm tracking-widest">
              {Math.round(heading)}°
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
            <Compass size={48} className="mx-auto mb-6 text-white" />
            <h2 className="text-2xl text-white font-bold mb-4 font-heading">Calibrate Compass</h2>
            <p className="text-white/70 mb-8 font-body">We need access to your device's compass to point you in the right direction.</p>
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
