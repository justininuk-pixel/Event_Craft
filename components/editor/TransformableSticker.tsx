"use client";

import React, { useRef, useState, useEffect } from "react";
import { Trash2, RotateCw } from "lucide-react";

interface TransformableStickerProps {
  sticker: { 
    stickerId: string; 
    x: number; 
    y: number; 
    rotation: number; 
    scale: number;
    scaleX?: number;
    scaleY?: number;
    flipX?: boolean;
    flipY?: boolean;
    props?: any;
  };
  index: number;
  isSelected: boolean;
  onSelect: (e?: any) => void;
  onUpdate: (updates: Partial<{ stickerId: string; x: number; y: number; rotation: number; scale: number; scaleX?: number; scaleY?: number; color?: string }>, isFinal?: boolean) => void;
  onDelete: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isEmoji: boolean;
  isShape: boolean;
  shapeMap: Record<string, string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const getImageFilter = (props?: any) => {
  if (!props) return undefined;
  const preset = props.presetFilter;
  let presetString = '';
  if (preset === '1977') presetString = 'contrast(1.1) brightness(1.1) saturate(1.3) ';
  else if (preset === 'aden') presetString = 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2) ';
  else if (preset === 'inkwell') presetString = 'sepia(0.3) contrast(1.1) brightness(1.1) grayscale(1) ';
  else if (preset === 'valencia') presetString = 'sepia(0.08) contrast(1.08) brightness(1.08) ';
  else if (preset === 'toaster') presetString = 'contrast(1.5) brightness(0.9) ';

  const filters = props.filters || {};
  const brightness = filters.brightness ?? 100;
  const contrast = filters.contrast ?? 100;
  const saturate = filters.saturate ?? 100;
  const blur = filters.blur ?? 0;

  return `${presetString}brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px)`;
};

export const getImageClipPath = (maskType?: string) => {
  if (!maskType || maskType === 'none') return undefined;
  if (maskType === 'circle') return 'circle(50%)';
  if (maskType === 'triangle') return 'polygon(50% 0%, 0% 100%, 100% 100%)';
  if (maskType === 'hexagon') return 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  if (maskType === 'star') return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
  return undefined;
};

export function renderFormattedText(text: string) {
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/_(.*?)_/g, "<em>$1</em>");
  formatted = formatted.split('\n').map(line => {
    if (line.trim().startsWith('- ')) {
      return `• ${line.trim().substring(2)}`;
    }
    return line;
  }).join('<br />');

  return { __html: formatted };
}

export function renderShape(shapeId: string, color: string = "var(--color-primary)", props?: any) {
  const cleanId = shapeId.startsWith("text:") ? "text" : shapeId;
  const borderWidth = props?.borderWidth ?? 0;
  const borderRadius = props?.borderRadius ?? 0;
  const borderColor = props?.borderColor || "#000000";

  const hasGradient = props?.gradientType === 'linear' || props?.gradientType === 'radial';
  const fillValue = hasGradient ? "url(#shape-grad)" : color;

  const style = {
    borderRadius: `${borderRadius}%`,
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
    boxSizing: 'border-box' as const,
    width: '64px',
    height: '64px',
  };

  const svgStyle = {
    stroke: borderWidth > 0 ? borderColor : 'none',
    strokeWidth: borderWidth > 0 ? `${borderWidth}px` : 0,
    strokeLinejoin: 'round' as const,
    width: '64px',
    height: '64px',
  };

  const gradientBlock = hasGradient && (
    <defs>
      {props.gradientType === 'linear' ? (
        <linearGradient id="shape-grad" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${props.gradientAngle || 90})`}>
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={props.gradientColor2 || 'rgba(0,0,0,0)'} />
        </linearGradient>
      ) : (
        <radialGradient id="shape-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={props.gradientColor2 || 'rgba(0,0,0,0)'} />
        </radialGradient>
      )}
    </defs>
  );

  const bgStyle = hasGradient 
    ? (props.gradientType === 'linear' 
        ? { background: `linear-gradient(${props.gradientAngle || 90}deg, ${color}, ${props.gradientColor2 || 'rgba(0,0,0,0)'})` }
        : { background: `radial-gradient(circle, ${color}, ${props.gradientColor2 || 'rgba(0,0,0,0)'})` }
      )
    : { backgroundColor: color };

  switch (cleanId) {
    case "text":
      return null;
    case "square":
      return <div className="w-16 h-16 shadow-md" style={{ ...style, ...bgStyle }} />;
    case "circle":
      return <div className="w-16 h-16 rounded-full shadow-md" style={{ ...style, ...bgStyle, borderRadius: '50%' }} />;
    case "triangle":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="12,2 22,22 2,22" fill={fillValue} />
        </svg>
      );
    case "star":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill={fillValue} />
        </svg>
      );
    case "heart":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={fillValue} />
        </svg>
      );
    case "pentagon":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="12,2 22,9 18,20 6,20 2,9" fill={fillValue} />
        </svg>
      );
    case "hexagon":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill={fillValue} />
        </svg>
      );
    case "diamond":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="12,2 22,12 12,22 2,12" fill={fillValue} />
        </svg>
      );
    case "arrow":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="2,9 14,9 14,4 22,12 14,20 14,15 2,15" fill={fillValue} />
        </svg>
      );
    case "speech":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M4 3h16a2 2 0 012 2v9a2 2 0 01-2 2H10l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2z" fill={fillValue} />
        </svg>
      );
    case "lightning":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="13,2 4,14 11,14 9,22 20,9 13,9" fill={fillValue} />
        </svg>
      );
    case "plus":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9" fill={fillValue} />
        </svg>
      );
    case "pill":
      return <div className="w-16 h-16 shadow-md" style={{ ...style, ...bgStyle, borderRadius: '9999px', height: '40px', marginTop: '12px' }} />;
    case "rounded-square":
      return <div className="w-16 h-16 shadow-md" style={{ ...style, ...bgStyle, borderRadius: '22%' }} />;
    case "oval":
      return <div className="w-16 shadow-md" style={{ ...style, ...bgStyle, borderRadius: '50%', height: '44px', marginTop: '10px' }} />;
    case "octagon":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7" fill={fillValue} />
        </svg>
      );
    case "chevron":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="2,5 12,15 22,5 22,10 12,20 2,10" fill={fillValue} />
        </svg>
      );
    case "shield":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M12 2l9 3v6c0 5-3.8 9-9 11-5.2-2-9-6-9-11V5l9-3z" fill={fillValue} />
        </svg>
      );
    case "banner":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="3,3 21,3 21,18 12,13.5 3,18" fill={fillValue} />
        </svg>
      );
    case "sparkle4":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M12 0c1 6 5 10 12 12-7 2-11 6-12 12-1-6-5-10-12-12 7-2 11-6 12-12z" fill={fillValue} />
        </svg>
      );
    case "cloud":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M6 18a4 4 0 010-8 6 6 0 0111.5-2A4.5 4.5 0 0118 18H6z" fill={fillValue} />
        </svg>
      );
    case "crescent":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M16 3a9 9 0 100 18 7 7 0 010-18z" fill={fillValue} />
        </svg>
      );
    case "pin":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.6A2.6 2.6 0 1112 6.4a2.6 2.6 0 010 5.2z" fill={fillValue} />
        </svg>
      );
    case "gem":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="6,3 18,3 22,9 12,22 2,9" fill={fillValue} />
        </svg>
      );
    case "check":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="9.2,16.2 4.8,11.8 3.4,13.2 9.2,19 21,7.2 19.6,5.8" fill={fillValue} />
        </svg>
      );
    case "ring":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={{ width: "64px", height: "64px" }}>
          {gradientBlock}
          <circle cx="12" cy="12" r="9" fill="none" stroke={fillValue} strokeWidth="4" />
        </svg>
      );
    case "star6":
      return (
        <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 24 24" style={svgStyle}>
          {gradientBlock}
          <polygon points="12,1 15,7 22,7 17,12 22,17 15,17 12,23 9,17 2,17 7,12 2,7 9,7" fill={fillValue} />
        </svg>
      );
    default:
      return null;
  }
}

type TransformMode = 'idle' | 'drag' | 'rotate' | 'scale' | 'scale-x' | 'scale-y';

export function TransformableSticker({
  sticker,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isEmoji,
  isShape,
  shapeMap,
  containerRef,
  onContextMenu,
}: TransformableStickerProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<TransformMode>('idle');

  const interactionStartRef = useRef<{
    clientX: number;
    clientY: number;
    stickerX: number;
    stickerY: number;
    stickerRotation: number;
    stickerScale: number;
    stickerScaleX: number;
    stickerScaleY: number;
    cx: number;
    cy: number;
    startAngle: number;
    startDistance: number;
    startWidth: number;
    startHeight: number;
    direction?: string;
  } | null>(null);

  // Inline text editing states
  const isText = sticker.stickerId.startsWith("text:") || sticker.stickerId === "text";
  const textContent = sticker.stickerId.startsWith("text:") ? sticker.stickerId.substring(5) : "Double click to edit";
  const [isEditingText, setIsEditingText] = useState(false);
  const [textValue, setTextValue] = useState(textContent);
  
  const [localTransform, setLocalTransform] = useState<Partial<{ x: number; y: number; rotation: number; scale: number; scaleX: number; scaleY: number }> | null>(null);
  // Ref mirror of localTransform. Pointer handlers read/write this directly so pointer-up can
  // access the final value WITHOUT calling onUpdate inside a setState updater (that pattern
  // triggered React's "cannot update a component while rendering a different component").
  const localTransformRef = useRef<typeof localTransform>(null);
  const applyLocalTransform = (next: typeof localTransform) => {
    localTransformRef.current = next;
    setLocalTransform(next);
  };

  useEffect(() => {
    setTextValue(textContent);
  }, [textContent]);

  useEffect(() => {
    if (mode === 'idle') return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactionStartRef.current || !containerRef.current || !nodeRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const start = interactionStartRef.current;

      if (mode === 'drag') {
        const deltaX = e.clientX - start.clientX;
        const deltaY = e.clientY - start.clientY;
        
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;
        
        const newX = start.stickerX + deltaXPercent;
        const newY = start.stickerY + deltaYPercent;
        
        applyLocalTransform({ ...localTransformRef.current, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (mode === 'rotate') {
        const angle = Math.atan2(e.clientY - start.cy, e.clientX - start.cx) * (180 / Math.PI);
        const deltaAngle = angle - start.startAngle;
        applyLocalTransform({ ...localTransformRef.current, rotation: (start.stickerRotation + deltaAngle + 360) % 360 });
      } else if (mode === 'scale') {
        const distance = Math.sqrt(Math.pow(e.clientX - start.cx, 2) + Math.pow(e.clientY - start.cy, 2));
        const scaleFactor = distance / Math.max(10, start.startDistance);
        const newScale = start.stickerScale * scaleFactor;
        applyLocalTransform({ ...localTransformRef.current, scale: Math.max(0.1, Math.min(10, newScale)) });
      } else if (mode === 'scale-x') {
        // Horizontal stretching
        const rad = start.stickerRotation * (Math.PI / 180);
        const dx = e.clientX - start.clientX;
        const dy = e.clientY - start.clientY;
        // Project movement along the rotated X axis
        const projectedDx = dx * Math.cos(rad) + dy * Math.sin(rad);
        const dirSign = start.direction === 'w' ? -1 : 1;
        
        // ScaleX changes based on the width
        const widthChange = projectedDx * dirSign * 2; // *2 because it grows from center
        const newScaleX = start.stickerScaleX * ((start.startWidth + widthChange) / start.startWidth);
        applyLocalTransform({ ...localTransformRef.current, scaleX: Math.max(0.1, Math.min(10, newScaleX)) });
      } else if (mode === 'scale-y') {
        // Vertical stretching
        const rad = start.stickerRotation * (Math.PI / 180);
        const dx = e.clientX - start.clientX;
        const dy = e.clientY - start.clientY;
        // Project movement along the rotated Y axis
        const projectedDy = -dx * Math.sin(rad) + dy * Math.cos(rad);
        const dirSign = start.direction === 'n' ? -1 : 1;
        
        const heightChange = projectedDy * dirSign * 2;
        const newScaleY = start.stickerScaleY * ((start.startHeight + heightChange) / start.startHeight);
        applyLocalTransform({ ...localTransformRef.current, scaleY: Math.max(0.1, Math.min(10, newScaleY)) });
      }
    };

    const handlePointerUp = () => {
      // Read the final transform from the ref mirror — never call onUpdate inside a setState
      // updater (React forbids updating another component from within an updater/render).
      const currentLocal = localTransformRef.current;
      applyLocalTransform(null);
      if (currentLocal) {
        onUpdate(currentLocal, true);
      } else {
        onUpdate({}, true); // Just commit history if no changes
      }
      setMode('idle');
      interactionStartRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [mode, containerRef, onUpdate]);

  const isMediaUrl = sticker.stickerId.startsWith("data:image") || sticker.stickerId.startsWith("http") || sticker.stickerId.startsWith("/");

  const handlePointerDown = (e: React.PointerEvent, newMode: TransformMode, direction?: string) => {
    e.stopPropagation();
    onSelect(e);
    
    if (!containerRef.current || !nodeRef.current) return;
    
    const nodeRect = nodeRef.current.getBoundingClientRect();
    const cx = nodeRect.left + nodeRect.width / 2;
    const cy = nodeRect.top + nodeRect.height / 2;
    
    interactionStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      stickerX: sticker.x,
      stickerY: sticker.y,
      stickerRotation: sticker.rotation,
      stickerScale: sticker.scale,
      stickerScaleX: sticker.scaleX || 1,
      stickerScaleY: sticker.scaleY || 1,
      cx,
      cy,
      startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI),
      startDistance: Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2)),
      startWidth: nodeRect.width,
      startHeight: nodeRect.height,
      direction,
    };
    setMode(newMode);
  };

  const currentX = localTransform?.x ?? sticker.x;
  const currentY = localTransform?.y ?? sticker.y;
  const currentRotation = localTransform?.rotation ?? sticker.rotation;
  const currentScale = localTransform?.scale ?? sticker.scale;
  const currentScaleX = localTransform?.scaleX ?? sticker.scaleX ?? 1;
  const currentScaleY = localTransform?.scaleY ?? sticker.scaleY ?? 1;

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

  const textStyle = getTextStyle((sticker as any).color || "var(--color-text)", sticker.props);

  return (
    <div
      className="absolute z-40"
      style={{
        left: `${currentX}%`,
        top: `${currentY}%`,
        transform: `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${currentScale}) scaleX(${sticker.flipX ? -1 : 1}) scaleY(${sticker.flipY ? -1 : 1})`,
        touchAction: "none",
      }}
    >
      <div
        ref={nodeRef}
        onPointerDown={(e) => handlePointerDown(e, 'drag')}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.preventDefault();
            e.stopPropagation();
            onSelect(e);
            onContextMenu(e);
          }
        }}
        style={{ transform: `scaleX(${currentScaleX}) scaleY(${currentScaleY})` }}
        className={`relative select-none flex items-center justify-center p-0 transition-none ${
          isSelected ? "ring-[2px] ring-primary cursor-move" : "cursor-pointer hover:ring-1 hover:ring-border/50"
        }`}
      >
        {isText ? (
          isEditingText ? (
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={() => {
                setIsEditingText(false);
                onUpdate({ stickerId: `text:${textValue}` });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingText(false);
                  onUpdate({ stickerId: `text:${textValue}` });
                }
              }}
              className="bg-transparent text-center focus:outline-none select-text text-lg font-bold min-w-[120px] font-heading"
              style={textStyle}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingText(true);
              }}
              className="text-lg font-bold text-center select-none font-heading drop-shadow-md min-w-[20px] inline-block"
              style={textStyle}
              dangerouslySetInnerHTML={renderFormattedText(textContent)}
            />
          )
        ) : isEmoji ? (
          <span className="text-4xl leading-none drop-shadow-lg">{sticker.stickerId}</span>
        ) : isShape ? (
          renderShape(sticker.stickerId, (sticker as any).color || "var(--color-primary)", sticker.props)
        ) : isMediaUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={sticker.props?.bgRemovedDataUrl || sticker.stickerId}
            alt="user media"
            className="w-32 h-32 object-contain rounded-md animate-fade-in"
            draggable={false}
            style={{
              filter: getImageFilter(sticker.props),
              clipPath: getImageClipPath(sticker.props?.maskType)
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`/stickers/${sticker.stickerId}.svg`}
            alt="sticker"
            className="w-12 h-12 object-contain"
            draggable={false}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const span = document.createElement("span");
              span.className = "text-3xl leading-none drop-shadow-lg";
              span.textContent = sticker.stickerId;
              target.parentElement?.appendChild(span);
            }}
          />
        )}

        {/* Selected State Handles (Canva Bounding Box) */}
        {isSelected && !isEditingText && (
          <>
            {/* Delete Button (Optional contextual UI - typically Canva uses floating bar or keyboard, but keeping this for now) */}
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute -top-10 -right-4 w-7 h-7 bg-white text-zinc-900 border border-zinc-200 rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform z-50 pointer-events-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Corner Handles (Proportional Scale) */}
            <div onPointerDown={(e) => handlePointerDown(e, 'scale')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-nwse-resize z-50 pointer-events-auto" />
            <div onPointerDown={(e) => handlePointerDown(e, 'scale')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-nesw-resize z-50 pointer-events-auto" />
            <div onPointerDown={(e) => handlePointerDown(e, 'scale')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-nesw-resize z-50 pointer-events-auto" />
            <div onPointerDown={(e) => handlePointerDown(e, 'scale')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-primary rounded-full cursor-nwse-resize z-50 pointer-events-auto" />

            {/* Edge Handles (Stretch) */}
            <div onPointerDown={(e) => handlePointerDown(e, 'scale-y', 'n')} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-primary rounded-full cursor-ns-resize z-50 pointer-events-auto" />
            <div onPointerDown={(e) => handlePointerDown(e, 'scale-y', 's')} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-primary rounded-full cursor-ns-resize z-50 pointer-events-auto" />
            <div onPointerDown={(e) => handlePointerDown(e, 'scale-x', 'w')} className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-4 bg-white border border-primary rounded-full cursor-ew-resize z-50 pointer-events-auto" />
            <div onPointerDown={(e) => handlePointerDown(e, 'scale-x', 'e')} className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-4 bg-white border border-primary rounded-full cursor-ew-resize z-50 pointer-events-auto" />

            {/* Rotate Handle */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'rotate')}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-primary rounded-full flex items-center justify-center shadow-sm cursor-grab active:cursor-grabbing z-50 pointer-events-auto"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-700" />
            </div>
            
            {/* Rotate Connector Line */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-px h-4 bg-primary z-40 pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
}
