"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

/**
 * "Pull back the tide" reveal. The message is written in the sand and covered by the sea; the
 * recipient presses and holds to draw the water back until the words surface. Releasing lets the
 * tide flow back in. This replaces the old version, which only revealed the message when the
 * real-world tide happened to be low — meaning a recipient could open the card and just see an
 * ocean for hours with no way to read their message.
 */
export function TideTracker({
  theme,
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  // 1 = fully covered by sea, 0 = fully receded (message readable).
  const [tide, setTide] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const holdingRef = useRef(false);
  const rafRef = useRef(0);

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0ea5e9";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fde68a"];

  useEffect(() => {
    const tick = () => {
      setTide((prev) => {
        const target = holdingRef.current ? -0.02 : 0.012; // recede fast, return gently
        let next = prev + target;
        next = Math.max(0, Math.min(1, next));
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (tide <= 0.12 && !revealed) {
      setRevealed(true);
      onComplete?.();
    }
  }, [tide, revealed, onComplete]);

  const oceanTranslateY = (1 - tide) * 100;
  const title = config.title || theme.content.title;
  const body = config.body || theme.content.body;

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none touch-none cursor-pointer"
      style={{ backgroundColor: bgColors[0] }}
      onPointerDown={() => { holdingRef.current = true; }}
      onPointerUp={() => { holdingRef.current = false; }}
      onPointerLeave={() => { holdingRef.current = false; }}
    >
      {/* Sand texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Message written in the wet sand */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10 pointer-events-none">
        <div
          className="max-w-2xl text-[#b45309]"
          style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.5), -1px -1px 2px rgba(0,0,0,0.2)" }}
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-8">{title}</h1>
          <p className="text-xl md:text-2xl font-bold leading-relaxed whitespace-pre-wrap opacity-90">{body}</p>
        </div>
      </div>

      {/* The sea */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[150vh] z-20 pointer-events-none flex flex-col justify-start"
        animate={{ y: `${oceanTranslateY}%` }}
        transition={{ type: "tween", duration: 0.12, ease: "linear" }}
      >
        <div className="w-full h-16 md:h-24 relative overflow-hidden text-white/80">
          <svg className="absolute bottom-0 w-[200%] h-full animate-[wave_10s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ fill: primaryColor }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-28.89V0Z" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" />
          </svg>
          <style>{`@keyframes wave { 0% { transform: translateX(0);} 100% { transform: translateX(-50%);} }`}</style>
        </div>
        <div className="w-full flex-1" style={{ backgroundColor: primaryColor }} />
      </motion.div>

      {/* Clear instruction while covered */}
      <AnimatePresence>
        {!revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
          >
            <div className="bg-white/25 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/40 text-white font-bold uppercase tracking-widest text-xs shadow-lg animate-pulse">
              Press &amp; hold to pull back the tide
            </div>
            <div className="w-40 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white/90 transition-all" style={{ width: `${(1 - tide) * 100}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
