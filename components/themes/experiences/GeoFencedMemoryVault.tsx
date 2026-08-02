"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Lock, Unlock, Navigation } from "lucide-react";

export function GeoFencedMemoryVault({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#22c55e";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"];

  const targetLat = (config.experience as any)?.targetLat || 40.7128;
  const targetLng = (config.experience as any)?.targetLng || -74.006;
  const radiusMeters = (config.experience as any)?.radiusMeters || 50;
  const lockedMemory = config.body || "This is where we had our first kiss. The park bench by the old fountain.";
  const title = config.title || "The Park Bench";

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Haversine distance
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          const d = haversine(pos.coords.latitude, pos.coords.longitude, targetLat, targetLng);
          setDistance(d);
          if (d <= radiusMeters && !isUnlocked) {
            setIsUnlocked(true);
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
            if (onComplete) onComplete();
          }
        },
        (err) => {
          setError("Location access denied or unavailable.");
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      setError("Geolocation not supported.");
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const handleFallbackUnlock = () => {
    setIsUnlocked(true);
    if (onComplete) onComplete();
  };

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center font-mono overflow-hidden text-white p-6"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* Radar rings background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="absolute rounded-full border border-green-500/50" style={{ width: `${i * 25}%`, height: `${i * 25}%` }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div key="locked" exit={{ scale: 0.8, opacity: 0 }} className="relative z-10 flex flex-col items-center max-w-sm text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 rounded-full border-4 border-green-500/50 flex items-center justify-center mb-8 bg-green-500/10"
            >
              <Lock size={36} className="text-green-400" />
            </motion.div>

            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">{title}</h2>
            <p className="text-slate-400 text-sm mb-6">This memory is locked to a location. Travel to the coordinates to unlock it.</p>

            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 w-full mb-4">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Target Coordinates</div>
              <div className="text-green-400 font-bold">{targetLat.toFixed(4)}°N, {Math.abs(targetLng).toFixed(4)}°W</div>
              <div className="text-[10px] text-slate-500 mt-2">Radius: {radiusMeters}m</div>
            </div>

            {distance !== null && (
              <div className="text-sm mb-4">
                <span className="text-slate-400">Distance: </span>
                <span className="text-green-400 font-bold">{distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`}</span>
              </div>
            )}

            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

            <button
              onClick={() => setUseFallback(true)}
              className="text-xs text-slate-500 hover:text-slate-300 underline mt-4"
            >
              Can't travel? Unlock manually
            </button>

            {useFallback && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleFallbackUnlock}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg font-bold"
              >
                <Unlock size={16} className="inline mr-2" /> Force Unlock
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 max-w-md bg-green-500/10 border border-green-500/30 p-8 rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.15)] text-center"
          >
            <Unlock size={32} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-green-300 mb-4">Memory Unlocked</h3>
            <div className="w-full h-px bg-green-500/30 mb-6" />
            <p className="text-lg text-slate-200 leading-relaxed font-sans">{lockedMemory}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
