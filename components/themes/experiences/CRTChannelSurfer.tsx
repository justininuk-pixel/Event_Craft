"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Volume2 } from "lucide-react";

type Channel = {
  id: string;
  label: string;
  videoSrc: string;
  caption: string;
};

export function CRTChannelSurfer({
  theme,
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#1a1a1a"];

  // Channels come from the creator's own "moments" (editable in the Experience panel);
  // falls back to the card's title/message so nothing hardcoded about strangers ever shows.
  const milestones = config.experience?.milestones ?? [];
  const channelNumbers = ["03", "07", "12", "24", "36", "48", "61", "72"];
  const channels: Channel[] = milestones.length > 0
    ? milestones.slice(0, 8).map((m, i) => ({
        id: m.id || `ch${i}`,
        label: `CH ${channelNumbers[i % channelNumbers.length]}`,
        videoSrc: "",
        caption: [m.date, m.title, m.body].filter(Boolean).join(", "),
      }))
    : [
        { id: "ch1", label: "CH 03", videoSrc: "", caption: config.title || theme.content.title || "A special broadcast" },
        { id: "ch2", label: "CH 07", videoSrc: "", caption: config.body || theme.content.body || "Someone has something to tell you." },
        { id: "ch3", label: "CH 12", videoSrc: "", caption: config.recipient ? `This broadcast is dedicated to ${config.recipient}.` : "Add your own moments in the editor's Experience panel, each becomes a channel." },
      ];

  const [currentChannel, setCurrentChannel] = useState(0);
  const [isStatic, setIsStatic] = useState(false);
  const [staticCanvas, setStaticCanvas] = useState<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticAnimRef = useRef<number>(0);

  // Draw TV static
  const drawStatic = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Runs from requestAnimationFrame (TV static effect), not during render.
      // eslint-disable-next-line react-hooks/purity
      const val = Math.random() * 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    if (isStatic) {
      staticAnimRef.current = requestAnimationFrame(drawStatic);
    }
  };

  useEffect(() => {
    if (isStatic) {
      drawStatic();
    }
    return () => {
      if (staticAnimRef.current) cancelAnimationFrame(staticAnimRef.current);
    };
  }, [isStatic]);

  const changeChannel = (direction: "up" | "down") => {
    setIsStatic(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      setCurrentChannel((prev) => {
        if (direction === "up") return (prev + 1) % channels.length;
        return (prev - 1 + channels.length) % channels.length;
      });
      setIsStatic(false);
      if (onComplete) onComplete();
    }, 600);
  };

  const activeChannel = channels[currentChannel];

  return (
    <div
      className="w-full h-full relative flex flex-col items-center justify-center font-mono overflow-hidden select-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* CRT TV Body */}
      <div className="relative w-full max-w-sm aspect-[4/3] bg-[#2a2a2a] rounded-xl border-[12px] border-[#3d3d3d] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(0,0,0,0.5)]">

        {/* Screen */}
        <div className="w-full h-full relative overflow-hidden rounded-sm bg-black">

          {/* Scanlines overlay */}
          <div
            className="absolute inset-0 z-20 pointer-events-none opacity-30"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              backgroundSize: "100% 4px",
            }}
          />

          {/* CRT curvature vignette */}
          <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]" />

          {/* Static Canvas */}
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-100 ${isStatic ? "opacity-100" : "opacity-0"}`}
          />

          {/* Channel Content */}
          <AnimatePresence mode="wait">
            {!isStatic && (
              <motion.div
                key={activeChannel.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-slate-800 to-black"
              >
                {/* Placeholder for video, show the memory text */}
                <div className="text-6xl mb-4 opacity-30">📼</div>
                <p className="text-white/90 text-sm leading-relaxed max-w-[250px] font-sans">
                  {activeChannel.caption}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Channel Number OSD */}
          <div className="absolute top-3 right-4 z-30 text-green-400 font-mono text-xl font-bold drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]">
            {activeChannel.label}
          </div>
        </div>
      </div>

      {/* Channel Dial Controls */}
      <div className="mt-8 flex items-center gap-8">
        <button
          onClick={() => changeChannel("down")}
          className="w-14 h-14 rounded-full bg-[#3d3d3d] border-2 border-[#555] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4)] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:translate-y-[1px] flex items-center justify-center text-white transition-all"
        >
          <ChevronDown size={24} />
        </button>

        <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Channel</div>

        <button
          onClick={() => changeChannel("up")}
          className="w-14 h-14 rounded-full bg-[#3d3d3d] border-2 border-[#555] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4)] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] active:translate-y-[1px] flex items-center justify-center text-white transition-all"
        >
          <ChevronUp size={24} />
        </button>
      </div>

      {/* Volume knob decorative */}
      <div className="mt-4 flex items-center gap-2 text-slate-600">
        <Volume2 size={14} />
        <div className="w-20 h-1 bg-slate-700 rounded-full">
          <div className="w-3/4 h-full bg-slate-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
