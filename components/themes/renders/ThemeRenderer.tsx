"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Theme, CardConfig, Contribution } from "../../../lib/themes/types";
import { loadFont } from "../../../lib/utils/fonts";
import { audioManager } from "../../../lib/audio/manager";
import { triggerVibrate } from "../../../lib/utils/device";
import { useEditorStore } from "../../../lib/editor/store";
import { TransformableSticker, renderShape, getImageFilter, getImageClipPath, renderFormattedText } from "../../editor/TransformableSticker";
import { useToast } from "@/components/ui/ToastQueue";

// Animation Engines
import { ParticleCanvas } from "../engines/ParticleCanvas";
import { FireworksCanvas } from "../engines/FireworksCanvas";
import { ConfettiBlast } from "../engines/ConfettiBlast";
import { MeshGradient } from "../engines/MeshGradient";
import { SnowfallCanvas } from "../engines/SnowfallCanvas";
import { RainCanvas } from "../engines/RainCanvas";
import { AudioVisualiser } from "../engines/AudioVisualiser";
import { CountdownTimer } from "../engines/CountdownTimer";
import { FlipCard3D } from "../engines/FlipCard3D";
import { GlitchOverlay } from "../engines/GlitchOverlay";
import { MorphSVG } from "../engines/MorphSVG";
import { ParallaxTilt } from "../engines/ParallaxTilt";
import { PhysicsCanvas } from "../engines/PhysicsCanvas";
import { PopUpCard } from "../engines/PopUpCard";
import { ScratchReveal } from "../engines/ScratchReveal";
import { TypewriterText } from "../engines/TypewriterText";
import { Sparkles, Gift, Shapes, Copy, Trash2, ArrowUp, ArrowDown, FlipHorizontal, FlipVertical, Grid, AlignLeft, AlignCenter, AlignRight, Type, SlidersHorizontal, X } from "lucide-react";

// Interactive Components
import { EvadingButton } from "../interactive/EvadingButton";
import { PhysicsFanTheme } from "../interactive/PhysicsFanTheme";
import { BouncingDVD } from "../interactive/BouncingDVD";
import { ShrinkingNo } from "../interactive/ShrinkingNo";
import { NinjaTeleport } from "../interactive/NinjaTeleport";
import { LoopOfDoom } from "../interactive/LoopOfDoom";
import { GyroscopeSlide } from "../interactive/GyroscopeSlide";
import { GravityWell } from "../interactive/GravityWell";
import { ScratchToReveal } from "../interactive/ScratchToReveal";
import { PuzzlePieces } from "../interactive/PuzzlePieces";
import { SlotMachine } from "../interactive/SlotMachine";
import { MagicEightBall } from "../interactive/MagicEightBall";
import { SpinTheWheel } from "../interactive/SpinTheWheel";
import { PasswordCracker } from "../interactive/PasswordCracker";

interface ThemeRendererProps {
  theme: Theme;
  config: CardConfig;
  mode: "gallery-mini" | "editor-preview" | "full";
  contributions?: Contribution[];
  onInteractionComplete?: () => void;
}

interface ConditionalParallaxProps {
  isParallax: boolean;
  children: React.ReactNode;
}

function ConditionalParallax({ isParallax, children }: ConditionalParallaxProps) {
  if (isParallax) {
    return (
      <ParallaxTilt maxTilt={15} className="z-20 w-11/12 max-w-lg card-content-wrapper">
        {children}
      </ParallaxTilt>
    );
  }
  return <>{children}</>;
}

export function ThemeRenderer({
  theme,
  config,
  mode,
  contributions = [],
  onInteractionComplete,
}: ThemeRendererProps) {
  const toast = useToast();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // Interactive game solved
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedStickerIndices, setSelectedStickerIndices] = useState<number[]>([]);
  const [lassoRect, setLassoRect] = useState<{startX: number, startY: number, currentX: number, currentY: number} | null>(null);
  const [guides, setGuides] = useState<{axis: "x" | "y", value: number}[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeSubmenu, setActiveSubmenu] = useState<"border" | "gradients" | "spacing" | "adjust" | null>(null);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [submenuPortalNode, setSubmenuPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const node = document.getElementById("editor-sticker-toolbar-portal");
      setPortalNode(node);
      const subNode = document.getElementById("editor-sticker-submenu-portal");
      setSubmenuPortalNode(subNode);
    }
  }, []);

  useEffect(() => {
    if (!activeSubmenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".toolbar-menu-container") && !target.closest(".toolbar-submenu")) {
        setActiveSubmenu(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [activeSubmenu]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const palette = config.palette || theme.visual.palette;
  const isInteractive = theme.interactive && mode === "full";

  // Dynamic Font Loading
  useEffect(() => {
    const headingFont = config.fontHeading || theme.visual.fonts.heading;
    const bodyFont = config.fontBody || theme.visual.fonts.body;

    const loadThemeFonts = async () => {
      try {
        await Promise.all([loadFont(headingFont), loadFont(bodyFont)]);
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Failed to load fonts, using fallback", e);
        setFontsLoaded(true);
      }
    };
    loadThemeFonts();
  }, [config.fontHeading, config.fontBody, theme.visual.fonts.heading, theme.visual.fonts.body]);

  // Keyboard Shortcuts for Stickers (Delete & Nudge)
  useEffect(() => {
    if (selectedStickerIndices.length === 0 || mode !== "editor-preview") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useEditorStore.getState();
      const currentStickers = store.config.stickers || [];
      if (selectedStickerIndices.some(idx => !currentStickers[idx])) return;

      // Deletion
      if (e.key === "g" && e.shiftKey) {
        e.preventDefault();
        setShowGrid(prev => !prev);
        return;
      }
      
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const newStickers = currentStickers.filter((_, i) => !selectedStickerIndices.includes(i));
        store.updateField("stickers", newStickers);
        setSelectedStickerIndices([]);
        return;
      }

      // Nudging
      const step = e.shiftKey ? 5 : 0.5; // 5% vs 0.5%
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const newStickers = [...currentStickers];
        selectedStickerIndices.forEach(idx => {
          const target = newStickers[idx];
          newStickers[idx] = {
            ...target,
            x: Math.max(0, Math.min(100, target.x + dx)),
            y: Math.max(0, Math.min(100, target.y + dy)),
          };
        });
        // Debounce history for rapid nudging? We'll just commit it for now or rely on the user.
        // For simplicity, we just push to history on every keydown (it's discrete).
        store.updateField("stickers", newStickers);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStickerIndices, mode]);

  // Audio Playback is now managed at the layout level in ViewerLayout.tsx to cover the delivery phase.

  // Apply palette variables to container style
  const styleVars = useMemo(() => {
    return {
      "--color-primary": palette.primary,
      "--color-secondary": palette.secondary,
      "--color-accent": palette.accent,
      "--color-text": palette.text,
      "--color-text-secondary": palette.textSecondary,
      "--color-background": Array.isArray(palette.background) ? palette.background[0] : palette.background,
      fontFamily: config.fontBody || theme.visual.fonts.body,
    } as React.CSSProperties;
  }, [palette, config.fontBody, theme.visual.fonts.body]);

  // Render Background layer
  const renderBackground = () => {
    const bgType = theme.visual.backgroundType;
    const bgVal = palette.background;

    if (bgType === "mesh-gradient") {
      const colors = Array.isArray(bgVal) ? bgVal : [palette.primary, palette.secondary, palette.accent];
      return <MeshGradient colors={colors} className="absolute inset-0 z-0" />;
    }

    const bgStyle = Array.isArray(bgVal)
      ? { background: `linear-gradient(135deg, ${bgVal.join(", ")})` }
      : { backgroundColor: bgVal };

    return (
      <div
        className={`absolute inset-0 z-0 ${bgType === "animated-gradient" ? "animate-gradient-slow" : ""
          }`}
        style={bgStyle}
      />
    );
  };

  // Render Animation Engine
  const renderAnimationEngine = () => {
    if (mode === "gallery-mini" || !config.animationsEnabled) return null;

    const engine = theme.visual.animationEngine;
    const preset = (theme.visual.animationConfig.preset as string) || "STARS";

    switch (engine) {
      case "particles":
        return <ParticleCanvas preset={preset} palette={palette} className="absolute inset-0 z-10 pointer-events-none" />;
      case "fireworks":
        return <FireworksCanvas className="absolute inset-0 z-10 pointer-events-none" />;
      case "snow":
        return <SnowfallCanvas className="absolute inset-0 z-10 pointer-events-none" />;
      case "rain":
        return <RainCanvas className="absolute inset-0 z-10 pointer-events-none" />;
      case "audio-visualiser":
        return <AudioVisualiser className="absolute bottom-4 inset-x-4 h-16 z-10 pointer-events-none" />;
      case "countdown-timer":
        if (config.countdownTarget) {
          return (
            <div className="absolute top-10 inset-x-0 z-20 pointer-events-none">
              <CountdownTimer targetDate={config.countdownTarget} styleType="minimal" />
            </div>
          );
        }
        return null;
      case "confetti":
        return <ConfettiBlast trigger={true} />;
      case "physics":
        const defaultBodies = [
          { id: "b1", type: "circle" as const, x: 0.2, y: 0.1, radius: 25, color: palette.primary },
          { id: "b2", type: "rectangle" as const, x: 0.4, y: 0.2, width: 50, height: 50, color: palette.secondary },
          { id: "b3", type: "polygon" as const, x: 0.6, y: 0.15, radius: 30, sides: 5, color: palette.accent },
          { id: "b4", type: "circle" as const, x: 0.5, y: 0.05, radius: 25, color: palette.background as string || "#ffffff" },
          { id: "b5", type: "circle" as const, x: 0.8, y: 0.25, radius: 20, color: palette.primary },
        ];
        return <PhysicsCanvas bodies={defaultBodies} className="absolute inset-0 z-10 pointer-events-none" />;
      case "typewriter":
        return (
          <div className="absolute top-10 inset-x-4 text-center z-20 pointer-events-none">
            <TypewriterText text={config.body || theme.content.body || ""} speed={40} />
          </div>
        );
      case "glitch":
        return <GlitchOverlay className="absolute inset-0 z-10 pointer-events-none w-full h-full" />;
      case "parallax":
        // Parallax is handled as a card wrapper, returning null here.
        return null;
      case "scratch-reveal":
        return (
          <ScratchReveal scratchColor="gold" className="absolute inset-0 z-35 w-full h-full">
            <div className="w-full h-full bg-transparent" />
          </ScratchReveal>
        );
      case "flip-card-3d":
        return (
          <FlipCard3D
            front={<div className="absolute inset-0 bg-cyan-500/10 border border-cyan-500 rounded-xl flex items-center justify-center text-xs text-cyan-400 font-bold backdrop-blur-sm shadow">Flip Me 🔄</div>}
            back={<div className="absolute inset-0 bg-fuchsia-500/10 border border-fuchsia-500 rounded-xl flex items-center justify-center text-xs text-fuchsia-400 font-bold backdrop-blur-sm shadow">Happy Celebration! 🎉</div>}
            className="absolute top-4 right-4 w-28 h-20 z-25"
          />
        );
      case "pop-up-card":
        return (
          <PopUpCard
            className="absolute inset-0 z-25 flex items-center justify-center bg-black/60"
            coverContent={
              <div className="flex flex-col justify-between h-full text-center items-center py-4">
                <Gift className="w-12 h-12 text-primary" />
                <span className="text-sm font-bold">Pop-Up Surprise!</span>
                <span className="text-[10px] text-zinc-300">Click to Open</span>
              </div>
            }
            insideLeftContent={
              <div className="flex flex-col justify-center items-center h-full text-zinc-800 text-center px-2">
                <span className="text-xs font-bold">{config.title || theme.content.title}</span>
                <p className="text-[10px] text-zinc-500 mt-2">{config.subtitle || theme.content.subtitle}</p>
              </div>
            }
            insideRightContent={
              <div className="flex flex-col justify-center items-center h-full text-zinc-800 text-center">
                <span className="text-[9px] text-zinc-400">Blessings!</span>
              </div>
            }
            popUpElements={[
              { element: <Sparkles className="w-8 h-8 text-primary" />, x: 50, y: 50 }
            ]}
          />
        );
      case "morph-svg":
        const defaultPaths = [
          "M 50 10 C 70 10, 90 30, 90 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 10 50 C 10 30, 30 10, 50 10 Z",
          "M 50 10 C 80 10, 90 20, 90 50 C 90 80, 80 90, 50 90 C 20 90, 10 80, 10 50 C 10 20, 20 10, 50 10 Z",
          "M 50 15 C 65 0, 95 0, 95 35 C 95 65, 50 90, 50 90 C 50 90, 5 65, 5 35 C 5 0, 35 0, 50 15 Z"
        ];
        return <MorphSVG paths={defaultPaths} className="absolute inset-0 z-10 pointer-events-none w-full h-full" />;
      case "mesh-gradient":
      default:
        return null;
    }
  };

  const handleInteractionSuccess = () => {
    setIsCompleted(true);
    setShowConfetti(true);
    if (onInteractionComplete) {
      onInteractionComplete();
    }
  };

  // Render Interactive Game Gate
  const renderInteractiveGate = () => {
    if (!isInteractive || isCompleted) return null;

    const gameType = theme.interactive?.type;
    const prompt = config.ctaPromptText || theme.content.cta?.promptText || undefined;

    const commonProps = {
      yesText: config.ctaYesText || theme.content.cta?.yesText || "Yes",
      noText: config.ctaNoText || theme.content.cta?.noText || "No",
      promptText: prompt,
      onYes: handleInteractionSuccess,
      palette: palette,
    };

    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
        {/* Card Question Header */}
        <div className="text-center max-w-xs md:max-w-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-lg md:text-xl font-extrabold font-heading mb-1 tracking-tight" style={{ color: "var(--color-primary)" }}>
            {config.title || theme.content.title}
          </h2>
          {(config.subtitle || theme.content.subtitle) && (
            <p className="text-[11px] md:text-xs font-semibold font-sans text-zinc-300">
              {config.subtitle || theme.content.subtitle}
            </p>
          )}
          <div className="w-8 h-0.5 bg-primary/40 mx-auto mt-2 rounded-full" />
        </div>

        {gameType === "evading-button" && <EvadingButton {...commonProps} />}
        {gameType === "physics-fan" && <PhysicsFanTheme {...commonProps} />}
        {gameType === "bouncing-dvd" && <BouncingDVD {...commonProps} />}
        {gameType === "shrinking-no" && <ShrinkingNo {...commonProps} />}
        {gameType === "ninja-teleport" && <NinjaTeleport {...commonProps} />}
        {gameType === "loop-of-doom" && <LoopOfDoom {...commonProps} />}
        {gameType === "swap-on-touch" && <GyroscopeSlide {...commonProps} />}
        {gameType === "gravity-well" && <GravityWell {...commonProps} />}
        {gameType === "scratch-reveal" && <ScratchToReveal {...commonProps} />}
        {gameType === "puzzle-pieces" && <PuzzlePieces {...commonProps} />}
        {gameType === "slot-machine" && <SlotMachine {...commonProps} />}
        {gameType === "magic-8-ball" && <MagicEightBall {...commonProps} />}
        {gameType === "spin-the-wheel" && <SpinTheWheel {...commonProps} />}
        {gameType === "password-cracker" && <PasswordCracker {...commonProps} />}
      </div>
    );
  };

  if (!fontsLoaded) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-950 text-zinc-400">
        Loading styles...
      </div>
    );
  }

  // RENDER MODES & LAYOUTS
  const isMini = mode === "gallery-mini";
  const layout = theme.visual.borderRadius; // none, sm, md, lg, xl, full

  const isParallax = theme.visual.animationEngine === "parallax" && config.animationsEnabled && mode !== "gallery-mini";

  const toolbarElement = selectedStickerIndices.length > 0 && mode === "editor-preview" ? (
    <div 
      className={clsx(
        portalNode 
          ? "w-full max-w-5xl bg-zinc-900/95 border border-zinc-800 rounded-2xl md:rounded-full shadow-2xl p-2 md:px-4 md:py-1.5 flex flex-wrap items-center justify-center gap-1.5 md:gap-3" 
          : "absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[310px] md:max-w-none md:w-auto bg-zinc-900/95 border border-zinc-800 rounded-2xl md:rounded-full shadow-2xl p-2 md:px-4 md:py-2 flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5 md:gap-3 animate-in slide-in-from-top-4 fade-in backdrop-blur-sm",
        "backdrop-blur-sm"
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {(() => {
        const storeState = useEditorStore.getState();
        const currentStickers = storeState.config.stickers || [];
        
        // Multiple Selection Bar
        if (selectedStickerIndices.length > 1) {
          return (
            <>
              <div className="flex items-center gap-2 pr-4 border-r border-zinc-800">
                <span className="text-xs font-bold text-zinc-400">{selectedStickerIndices.length} Selected</span>
              </div>
              <button
                onClick={() => {
                  const newGroupId = "group_" + Math.random().toString(36).substr(2, 9);
                  const newStickers = [...currentStickers];
                  selectedStickerIndices.forEach(idx => {
                    newStickers[idx] = { ...newStickers[idx], groupId: newGroupId };
                  });
                  storeState.updateField("stickers", newStickers);
                  storeState.commitHistory();
                }}
                className="text-xs font-bold text-white hover:text-primary transition-colors cursor-pointer"
              >
                Group
              </button>
              {selectedStickerIndices.some(idx => currentStickers[idx]?.groupId) && (
                <button
                  onClick={() => {
                    const newStickers = [...currentStickers];
                    selectedStickerIndices.forEach(idx => {
                      if (newStickers[idx]) {
                        const { groupId, ...rest } = newStickers[idx] as any;
                        newStickers[idx] = rest;
                      }
                    });
                    storeState.updateField("stickers", newStickers);
                    storeState.commitHistory();
                  }}
                  className="text-xs font-bold text-white hover:text-primary transition-colors ml-3 cursor-pointer"
                >
                  Ungroup
                </button>
              )}
              <button
                onClick={() => {
                  const newStickers = currentStickers.filter((_, i) => !selectedStickerIndices.includes(i));
                  storeState.updateField("stickers", newStickers);
                  setSelectedStickerIndices([]);
                }}
                className="p-1.5 hover:bg-red-900/50 rounded-full text-red-400 ml-2 cursor-pointer"
                title="Delete All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          );
        }

        // Single Selection Bar
        const currentSticker = currentStickers[selectedStickerIndices[0]];
        if (!currentSticker) return null;
        
        const isText = currentSticker.stickerId.startsWith("text:") || currentSticker.stickerId === "text";
        const isShape = ["square", "circle", "triangle", "star", "heart", "pentagon", "hexagon", "diamond", "arrow", "speech", "lightning", "plus", "pill"].includes(currentSticker.stickerId);
        const isMediaUrl = currentSticker.stickerId.startsWith("data:") || currentSticker.stickerId.startsWith("http") || currentSticker.stickerId.startsWith("data:image") || currentSticker.stickerId.startsWith("/");

        const borderSubmenuContent = (
          <div className={clsx(submenuPortalNode ? "flex flex-col gap-3 select-text" : "absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-3 shadow-xl z-50 toolbar-submenu")}>
            {submenuPortalNode && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Border Options</span>
                <button onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Thickness</span>
                <span>{currentSticker.props?.borderWidth ?? 0}px</span>
              </div>
              <input 
                type="range" min="0" max="20"
                value={currentSticker.props?.borderWidth ?? 0}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...(stickers[idx].props || {}), borderWidth: Number(e.target.value) }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
                className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Rounding</span>
                <span>{currentSticker.props?.borderRadius ?? 0}%</span>
              </div>
              <input 
                type="range" min="0" max="50"
                value={currentSticker.props?.borderRadius ?? 0}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...(stickers[idx].props || {}), borderRadius: Number(e.target.value) }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
                className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Border Color</span>
              </div>
              <input 
                type="color"
                value={currentSticker.props?.borderColor || "#000000"}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...(stickers[idx].props || {}), borderColor: e.target.value }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>
        );

        const gradientsSubmenuContent = (
          <div className={clsx(submenuPortalNode ? "flex flex-col gap-3 select-text" : "absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-3 shadow-xl z-50 toolbar-submenu")}>
            {submenuPortalNode && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Gradient Options</span>
                <button onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <div className="mb-2 pb-2">
              <select 
                className="bg-zinc-800 text-xs w-full text-white border border-zinc-700 rounded p-1 outline-none mb-2"
                value={currentSticker.props?.gradientType || 'solid'}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...(stickers[idx].props || {}), gradientType: e.target.value }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
              >
                <option value="solid">Solid</option>
                <option value="linear">Linear Gradient</option>
                <option value="radial">Radial Gradient</option>
              </select>
              {(currentSticker.props?.gradientType === 'linear' || currentSticker.props?.gradientType === 'radial') && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input type="color" value={currentSticker.props?.gradientColor2 || '#ff0000'} onChange={(e) => {
                      const store = useEditorStore.getState();
                      const stickers = [...(store.config.stickers || [])];
                      const idx = selectedStickerIndices[0];
                      stickers[idx] = {
                        ...stickers[idx],
                        props: { ...(stickers[idx].props || {}), gradientColor2: e.target.value }
                      };
                      store.updateField("stickers", stickers, true);
                    }} className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent" />
                    <span className="text-[10px] text-zinc-400">Color 2</span>
                  </div>
                  {currentSticker.props?.gradientType === 'linear' && (
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Angle</span>
                        <span>{currentSticker.props?.gradientAngle ?? 90}°</span>
                      </div>
                      <input 
                        type="range" min="0" max="360"
                        value={currentSticker.props?.gradientAngle ?? 90}
                        onChange={(e) => {
                          const store = useEditorStore.getState();
                          const stickers = [...(store.config.stickers || [])];
                          const idx = selectedStickerIndices[0];
                          stickers[idx] = {
                            ...stickers[idx],
                            props: { ...(stickers[idx].props || {}), gradientAngle: Number(e.target.value) }
                          };
                          store.updateField("stickers", stickers, true);
                        }}
                        onBlur={() => useEditorStore.getState().commitHistory()}
                        className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

        const spacingSubmenuContent = (
          <div className={clsx(submenuPortalNode ? "flex flex-col gap-3 select-text" : "absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-3 shadow-xl z-50 toolbar-submenu")}>
            {submenuPortalNode && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Text Spacing</span>
                <button onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Letter Spacing</span>
                <span>{(currentSticker.props?.letterSpacing ?? 0).toFixed(2)}em</span>
              </div>
              <input 
                type="range" min="-0.1" max="0.5" step="0.01"
                value={currentSticker.props?.letterSpacing ?? 0}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...(stickers[idx].props || {}), letterSpacing: Number(e.target.value) }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
                className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Line Height</span>
                <span>{(currentSticker.props?.lineHeight ?? 1.1).toFixed(1)}</span>
              </div>
              <input 
                type="range" min="0.5" max="2.5" step="0.1"
                value={currentSticker.props?.lineHeight ?? 1.1}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...(stickers[idx].props || {}), lineHeight: Number(e.target.value) }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
                className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
          </div>
        );

        const adjustSubmenuContent = (
          <div className={clsx(submenuPortalNode ? "flex flex-col gap-3 select-text max-h-[75vh] overflow-y-auto" : "absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col gap-3 shadow-xl z-50 toolbar-submenu")}>
            {submenuPortalNode && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Image Adjust</span>
                <button onClick={(e) => { e.stopPropagation(); setActiveSubmenu(null); }} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <button 
              onClick={async () => {
                const currentSrc = currentSticker.stickerId;
                if (currentSrc.startsWith('draw:')) return;
                const toastId = toast.info("Removing background using AI...");
                try {
                  // Loaded on demand — this ML model is ~50MB and must never be in the page bundle.
                  const { removeBackground } = await import("@imgly/background-removal");
                  const blob = await removeBackground(currentSrc);
                  const reader = new FileReader();
                  reader.readAsDataURL(blob);
                  reader.onloadend = () => {
                    const base64data = reader.result;
                    const store = useEditorStore.getState();
                    const stickers = [...(store.config.stickers || [])];
                    const idx = selectedStickerIndices[0];
                    stickers[idx] = {
                      ...stickers[idx],
                      props: { ...(stickers[idx].props || {}), bgRemovedDataUrl: base64data }
                    };
                    store.updateField("stickers", stickers, false);
                    toast.dismiss(toastId);
                    toast.success("Background removed!");
                  };
                } catch (e) {
                  console.error(e);
                  toast.dismiss(toastId);
                  toast.error("Failed to remove background");
                }
              }}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary rounded py-1.5 px-2 text-xs font-bold mb-1 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Magic BG Remover
            </button>
            
            <div className="text-[10px] text-zinc-400 font-bold mb-0.5">Mask/Frame</div>
            <select 
              className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded p-1 outline-none mb-1"
              value={currentSticker.props?.maskType || 'none'}
              onChange={(e) => {
                const store = useEditorStore.getState();
                const stickers = [...(store.config.stickers || [])];
                const idx = selectedStickerIndices[0];
                stickers[idx] = {
                  ...stickers[idx],
                  props: { ...(stickers[idx].props || {}), maskType: e.target.value }
                };
                store.updateField("stickers", stickers, true);
              }}
              onBlur={() => useEditorStore.getState().commitHistory()}
            >
              <option value="none">No Mask</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
              <option value="hexagon">Hexagon</option>
              <option value="star">Star</option>
            </select>
            <div className="w-full h-px bg-zinc-800 my-1" />
            
            <div className="text-[10px] text-zinc-400 font-bold mb-0.5">Preset Filter</div>
            <select 
              className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded p-1 outline-none mb-1"
              value={currentSticker.props?.presetFilter || 'none'}
              onChange={(e) => {
                const store = useEditorStore.getState();
                const stickers = [...(store.config.stickers || [])];
                const idx = selectedStickerIndices[0];
                stickers[idx] = {
                  ...stickers[idx],
                  props: { ...(stickers[idx].props || {}), presetFilter: e.target.value }
                };
                store.updateField("stickers", stickers, true);
              }}
              onBlur={() => useEditorStore.getState().commitHistory()}
            >
              <option value="none">No Preset</option>
              <option value="1977">1977</option>
              <option value="aden">Aden</option>
              <option value="inkwell">Inkwell</option>
              <option value="valencia">Valencia</option>
              <option value="toaster">Toaster</option>
            </select>

            <div className="w-full h-px bg-zinc-800 my-1" />
            {['brightness', 'contrast', 'saturate'].map(f => (
              <div key={f} className="mb-1">
                <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5 capitalize">
                  <span>{f}</span>
                  <span>{(currentSticker.props?.filters?.[f] ?? 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" 
                  value={currentSticker.props?.filters?.[f] ?? 100}
                  onChange={(e) => {
                    const store = useEditorStore.getState();
                    const stickers = [...(store.config.stickers || [])];
                    const idx = selectedStickerIndices[0];
                    const props = stickers[idx].props || {};
                    const filters = { ...(props.filters || {}) };
                    filters[f] = Number(e.target.value);
                    stickers[idx] = {
                      ...stickers[idx],
                      props: { ...props, filters }
                    };
                    store.updateField("stickers", stickers, true);
                  }}
                  onBlur={() => useEditorStore.getState().commitHistory()}
                  className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            ))}
            <div className="mb-1">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                <span>Blur</span>
                <span>{(currentSticker.props?.filters?.blur ?? 0)}px</span>
              </div>
              <input 
                type="range" min="0" max="20" step="0.5"
                value={currentSticker.props?.filters?.blur ?? 0}
                onChange={(e) => {
                  const store = useEditorStore.getState();
                  const stickers = [...(store.config.stickers || [])];
                  const idx = selectedStickerIndices[0];
                  const props = stickers[idx].props || {};
                  const filters = { ...(props.filters || {}) };
                  filters.blur = Number(e.target.value);
                  stickers[idx] = {
                    ...stickers[idx],
                    props: { ...props, filters }
                  };
                  store.updateField("stickers", stickers, true);
                }}
                onBlur={() => useEditorStore.getState().commitHistory()}
                className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
          </div>
        );

        return (
          <>
            {isText && (
              <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                <label className="text-xs font-bold text-zinc-400">Color</label>
                <input 
                  type="color" 
                  value={(currentSticker as any).color || "#ffffff"} 
                  onChange={(e) => {
                    const store = useEditorStore.getState();
                    const newStickers = [...(store.config.stickers || [])];
                    newStickers[selectedStickerIndices[0]] = { ...currentSticker, color: e.target.value };
                    store.updateField("stickers", newStickers, true);
                  }}
                  onPointerUp={() => {
                    useEditorStore.getState().commitHistory();
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
              </div>
            )}
            {isShape && (
              <>
                <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                  <label className="text-xs font-bold text-zinc-400">Color</label>
                  <input 
                    type="color" 
                    value={(currentSticker as any).color || "#ffffff"} 
                    onChange={(e) => {
                      const store = useEditorStore.getState();
                      const newStickers = [...(store.config.stickers || [])];
                      newStickers[selectedStickerIndices[0]] = { ...currentSticker, color: e.target.value };
                      store.updateField("stickers", newStickers, true);
                    }}
                    onPointerUp={() => {
                      useEditorStore.getState().commitHistory();
                    }}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>
                {/* Shape Morphing */}
                <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                  <select
                    value={currentSticker.stickerId}
                    onChange={(e) => {
                      const store = useEditorStore.getState();
                      const currentStickers = [...(store.config.stickers || [])];
                      currentStickers[selectedStickerIndices[0]] = { ...currentStickers[selectedStickerIndices[0]], stickerId: e.target.value };
                      store.updateField("stickers", currentStickers);
                      store.commitHistory();
                    }}
                    className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded p-1 outline-none"
                  >
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                    <option value="star">Star</option>
                    <option value="heart">Heart</option>
                    <option value="pentagon">Pentagon</option>
                    <option value="hexagon">Hexagon</option>
                  </select>
                </div>
                {/* Shape Border */}
                <div className={clsx("flex items-center gap-2 border-r border-zinc-800 pr-4 relative toolbar-menu-container", activeSubmenu === "border" ? "z-50" : "z-10")}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubmenu(activeSubmenu === "border" ? null : "border");
                    }}
                    className={clsx(
                      "text-xs px-2 py-1 font-bold rounded hover:bg-zinc-800 transition-colors cursor-pointer",
                      activeSubmenu === "border" ? "text-primary" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Border
                  </button>
                  {activeSubmenu === "border" && (
                    submenuPortalNode 
                      ? createPortal(borderSubmenuContent, submenuPortalNode) 
                      : borderSubmenuContent
                  )}
                </div>
                {/* Gradient Fills */}
                <div className={clsx("flex items-center gap-2 border-r border-zinc-800 pr-4 relative toolbar-menu-container", activeSubmenu === "gradients" ? "z-50" : "z-10")}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubmenu(activeSubmenu === "gradients" ? null : "gradients");
                    }}
                    className={clsx(
                      "text-xs px-2 py-1 font-bold rounded hover:bg-zinc-800 transition-colors cursor-pointer",
                      activeSubmenu === "gradients" ? "text-primary" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Gradients
                  </button>
                  {activeSubmenu === "gradients" && (
                    submenuPortalNode 
                      ? createPortal(gradientsSubmenuContent, submenuPortalNode) 
                      : gradientsSubmenuContent
                  )}
                </div>
              </>
            )}
            {isText && (
              <>
                <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                  <input 
                    type="text" 
                    value={currentSticker.stickerId.split('text:')[1] || ''}
                    onChange={(e) => {
                      const store = useEditorStore.getState();
                      const newStickers = [...(store.config.stickers || [])];
                      newStickers[selectedStickerIndices[0]] = { ...currentSticker, stickerId: 'text:' + e.target.value };
                      store.updateField("stickers", newStickers, true);
                    }}
                    onBlur={() => {
                      useEditorStore.getState().commitHistory();
                    }}
                    className="bg-transparent text-sm font-bold text-white outline-none w-24 border-b border-zinc-700 focus:border-primary"
                    placeholder="Text..."
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                {/* Align, Spacing, Effects for Text */}
                <div className="flex items-center gap-1 border-r border-zinc-800 pr-4">
                  <button 
                    onClick={() => {
                      const store = useEditorStore.getState();
                      const currentStickers = [...(store.config.stickers || [])];
                      const idx = selectedStickerIndices[0];
                      const targetSticker = currentStickers[idx];
                      const props = targetSticker.props || {};
                      currentStickers[idx] = {
                        ...targetSticker,
                        props: { ...props, textAlign: 'left' }
                      };
                      store.updateField("stickers", currentStickers);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-white rounded cursor-pointer" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
                  <button 
                    onClick={() => {
                      const store = useEditorStore.getState();
                      const currentStickers = [...(store.config.stickers || [])];
                      const idx = selectedStickerIndices[0];
                      const targetSticker = currentStickers[idx];
                      const props = targetSticker.props || {};
                      currentStickers[idx] = {
                        ...targetSticker,
                        props: { ...props, textAlign: 'center' }
                      };
                      store.updateField("stickers", currentStickers);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-white rounded cursor-pointer" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
                  <button 
                    onClick={() => {
                      const store = useEditorStore.getState();
                      const currentStickers = [...(store.config.stickers || [])];
                      const idx = selectedStickerIndices[0];
                      const targetSticker = currentStickers[idx];
                      const props = targetSticker.props || {};
                      currentStickers[idx] = {
                        ...targetSticker,
                        props: { ...props, textAlign: 'right' }
                      };
                      store.updateField("stickers", currentStickers);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-white rounded cursor-pointer" title="Align Right"><AlignRight className="w-4 h-4" /></button>
                  
                  <div className="w-px h-4 bg-zinc-800 mx-1" />
                  
                  <select 
                    value={(currentSticker.props && currentSticker.props.textEffect) || 'none'}
                    onChange={(e) => {
                      const store = useEditorStore.getState();
                      const currentStickers = [...(store.config.stickers || [])];
                      const idx = selectedStickerIndices[0];
                      const targetSticker = currentStickers[idx];
                      const props = targetSticker.props || {};
                      currentStickers[idx] = {
                        ...targetSticker,
                        props: { ...props, textEffect: e.target.value }
                      };
                      store.updateField("stickers", currentStickers);
                    }}
                    className="bg-zinc-800 text-[10px] text-white border border-zinc-700 rounded p-1 outline-none"
                  >
                    <option value="none">Normal</option>
                    <option value="shadow">Shadow</option>
                    <option value="lift">Lift</option>
                    <option value="hollow">Hollow</option>
                    <option value="neon">Neon</option>
                    <option value="splice">Splice</option>
                  </select>
                  
                  <div className={clsx("relative toolbar-menu-container ml-1", activeSubmenu === "spacing" ? "z-50" : "z-10")}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSubmenu(activeSubmenu === "spacing" ? null : "spacing");
                      }}
                      className={clsx(
                        "text-[10px] px-2 py-1 font-bold rounded hover:bg-zinc-800 transition-colors cursor-pointer",
                        activeSubmenu === "spacing" ? "text-primary" : "text-zinc-400 hover:text-white"
                      )}
                    >
                      Spacing
                    </button>
                    {activeSubmenu === "spacing" && (
                      submenuPortalNode 
                        ? createPortal(spacingSubmenuContent, submenuPortalNode) 
                        : spacingSubmenuContent
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                  <label className="text-xs font-bold text-zinc-400">Size</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="5" 
                    step="0.1" 
                    value={currentSticker.scale} 
                    onChange={(e) => {
                      const store = useEditorStore.getState();
                      const newStickers = [...(store.config.stickers || [])];
                      newStickers[selectedStickerIndices[0]] = { ...currentSticker, scale: parseFloat(e.target.value) };
                      store.updateField("stickers", newStickers, true);
                    }}
                    onPointerUp={() => {
                      useEditorStore.getState().commitHistory();
                    }}
                    className="w-20 accent-primary cursor-pointer"
                  />
                </div>
              </>
            )}
            
            {isMediaUrl && (
              <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
                <div className={clsx("relative toolbar-menu-container", activeSubmenu === "adjust" ? "z-50" : "z-10")}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubmenu(activeSubmenu === "adjust" ? null : "adjust");
                    }}
                    className={clsx(
                      "text-[10px] px-2 py-1 font-bold rounded hover:bg-zinc-800 transition-colors cursor-pointer",
                      activeSubmenu === "adjust" ? "text-primary" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    Image Adjust
                  </button>
                  {activeSubmenu === "adjust" && (
                    submenuPortalNode 
                      ? createPortal(adjustSubmenuContent, submenuPortalNode) 
                      : adjustSubmenuContent
                  )}
                </div>
                
                <button
                  onClick={() => {
                    const store = useEditorStore.getState();
                    const newStickers = [...(store.config.stickers || [])];
                    newStickers[selectedStickerIndices[0]] = { ...currentSticker, flipX: !currentSticker.flipX };
                    store.updateField("stickers", newStickers);
                    store.commitHistory();
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 cursor-pointer"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const store = useEditorStore.getState();
                    const newStickers = [...(store.config.stickers || [])];
                    newStickers[selectedStickerIndices[0]] = { ...currentSticker, flipY: !currentSticker.flipY };
                    store.updateField("stickers", newStickers);
                    store.commitHistory();
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 cursor-pointer"
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {currentSticker.groupId && (
              <button
                onClick={() => {
                  const store = useEditorStore.getState();
                  const newStickers = [...(store.config.stickers || [])];
                  // Ungroup all stickers in this group
                  newStickers.forEach((st, idx) => {
                    if (st.groupId === currentSticker.groupId) {
                      const { groupId, ...rest } = newStickers[idx] as any;
                      newStickers[idx] = rest;
                    }
                  });
                  store.updateField("stickers", newStickers);
                  store.commitHistory();
                }}
                className="text-xs font-bold text-white hover:text-primary transition-colors pr-4 border-r border-zinc-800 cursor-pointer"
              >
                Ungroup
              </button>
            )}

            <div className="flex items-center gap-1 pl-2">
              <button
                onClick={() => {
                  const store = useEditorStore.getState();
                  const newStickers = (store.config.stickers || []).filter((_, i) => i !== selectedStickerIndices[0]);
                  store.updateField("stickers", newStickers);
                  setSelectedStickerIndices([]);
                }}
                className="p-1.5 hover:bg-red-900/50 rounded-full text-red-400 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        );
      })()}
    </div>
  ) : null;

  return (
    <div
      className={`w-full h-full min-h-[inherit] ${isMini ? "relative" : "absolute inset-0"} overflow-hidden select-none flex flex-col ${isMini ? "justify-start pt-8" : "justify-center"} items-center ${layout === "none" ? "" : "rounded-3xl"
        }`}
      style={styleVars}
      onPointerDown={(e) => {
        if (e.target === containerRef.current || e.target === e.currentTarget) {
          setSelectedStickerIndices([]);
          // Start lasso
          setLassoRect({ startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY });
        }
      }}
      onPointerMove={(e) => {
        if (lassoRect) {
          setLassoRect(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
        }
      }}
      onPointerUp={(e) => {
        if (lassoRect) {
          // Perform selection logic here based on intersection
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const minX = Math.min(lassoRect.startX, lassoRect.currentX) - rect.left;
            const minY = Math.min(lassoRect.startY, lassoRect.currentY) - rect.top;
            const maxX = Math.max(lassoRect.startX, lassoRect.currentX) - rect.left;
            const maxY = Math.max(lassoRect.startY, lassoRect.currentY) - rect.top;
            
            // Check intersection (simple percentage heuristic for now)
            const minXPercent = (minX / rect.width) * 100;
            const maxXPercent = (maxX / rect.width) * 100;
            const minYPercent = (minY / rect.height) * 100;
            const maxYPercent = (maxY / rect.height) * 100;
            
            const store = useEditorStore.getState();
            const currentStickers = store.config.stickers || [];
            
            const newSelection: number[] = [];
            currentStickers.forEach((st, idx) => {
              if (st.x >= minXPercent && st.x <= maxXPercent && st.y >= minYPercent && st.y <= maxYPercent) {
                newSelection.push(idx);
              }
            });
            if (newSelection.length > 0) setSelectedStickerIndices(newSelection);
          }
          setLassoRect(null);
        }
      }}
    >
      {/* Background Layer */}
      {renderBackground()}

      {/* Grid Overlay */}
      {showGrid && mode === "editor-preview" && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '5% 5%'
          }}
        />
      )}

      {/* Animation Engine Overlay */}
      {renderAnimationEngine()}

      {/* Confetti Blast on Success */}
      {showConfetti && <ConfettiBlast trigger={true} onComplete={() => setShowConfetti(false)} />}

      {/* Interactive Game Lock */}
      {renderInteractiveGate()}

      {/* Main Greeting Card Content */}
      <ConditionalParallax isParallax={isParallax}>
        <div 
          ref={containerRef}
          className={isParallax 
            ? "card-content-wrapper w-full p-6 shadow-2xl rounded-2xl border select-text flex flex-col justify-start gap-1 items-center text-center backdrop-blur-md relative transition-colors duration-300" 
            : "card-content-wrapper z-20 w-11/12 max-w-lg p-6 shadow-2xl rounded-2xl border select-text flex flex-col justify-start gap-1 items-center text-center backdrop-blur-md relative transition-colors duration-300"
          }
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-background) 94%, var(--color-text) 6%)",
            color: "var(--color-text)",
            borderColor: "color-mix(in srgb, var(--color-text) 12%, transparent)",
          }}
        >
        {/* Recipient Header */}
        <span
          className="text-xs uppercase tracking-widest font-semibold mb-2"
          style={{ color: "var(--color-accent)" }}
        >
          For {config.recipient || "Someone Special"}
        </span>

        {/* Title */}
        <h2
          className="text-2xl md:text-3xl font-black mb-4 leading-tight"
          style={{
            fontFamily: config.fontHeading || theme.visual.fonts.heading,
            color: "var(--color-primary)",
          }}
        >
          {config.title || theme.content.title}
        </h2>

        {/* Subtitle */}
        {(config.subtitle || theme.content.subtitle) && (
          <h4 
            className="text-sm font-medium mb-6 italic"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {config.subtitle || theme.content.subtitle}
          </h4>
        )}

        {/* Photo/Media Attachments */}
        {theme.content.supportsMedia && config.mediaUrl && (
          <div 
            className="card-media-section w-full h-48 md:h-56 relative overflow-hidden rounded-xl mb-6 shadow-inner border"
            style={{ borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.mediaUrl}
              alt="Celebration moment"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        )}

        {/* Body Text */}
        <p 
          className="card-body-text text-sm md:text-base leading-relaxed font-medium mb-8 whitespace-pre-line px-2"
          style={{ color: "var(--color-text)" }}
        >
          {config.body || theme.content.body}
        </p>

        {/* Signature Handwriting base64 */}
        {theme.content.supportsHandwriting && config.handwritingData && (
          <div className="card-signature-section w-40 h-16 relative mb-6 select-none opacity-80 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.handwritingData}
              alt="Sender Signature"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Voice Memo Player */}
        {theme.content.supportsVoice && config.voiceUrl && (
          <div 
            className="card-voice-section w-full p-3 rounded-lg flex items-center gap-3 mb-6 border"
            style={{ 
              backgroundColor: "color-mix(in srgb, var(--color-background) 85%, var(--color-text) 15%)",
              borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)"
            }}
          >
            <button
              onClick={() => {
                triggerVibrate(40);
                audioManager.playSfx(config.voiceUrl!);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:opacity-90 animate-pulse"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              ▶
            </button>
            <span className="text-[10px] font-mono" style={{ color: "var(--color-text-secondary)" }}>
              Voice note attachment (30s)
            </span>
          </div>
        )}

        {/* Sender Footer */}
        <div 
          className="w-full pt-4 border-t flex flex-col items-center"
          style={{ borderColor: "color-mix(in srgb, var(--color-text) 15%, transparent)" }}
        >
          <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
            From the heart of
          </span>
          <span className="font-semibold text-sm mt-1" style={{ color: "var(--color-primary)" }}>
            {config.sender || "Anonymous"}
          </span>
        </div>

        {/* Snapping Guides */}
        {guides.map((g, i) => (
          <div
            key={"guide-"+i}
            className="absolute bg-primary z-[90] pointer-events-none"
            style={{
              [g.axis === 'x' ? 'left' : 'top']: `${g.value}%`,
              [g.axis === 'x' ? 'top' : 'left']: 0,
              [g.axis === 'x' ? 'width' : 'height']: '1px',
              [g.axis === 'x' ? 'height' : 'width']: '100%',
              transform: g.axis === 'x' ? 'translateX(-50%)' : 'translateY(-50%)'
            }}
          />
        ))}

        {/* Stickers Overlay */}
        {!isMini &&
          config.stickers &&
          config.stickers.map((st, idx) => {
            const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(st.stickerId);
            const isShape = ["text", "star", "square", "circle", "triangle", "heart", "pentagon", "hexagon", "diamond", "arrow", "speech", "lightning", "plus", "pill", "rounded-square", "oval", "octagon", "chevron", "shield", "banner", "sparkle4", "cloud", "crescent", "pin", "gem", "check", "ring", "star6"].includes(st.stickerId) || st.stickerId.startsWith("text:");
            const isText = st.stickerId.startsWith("text:") || st.stickerId === "text";
            const textContent = st.stickerId.startsWith("text:") ? st.stickerId.substring(5) : "Double click to edit";
            const isMediaUrl = st.stickerId.startsWith("data:image") || st.stickerId.startsWith("http") || st.stickerId.startsWith("/");
            const shapeMap: Record<string, string> = { text: "T", star: "★", square: "■", circle: "●" };

            if (mode === "editor-preview") {
              return (
                <TransformableSticker
                  key={idx}
                  sticker={st}
                  index={idx}
                  isSelected={selectedStickerIndices.includes(idx)}
                  onSelect={(e) => {
                    const store = useEditorStore.getState();
                    const currentStickers = store.config.stickers || [];
                    const targetSticker = currentStickers[idx];
                    
                    if (targetSticker && targetSticker.isLocked) return;
                    
                    let indicesToToggle = [idx];
                    if (targetSticker && targetSticker.groupId) {
                      indicesToToggle = currentStickers
                        .map((st, i) => st.groupId === targetSticker.groupId ? i : -1)
                        .filter(i => i !== -1);
                    }

                    if (e && e.shiftKey) {
                      setSelectedStickerIndices(prev => {
                        const isSelected = indicesToToggle.every(i => prev.includes(i));
                        if (isSelected) {
                          return prev.filter(i => !indicesToToggle.includes(i));
                        } else {
                          return [...new Set([...prev, ...indicesToToggle])];
                        }
                      });
                    } else {
                      setSelectedStickerIndices(indicesToToggle);
                    }
                  }}
                  onUpdate={(updates, isFinal) => {
                    const store = useEditorStore.getState();
                    // NOTE: TransformableSticker streams moves locally and only reports the FINAL
                    // transform at pointer-up (isFinal=true). We must APPLY that final transform —
                    // the old early-return here threw it away, so dragged stickers snapped back.
                    const newStickers = [...(store.config.stickers || [])];
                    const target = newStickers[idx];
                    if (!target) {
                      if (isFinal) { setGuides([]); store.commitHistory(); }
                      return;
                    }
                    
                    let dx = updates.x !== undefined ? updates.x - target.x : 0;
                    let dy = updates.y !== undefined ? updates.y - target.y : 0;
                    const dr = updates.rotation !== undefined ? updates.rotation - target.rotation : 0;
                    const dScale = updates.scale !== undefined ? updates.scale / target.scale : 1;
                    const dScaleX = updates.scaleX !== undefined ? updates.scaleX / (target.scaleX || 1) : 1;
                    const dScaleY = updates.scaleY !== undefined ? updates.scaleY / (target.scaleY || 1) : 1;

                    // Snapping Logic
                    const newGuides: {axis: "x" | "y", value: number}[] = [];
                    const SNAP_DIST = 1.5; // percent threshold
                    
                    if (updates.x !== undefined || updates.y !== undefined) {
                      let snapX = target.x + dx;
                      let snapY = target.y + dy;
                      
                      // Grid snapping
                      if (showGrid) {
                        snapX = Math.round(snapX / 5) * 5;
                        snapY = Math.round(snapY / 5) * 5;
                      }
                      
                      // Snap to center
                      if (Math.abs(snapX - 50) < SNAP_DIST) { snapX = 50; newGuides.push({ axis: 'x', value: 50 }); }
                      if (Math.abs(snapY - 50) < SNAP_DIST) { snapY = 50; newGuides.push({ axis: 'y', value: 50 }); }
                      
                      // Snap to other stickers
                      newStickers.forEach((st, i) => {
                        if (selectedStickerIndices.includes(i)) return;
                        if (Math.abs(snapX - st.x) < SNAP_DIST) { snapX = st.x; newGuides.push({ axis: 'x', value: st.x }); }
                        if (Math.abs(snapY - st.y) < SNAP_DIST) { snapY = st.y; newGuides.push({ axis: 'y', value: st.y }); }
                      });
                      
                      dx = snapX - target.x;
                      dy = snapY - target.y;
                    }

                    // Only update state if guides changed to prevent excessive re-renders
                    setGuides(prev => {
                      if (prev.length !== newGuides.length) return newGuides;
                      for (let i = 0; i < prev.length; i++) {
                        if (prev[i].axis !== newGuides[i].axis || prev[i].value !== newGuides[i].value) return newGuides;
                      }
                      return prev;
                    });

                    // Apply deltas
                    selectedStickerIndices.forEach(i => {
                      const st = newStickers[i];
                      if (!st) return;
                      newStickers[i] = {
                        ...st,
                        ...(updates.stickerId && i === idx ? { stickerId: updates.stickerId } : {}),
                        ...(updates.color && i === idx ? { color: updates.color } : {}),
                        x: st.x + dx,
                        y: st.y + dy,
                        rotation: (st.rotation + dr + 360) % 360,
                        scale: Math.max(0.1, Math.min(10, st.scale * dScale)),
                        scaleX: (st.scaleX || 1) * dScaleX,
                        scaleY: (st.scaleY || 1) * dScaleY,
                      };
                    });

                    store.updateField("stickers", newStickers, true);
                    if (isFinal) {
                      setGuides([]);
                      store.commitHistory();
                    }
                  }}
                  onDelete={() => {
                    const store = useEditorStore.getState();
                    const newStickers = (store.config.stickers || []).filter((_, i) => i !== idx);
                    store.updateField("stickers", newStickers);
                    setSelectedStickerIndices(prev => prev.filter(i => i !== idx));
                  }}
                  onContextMenu={(e) => {
                    setContextMenu({ x: e.clientX, y: e.clientY });
                  }}
                  isEmoji={isEmoji}
                  isShape={isShape}
                  shapeMap={shapeMap}
                  containerRef={containerRef}
                />
              );
            }

            const getTextStyle = (color: string, props?: any) => {
              const getTextEffectStyle = (effect?: string) => {
                if (!effect || effect === 'none') return {};
                if (effect === 'shadow') return { textShadow: '2px 2px 4px rgba(0,0,0,0.6)' };
                if (effect === 'lift') return { textShadow: '0px 4px 8px rgba(0,0,0,0.5), 0px 2px 4px rgba(0,0,0,0.3)' };
                if (effect === 'hollow') return { WebkitTextStroke: '1px currentColor', color: 'transparent' };
                if (effect === 'neon') return { textShadow: '0 0 5px currentColor, 0 0 15px currentColor, 0 0 30px currentColor' };
                if (effect === 'splice') return { textShadow: '1.5px 1.5px 0px #ff007f, -1.5px -1.5px 0px #00f0ff' };
                return {};
              };

              return {
                color,
                ...getTextEffectStyle(props?.textEffect),
                letterSpacing: props?.letterSpacing ? `${props.letterSpacing}em` : undefined,
                lineHeight: props?.lineHeight ? props.lineHeight : undefined,
                textAlign: props?.textAlign ? props.textAlign : undefined,
                whiteSpace: 'pre-wrap' as const,
              };
            };

            const textStyle = getTextStyle((st as any).color || "var(--color-text)", st.props);

            return (
              <div
                key={idx}
                className="absolute pointer-events-none z-30 select-none"
                style={{
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale}) scaleX(${st.flipX ? -1 : 1}) scaleY(${st.flipY ? -1 : 1})`,
                }}
              >
                {isText ? (
                  <span 
                    className="text-lg font-bold text-center drop-shadow-lg select-none font-heading inline-block min-w-[20px]"
                    style={textStyle}
                    dangerouslySetInnerHTML={renderFormattedText(textContent)}
                  />
                ) : isEmoji ? (
                  <span className="text-4xl leading-none drop-shadow-lg">{st.stickerId}</span>
                ) : isShape ? (
                  renderShape(st.stickerId, (st as any).color || "var(--color-primary)", st.props)
                ) : isMediaUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={st.props?.bgRemovedDataUrl || st.stickerId}
                    alt="user media"
                    className="w-32 h-32 object-contain rounded-md"
                    style={{
                      filter: getImageFilter(st.props),
                      clipPath: getImageClipPath(st.props?.maskType)
                    }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/stickers/${st.stickerId}.svg`}
                    alt="sticker"
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        e.currentTarget.style.display = "none";
                        const span = document.createElement("span");
                        span.className = "text-3xl leading-none drop-shadow-lg";
                        span.textContent = st.stickerId;
                        parent.appendChild(span);
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {lassoRect && mode === "editor-preview" && (
    <div
      className="fixed bg-primary/20 border border-primary z-[100] pointer-events-none"
      style={{
        left: Math.min(lassoRect.startX, lassoRect.currentX),
        top: Math.min(lassoRect.startY, lassoRect.currentY),
        width: Math.abs(lassoRect.currentX - lassoRect.startX),
        height: Math.abs(lassoRect.currentY - lassoRect.startY),
      }}
    />
  )}
      </ConditionalParallax>

      {portalNode && toolbarElement ? createPortal(toolbarElement, portalNode) : toolbarElement}

      {/* Context Menu */}
      {contextMenu && selectedStickerIndices.length > 0 && mode === "editor-preview" && (
        <div
          className="fixed z-[100] w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden py-1 text-sm font-medium"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const store = useEditorStore.getState();
              const currentStickers = store.config.stickers || [];
              const toDuplicate = selectedStickerIndices.map(idx => ({ ...currentStickers[idx], x: currentStickers[idx].x + 5, y: currentStickers[idx].y + 5 }));
              store.updateField("stickers", [...currentStickers, ...toDuplicate]);
              const newIndices = toDuplicate.map((_, i) => currentStickers.length + i);
              setSelectedStickerIndices(newIndices);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 flex items-center hover:bg-zinc-800 text-zinc-200"
          >
            <Copy className="w-4 h-4 mr-2" /> Duplicate
          </button>
          
          <div className="h-px bg-zinc-800 my-1" />
          
          <button
            onClick={() => {
              const store = useEditorStore.getState();
              const currentStickers = [...(store.config.stickers || [])];
              // Simplified bring forward for first item for now
              const idx = selectedStickerIndices[0];
              if (idx < currentStickers.length - 1) {
                const temp = currentStickers[idx];
                currentStickers[idx] = currentStickers[idx + 1];
                currentStickers[idx + 1] = temp;
                store.updateField("stickers", currentStickers);
                setSelectedStickerIndices([idx + 1]);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 flex items-center hover:bg-zinc-800 text-zinc-200"
          >
            <ArrowUp className="w-4 h-4 mr-2" /> Bring Forward
          </button>
          
          <button
            onClick={() => {
              const store = useEditorStore.getState();
              const currentStickers = [...(store.config.stickers || [])];
              const idx = selectedStickerIndices[0];
              if (idx > 0) {
                const temp = currentStickers[idx];
                currentStickers[idx] = currentStickers[idx - 1];
                currentStickers[idx - 1] = temp;
                store.updateField("stickers", currentStickers);
                setSelectedStickerIndices([idx - 1]);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 flex items-center hover:bg-zinc-800 text-zinc-200"
          >
            <ArrowDown className="w-4 h-4 mr-2" /> Send Backward
          </button>
          
          <div className="h-px bg-zinc-800 my-1" />

          {/* Align to Page (Single Selection) or Align Together (Multi Selection) */}
          <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Align</div>
          <div className="grid grid-cols-3 gap-1 px-2 pb-2">
            <button
              onClick={() => {
                const store = useEditorStore.getState();
                const currentStickers = [...(store.config.stickers || [])];
                if (selectedStickerIndices.length === 1) {
                  currentStickers[selectedStickerIndices[0]].x = 50;
                } else if (selectedStickerIndices.length > 1) {
                  const avgX = selectedStickerIndices.reduce((sum, idx) => sum + currentStickers[idx].x, 0) / selectedStickerIndices.length;
                  selectedStickerIndices.forEach(idx => { currentStickers[idx].x = avgX; });
                }
                store.updateField("stickers", currentStickers);
                setContextMenu(null);
              }}
              className="p-1.5 text-center bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
            >Center</button>
            <button
              onClick={() => {
                const store = useEditorStore.getState();
                const currentStickers = [...(store.config.stickers || [])];
                if (selectedStickerIndices.length === 1) {
                  currentStickers[selectedStickerIndices[0]].y = 50;
                } else if (selectedStickerIndices.length > 1) {
                  const avgY = selectedStickerIndices.reduce((sum, idx) => sum + currentStickers[idx].y, 0) / selectedStickerIndices.length;
                  selectedStickerIndices.forEach(idx => { currentStickers[idx].y = avgY; });
                }
                store.updateField("stickers", currentStickers);
                setContextMenu(null);
              }}
              className="p-1.5 text-center bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
            >Middle</button>
            {selectedStickerIndices.length > 2 && (
              <button
                onClick={() => {
                  const store = useEditorStore.getState();
                  const currentStickers = [...(store.config.stickers || [])];
                  // Sort by X
                  const sorted = [...selectedStickerIndices].sort((a, b) => currentStickers[a].x - currentStickers[b].x);
                  const minX = currentStickers[sorted[0]].x;
                  const maxX = currentStickers[sorted[sorted.length - 1]].x;
                  const step = (maxX - minX) / (sorted.length - 1);
                  sorted.forEach((idx, i) => {
                    currentStickers[idx].x = minX + (step * i);
                  });
                  store.updateField("stickers", currentStickers);
                  setContextMenu(null);
                }}
                className="p-1.5 text-center bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
              >Tidy</button>
            )}
          </div>

          <div className="h-px bg-zinc-800 my-1" />

          <button
            onClick={() => {
              const store = useEditorStore.getState();
              const currentStickers = store.config.stickers || [];
              store.updateField("stickers", currentStickers.filter((_, i) => !selectedStickerIndices.includes(i)));
              setSelectedStickerIndices([]);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 flex items-center hover:bg-red-900/50 text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      )}

      {/* Collaborative Contributions Section (only shown in full mode if collaborative card) */}
      {mode === "full" && contributions.length > 0 && (
        <div 
          className="z-20 w-11/12 max-w-lg mt-6 shadow-xl rounded-xl p-4 border select-text flex flex-col gap-4 text-left backdrop-blur-md"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-background) 90%, var(--color-text) 10%)",
            borderColor: "color-mix(in srgb, var(--color-text) 15%, transparent)",
          }}
        >
          <h4 
            className="text-xs uppercase tracking-wider font-bold border-b pb-2"
            style={{ 
              color: "var(--color-accent)",
              borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)"
            }}
          >
            Group Wishes ({contributions.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
            {contributions.map((con) => (
              <div 
                key={con.id} 
                className="text-xs border-b pb-2"
                style={{ borderColor: "color-mix(in srgb, var(--color-text) 8%, transparent)" }}
              >
                <span className="font-bold" style={{ color: "var(--color-primary)" }}>{con.display_name}:</span>
                <p className="italic mt-0.5 font-medium" style={{ color: "var(--color-text)" }}>{con.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeRenderer;
