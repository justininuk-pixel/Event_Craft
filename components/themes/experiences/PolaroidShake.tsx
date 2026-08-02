"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export function PolaroidShake({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isDeveloped, setIsDeveloped] = useState(false);
  
  const reqRef = useRef<number>(0);
  const progressRef = useRef(0);
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });

  const NATURAL_DEV_TIME_MS = 30000; // 30s
  const MAX_SHAKE_BONUS = 0.05; // 5% jump for extreme shake

  useEffect(() => {
    // Check if we need permission for devicemotion
    if (typeof window !== 'undefined' && typeof (window as any).DeviceMotionEvent !== 'undefined') {
      if (typeof (window.DeviceMotionEvent as any).requestPermission !== "function") {
        setPermissionGranted(true);
      }
    } else {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted || isDeveloped) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      // Natural increment
      progressRef.current = Math.min(1, progressRef.current + dt / NATURAL_DEV_TIME_MS);
      
      setProgress(progressRef.current);

      if (progressRef.current >= 1 && !isDeveloped) {
        setIsDeveloped(true);
        onComplete?.();
      } else {
        reqRef.current = requestAnimationFrame(loop);
      }
    };

    reqRef.current = requestAnimationFrame(loop);

    // Mobile Shake Handler
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      const { x, y, z } = event.accelerationIncludingGravity;
      const force = Math.abs(x || 0) + Math.abs(y || 0) + Math.abs(z || 0);
      
      // Typical resting gravity is ~9.8. A shake might push it to 20-30+
      if (force > 15) {
        const bonus = Math.min(MAX_SHAKE_BONUS, (force - 15) * 0.001);
        progressRef.current = Math.min(1, progressRef.current + bonus);
      }
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      cancelAnimationFrame(reqRef.current);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [permissionGranted, isDeveloped, onComplete]);

  const requestPermission = async () => {
    if (typeof (window as any).DeviceMotionEvent !== 'undefined' && typeof (window.DeviceMotionEvent as any).requestPermission === "function") {
      try {
        const permissionState = await (window.DeviceMotionEvent as any).requestPermission();
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
    if (isDeveloped) return;
    
    const now = performance.now();
    if (lastMouseRef.current.time > 0) {
      const dt = now - lastMouseRef.current.time;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      // Speed in pixels per ms
      const speed = distance / Math.max(1, dt);
      
      // If moving fast (e.g. wiggling)
      if (speed > 2) {
        const bonus = Math.min(MAX_SHAKE_BONUS, speed * 0.0005);
        progressRef.current = Math.min(1, progressRef.current + bonus);
      }
    }

    lastMouseRef.current = { x: e.clientX, y: e.clientY, time: now };
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-[var(--exp-background)] flex items-center justify-center p-8 touch-none select-none"
      onPointerMove={handlePointerMove}
    >
      
      {/* The Polaroid */}
      <motion.div 
        className="bg-white p-4 pb-12 rounded-sm shadow-2xl flex flex-col w-full max-w-sm"
        initial={{ y: 50, rotate: -3 }}
        animate={{ y: 0, rotate: (Math.random() - 0.5) * 4 }} // Slight wiggles when agitated?
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="w-full aspect-square bg-[#ddd] relative overflow-hidden border border-black/5">
          
          {/* Inner Photo */}
          {config.mediaUrl && (
            <img 
              src={config.mediaUrl} 
              alt="Developed" 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
              style={{
                opacity: progress,
                filter: `sepia(${1 - progress}) contrast(${1 + (1 - progress)})`
              }}
            />
          )}

          {/* Chemical Development Overlay */}
          <div 
            className="absolute inset-0 bg-[#f0f0f0] transition-opacity duration-200 mix-blend-multiply"
            style={{ opacity: 1 - progress }}
          />

        </div>

        {/* Caption */}
        <p className="text-center font-heading text-2xl mt-6 text-black/80 transform -rotate-2">
          {config.title}
        </p>

      </motion.div>

      {/* Intro Mask / Gate */}
      {permissionGranted === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-center backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 p-8 rounded-3xl border border-white/20 max-w-sm shadow-2xl"
          >
            <Camera size={48} className="mx-auto mb-6 text-white" />
            <h2 className="text-2xl text-white font-bold mb-4 font-heading">Develop the Photo</h2>
            <p className="text-white/70 mb-8 font-body">Shake your device or wiggle your mouse to speed up the chemical development.</p>
            <button 
              onClick={requestPermission}
              className="px-8 py-4 bg-white text-black font-bold font-body rounded-full hover:bg-gray-200 transition-colors w-full"
            >
              Start Developing
            </button>
          </motion.div>
        </div>
      )}
      
    </div>
  );
}
