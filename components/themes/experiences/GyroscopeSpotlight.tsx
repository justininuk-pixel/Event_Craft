"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function GyroscopeSpotlight({
  config,
  palette,
}: ExperienceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentages
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // If not mobile/tablet, we don't necessarily need permission, but let's check
    if (typeof window !== 'undefined' && typeof (window as any).DeviceOrientationEvent !== 'undefined') {
      if (typeof (window.DeviceOrientationEvent as any).requestPermission !== "function") {
        setPermissionGranted(true);
      }
    } else {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Beta (front-to-back tilt) ranges from -180 to 180
      // Gamma (left-to-right tilt) ranges from -90 to 90
      let beta = event.beta || 0;
      let gamma = event.gamma || 0;

      // Clamp for usable viewing angles (e.g., -45 to 45)
      beta = Math.max(-45, Math.min(45, beta));
      gamma = Math.max(-45, Math.min(45, gamma));

      // Map to 0-100%
      const x = ((gamma + 45) / 90) * 100;
      // Depending on how the user holds the phone, 0 might be flat or upright
      // Typically, holding upright gives beta ~45-90. Let's assume a range of 0 to 90
      const clampedBeta = Math.max(0, Math.min(90, event.beta || 45));
      const y = ((clampedBeta) / 90) * 100;

      setPosition({ x, y });
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [permissionGranted]);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    // Desktop fallback
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black touch-none"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* The Hidden Panoramic Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-transform duration-300"
        style={{
          // Parallax effect on the background to make the spotlight feel more physical
          transform: `translate(${(50 - position.x) * 0.2}%, ${(50 - position.y) * 0.2}%) scale(1.2)`,
          backgroundColor: palette.background as string || '#111'
        }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Hidden" 
            className="w-64 h-64 object-cover rounded-xl shadow-2xl mb-8"
          />
        )}
        <h1 className="text-5xl font-heading mb-6" style={{ color: palette.primary }}>
          {config.title}
        </h1>
        <p className="text-xl font-body max-w-lg" style={{ color: palette.text }}>
          {config.body}
        </p>
      </div>

      {/* The Darkness Overlay (Mask) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-75 z-10"
        style={{
          background: `radial-gradient(circle 120px at ${position.x}% ${position.y}%, transparent 0%, rgba(0,0,0,0.95) 100%)`
        }}
      />

      {/* Permission Gate */}
      {permissionGranted === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-6 text-center backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 p-8 rounded-3xl border border-white/20 max-w-sm shadow-2xl"
          >
            <Compass size={48} className="mx-auto mb-6 text-white" />
            <h2 className="text-2xl text-white font-bold mb-4 font-heading">Start Exploring</h2>
            <p className="text-white/70 mb-8 font-body">Move your device around like a flashlight to explore the hidden message in the dark.</p>
            <button 
              onClick={requestPermission}
              className="px-8 py-4 bg-white text-black font-bold font-body rounded-full hover:bg-gray-200 transition-colors w-full"
            >
              Turn on Flashlight
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
