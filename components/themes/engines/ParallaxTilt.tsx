"use client";

import React, { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../../lib/utils/device";

interface ParallaxLayer {
  element: React.ReactNode;
  depth: number; // multiplier for shift (-1.0 to 1.0, e.g. -0.2 for background, 0.5 for foreground)
}

interface ParallaxTiltProps {
  children?: React.ReactNode;
  layers?: ParallaxLayer[];
  maxTilt?: number; // max tilt angle in degrees, e.g. 15
  className?: string;
  enableMobileGyro?: boolean;
}

export function ParallaxTilt({
  children,
  layers,
  maxTilt = 15,
  className,
  enableMobileGyro = true,
}: ParallaxTiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const [gyroActive, setGyroActive] = useState(false);

  // Handle mobile gyroscope (device orientation)
  useEffect(() => {
    if (typeof window === "undefined" || !enableMobileGyro || prefersReducedMotion()) return;

    const requestGyroPermission = async () => {
      // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          // @ts-expect-error DeviceOrientationEvent requestPermission is iOS-specific
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            setGyroActive(true);
          }
        } catch (e) {
          console.warn("DeviceOrientation request failed", e);
        }
      } else {
        // Standard Android / Desktop with gyro
        window.addEventListener("deviceorientation", handleOrientation);
        setGyroActive(true);
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // beta (pitch, front/back tilt): -180 to 180
      // gamma (roll, left/right tilt): -90 to 90
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;

      // Normalise tilt based on typical holding angles (beta: 45-75, gamma: -30 to 30)
      const clampedBeta = Math.max(20, Math.min(80, beta)) - 50; // -30 to 30
      const clampedGamma = Math.max(-30, Math.min(30, gamma)); // -30 to 30

      // Map to rotation angles
      const rotY = (clampedGamma / 30) * maxTilt;
      const rotX = -(clampedBeta / 30) * maxTilt;

      // Map to translations
      const transX = (clampedGamma / 30) * 20;
      const transY = (clampedBeta / 30) * 20;

      setOffsets({ rx: rotX, ry: rotY, tx: transX, ty: transY });
    };

    // Prompt gyro request on initial interaction
    const handleTrigger = () => {
      requestGyroPermission();
      window.removeEventListener("touchstart", handleTrigger);
      window.removeEventListener("click", handleTrigger);
    };

    window.addEventListener("touchstart", handleTrigger);
    window.addEventListener("click", handleTrigger);

    return () => {
      window.removeEventListener("touchstart", handleTrigger);
      window.removeEventListener("click", handleTrigger);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [enableMobileGyro, maxTilt]);

  // Handle desktop mouse movement tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gyroActive || prefersReducedMotion()) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalised mouse coordinates (-0.5 to 0.5)
    const px = (e.clientX - rect.left) / width - 0.5;
    const py = (e.clientY - rect.top) / height - 0.5;

    // Map to tilt rotations
    const rotY = px * maxTilt * 2;
    const rotX = -py * maxTilt * 2;

    // Map to translations
    const transX = px * 30;
    const transY = py * 30;

    setOffsets({ rx: rotX, ry: rotY, tx: transX, ty: transY });
  };

  const handleMouseLeave = () => {
    if (gyroActive) return;
    // Smooth reset
    setOffsets({ rx: 0, ry: 0, tx: 0, ty: 0 });
  };

  if (prefersReducedMotion()) {
    return <div className={className}>{children || (layers && layers.map((l, i) => <div key={i}>{l.element}</div>))}</div>;
  }

  // Multi-layer depth layout
  if (layers && layers.length > 0) {
    return (
      <div
        ref={containerRef}
        className={className ? `overflow-hidden ${className}` : "relative overflow-hidden w-full h-full"}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {layers.map((layer, index) => {
          const tx = offsets.tx * layer.depth;
          const ty = offsets.ty * layer.depth;

          return (
            <div
              key={index}
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate3d(${tx}px, ${ty}px, 0)`,
                transition: gyroActive ? "transform 0.1s ease-out" : "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <div className="pointer-events-auto">{layer.element}</div>
            </div>
          );
        })}
        {children}
      </div>
    );
  }

  // Single card tilting
  return (
    <div
      ref={containerRef}
      className={`perspective-1000 ${className || ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      <div
        style={{
          transform: `rotateX(${offsets.rx}deg) rotateY(${offsets.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: gyroActive ? "transform 0.1s ease-out" : "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
}

export default ParallaxTilt;
