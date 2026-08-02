"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import Matter from "matter-js";

export function MicrophoneBlowAway({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const engineRef = useRef<Matter.Engine | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const reqIdRef = useRef<number>(0);

  // Initialize Physics
  useEffect(() => {
    if (!permissionGranted || isRevealed || !containerRef.current || !canvasRef.current) return;

    const { Engine, Render, Runner, World, Bodies, Body } = Matter;
    const engine = Engine.create();
    engineRef.current = engine;
    
    // Set gravity to 0 so they float until blown
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;

    const rect = containerRef.current.getBoundingClientRect();
    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: rect.width,
        height: rect.height,
        wireframes: false,
        background: 'transparent'
      }
    });

    const particles: Matter.Body[] = [];
    // Create 150 small circle bodies
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const r = Math.random() * 10 + 5;
      
      const p = Bodies.circle(x, y, r, {
        restitution: 0.5,
        frictionAir: 0.05, // Some air resistance so they slow down
        render: {
          fillStyle: Math.random() > 0.5 ? (palette.primary as string) : (palette.accent as string)
        }
      });
      particles.push(p);
    }

    World.add(engine.world, particles);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Audio loop for blowing
    const checkAudio = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length; // 0 to 255

        // If blowing hard (e.g. average > 30)
        if (average > 30) {
          // Apply outward / upward force
          const forceMagnitude = (average - 30) * 0.00005; 
          
          let remainingOnScreen = 0;

          particles.forEach(p => {
            if (p.position.y > -50 && p.position.y < rect.height + 50 && p.position.x > -50 && p.position.x < rect.width + 50) {
              remainingOnScreen++;
              // Random vector pointing roughly up and out
              const fx = (Math.random() - 0.5) * forceMagnitude;
              const fy = -Math.abs((Math.random() * forceMagnitude) + 0.001); // always blow up/away
              Body.applyForce(p, p.position, { x: fx, y: fy });
            }
          });

          if (remainingOnScreen < 20 && !isRevealed) {
            setIsRevealed(true);
            onComplete?.();
          }
        }
      }
      reqIdRef.current = requestAnimationFrame(checkAudio);
    };
    checkAudio();

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      cancelAnimationFrame(reqIdRef.current);
    };
  }, [permissionGranted, isRevealed, palette, onComplete]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      setPermissionGranted(true);
    } catch (err) {
      console.error(err);
      setPermissionGranted(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[var(--exp-background)]" ref={containerRef}>
      
      {/* Background Revealed Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Surprise" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap">
          {config.body}
        </p>
      </div>

      {/* Physics Canvas (Dust) */}
      <AnimatePresence>
        {!isRevealed && permissionGranted && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />
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
            <Mic size={48} className="mx-auto mb-6 text-white" />
            <h2 className="text-2xl text-white font-bold mb-4 font-heading">Blow Away the Dust</h2>
            <p className="text-white/70 mb-8 font-body">Blow into your microphone to scatter the dust and reveal the message.</p>
            <button 
              onClick={requestPermission}
              className="px-8 py-4 bg-white text-black font-bold font-body rounded-full hover:bg-gray-200 transition-colors w-full"
            >
              Enable Microphone
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
