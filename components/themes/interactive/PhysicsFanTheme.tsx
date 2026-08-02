"use client";

import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
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

export function PhysicsFanTheme({
  yesText = "Yes",
  noText = "No",
  promptText = "Will you marry me? 💍",
  onYes,
  palette,
}: InteractiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ask for device orientation permissions (iOS 13+)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const requestPermission = async () => {
      // @ts-expect-error - DeviceOrientationEvent might not be defined in all types
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          // @ts-expect-error - requestPermission is iOS-specific and might not be in standard definitions
          await DeviceOrientationEvent.requestPermission();
        } catch (e) {
          console.warn("DeviceOrientation request failed", e);
        }
      }
    };

    const handleInitialTouch = () => {
      requestPermission();
      window.removeEventListener("touchstart", handleInitialTouch);
    };
    window.addEventListener("touchstart", handleInitialTouch);
    return () => window.removeEventListener("touchstart", handleInitialTouch);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth || 350);
    let height = (canvas.height = container.clientHeight || 350);

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.4 },
    });
    const world = engine.world;

    // Boundary walls
    const wallThick = 60;
    const walls = [
      Matter.Bodies.rectangle(width / 2, height + wallThick / 2, width + 100, wallThick, { isStatic: true }),
      Matter.Bodies.rectangle(-wallThick / 2, height / 2, wallThick, height + 100, { isStatic: true }),
      Matter.Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height + 100, { isStatic: true }),
      Matter.Bodies.rectangle(width / 2, -wallThick / 2, width + 100, wallThick, { isStatic: true }),
    ];
    Matter.Composite.add(world, walls);

    // Create YES Button as Static Body (Anchored in center)
    const yesWidth = 90;
    const yesHeight = 40;
    const yesBody = Matter.Bodies.rectangle(width * 0.35, height * 0.65, yesWidth, yesHeight, {
      isStatic: true,
      label: "YES_BTN",
    });

    // Create NO Button as Dynamic Physics Body
    const noWidth = 90;
    const noHeight = 40;
    const noBody = Matter.Bodies.rectangle(width * 0.65, height * 0.4, noWidth, noHeight, {
      restitution: 0.8,
      friction: 0.05,
      label: "NO_BTN",
    });

    Matter.Composite.add(world, [yesBody, noBody]);

    // Create decorative floating physical shapes (hearts, stars, beads)
    const decorBodies: Matter.Body[] = [];
    const colorsList = [palette.primary, palette.secondary, palette.accent, "#db2777", "#8b5cf6"];
    for (let i = 0; i < 15; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * (height * 0.4);
      const rSize = Math.random() * 8 + 6;
      const body = Matter.Bodies.circle(rx, ry, rSize, {
        restitution: 0.6,
        friction: 0.1,
      });
      decorBodies.push(body);
    }
    Matter.Composite.add(world, decorBodies);

    // Mouse movement repulsion
    const mousePos = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.touches[0].clientX - rect.left;
        mousePos.y = e.touches[0].clientY - rect.top;
      }
    };
    const handleMouseLeave = () => {
      mousePos.x = -1000;
      mousePos.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchend", handleMouseLeave);

    // Interactive clicking
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check click on YES
      if (
        clickX >= yesBody.position.x - yesWidth / 2 &&
        clickX <= yesBody.position.x + yesWidth / 2 &&
        clickY >= yesBody.position.y - yesHeight / 2 &&
        clickY <= yesBody.position.y + yesHeight / 2
      ) {
        onYes();
      }

      // Repulsion Burst from click location
      const forceScale = 0.08;
      const allBodies = Matter.Composite.allBodies(world);
      allBodies.forEach((b) => {
        if (b.isStatic) return;
        const dx = b.position.x - clickX;
        const dy = b.position.y - clickY;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist < 200 && dist > 10) {
          const push = (forceScale * b.mass) / dist;
          Matter.Body.applyForce(b, b.position, { x: dx * push, y: dy * push });
        }
      });
    };
    canvas.addEventListener("mousedown", handleMouseDown);

    // Handle touch tapping for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.touches[0].clientX - rect.left;
      const clickY = e.touches[0].clientY - rect.top;

      if (
        clickX >= yesBody.position.x - yesWidth / 2 &&
        clickX <= yesBody.position.x + yesWidth / 2 &&
        clickY >= yesBody.position.y - yesHeight / 2 &&
        clickY <= yesBody.position.y + yesHeight / 2
      ) {
        triggerVibrate(60);
        onYes();
      }
    };
    canvas.addEventListener("touchstart", handleTouchStart);

    // Mobile accelerometer / gyro gravitational swing
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const b = e.beta || 0; // -180 to 180
      const g = e.gamma || 0; // -90 to 90

      // Map angles to gravity vector
      const gravX = Math.max(-1.5, Math.min(1.5, g / 30));
      const gravY = Math.max(-1.5, Math.min(1.5, b / 30));

      engine.gravity.x = gravX;
      engine.gravity.y = gravY;
    };
    window.addEventListener("deviceorientation", handleOrientation);

    // Canvas resize handler
    const handleResize = () => {
      width = canvas.width = container.clientWidth || 350;
      height = canvas.height = container.clientHeight || 350;

      // Update static bounds
      Matter.Body.setPosition(walls[0], { x: width / 2, y: height + wallThick / 2 });
      Matter.Body.setPosition(walls[1], { x: -wallThick / 2, y: height / 2 });
      Matter.Body.setPosition(walls[2], { x: width + wallThick / 2, y: height / 2 });
      Matter.Body.setPosition(walls[3], { x: width / 2, y: -wallThick / 2 });

      // Relocate buttons proportionally
      Matter.Body.setPosition(yesBody, { x: width * 0.35, y: height * 0.65 });
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(time - lastTime, 60);
      lastTime = time;

      // Apply constant minor mouse repulsion
      if (mousePos.x !== -1000 && mousePos.y !== -1000) {
        const bodies = Matter.Composite.allBodies(world);
        bodies.forEach((b) => {
          if (b.isStatic) return;
          const dx = b.position.x - mousePos.x;
          const dy = b.position.y - mousePos.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          if (dist < 150 && dist > 5) {
            const push = (0.0018 * b.mass) / distSq;
            Matter.Body.applyForce(b, b.position, { x: dx * push, y: dy * push });
          }
        });
      }

      Matter.Engine.update(engine, dt);

      // Render
      ctx.clearRect(0, 0, width, height);

      // Render static YES button
      ctx.save();
      ctx.translate(yesBody.position.x, yesBody.position.y);
      ctx.beginPath();
      ctx.roundRect(-yesWidth / 2, -yesHeight / 2, yesWidth, yesHeight, 10);
      ctx.fillStyle = palette.primary;
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(yesText, yesBody.position.x, yesBody.position.y);

      // Render dynamic NO button
      ctx.save();
      ctx.translate(noBody.position.x, noBody.position.y);
      ctx.rotate(noBody.angle);
      ctx.beginPath();
      ctx.roundRect(-noWidth / 2, -noHeight / 2, noWidth, noHeight, 10);
      ctx.fillStyle = palette.secondary;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(noBody.position.x, noBody.position.y);
      ctx.rotate(noBody.angle);
      ctx.fillText(noText, 0, 0);
      ctx.restore();

      // Render decorative floating shapes
      decorBodies.forEach((b) => {
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.beginPath();
        ctx.arc(0, 0, b.circleRadius || 6, 0, Math.PI * 2);
        ctx.fillStyle = colorsList[b.id % colorsList.length];
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("deviceorientation", handleOrientation);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchend", handleMouseLeave);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [yesText, noText, onYes, palette]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md mx-auto p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 min-h-[350px]"
    >
      <h3
        className="text-lg md:text-xl font-black text-center mb-4 select-none px-4"
        style={{ color: palette.text }}
      >
        {promptText}
      </h3>

      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer"
        style={{ minHeight: "260px" }}
      />
      <span className="text-[9px] opacity-40 select-none mt-2">
        Tip: Tilting your screen shifts gravity! 🧭
      </span>
    </div>
  );
}

export default PhysicsFanTheme;
