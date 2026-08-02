"use client";

import React, { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { prefersReducedMotion, getHardwareTier } from "../../../lib/utils/device";

export interface BodyConfig {
  id: string;
  type: "rectangle" | "circle" | "polygon" | "sprite" | "text";
  x: number; // fraction 0 to 1 of screen width
  y: number; // fraction 0 to 1 of screen height
  width?: number; // absolute in px or proportional
  height?: number; // absolute in px or proportional
  radius?: number; // absolute in px
  sides?: number; // for polygon
  spriteUrl?: string;
  text?: string;
  color?: string;
  textColor?: string;
  font?: string;
  options?: Matter.IBodyDefinition;
}

interface ForceConfig {
  type: "wind" | "gravity" | "mouse-attraction" | "mouse-repulsion";
  value: number;
}

interface PhysicsCanvasProps {
  bodies: BodyConfig[];
  forces?: ForceConfig[];
  className?: string;
  gravityScale?: number;
  tiltGravityEnabled?: boolean;
}

export function PhysicsCanvas({
  bodies: initialBodies,
  forces = [],
  className,
  gravityScale = 1,
  tiltGravityEnabled = true,
}: PhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiltPermissionGranted, setTiltPermissionGranted] = useState(() => {
    if (typeof window === "undefined" || !tiltGravityEnabled) return false;
    // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
    const hasRequestPermission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
    return !hasRequestPermission;
  });

  // Handle Device Orientation Permissions (iOS 13+)
  useEffect(() => {
    if (typeof window === "undefined" || !tiltGravityEnabled) return;

    // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
    const hasRequestPermission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
    if (!hasRequestPermission) {
      return;
    }

    const requestPermission = async () => {
      try {
        // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === "granted") {
          setTiltPermissionGranted(true);
        }
      } catch (e) {
        console.warn("DeviceOrientation permission request failed", e);
      }
    };

    const handleInitialTouch = () => {
      requestPermission();
      window.removeEventListener("touchstart", handleInitialTouch);
      window.removeEventListener("mousedown", handleInitialTouch);
    };

    window.addEventListener("touchstart", handleInitialTouch);
    window.addEventListener("mousedown", handleInitialTouch);

    return () => {
      window.removeEventListener("touchstart", handleInitialTouch);
      window.removeEventListener("mousedown", handleInitialTouch);
    };
  }, [tiltGravityEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (prefersReducedMotion()) {
      return;
    }

    const hardwareTier = getHardwareTier();
    // Hardware scaling limits
    const maxBodiesCount = hardwareTier === "low" ? 30 : hardwareTier === "medium" ? 60 : 120;
    const filteredBodiesConfig = initialBodies.slice(0, maxBodiesCount);

    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    // Create Matter Engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5 * gravityScale, scale: 0.001 },
    });
    const world = engine.world;

    // Create Bounds
    const wallThickness = 100;
    const walls = {
      ground: Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true }),
      left: Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
      right: Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + wallThickness * 2, { isStatic: true }),
      top: Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width + wallThickness * 2, wallThickness, { isStatic: true }),
    };

    Matter.Composite.add(world, Object.values(walls));

    // Load Sprite Images if needed
    const imageCache: Record<string, HTMLImageElement> = {};
    filteredBodiesConfig.forEach((bc) => {
      if (bc.type === "sprite" && bc.spriteUrl) {
        const img = new Image();
        img.src = bc.spriteUrl;
        imageCache[bc.spriteUrl] = img;
      }
    });

    // Create Bodies
    const matterBodiesMap = new Map<string, { body: Matter.Body; config: BodyConfig }>();

    filteredBodiesConfig.forEach((bc) => {
      const px = bc.x * width;
      const py = bc.y * height;
      let body: Matter.Body | null = null;
      const opts = {
        restitution: 0.6,
        friction: 0.1,
        ...bc.options,
      } as Matter.IChamferableBodyDefinition;

      if (bc.type === "circle") {
        const r = bc.radius || 20;
        body = Matter.Bodies.circle(px, py, r, opts);
      } else if (bc.type === "rectangle" || bc.type === "sprite") {
        const w = bc.width || 40;
        const h = bc.height || 40;
        body = Matter.Bodies.rectangle(px, py, w, h, opts);
      } else if (bc.type === "polygon") {
        const r = bc.radius || 25;
        const s = bc.sides || 5;
        body = Matter.Bodies.polygon(px, py, s, r, opts);
      } else if (bc.type === "text") {
        // Estimate size for text
        const w = bc.width || (bc.text ? bc.text.length * 10 + 20 : 60);
        const h = bc.height || 30;
        body = Matter.Bodies.rectangle(px, py, w, h, opts);
      }

      if (body) {
        Matter.Composite.add(world, body);
        matterBodiesMap.set(bc.id, { body, config: bc });
      }
    });

    // Track Mouse
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

    // Track Accelerometer / Gyroscope tilt
    let tiltX = 0;
    let tiltY = 0.5 * gravityScale;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!tiltGravityEnabled) return;
      // beta: front-back tilt (-180 to 180)
      // gamma: left-right tilt (-90 to 90)
      const b = e.beta || 0;
      const g = e.gamma || 0;

      // Map tilt to x and y gravity
      tiltX = (g / 90) * gravityScale;
      tiltY = (b / 90) * gravityScale;

      // Clamp values
      tiltX = Math.max(-1, Math.min(1, tiltX));
      tiltY = Math.max(-1, Math.min(1, tiltY));

      engine.gravity.x = tiltX;
      engine.gravity.y = tiltY;
    };

    if (tiltGravityEnabled && tiltPermissionGranted) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    // Force calculations
    const windForce = forces.find((f) => f.type === "wind")?.value || 0;
    const attractionForce = forces.find((f) => f.type === "mouse-attraction")?.value || 0;
    const repulsionForce = forces.find((f) => f.type === "mouse-repulsion")?.value || 0;

    // Resize Handler
    const handleResize = () => {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      width = canvas.width = newWidth;
      height = canvas.height = newHeight;

      // Update static bounds
      Matter.Body.setPosition(walls.ground, { x: width / 2, y: height + wallThickness / 2 });
      Matter.Body.setPosition(walls.left, { x: -wallThickness / 2, y: height / 2 });
      Matter.Body.setPosition(walls.right, { x: width + wallThickness / 2, y: height / 2 });
      Matter.Body.setPosition(walls.top, { x: width / 2, y: -wallThickness / 2 });
    };
    window.addEventListener("resize", handleResize);

    // Loop variables
    let animationId: number;
    let lastTime = performance.now();

    const update = (time: number) => {
      // Cap delta time to 60ms (approx 16fps minimum) to prevent extreme jumps
      const dt = Math.min(time - lastTime, 60);
      lastTime = time;

      // Apply external forces (wind, mouse)
      const bodiesInWorld = Matter.Composite.allBodies(world);
      bodiesInWorld.forEach((body) => {
        if (body.isStatic) return;

        // Apply wind
        if (windForce !== 0) {
          Matter.Body.applyForce(body, body.position, { x: windForce * 0.0001, y: 0 });
        }

        // Apply mouse attraction/repulsion
        if (mousePos.x !== -1000 && mousePos.y !== -1000) {
          const dx = mousePos.x - body.position.x;
          const dy = mousePos.y - body.position.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist > 10) {
            if (attractionForce > 0) {
              const f = (attractionForce * 0.001) / distSq;
              Matter.Body.applyForce(body, body.position, { x: dx * f, y: dy * f });
            }
            if (repulsionForce > 0) {
              const f = (repulsionForce * 0.001) / distSq;
              Matter.Body.applyForce(body, body.position, { x: -dx * f, y: -dy * f });
            }
          }
        }
      });

      // Update physics engine
      Matter.Engine.update(engine, dt);

      // Render Loop
      ctx.clearRect(0, 0, width, height);

      // Draw Bodies
      matterBodiesMap.forEach(({ body, config }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        if (config.type === "circle") {
          const r = config.radius || 20;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fillStyle = config.color || "#db2777";
          ctx.fill();
        } else if (config.type === "rectangle") {
          const w = config.width || 40;
          const h = config.height || 40;
          ctx.fillStyle = config.color || "#2563eb";
          ctx.fillRect(-w / 2, -h / 2, w, h);
        } else if (config.type === "polygon") {
          ctx.beginPath();
          const vertices = body.vertices;
          if (vertices.length > 0) {
            ctx.moveTo(vertices[0].x - x, vertices[0].y - y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x - x, vertices[i].y - y);
            }
          }
          ctx.closePath();
          ctx.fillStyle = config.color || "#16a34a";
          ctx.fill();
        } else if (config.type === "sprite" && config.spriteUrl) {
          const w = config.width || 40;
          const h = config.height || 40;
          const img = imageCache[config.spriteUrl];
          if (img && img.complete) {
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
          } else {
            // Placeholder color if image isn't loaded
            ctx.fillStyle = config.color || "#e2e8f0";
            ctx.fillRect(-w / 2, -h / 2, w, h);
          }
        } else if (config.type === "text" && config.text) {
          ctx.font = config.font || "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const textWidth = ctx.measureText(config.text).width;
          const padX = 16;
          const h = config.height || 30;
          const w = config.width || textWidth + padX * 2;

          // Draw speech-like capsule
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 12);
          ctx.fillStyle = config.color || "#ffffff";
          ctx.strokeStyle = config.textColor || "#000000";
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = config.textColor || "#000000";
          ctx.fillText(config.text, 0, 0);
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (tiltGravityEnabled && tiltPermissionGranted) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchend", handleMouseLeave);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [initialBodies, forces, gravityScale, tiltGravityEnabled, tiltPermissionGranted]);

  return (
    <div ref={containerRef} className={className || "relative w-full h-full overflow-hidden"}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

export default PhysicsCanvas;
