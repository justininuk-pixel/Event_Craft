"use client";

import React, { useMemo } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { prefersReducedMotion, getHardwareTier } from "../../../lib/utils/device";
import { ThemePalette } from "../../../lib/themes/types";

interface ParticleCanvasProps {
  preset: string;
  palette: ThemePalette;
  className?: string;
}

const initFn = async (engine: unknown) => {
  // @ts-expect-error engine is typed as Engine in tsParticles
  await loadSlim(engine);
};

export function ParticleCanvas({ preset, palette, className }: ParticleCanvasProps) {
  const hardwareTier = useMemo(() => getHardwareTier(), []);

  const options = useMemo(() => {
    if (prefersReducedMotion() || hardwareTier === "low") {
      return {
        autoPlay: false,
        particles: { number: { value: 0 } },
      };
    }

    const countFactor = hardwareTier === "medium" ? 0.5 : 1.0;

    let count = Math.round(80 * countFactor);
    let speed = 1.5;
    let shape: Record<string, unknown> = { type: "circle" };
    let colors = [palette.primary, palette.secondary, palette.accent];
    let opacity = 0.6;
    let sizeRange = { min: 2, max: 6 };
    let direction = "bottom";
    let rotate = false;
    const outMode = "out";

    switch (preset) {
      case "ROSE_PETALS":
        count = Math.round(30 * countFactor);
        speed = 1.2;
        shape = {
          type: "polygon",
          options: { polygon: { sides: 5 } },
        };
        colors = ["#ff4d6d", "#ff758f", "#ff8fa3", "#c9184a"];
        sizeRange = { min: 6, max: 12 };
        rotate = true;
        break;
      case "SAKURA":
        count = Math.round(40 * countFactor);
        speed = 1.0;
        shape = { type: "circle" };
        colors = ["#ffb3c1", "#ffccd5", "#fff0f3", "#ff8fa3"];
        sizeRange = { min: 5, max: 10 };
        rotate = true;
        break;
      case "BUBBLES":
        count = Math.round(60 * countFactor);
        speed = 1.8;
        direction = "top";
        colors = ["#38bdf8", "#7dd3fc", "#bae6fd"];
        opacity = 0.3;
        sizeRange = { min: 8, max: 18 };
        break;
      case "SNOW":
        count = Math.round(100 * countFactor);
        speed = 1.0;
        colors = ["#ffffff", "#e2e8f0"];
        opacity = 0.8;
        sizeRange = { min: 2, max: 5 };
        break;
      case "STARS":
        count = Math.round(120 * countFactor);
        speed = 0.2;
        direction = "none";
        colors = ["#ffffff", "#cbd5e1", "#fef08a"];
        opacity = 0.9;
        sizeRange = { min: 1, max: 3 };
        break;
      case "FIREFLIES":
        count = Math.round(25 * countFactor);
        speed = 0.8;
        direction = "none";
        colors = ["#a3e635", "#84cc16", "#eab308"];
        opacity = 0.7;
        sizeRange = { min: 3, max: 6 };
        break;
      case "CONFETTI_STREAM":
        count = Math.round(90 * countFactor);
        speed = 3.5;
        shape = { type: ["circle", "square"] };
        colors = ["#f43f5e", "#3b82f6", "#10b981", "#eab308", "#8b5cf6"];
        sizeRange = { min: 4, max: 8 };
        rotate = true;
        break;
      case "MARIGOLD_PETALS":
        count = Math.round(35 * countFactor);
        speed = 1.3;
        colors = ["#ea580c", "#f59e0b", "#fbbf24"];
        sizeRange = { min: 6, max: 12 };
        rotate = true;
        break;
      case "BOKEH_LIGHTS":
        count = Math.round(20 * countFactor);
        speed = 0.5;
        direction = "none";
        colors = [palette.primary, palette.secondary, palette.accent];
        opacity = 0.25;
        sizeRange = { min: 40, max: 100 };
        break;
      case "HEARTS":
        count = Math.round(25 * countFactor);
        speed = 1.4;
        direction = "top";
        shape = {
          type: "character",
          options: {
            character: { value: ["❤️", "💖", "💕", "💘"], font: "Arial" },
          },
        };
        sizeRange = { min: 12, max: 24 };
        break;
      case "MUSIC_NOTES":
        count = Math.round(20 * countFactor);
        speed = 1.0;
        direction = "top";
        shape = {
          type: "character",
          options: {
            character: { value: ["♪", "♫", "♩", "♬", "♭"], font: "Arial" },
          },
        };
        sizeRange = { min: 14, max: 24 };
        break;
      case "LEAVES":
        count = Math.round(30 * countFactor);
        speed = 1.5;
        colors = ["#d97706", "#c2410c", "#16a34a", "#854d0e"];
        sizeRange = { min: 8, max: 14 };
        rotate = true;
        break;
      case "RAINDROPS":
        count = Math.round(150 * countFactor);
        speed = 8.0;
        direction = "bottom";
        colors = ["#60a5fa", "#3b82f6"];
        opacity = 0.5;
        sizeRange = { min: 1, max: 3 };
        break;
      case "EMOJI_RAIN":
        count = Math.round(20 * countFactor);
        speed = 2.0;
        shape = {
          type: "character",
          options: {
            character: { value: ["🎂", "🎉", "🎁", "✨", "🥳"], font: "Arial" },
          },
        };
        sizeRange = { min: 16, max: 28 };
        break;
      case "FIRECRACKER_SPARKS":
        count = Math.round(80 * countFactor);
        speed = 4.0;
        direction = "none";
        colors = ["#ffedd5", "#fed7aa", "#fdba74", "#ef4444"];
        opacity = 0.8;
        sizeRange = { min: 1, max: 4 };
        break;
      case "LANTERNS":
        count = Math.round(15 * countFactor);
        speed = 0.7;
        direction = "top";
        shape = {
          type: "character",
          options: {
            character: { value: ["🏮", "🏮", "🕯️"], font: "Arial" },
          },
        };
        sizeRange = { min: 16, max: 32 };
        break;
      case "PAW_PRINTS":
        count = Math.round(15 * countFactor);
        speed = 1.0;
        direction = "top";
        shape = {
          type: "character",
          options: {
            character: { value: ["🐾", "🐾", "🐕", "🐈"], font: "Arial" },
          },
        };
        sizeRange = { min: 14, max: 26 };
        break;
      case "BUTTERFLIES":
        count = Math.round(12 * countFactor);
        speed = 1.2;
        direction = "none";
        shape = {
          type: "character",
          options: {
            character: { value: ["🦋", "🦋"], font: "Arial" },
          },
        };
        sizeRange = { min: 16, max: 28 };
        break;
      case "DIAMONDS":
        count = Math.round(30 * countFactor);
        speed = 1.1;
        colors = ["#93c5fd", "#e0f2fe", "#a5f3fc"];
        opacity = 0.5;
        shape = {
          type: "polygon",
          options: { polygon: { sides: 4 } },
        };
        sizeRange = { min: 6, max: 10 };
        rotate = true;
        break;
    }

    return {
      fullScreen: { enable: false, zIndex: 0 },
      autoPlay: true,
      fpsLimit: 60,
      particles: {
        number: { value: count },
        color: { value: colors },
        shape,
        opacity: {
          value: opacity,
          animation:
            preset === "STARS"
              ? { enable: true, speed: 1, minimumValue: 0.1, sync: false }
              : undefined,
        },
        size: { value: sizeRange },
        rotate: rotate
          ? {
              value: { min: 0, max: 360 },
              animation: { enable: true, speed: 2, sync: false },
            }
          : undefined,
        move: {
          enable: true,
          speed,
          direction,
          random: true,
          straight: false,
          outModes: { default: outMode },
        },
      },
      detectRetina: true,
    };
  }, [preset, palette, hardwareTier]);

  return (
    <ParticlesProvider init={initFn}>
      <Particles
        id={`particles-${preset.toLowerCase()}`}
        options={options as Record<string, unknown>}
        className={className}
      />
    </ParticlesProvider>
  );
}
export default ParticleCanvas;
