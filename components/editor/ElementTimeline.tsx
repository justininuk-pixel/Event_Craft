"use client";

import React, { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { Clock, GripVertical, Play, Pause, RotateCcw } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";

/** Scrub position (seconds) shared with the canvas preview; null = live/off. */
export const useTimelineScrub = create<{ t: number | null; setT: (t: number | null) => void }>((set) => ({
  t: null,
  setT: (t) => set({ t }),
}));

const MAX_T = 60; // seconds shown on the track

function labelFor(stickerId: string): string {
  if (stickerId.startsWith("text:")) return `"${stickerId.slice(5, 17)}"`;
  if (stickerId.startsWith("data:image") || stickerId.startsWith("http") || stickerId.startsWith("/")) return "Image";
  return stickerId.replace(/-/g, " ");
}

/**
 * A genuine per-element timeline: each element is a draggable bar (drag the middle to move its
 * start, drag the right edge to change when it disappears). The scrubber previews exactly what
 * the recipient sees at any second. Times are stored on the element (props.startAt / props.endAt)
 * and honoured by the viewer.
 */
export function ElementTimeline() {
  const stickers = useEditorStore((s) => s.config.stickers) || [];
  const scrubT = useTimelineScrub((s) => s.t);
  const setScrubT = useTimelineScrub((s) => s.setT);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ idx: number; mode: "move" | "resize"; startX: number; startAt: number; endAt: number } | null>(null);
  const [, forceTick] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Real-time playback: advance the scrubber so the creator can WATCH elements appear and
  // disappear on schedule, instead of only dragging the scrubber by hand.
  useEffect(() => {
    if (!playing) return;
    const startWall = Date.now();
    const startT = useTimelineScrub.getState().t ?? 0;
    const id = setInterval(() => {
      const t = startT + (Date.now() - startWall) / 1000;
      if (t >= MAX_T) {
        useTimelineScrub.getState().setT(MAX_T);
        setPlaying(false);
      } else {
        useTimelineScrub.getState().setT(Math.round(t * 10) / 10);
      }
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const patchTimes = (idx: number, startAt: number, endAt: number | undefined, commit: boolean) => {
    const store = useEditorStore.getState();
    const ns = [...(store.config.stickers || [])];
    if (!ns[idx]) return;
    ns[idx] = { ...ns[idx], props: { ...(ns[idx].props || {}), startAt, endAt } };
    store.updateField("stickers", ns, true);
    if (commit) store.commitHistory();
  };

  const secPerPx = () => MAX_T / Math.max(1, trackRef.current?.offsetWidth ?? 300);

  const onPointerMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dSec = (e.clientX - d.startX) * secPerPx();
    if (d.mode === "move") {
      const dur = d.endAt - d.startAt;
      const s = Math.max(0, Math.min(MAX_T - 1, d.startAt + dSec));
      patchTimes(d.idx, Math.round(s), d.endAt >= MAX_T ? undefined : Math.round(Math.min(MAX_T, s + dur)), false);
    } else {
      const en = Math.max(d.startAt + 1, Math.min(MAX_T, d.endAt + dSec));
      patchTimes(d.idx, d.startAt, en >= MAX_T ? undefined : Math.round(en), false);
    }
    forceTick((n) => n + 1);
  };
  const onPointerUp = () => {
    if (dragRef.current) useEditorStore.getState().commitHistory();
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };
  const beginDrag = (e: React.PointerEvent, idx: number, mode: "move" | "resize", startAt: number, endAt: number) => {
    e.preventDefault();
    dragRef.current = { idx, mode, startX: e.clientX, startAt, endAt };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (stickers.length === 0) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        Add elements or stickers first — each one appears here as a bar you can place in time.
      </p>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Drag a bar to set <strong>when it appears</strong>; drag its right edge to set{" "}
        <strong>when it disappears</strong>. Bars reaching the end stay forever. Use the scrubber
        to preview any moment.
      </p>

      {/* Scrubber + playback */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Preview at {scrubT ?? 0}s</span>
          {scrubT !== null && (
            <button onClick={() => { setPlaying(false); setScrubT(null); }} className="text-primary hover:underline cursor-pointer">Show all</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (!playing && (scrubT === null || scrubT >= MAX_T)) setScrubT(0); setPlaying((p) => !p); }}
            className="shrink-0 w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center hover:bg-primary/25 cursor-pointer"
            title={playing ? "Pause preview" : "Play the timeline"}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => { setPlaying(false); setScrubT(0); }}
            className="shrink-0 w-8 h-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center hover:text-foreground cursor-pointer"
            title="Restart at 0s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={0}
            max={MAX_T}
            value={scrubT ?? 0}
            onChange={(e) => { setPlaying(false); setScrubT(Number(e.target.value)); }}
            className="flex-1 accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Axis */}
      <div ref={trackRef} className="relative">
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground mb-1">
          {[0, 15, 30, 45, 60].map((s) => <span key={s}>{s}s</span>)}
        </div>

        <div className="space-y-2">
          {stickers.map((st, idx) => {
            const startAt = Number((st.props as any)?.startAt ?? 0);
            const rawEnd = (st.props as any)?.endAt ?? (st.props as any)?.showForSeconds;
            const endAt = rawEnd !== undefined && rawEnd !== null ? Number(rawEnd) : MAX_T;
            const leftPct = (Math.min(startAt, MAX_T) / MAX_T) * 100;
            const widthPct = (Math.max(1, Math.min(endAt, MAX_T) - startAt) / MAX_T) * 100;
            const activeAtScrub = scrubT === null || (scrubT >= startAt && (rawEnd == null || scrubT < endAt));

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-foreground truncate capitalize">{labelFor(st.stickerId)}</span>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                    {startAt}s → {rawEnd == null ? "∞" : `${endAt}s`}
                  </span>
                </div>
                <div className={`relative h-6 rounded-md bg-secondary/60 border border-border overflow-hidden ${activeAtScrub ? "" : "opacity-40"}`}>
                  {/* scrub cursor */}
                  {scrubT !== null && (
                    <div className="absolute top-0 bottom-0 w-px bg-primary z-20" style={{ left: `${(scrubT / MAX_T) * 100}%` }} />
                  )}
                  <div
                    onPointerDown={(e) => beginDrag(e, idx, "move", startAt, endAt)}
                    className="absolute top-0.5 bottom-0.5 rounded bg-primary/70 hover:bg-primary cursor-grab active:cursor-grabbing flex items-center touch-none"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title="Drag to move in time"
                  >
                    <GripVertical className="w-3 h-3 text-white/70 mx-auto pointer-events-none" />
                    <div
                      onPointerDown={(e) => { e.stopPropagation(); beginDrag(e, idx, "resize", startAt, endAt); }}
                      className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/30 hover:bg-white/60 cursor-ew-resize rounded-r touch-none"
                      title="Drag to set when it disappears"
                    />
                  </div>
                </div>
                {/* precise inputs */}
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                  <label className="flex items-center gap-1">from
                    <input
                      type="number" min={0} max={MAX_T} value={startAt}
                      onChange={(e) => patchTimes(idx, Math.max(0, Math.min(MAX_T - 1, Number(e.target.value) || 0)), rawEnd == null ? undefined : endAt, true)}
                      className="w-12 bg-card border border-border rounded px-1 py-0.5 text-foreground"
                    />s
                  </label>
                  <label className="flex items-center gap-1">until
                    <input
                      type="number" min={1} max={MAX_T} placeholder="∞"
                      value={rawEnd == null ? "" : endAt}
                      onChange={(e) => {
                        const v = e.target.value === "" ? undefined : Math.max(startAt + 1, Math.min(MAX_T, Number(e.target.value)));
                        patchTimes(idx, startAt, v, true);
                      }}
                      className="w-12 bg-card border border-border rounded px-1 py-0.5 text-foreground"
                    />s
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ElementTimeline;
