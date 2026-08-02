"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Clock, Palette as PaletteIcon, Sparkles } from "lucide-react";
import {
  TransformableSticker,
  renderShape,
  getImageFilter,
  getImageClipPath,
  renderFormattedText,
} from "../../editor/TransformableSticker";
import { useEditorStore } from "@/lib/editor/store";
import { useTimelineScrub } from "../../editor/ElementTimeline";
import type { CardConfig } from "@/lib/themes/types";

type Mode = "gallery-mini" | "editor-preview" | "full";
type Sticker = NonNullable<CardConfig["stickers"]>[number];

const SHAPE_IDS = [
  "text", "star", "square", "circle", "triangle", "heart", "pentagon",
  "hexagon", "diamond", "arrow", "speech", "lightning", "plus", "pill",
  "rounded-square", "oval", "octagon", "chevron", "shield", "banner",
  "sparkle4", "cloud", "crescent", "pin", "gem", "check", "ring", "star6",
];

/** How an element can animate on the recipient's card. */
const ANIMATIONS: { id: string; label: string; className: string }[] = [
  { id: "none", label: "None", className: "" },
  { id: "pulse", label: "Pulse", className: "animate-pulse" },
  { id: "bounce", label: "Bounce", className: "animate-bounce" },
  { id: "spin", label: "Spin", className: "animate-spin" },
];

function animationClass(props?: any): string {
  return ANIMATIONS.find((a) => a.id === props?.animation)?.className ?? "";
}

function classifySticker(stickerId: string) {
  const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(stickerId);
  const isShape = SHAPE_IDS.includes(stickerId) || stickerId.startsWith("text:");
  const isText = stickerId.startsWith("text:") || stickerId === "text";
  const isMediaUrl =
    stickerId.startsWith("data:image") || stickerId.startsWith("http") || stickerId.startsWith("/");
  return { isEmoji, isShape, isText, isMediaUrl };
}

const SHAPE_MAP: Record<string, string> = { text: "T", star: "★", square: "■", circle: "●" };

function getTextStyle(color: string, props?: any): React.CSSProperties {
  const effect = props?.textEffect;
  const effectStyle: React.CSSProperties =
    !effect || effect === "none"
      ? {}
      : effect === "shadow"
      ? { textShadow: "2px 2px 4px rgba(0,0,0,0.6)" }
      : effect === "lift"
      ? { textShadow: "0px 4px 8px rgba(0,0,0,0.5), 0px 2px 4px rgba(0,0,0,0.3)" }
      : effect === "hollow"
      ? { WebkitTextStroke: "1px currentColor", color: "transparent" }
      : effect === "neon"
      ? { textShadow: "0 0 5px currentColor, 0 0 15px currentColor, 0 0 30px currentColor" }
      : effect === "splice"
      ? { textShadow: "1.5px 1.5px 0px #ff007f, -1.5px -1.5px 0px #00f0ff" }
      : {};
  return {
    color,
    ...effectStyle,
    letterSpacing: props?.letterSpacing ? `${props.letterSpacing}em` : undefined,
    lineHeight: props?.lineHeight ? props.lineHeight : undefined,
    textAlign: props?.textAlign ? props.textAlign : undefined,
    whiteSpace: "pre-wrap",
  };
}

/**
 * When should this sticker be visible on the recipient's card?
 * - visibility "always": entire experience.
 * - visibility "start": only BEFORE the experience completes (hides after the reveal/button press).
 * - visibility "end": only AFTER the experience completes.
 * - showForSeconds N: additionally hides N seconds after the card opens.
 */
function isVisibleNow(st: Sticker, revealed: boolean, elapsedSec: number): boolean {
  const vis = (st.props as any)?.visibility ?? "always";
  if (vis === "end" && !revealed) return false;
  if (vis === "start" && revealed) return false;
  // Timeline window: startAt → endAt (endAt falls back to legacy showForSeconds).
  const startAt = Number((st.props as any)?.startAt ?? 0);
  if (Number.isFinite(startAt) && elapsedSec < startAt) return false;
  const rawEnd = (st.props as any)?.endAt ?? (st.props as any)?.showForSeconds;
  const endAt = Number(rawEnd);
  if (rawEnd != null && Number.isFinite(endAt) && endAt > 0 && elapsedSec >= endAt) return false;
  return true;
}

/** Does any sticker need a running clock (timeline window set)? */
function needsTimelineClock(stickers: Sticker[]): boolean {
  return stickers.some((st) => {
    const p = st.props as any;
    return Number(p?.startAt) > 0 || p?.endAt != null || Number(p?.showForSeconds) > 0;
  });
}

/** Static (non-interactive) render of one sticker, used in full/viewer mode. */
function StaticSticker({ st }: { st: Sticker }) {
  const { isEmoji, isShape, isText, isMediaUrl } = classifySticker(st.stickerId);
  const textContent = st.stickerId.startsWith("text:")
    ? st.stickerId.substring(5)
    : "Double click to edit";
  const anim = animationClass(st.props);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${st.x}%`,
        top: `${st.y}%`,
        transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale}) scaleX(${
          st.flipX ? -1 : 1
        }) scaleY(${st.flipY ? -1 : 1})`,
      }}
    >
      {/* animation lives on an inner wrapper so it can't fight the positioning transform */}
      <div className={anim}>
        {isText ? (
          <span
            className="text-lg font-bold text-center drop-shadow-lg select-none font-heading inline-block min-w-[20px]"
            style={getTextStyle((st as any).color || "var(--exp-text, #fff)", st.props)}
            dangerouslySetInnerHTML={renderFormattedText(textContent)}
          />
        ) : isEmoji ? (
          <span className="text-4xl leading-none drop-shadow-lg">{st.stickerId}</span>
        ) : isShape ? (
          renderShape(st.stickerId, (st as any).color || "var(--exp-primary, #7c3aed)", st.props)
        ) : isMediaUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={st.props?.bgRemovedDataUrl || st.stickerId}
            alt="user media"
            className="w-32 h-32 object-contain rounded-md"
            style={{ filter: getImageFilter(st.props), clipPath: getImageClipPath(st.props?.maskType) }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={`/stickers/${st.stickerId}.svg`} alt="sticker" className="w-12 h-12 object-contain" />
        )}
      </div>
    </div>
  );
}

/** Viewer-mode overlay: honours per-element visibility phase and show-for-N-seconds timers. */
function ViewerStickerLayer({ stickers, revealed }: { stickers: Sticker[]; revealed: boolean }) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const needsClock = needsTimelineClock(stickers);

  useEffect(() => {
    if (!needsClock) return;
    const t0 = Date.now();
    const i = setInterval(() => setElapsedSec((Date.now() - t0) / 1000), 500);
    return () => clearInterval(i);
  }, [needsClock]);

  const visible = stickers.filter((st) => isVisibleNow(st, revealed, elapsedSec));
  return (
    // Above experience end-screens (z-[55], under MessageAffordance's 60); never intercepts
    // pointer events so the experience stays interactive.
    <div className="absolute inset-0 pointer-events-none z-[55]">
      {visible.map((st, idx) => (
        <StaticSticker key={idx} st={st} />
      ))}
    </div>
  );
}

/** Compact toolbar for the selected element: color, timing, animation, delete. */
function ElementToolbar({
  sticker,
  index,
  onClose,
}: {
  sticker: Sticker;
  index: number;
  onClose: () => void;
}) {
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalEl(document.getElementById("editor-sticker-toolbar-portal"));
  }, []);

  const { isShape, isText, isEmoji } = classifySticker(sticker.stickerId);
  const supportsColor = isShape || isText;

  const patchSticker = (partial: Partial<Sticker> & { color?: string }) => {
    const store = useEditorStore.getState();
    const ns = [...(store.config.stickers || [])];
    if (!ns[index]) return;
    ns[index] = { ...ns[index], ...partial } as Sticker;
    store.updateField("stickers", ns);
  };
  const patchProps = (p: Record<string, unknown>) => {
    const store = useEditorStore.getState();
    const ns = [...(store.config.stickers || [])];
    if (!ns[index]) return;
    ns[index] = { ...ns[index], props: { ...(ns[index].props || {}), ...p } } as Sticker;
    store.updateField("stickers", ns);
  };

  const visibility = (sticker.props as any)?.visibility ?? "always";
  const animation = (sticker.props as any)?.animation ?? "none";

  const bar = (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/95 backdrop-blur px-3 py-2 text-zinc-100 shadow-xl pointer-events-auto">
      {supportsColor && (
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
          <PaletteIcon className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="color"
            value={(sticker as any).color || "#7c3aed"}
            onChange={(e) => patchSticker({ color: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"
            title="Element colour"
          />
        </label>
      )}
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5 text-zinc-400" />
        <select
          value={visibility}
          onChange={(e) => patchProps({ visibility: e.target.value })}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-1 text-[11px] font-bold cursor-pointer"
          title="When the element shows on the card"
        >
          <option value="always">Always visible</option>
          <option value="start">Only before the reveal</option>
          <option value="end">Only after the reveal</option>
        </select>
      </label>
      <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" title="Hide the element this many seconds after the card opens (empty = forever)">
        <span className="text-zinc-400">For</span>
        <input
          type="number"
          min={1}
          max={600}
          placeholder="∞"
          value={(sticker.props as any)?.showForSeconds ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? undefined : Math.max(1, Math.min(600, Number(e.target.value)));
            patchProps({ showForSeconds: v });
          }}
          className="w-14 bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-1 text-[11px] font-bold"
        />
        <span className="text-zinc-400">sec</span>
      </label>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
        <select
          value={animation}
          onChange={(e) => patchProps({ animation: e.target.value })}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-1 text-[11px] font-bold cursor-pointer"
          title="Animation played on the card"
        >
          {ANIMATIONS.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </label>
      <button
        onClick={() => {
          const store = useEditorStore.getState();
          const ns = (store.config.stickers || []).filter((_, i) => i !== index);
          store.updateField("stickers", ns);
          onClose();
        }}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 px-1.5 py-1 rounded-md hover:bg-red-500/10 cursor-pointer"
        title="Delete element"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      {(isEmoji || (!isShape && !isText)) && !supportsColor && (
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Colour applies to shapes &amp; text</span>
      )}
    </div>
  );

  if (portalEl) return createPortal(bar, portalEl);
  return <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[70]">{bar}</div>;
}

/**
 * Renders the `config.stickers` overlay. ThemeRenderer has its own copy for style themes; this
 * shared layer is what lets EXPERIENCE themes show stickers/elements too. In editor-preview it is
 * fully interactive (drag/resize/rotate + a colour/timing/animation toolbar); in the viewer it is
 * a static overlay that honours per-element visibility ("always" vs "only at the end").
 */
export function StickerLayer({
  stickers,
  mode,
  revealed = false,
}: {
  stickers: Sticker[] | undefined;
  mode: Mode;
  /** Whether the experience has completed (unlocks "show at the end" elements). */
  revealed?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const scrubT = useTimelineScrub((s) => s.t);

  if (!stickers || stickers.length === 0 || mode === "gallery-mini") {
    return null;
  }

  if (mode !== "editor-preview") {
    return <ViewerStickerLayer stickers={stickers} revealed={revealed} />;
  }

  // Interactive editor overlay.
  const primarySelected = selected.length > 0 ? selected[selected.length - 1] : null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[55]"
      onPointerDown={(e) => {
        if (e.target === containerRef.current) setSelected([]);
      }}
    >
      {primarySelected !== null && stickers[primarySelected] && (
        <ElementToolbar
          sticker={stickers[primarySelected]}
          index={primarySelected}
          onClose={() => setSelected([])}
        />
      )}
      {stickers.map((st, idx) => {
        const { isEmoji, isShape } = classifySticker(st.stickerId);
        const p = st.props as any;
        const vis = p?.visibility ?? "always";
        const isTimed = vis !== "always" || Number(p?.showForSeconds) > 0 || Number(p?.startAt) > 0 || p?.endAt != null;
        // When the timeline scrubber is active, ghost anything outside its time window so the
        // creator sees exactly what the recipient sees at that second.
        const s0 = Number(p?.startAt ?? 0) || 0;
        const rawEnd = p?.endAt ?? p?.showForSeconds;
        const inWindow = scrubT === null || (scrubT >= s0 && (rawEnd == null || scrubT < Number(rawEnd)));
        return (
          <div
            key={idx}
            className={!inWindow ? "opacity-15" : isTimed ? "opacity-60" : undefined}
            title={isTimed ? "Timed element, schedule it in the Timeline tab" : undefined}
          >
            <TransformableSticker
              sticker={st}
              index={idx}
              isSelected={selected.includes(idx)}
              onSelect={(e) => {
                const store = useEditorStore.getState();
                const target = (store.config.stickers || [])[idx];
                if (target && (target as any).isLocked) return;
                if (e && e.shiftKey) {
                  setSelected((prev) =>
                    prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                  );
                } else {
                  setSelected([idx]);
                }
              }}
              onUpdate={(updates, isFinal) => {
                const store = useEditorStore.getState();
                const newStickers = [...(store.config.stickers || [])];
                const target = newStickers[idx];
                if (target) {
                  const dx = updates.x !== undefined ? updates.x - target.x : 0;
                  const dy = updates.y !== undefined ? updates.y - target.y : 0;
                  const dr = updates.rotation !== undefined ? updates.rotation - target.rotation : 0;
                  const dScale = updates.scale !== undefined ? updates.scale / target.scale : 1;
                  const dScaleX = updates.scaleX !== undefined ? updates.scaleX / (target.scaleX || 1) : 1;
                  const dScaleY = updates.scaleY !== undefined ? updates.scaleY / (target.scaleY || 1) : 1;
                  const indices = selected.includes(idx) ? selected : [idx];
                  indices.forEach((i) => {
                    const s = newStickers[i];
                    if (!s) return;
                    newStickers[i] = {
                      ...s,
                      ...(updates.stickerId && i === idx ? { stickerId: updates.stickerId } : {}),
                      ...(updates.color && i === idx ? { color: updates.color } : {}),
                      x: s.x + dx,
                      y: s.y + dy,
                      rotation: (s.rotation + dr + 360) % 360,
                      scale: Math.max(0.1, Math.min(10, s.scale * dScale)),
                      scaleX: (s.scaleX || 1) * dScaleX,
                      scaleY: (s.scaleY || 1) * dScaleY,
                    };
                  });
                  store.updateField("stickers", newStickers, true);
                }
                if (isFinal) store.commitHistory();
              }}
              onDelete={() => {
                const store = useEditorStore.getState();
                const newStickers = (store.config.stickers || []).filter((_, i) => i !== idx);
                store.updateField("stickers", newStickers);
                setSelected((prev) => prev.filter((i) => i !== idx));
              }}
              isEmoji={isEmoji}
              isShape={isShape}
              shapeMap={SHAPE_MAP}
              containerRef={containerRef}
            />
          </div>
        );
      })}
    </div>
  );
}

export default StickerLayer;
