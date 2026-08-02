"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";

type GameState = "start" | "playing" | "crashed" | "won";

// Constants for physics
const GRAVITY = 400; // px/s^2
const THRUST_POWER = 900; // px/s^2
const ROTATION_POWER = 5; // rad/s^2
const DRAG = 0.98; // velocity multiplier per frame (~60fps)
const ANGULAR_DRAG = 0.90; 

const MAX_SAFE_LANDING_SPEED = 150;
const MAX_SAFE_LANDING_ANGLE = Math.PI / 6; // 30 degrees

export function DronePilot({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#06b6d4"; // Cyan 500
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#0f172a"]; // Slate 900

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<GameState>("start");
  const [showPayload, setShowPayload] = useState(false);

  // Drone State
  const droneRef = useRef({
     x: 50,
     y: 500,
     vx: 0,
     vy: 0,
     angle: 0, // 0 is pointing straight UP, positive is clockwise
     angularVelocity: 0,
     width: 40,
     height: 10
  });

  // Inputs
  const leftStickRef = useRef(0); // 0 to 1 (Thrust)
  const rightStickRef = useRef(0); // -1 to 1 (Rotation)

  // Level Definition
  const widthRef = useRef(400);
  const heightRef = useRef(600);
  
  const landingPad = { x: 280, y: 150, width: 80, height: 10 };
  const obstacles = [
     { x: 0, y: heightRef.current - 20, width: widthRef.current, height: 20 }, // Floor
     { x: 0, y: 0, width: 20, height: heightRef.current }, // Left wall
     { x: widthRef.current - 20, y: 0, width: 20, height: heightRef.current }, // Right wall
     { x: 0, y: 0, width: widthRef.current, height: 20 }, // Ceiling
     { x: 0, y: 350, width: 250, height: 20 }, // Middle shelf
     { x: landingPad.x, y: landingPad.y, width: landingPad.width, height: landingPad.height } // Landing pad physical block
  ];

  const particlesRef = useRef<Array<{ x: number, y: number, vx: number, vy: number, life: number, type: "thrust" | "explosion" }>>([]);

  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  const startGame = () => {
     droneRef.current = {
        x: 80,
        y: 540,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        width: 40,
        height: 10
     };
     leftStickRef.current = 0;
     rightStickRef.current = 0;
     particlesRef.current = [];
     setGameState("playing");
  };

  const checkCollision = (rect1: any, rect2: any) => {
     return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
     );
  };

  // Main Physics Loop
  useEffect(() => {
     if (gameState !== "playing") return;

     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext("2d");
     if (!ctx) return;

     const render = (time: number) => {
        const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
        lastTimeRef.current = time;

        const drone = droneRef.current;

        // Apply Input
        const thrust = leftStickRef.current * THRUST_POWER;
        const torque = rightStickRef.current * ROTATION_POWER;

        drone.angularVelocity += torque * dt;
        drone.angularVelocity *= ANGULAR_DRAG;
        drone.angle += drone.angularVelocity * dt;

        // Thrust vector (Angle 0 means UP)
        const thrustX = Math.sin(drone.angle) * thrust;
        const thrustY = -Math.cos(drone.angle) * thrust;

        drone.vx += thrustX * dt;
        drone.vy += (thrustY + GRAVITY) * dt;

        drone.vx *= DRAG;
        drone.vy *= DRAG;

        drone.x += drone.vx * dt;
        drone.y += drone.vy * dt;

        // Spawn thrust particles
        if (thrust > 0) {
           particlesRef.current.push({
              x: drone.x - Math.sin(drone.angle) * 5,
              y: drone.y + Math.cos(drone.angle) * 5,
              vx: -thrustX * 0.2 + (Math.random() - 0.5) * 50,
              vy: -thrustY * 0.2 + (Math.random() - 0.5) * 50,
              life: 1.0,
              type: "thrust"
           });
        }

        // Update particles
        particlesRef.current = particlesRef.current.filter(p => {
           p.x += p.vx * dt;
           p.y += p.vy * dt;
           if (p.type === "explosion") p.vy += GRAVITY * dt;
           p.life -= dt * (p.type === "thrust" ? 3 : 1.5);
           return p.life > 0;
        });

        // Collision Check (Approximated as AABB for simplicity)
        const droneRect = {
           x: drone.x - drone.width / 2,
           y: drone.y - drone.height / 2,
           width: drone.width,
           height: drone.height
        };

        let crashed = false;
        let won = false;

        for (const obs of obstacles) {
           if (checkCollision(droneRect, obs)) {
              // Check if it's the landing pad and we landed softly
              if (obs === obstacles[obstacles.length - 1] && 
                  drone.vy > 0 && 
                  drone.vy < MAX_SAFE_LANDING_SPEED && 
                  Math.abs(drone.angle) < MAX_SAFE_LANDING_ANGLE) {
                 // Good landing
                 drone.vy = 0;
                 drone.vx = 0;
                 drone.y = obs.y - drone.height / 2; // snap
                 drone.angularVelocity = 0;
                 drone.angle = 0;
                 won = true;
              } else {
                 crashed = true;
              }
           }
        }

        if (crashed) {
           setGameState("crashed");
           // Explosion particles
           for(let i=0; i<30; i++) {
              particlesRef.current.push({
                 x: drone.x, y: drone.y,
                 vx: (Math.random() - 0.5) * 400,
                 vy: (Math.random() - 0.5) * 400 - 200,
                 life: 1.0,
                 type: "explosion"
              });
           }
        }

        if (won) {
           setGameState("won");
    onComplete?.();
           setTimeout(() => setShowPayload(true), 1500);
        }

        // --- DRAWING ---
        ctx.fillStyle = bgColors[0];
        ctx.fillRect(0, 0, widthRef.current, heightRef.current);

        // Draw Obstacles
        ctx.fillStyle = "#1e293b"; // Slate 800
        obstacles.forEach(obs => {
           ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
           ctx.strokeStyle = "#334155";
           ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        });

        // Draw Landing Pad Indicator
        ctx.fillStyle = "rgba(16, 185, 129, 0.2)"; // Emerald tint
        ctx.fillRect(landingPad.x, landingPad.y - 40, landingPad.width, 40);
        ctx.fillStyle = primaryColor;
        ctx.textAlign = "center";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("LAND HERE", landingPad.x + landingPad.width/2, landingPad.y - 10);

        // Draw Particles
        particlesRef.current.forEach(p => {
           ctx.fillStyle = p.type === "thrust" 
              ? `rgba(255, 165, 0, ${p.life})` 
              : `rgba(239, 68, 68, ${p.life})`;
           ctx.beginPath();
           ctx.arc(p.x, p.y, p.type === "thrust" ? 3 : 5, 0, Math.PI * 2);
           ctx.fill();
        });

        // Draw Drone (if not crashed)
        if (!crashed) {
           ctx.save();
           ctx.translate(drone.x, drone.y);
           ctx.rotate(drone.angle);
           
           // Main body
           ctx.fillStyle = "#f8fafc";
           ctx.fillRect(-drone.width/2, -drone.height/2, drone.width, drone.height);
           
           // Rotors
           ctx.fillStyle = "#94a3b8";
           ctx.fillRect(-drone.width/2 - 5, -drone.height/2 - 2, 10, 2);
           ctx.fillRect(drone.width/2 - 5, -drone.height/2 - 2, 10, 2);
           
           // Light
           ctx.fillStyle = primaryColor;
           ctx.beginPath();
           ctx.arc(0, 0, 3, 0, Math.PI * 2);
           ctx.fill();

           ctx.restore();
        }

        if (gameState === "playing") {
           animationRef.current = requestAnimationFrame(render);
        } else {
           // One final draw if crashed
           if (crashed) requestAnimationFrame(() => {
              ctx.fillStyle = bgColors[0];
              ctx.fillRect(0, 0, widthRef.current, heightRef.current);
              
              // Obstacles
              ctx.fillStyle = "#1e293b";
              obstacles.forEach(obs => ctx.fillRect(obs.x, obs.y, obs.width, obs.height));

              // Particles
              particlesRef.current.forEach(p => {
                 p.x += p.vx * 0.016;
                 p.y += p.vy * 0.016;
                 p.vy += GRAVITY * 0.016;
                 ctx.fillStyle = `rgba(239, 68, 68, ${p.life})`;
                 ctx.beginPath();
                 ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                 ctx.fill();
              });
           });
        }
     };

     animationRef.current = requestAnimationFrame(render);
     return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, bgColors, primaryColor]);

  useEffect(() => {
     if (showPayload && onComplete) {
        setTimeout(onComplete, 8000);
     }
  }, [showPayload, onComplete]);

  // Joystick Input Handlers
  const handleLeftJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
     const rect = e.currentTarget.getBoundingClientRect();
     const y = e.clientY - rect.top;
     // Map top=1, bottom=0
     const val = Math.max(0, Math.min(1, 1 - (y / rect.height)));
     leftStickRef.current = val;
  };

  const handleRightJoystick = (e: React.PointerEvent<HTMLDivElement>) => {
     const rect = e.currentTarget.getBoundingClientRect();
     const x = e.clientX - rect.left;
     // Map left=-1, right=1
     const val = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
     rightStickRef.current = val;
  };

  return (
    <div 
      className="w-full h-full relative font-sans overflow-hidden flex flex-col items-center justify-center select-none touch-none"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Game Viewport Container */}
      <div className={`relative w-full max-w-md aspect-[2/3] bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 flex flex-col ${gameState === "won" ? "scale-95 opacity-40 blur-sm pointer-events-none" : "scale-100"}`}>
         
         <canvas 
            ref={canvasRef}
            width={400}
            height={600}
            className="absolute inset-0 w-full h-full pointer-events-none"
         />

         {/* Virtual Joysticks */}
         {gameState === "playing" && (
            <div className="absolute bottom-6 w-full px-6 flex justify-between z-20 touch-none pointer-events-none">
               {/* Left Stick Area (Thrust) */}
               <div 
                  className="w-24 h-48 bg-white/5 border border-white/10 rounded-full flex flex-col items-center justify-center relative pointer-events-auto"
                  onPointerDown={handleLeftJoystick}
                  onPointerMove={(e) => { if (e.buttons > 0) handleLeftJoystick(e); }}
                  onPointerUp={() => leftStickRef.current = 0}
                  onPointerLeave={() => leftStickRef.current = 0}
               >
                  <div className="absolute top-4 text-white/30 text-xs font-bold tracking-widest pointer-events-none">UP</div>
                  <div className="w-1 h-full bg-white/10 absolute rounded-full pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.1)] absolute" style={{ bottom: `${leftStickRef.current * 80}%` }} />
               </div>

               {/* Right Stick Area (Rotation) */}
               <div 
                  className="w-48 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative self-end pointer-events-auto"
                  onPointerDown={handleRightJoystick}
                  onPointerMove={(e) => { if (e.buttons > 0) handleRightJoystick(e); }}
                  onPointerUp={() => rightStickRef.current = 0}
                  onPointerLeave={() => rightStickRef.current = 0}
               >
                  <div className="absolute left-4 text-white/30 text-xs font-bold tracking-widest pointer-events-none">L</div>
                  <div className="absolute right-4 text-white/30 text-xs font-bold tracking-widest pointer-events-none">R</div>
                  <div className="w-full h-1 bg-white/10 absolute rounded-full pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.1)] absolute" style={{ left: `calc(50% - 24px + ${rightStickRef.current * 40}%)` }} />
               </div>
            </div>
         )}

         {/* Overlays */}
         <AnimatePresence>
            {gameState === "start" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                  exit={{ opacity: 0 }}
               >
                  <div className="text-white font-black text-4xl uppercase tracking-widest drop-shadow-lg mb-4 text-center px-4 leading-tight">
                     Drone Pilot
                  </div>
                  <div className="text-cyan-400 font-bold mb-8 text-center px-8 text-sm uppercase tracking-widest leading-relaxed">
                     Left Stick: Thrust<br/>Right Stick: Rotate<br/>Land softly on the pad.
                  </div>
                  <button 
                     onClick={startGame}
                     className="bg-cyan-500 text-slate-900 px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                     Take Off
                  </button>
               </motion.div>
            )}

            {gameState === "crashed" && (
               <motion.div 
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <div className="text-white font-black text-5xl uppercase tracking-widest drop-shadow-lg mb-2">
                     Crashed
                  </div>
                  <button 
                     onClick={startGame}
                     className="mt-8 px-8 py-3 bg-white text-red-900 rounded-full font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                     Retry Flight
                  </button>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* Payload Container */}
      <AnimatePresence>
         {showPayload && (
            <motion.div 
               className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8 }}
            >
               <motion.div 
                  className="bg-white p-10 md:p-14 rounded-[3rem] max-w-2xl w-full text-center shadow-[0_0_100px_rgba(6,182,212,0.3)] relative overflow-hidden"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
               >
                  <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: primaryColor }} />
                  <div className="text-cyan-500 font-black uppercase tracking-widest mb-6">Delivery Successful</div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-slate-900 leading-tight">
                     {config.title}
                  </h1>
                  <p className="text-xl text-slate-700 font-serif leading-relaxed">
                     {config.body}
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Editor Simulation Controls */}
      {mode === "editor-preview" && gameState === "playing" && (
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-5 flex flex-col items-center shadow-2xl z-50 rounded-2xl pointer-events-auto">
            <h2 className="text-white font-bold uppercase tracking-widest text-[10px] mb-4 drop-shadow-md">
               Simulation: Bypass Mini-Game
            </h2>
            <button 
               onClick={() => {
                  setGameState("won");
    onComplete?.();
                  setTimeout(() => setShowPayload(true), 500);
               }}
               className="w-full bg-cyan-500 text-slate-900 font-black uppercase tracking-widest py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-lg"
            >
               Auto-Land Bypass
            </button>
         </div>
      )}
      
    </div>
  );
}
