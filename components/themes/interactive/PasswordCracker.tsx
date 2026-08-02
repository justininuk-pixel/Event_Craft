"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerVibrate } from "../../../lib/utils/device";
import { audioManager } from "../../../lib/audio/manager";

interface InteractiveProps {
  yesText?: string;
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

const CONSOLE_LOGS = [
  "INITIALIZING OVERRIDE PROTOCOL...",
  "CONNECTING TO USER MAINFRAME...",
  "STATUS: CONNECTED (PORT 8080)",
  "BRUTE FORCING CARD PASSWORD HASH...",
  "CRACKING: [a-z0-9]... 18%... 54%... 89%",
  "DECRYPTED PASSCODE: 'I_LOVE_YOU_3000'",
  "BYPASSING SECURITY FIREWALL LOCKS...",
  "OVERRIDE STATUS: SUCCESSFUL!",
];

export function PasswordCracker({
  yesText = "ACCESS GRANTED ➔",
  onYes,
}: InteractiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  // Matrix Rain background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const characters = "0101ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*()";
    const fontSize = 10;
    const columns = Math.floor(width / fontSize);
    const drops = new Int32Array(columns).fill(1);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 300;
      height = canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    window.addEventListener("resize", handleResize);

    let animId: number;

    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#22c55e"; // bright green matrix
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const triggerCrack = () => {
    if (started) return;
    setStarted(true);
    triggerVibrate(100);

    // Sequence printer
    let logIndex = 0;

    const printNextLog = () => {
      if (logIndex >= CONSOLE_LOGS.length) {
        setCompleted(true);
        triggerVibrate([100, 50, 150]);
        audioManager.playSfx("/sfx/applause.mp3"); // success theme applause or crack pop
        return;
      }

      setLogs((prev) => [...prev, CONSOLE_LOGS[logIndex]]);
      audioManager.playSfx("/sfx/typewriter-key.mp3");
      triggerVibrate(30);

      logIndex++;
      // Timed increments totaling ~5 seconds
      const delays = [400, 600, 500, 800, 900, 700, 600, 500];
      setTimeout(printNextLog, delays[logIndex - 1]);
    };

    printNextLog();
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-4 rounded-2xl shadow-xl relative overflow-hidden bg-black border-2 border-green-500/30 min-h-[380px] flex flex-col justify-between"
      style={{
        boxShadow: "0 20px 40px rgba(0,0,0,0.7), inset 0 0 20px rgba(34, 197, 94, 0.15)",
      }}
    >
      {/* Matrix falling code overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0"
      />

      {/* Terminal Header */}
      <div className="border-b border-green-500/20 pb-2 flex justify-between items-center z-10 text-[10px] font-mono text-green-500/60 uppercase select-none">
        <span>CC-TERMINAL v1.4.2</span>
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      </div>

      {/* Scrolling Text Window */}
      <div className="flex-1 my-4 overflow-y-auto font-mono text-xs text-green-500 text-left space-y-1.5 z-10 select-text">
        {started ? (
          logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-green-500/40 select-none">&gt;</span>
              <span className={idx === CONSOLE_LOGS.length - 1 ? "font-bold text-white shadow-[0_0_8px_rgba(34,197,94,0.8)]" : ""}>
                {log}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-green-500/50 font-bold uppercase tracking-widest animate-pulse">
            Terminal Secured
          </div>
        )}

        {started && !completed && (
          <span className="inline-block w-2 h-4 bg-green-500 animate-ping ml-6" />
        )}
      </div>

      {/* Action triggers */}
      <div className="z-10 flex justify-center pb-2">
        <AnimatePresence>
          {!started ? (
            <motion.button
              onClick={triggerCrack}
              className="px-6 py-3 rounded bg-green-950 border border-green-500 text-green-400 font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-green-900 active:scale-95 transition cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              Execute Cracker Protocol
            </motion.button>
          ) : (
            completed && (
              <motion.button
                onClick={onYes}
                className="px-8 py-3.5 rounded bg-green-500 border-2 border-white text-black font-mono font-extrabold text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.6)] hover:bg-green-400 active:scale-95 transition cursor-pointer select-none"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {yesText}
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>

      <span className="text-[7px] text-green-500/30 font-mono tracking-widest uppercase text-center select-none z-10">
        Unauthorized access prohibited by law
      </span>
    </div>
  );
}

export default PasswordCracker;
