"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { triggerVibrate } from "../../../lib/utils/device";

interface InteractiveProps {
  yesText?: string;
  noText?: string;
  promptText?: string;
  onYes: () => void;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string | string[];
    text: string;
    textSecondary: string;
  };
}

export function GyroscopeSlide({
  yesText = "Yes",
  noText = "No",
  promptText = "Ready to adventure together? 🗺️",
  onYes,
  palette,
}: InteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const [gyroActive, setGyroActive] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [noScale, setNoScale] = useState(1.0); // Fallback shrinking scale

  // Motion positions
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 18 });
  const springY = useSpring(y, { stiffness: 150, damping: 18 });

  // Handle mobile gyroscope (device orientation)
  useEffect(() => {
    if (typeof window === "undefined" || !gyroActive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const container = containerRef.current;
      const button = noButtonRef.current;
      if (!container || !button) return;

      const cRect = container.getBoundingClientRect();
      const bRect = button.getBoundingClientRect();

      const maxW = cRect.width / 2 - bRect.width / 2 - 20;
      const maxH = cRect.height / 2 - bRect.height / 2 - 20;

      // beta: front-back tilt (-180 to 180)
      // gamma: left-right tilt (-90 to 90)
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;

      // Translate tilt to movement bounds
      const targetX = (gamma / 35) * maxW;
      const targetY = ((beta - 45) / 35) * maxH; // 45 deg average phone hold pitch

      x.set(Math.max(-maxW, Math.min(maxW, targetX)));
      y.set(Math.max(-maxH, Math.min(maxH, targetY)));
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [gyroActive, x, y]);

  const requestPermission = async () => {
    setPermissionRequested(true);
    // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
          setGyroActive(true);
        } else {
          // Denied
          setGyroActive(false);
        }
      } catch (e) {
        console.warn("DeviceOrientation permission failed", e);
        setGyroActive(false);
      }
    } else {
      // Standard Android or device orientation already active
      setGyroActive(true);
    }
  };

  // Fallback: Shrinking target if gyroscope is not supported/granted
  const handleNoClickFallback = () => {
    triggerVibrate(60);
    setNoScale((s) => Math.max(s * 0.4, 0.05));
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[350px]"
    >
      <h3
        className="text-lg md:text-xl font-black text-center mb-6 select-none z-10"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      {/* Permission Pre-screen Overlay */}
      {!gyroActive && !permissionRequested && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col justify-center items-center p-6 text-center">
          <span className="text-3xl mb-3">🧭</span>
          <h4 className="text-white font-bold text-sm mb-1">Motion Control Required</h4>
          <p className="text-zinc-300 text-xs mb-4">We use your device sensors to balance the interactive game.</p>
          <button
            onClick={requestPermission}
            className="px-5 py-2.5 rounded-full font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer min-h-[48px]"
          >
            Access Motion Sensors
          </button>
          <button
            onClick={() => setPermissionRequested(true)}
            className="text-[10px] text-zinc-400 mt-2 hover:underline cursor-pointer min-h-[44px]"
          >
            Skip and use Classic Fallback
          </button>
        </div>
      )}

      {/* YES BUTTON (Static center) */}
      <div className="flex-1 flex items-center justify-center z-10">
        <motion.button
          onClick={onYes}
          className="px-8 py-3 rounded-full font-bold text-white shadow-xl pointer-events-auto cursor-pointer select-none"
          style={{
            backgroundColor: palette.primary,
            fontSize: "17px",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {yesText}
        </motion.button>
      </div>

      {/* NO BUTTON (Tilt controlled OR Shrinking fallback) */}
      <div className="absolute inset-0 pointer-events-none w-full h-full">
        {gyroActive ? (
          <motion.button
            ref={noButtonRef}
            className="absolute p-3 px-5 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-default select-none"
            style={{
              backgroundColor: palette.secondary,
              x: springX,
              y: springY,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {noText}
          </motion.button>
        ) : (
          permissionRequested && noScale > 0.08 && (
            <motion.button
              ref={noButtonRef}
              onClick={handleNoClickFallback}
              className="absolute p-3 px-5 rounded-full font-bold text-white shadow-lg pointer-events-auto cursor-pointer select-none"
              style={{
                backgroundColor: palette.secondary,
                top: "50%",
                left: "70%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{ scale: noScale }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {noText}
            </motion.button>
          )
        )}
      </div>

      <span className="text-[9px] opacity-40 select-none z-10 mt-2">
        {gyroActive ? "Gyroscope active: Tilt screen to slide 🧭" : "Standard fallback mode active"}
      </span>
    </div>
  );
}

export default GyroscopeSlide;
