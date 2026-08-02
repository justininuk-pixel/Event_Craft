"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";

/**
 * Ceremonial "seal the capsule" ritual. The recipient turns each of the five keys themselves
 * (tap), then slides the heavy bolt to seal the memories in. Replaces the old version where the
 * keys were a fake hardcoded "4/5", the gallery showed stock photos of strangers, and the seal
 * ended on a meaningless fake 5-year countdown.
 */
export function TimeCapsuleSeal({
  theme,
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const [phase, setPhase] = useState<"open" | "sealing" | "sealed">("open");
  const totalKeys = 5;
  const [keysTurned, setKeysTurned] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const controls = useAnimation();
  const trackRef = useRef<HTMLDivElement>(null);

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#111827"];
  const allKeysTurned = keysTurned >= totalKeys;

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    const trackWidth = trackRef.current?.offsetWidth ?? 280;
    const threshold = trackWidth * 0.55;
    if (allKeysTurned && info.offset.x > threshold) {
      setIsLocked(true);
      controls.start({ x: trackWidth - 80 });
      setTimeout(() => handleSeal(), 400);
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleSeal = () => {
    setPhase("sealing");
    setTimeout(() => {
      setPhase("sealed");
      setTimeout(() => {
        onComplete?.();
      }, 2500);
    }, 1800);
  };

  // Real memories only: the creator's photos, never stock strangers.
  const media = (config.mediaUrls?.length ? config.mediaUrls : config.mediaUrl ? [config.mediaUrl] : []).slice(0, 4);

  const title = config.title || theme.content.title;
  const body = config.body || theme.content.body;
  const unlockDate = config.experience?.unlockDate;

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col font-sans select-none text-white bg-zinc-950">
      <AnimatePresence mode="wait">
        {phase === "open" && (
          <motion.div
            key="open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex flex-col"
            style={{ background: `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1] || bgColors[0]})` }}
          >
            {/* Memories to be sealed */}
            <div className="flex-1 overflow-y-auto p-6 pb-64 custom-scrollbar">
              <h1 className="text-3xl md:text-4xl font-black mb-4 capitalize leading-tight">{title}</h1>
              <p className="text-base md:text-lg opacity-80 mb-8 whitespace-pre-wrap">{body}</p>

              {media.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {media.map((img, i) => (
                    <div key={i} className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden shadow-xl border-4 border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} className="w-full h-full object-cover opacity-90" alt="Memory" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {["💌", "📸", "🎞️"].map((e, i) => (
                    <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-4xl">
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Control panel */}
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="absolute bottom-0 w-full bg-zinc-900 border-t-4 border-zinc-700 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] p-5 pt-6 rounded-t-3xl"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-xs text-zinc-400 uppercase tracking-widest">
                  {allKeysTurned ? "All keys turned, seal it" : "Turn every key to arm the seal"}
                </span>
                <span className="font-black text-lg text-white bg-zinc-800 px-3 py-0.5 rounded-full border border-zinc-700">
                  {keysTurned}/{totalKeys}
                </span>
              </div>

              {/* The five keys, the recipient turns them */}
              <div className="flex justify-between gap-2 mb-5">
                {Array.from({ length: totalKeys }).map((_, i) => {
                  const turned = i < keysTurned;
                  const isNext = i === keysTurned;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { if (isNext) setKeysTurned((k) => k + 1); }}
                      className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition-all cursor-pointer ${
                        turned
                          ? "bg-red-500/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          : isNext
                          ? "bg-zinc-800 border-zinc-500 animate-pulse"
                          : "bg-zinc-800/40 border-zinc-700 opacity-40"
                      }`}
                      aria-label={turned ? `Key ${i + 1} turned` : `Turn key ${i + 1}`}
                    >
                      <span className={turned ? "rotate-90 transition-transform duration-500 inline-block" : "inline-block"}>🗝️</span>
                    </button>
                  );
                })}
              </div>

              {/* Slide to seal */}
              <div
                ref={trackRef}
                className={`w-full h-16 bg-zinc-950 rounded-full border-4 border-zinc-800 shadow-inner relative flex items-center px-2 overflow-hidden transition-opacity ${allKeysTurned ? "opacity-100" : "opacity-40"}`}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <span className="font-black tracking-[0.4em] text-zinc-500 text-sm">SLIDE TO SEAL</span>
                </div>

                {!isLocked ? (
                  <motion.div
                    drag={allKeysTurned ? "x" : false}
                    dragConstraints={trackRef}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    className={`w-12 h-12 bg-gradient-to-br from-zinc-200 to-zinc-400 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-white relative z-10 ${
                      allKeysTurned ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-500 shadow-inner" />
                  </motion.div>
                ) : (
                  <div className="w-12 h-12 ml-auto bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-700 relative z-10">
                    <span className="text-lg">🔒</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {phase === "sealing" && (
          <motion.div key="sealing" className="absolute inset-0 z-50 bg-black flex items-center justify-center">
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              className="w-full h-full bg-zinc-800 absolute"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="w-44 h-44 rounded-full border-8 border-red-600 flex items-center justify-center relative z-10 bg-black"
            >
              <span className="text-4xl text-red-600 font-black tracking-widest">SEALED</span>
            </motion.div>
          </motion.div>
        )}

        {phase === "sealed" && (
          <motion.div
            key="sealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
              <span className="text-8xl">🏛️</span>
            </motion.div>

            <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-400 mb-4">Capsule Sealed</h2>
            <p className="text-zinc-400 max-w-sm mb-10 leading-relaxed">
              {`"${title}" is safely locked inside, these memories are kept exactly as they are today.`}
            </p>

            <div className="w-full max-w-sm border border-zinc-800 bg-zinc-900 rounded-2xl p-6 shadow-2xl">
              {unlockDate ? (
                <>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-4">Reopens in</h3>
                  <div className="font-mono text-3xl md:text-4xl font-black text-red-500 tracking-tighter">
                    <CountdownTimer target={unlockDate} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Come back to this link whenever the moment feels right, the capsule will be waiting.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CountdownTimer({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => Math.max(0, new Date(target).getTime() - Date.now());
    setRemaining(compute());
    const i = setInterval(() => setRemaining(compute()), 1000);
    return () => clearInterval(i);
  }, [target]);

  if (remaining === null) return <span>—</span>;
  if (remaining <= 0) return <span className="text-emerald-500">Unlocked!</span>;

  const s = Math.floor(remaining / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return (
    <div className="flex justify-center items-baseline gap-2">
      {days > 0 && (
        <div className="flex flex-col items-center">
          <span>{days}</span>
          <span className="text-[10px] text-zinc-600 uppercase">Days</span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <span>{hrs.toString().padStart(2, "0")}</span>
        <span className="text-[10px] text-zinc-600 uppercase">Hr</span>
      </div>
      <span className="opacity-30 pb-4">:</span>
      <div className="flex flex-col items-center">
        <span>{mins.toString().padStart(2, "0")}</span>
        <span className="text-[10px] text-zinc-600 uppercase">Min</span>
      </div>
      <span className="opacity-30 pb-4">:</span>
      <div className="flex flex-col items-center">
        <span>{secs.toString().padStart(2, "0")}</span>
        <span className="text-[10px] text-zinc-600 uppercase">Sec</span>
      </div>
    </div>
  );
}
