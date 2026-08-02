"use client";

import React from "react";
import clsx from "clsx";
import { Lock, Unlock, Copy, Trash2, ArrowUp, ArrowDown, Type, Image as ImageIcon, Shapes, Smile } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { StickerPlacement } from "@/lib/themes/types";
import { triggerVibrate } from "@/lib/utils/device";

const SHAPE_NAMES: Record<string, string> = {
  square: "Square", circle: "Circle", triangle: "Triangle", star: "Star", heart: "Heart",
  pentagon: "Pentagon", hexagon: "Hexagon", diamond: "Diamond", arrow: "Arrow",
  speech: "Speech bubble", lightning: "Lightning", plus: "Cross", pill: "Pill",
};

type LayerIcon = "text" | "image" | "shape" | "emoji";

function describe(s: StickerPlacement): { label: string; icon: LayerIcon } {
  const id = s.stickerId;
  if (id.startsWith("text:")) return { label: `Text: ${id.slice(5).trim().slice(0, 18) || "…"}`, icon: "text" };
  if (id === "text") return { label: "Text", icon: "text" };
  if (SHAPE_NAMES[id]) return { label: SHAPE_NAMES[id], icon: "shape" };
  if (id.startsWith("http") || id.startsWith("data:") || id.startsWith("/")) return { label: "Image", icon: "image" };
  return { label: id.length <= 4 ? id : "Sticker", icon: "emoji" };
}

function IconBtn({
  onClick, disabled, danger, title, children,
}: { onClick: () => void; disabled?: boolean; danger?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "w-6 h-6 rounded-md flex items-center justify-center transition-colors disabled:opacity-25 cursor-pointer",
        danger ? "text-red-400 hover:bg-red-500/15" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </button>
  );
}

export function LayersPanel() {
  const stickers = useEditorStore((state) => state.config.stickers) || [];
  const updateField = useEditorStore((state) => state.updateField);
  const setStickers = (next: StickerPlacement[]) => updateField("stickers", next);

  // Front layer = end of array; display top-first.
  const display = stickers.map((s, i) => ({ s, i })).reverse();

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= stickers.length) return;
    triggerVibrate(15);
    const next = [...stickers];
    [next[i], next[j]] = [next[j], next[i]];
    setStickers(next);
  };
  const toggleLock = (i: number) => {
    triggerVibrate(15);
    const next = [...stickers];
    next[i] = { ...next[i], isLocked: !next[i].isLocked };
    setStickers(next);
  };
  const duplicate = (i: number) => {
    triggerVibrate(20);
    const s = stickers[i];
    setStickers([...stickers, { ...s, x: Math.min(95, (s.x ?? 50) + 4), y: Math.min(95, (s.y ?? 50) + 4), isLocked: false }]);
  };
  const remove = (i: number) => {
    triggerVibrate(25);
    setStickers(stickers.filter((_, k) => k !== i));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Everything on your canvas. The top of the list is the front layer.</p>
      {stickers.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground py-10 border border-dashed border-border rounded-xl px-4">
          No layers yet. Add text, shapes, stickers or photos to the canvas and they&apos;ll appear here.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {display.map(({ s, i }) => {
            const { label, icon } = describe(s);
            const Glyph = icon === "text" ? Type : icon === "image" ? ImageIcon : icon === "shape" ? Shapes : Smile;
            return (
              <li
                key={i}
                className={clsx(
                  "flex items-center gap-2 p-2 rounded-lg bg-card border border-border",
                  s.isLocked && "opacity-70"
                )}
              >
                <span className="w-6 h-6 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {icon === "image" && (s.stickerId.startsWith("http") || s.stickerId.startsWith("data:") || s.stickerId.startsWith("/")) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.stickerId} alt="" className="w-full h-full object-cover" />
                  ) : icon === "emoji" && s.stickerId.length <= 4 ? (
                    <span className="text-sm">{s.stickerId}</span>
                  ) : (
                    <Glyph className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </span>
                <span className="flex-1 min-w-0 text-xs font-medium text-foreground truncate">{label}</span>
                <div className="flex items-center gap-0.5">
                  <IconBtn onClick={() => move(i, 1)} disabled={i === stickers.length - 1} title="Bring forward">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </IconBtn>
                  <IconBtn onClick={() => move(i, -1)} disabled={i === 0} title="Send backward">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </IconBtn>
                  <IconBtn onClick={() => toggleLock(i)} title={s.isLocked ? "Unlock" : "Lock"}>
                    {s.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </IconBtn>
                  <IconBtn onClick={() => duplicate(i)} title="Duplicate">
                    <Copy className="w-3.5 h-3.5" />
                  </IconBtn>
                  <IconBtn onClick={() => remove(i)} danger title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconBtn>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default LayersPanel;
