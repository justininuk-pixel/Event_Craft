"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Theme, ExperienceConfig, TimelineMilestone, MessageLayer, StoryPage, GestureType, QuizQuestion } from "@/lib/themes/types";
import { useEditorStore } from "@/lib/editor/store";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Slider } from "@/components/ui/Slider";

// ------------------------------ helpers ------------------------------

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

interface PartProps {
  exp: ExperienceConfig;
  patch: (partial: Partial<ExperienceConfig>) => void;
}

// ------------------------------ small UI bits ------------------------------

function IconBtn({
  onClick,
  disabled,
  danger,
  children,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-7 h-7 rounded-lg flex items-center justify-center border transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer",
        danger
          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
    >
      {children}
    </button>
  );
}

function ListRow({
  index,
  count,
  label,
  onUp,
  onDown,
  onDelete,
  children,
}: {
  index: number;
  count: number;
  label: string;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/20 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground/80 font-heading tracking-wide">{label}</span>
        <div className="flex items-center gap-1">
          <IconBtn title="Move up" onClick={onUp} disabled={index === 0}>
            <ArrowUp className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn title="Move down" onClick={onDown} disabled={index === count - 1}>
            <ArrowDown className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn title="Delete" onClick={onDelete} danger>
            <Trash2 className="w-3.5 h-3.5" />
          </IconBtn>
        </div>
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-sm font-bold text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
    >
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground leading-relaxed">{children}</p>;
}

// ------------------------------ per-experience editors ------------------------------

function MilestonesEditor({ exp, patch }: PartProps) {
  const milestones = exp.milestones ?? [];
  const set = (m: TimelineMilestone[]) => patch({ milestones: m });
  const update = (i: number, field: keyof TimelineMilestone, value: string) => {
    const next = [...milestones];
    next[i] = { ...next[i], [field]: value };
    set(next);
  };

  return (
    <div className="space-y-3">
      <Hint>Each moment becomes an unlockable step the recipient taps open, oldest first.</Hint>
      {milestones.map((m, i) => (
        <ListRow
          key={m.id}
          index={i}
          count={milestones.length}
          label={`Moment ${i + 1}`}
          onUp={() => set(move(milestones, i, -1))}
          onDown={() => set(move(milestones, i, 1))}
          onDelete={() => set(milestones.filter((_, idx) => idx !== i))}
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="When"
              value={m.date ?? ""}
              onChange={(e) => update(i, "date", e.target.value)}
              placeholder="e.g. Summer 2019"
              maxLength={40}
            />
            <Input
              label="Emoji"
              value={m.emoji ?? ""}
              onChange={(e) => update(i, "emoji", e.target.value)}
              placeholder="✨"
              maxLength={2}
            />
          </div>
          <Input
            label="Title"
            value={m.title}
            onChange={(e) => update(i, "title", e.target.value)}
            placeholder="What happened"
            maxLength={80}
          />
          <TextArea
            label="Message"
            value={m.body}
            onChange={(e) => update(i, "body", e.target.value)}
            placeholder="Tell the story of this moment..."
            rows={2}
            maxLength={300}
            showCharCounter
          />
        </ListRow>
      ))}
      <AddButton
        onClick={() => set([...milestones, { id: uid("m"), date: "", title: "", body: "", emoji: "✨" }])}
        label="Add moment"
      />
    </div>
  );
}

function LayersEditor({ exp, patch }: PartProps) {
  const layers = exp.layers ?? [];
  const set = (l: MessageLayer[]) => patch({ layers: l });
  const update = (i: number, field: keyof MessageLayer, value: string) => {
    const next = [...layers];
    next[i] = { ...next[i], [field]: value };
    set(next);
  };

  return (
    <div className="space-y-3">
      <Hint>Each layer is peeled in order, the message gets deeper as they go. End with the big one.</Hint>
      {layers.map((l, i) => (
        <ListRow
          key={l.id}
          index={i}
          count={layers.length}
          label={`Layer ${i + 1}`}
          onUp={() => set(move(layers, i, -1))}
          onDown={() => set(move(layers, i, 1))}
          onDelete={() => set(layers.filter((_, idx) => idx !== i))}
        >
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              label="Teaser (on the sealed layer)"
              value={l.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Tap to reveal…"
              maxLength={40}
            />
            <Input
              label="Emoji"
              value={l.emoji ?? ""}
              onChange={(e) => update(i, "emoji", e.target.value)}
              placeholder="💌"
              maxLength={2}
              className="!w-16"
            />
          </div>
          <TextArea
            label="Revealed message"
            value={l.body}
            onChange={(e) => update(i, "body", e.target.value)}
            placeholder="What this layer reveals..."
            rows={2}
            maxLength={300}
            showCharCounter
          />
        </ListRow>
      ))}
      <AddButton
        onClick={() => set([...layers, { id: uid("l"), label: "Tap to reveal…", body: "", emoji: "💛" }])}
        label="Add layer"
      />
    </div>
  );
}

function FutureEditor({ exp, patch }: PartProps) {
  return (
    <div className="space-y-3">
      <Input
        type="datetime-local"
        label="Unlock date & time"
        value={toLocalInput(exp.unlockDate)}
        onChange={(e) => patch({ unlockDate: fromLocalInput(e.target.value) })}
      />
      <TextArea
        label="Teaser (shown while sealed)"
        value={exp.teaser ?? ""}
        onChange={(e) => patch({ teaser: e.target.value })}
        placeholder="A message is waiting for you. It opens the moment the time is right."
        rows={2}
        maxLength={160}
        showCharCounter
      />
      <Hint>
        The message body (in <strong>Personalisation</strong>) is what unlocks when the countdown reaches
        zero. Leave the date empty to deliver instantly.
      </Hint>
    </div>
  );
}

function PuzzleEditor({ exp, patch }: PartProps) {
  return (
    <div className="space-y-3">
      <Input
        label="Secret word"
        value={exp.puzzleAnswer ?? ""}
        onChange={(e) => patch({ puzzleAnswer: e.target.value.toUpperCase().replace(/\s/g, "") })}
        placeholder="CELEBRATE"
        maxLength={14}
      />
      <Hint>Letters are scrambled into tiles to unlock. Best with 3–12 letters, no spaces.</Hint>
      <Input
        label="Prompt"
        value={exp.puzzlePrompt ?? ""}
        onChange={(e) => patch({ puzzlePrompt: e.target.value })}
        placeholder="Unscramble the word to unlock your message"
        maxLength={80}
      />
      <Input
        label="Hint (optional)"
        value={exp.puzzleHint ?? ""}
        onChange={(e) => patch({ puzzleHint: e.target.value })}
        placeholder="It's exactly what we're here to do 🎉"
        maxLength={80}
      />
    </div>
  );
}

const GESTURE_OPTIONS: { id: GestureType; emoji: string; label: string }[] = [
  { id: "flip-off", emoji: "🖕", label: "Salute" },
  { id: "high-five", emoji: "🙌", label: "High Five" },
  { id: "hug", emoji: "🤗", label: "Hug" },
  { id: "applause", emoji: "👏", label: "Applause" },
  { id: "fist-bump", emoji: "👊", label: "Fist Bump" },
  { id: "blow-kiss", emoji: "😘", label: "Blow Kiss" },
];

function GestureEditor({ exp, patch }: PartProps) {
  const current = exp.gesture ?? "high-five";
  return (
    <div className="space-y-3">
      <Hint>Pick the gesture the recipient triggers with a tap. The message itself lives in Personalisation.</Hint>
      <div className="grid grid-cols-3 gap-2">
        {GESTURE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => patch({ gesture: o.id })}
            className={clsx(
              "rounded-xl border p-2.5 flex flex-col items-center gap-1 cursor-pointer transition-colors",
              current === o.id
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/20 hover:border-primary/40"
            )}
          >
            <span className="text-2xl">{o.emoji}</span>
            <span className="text-[10px] font-bold text-muted-foreground">{o.label}</span>
          </button>
        ))}
      </div>
      <Input
        label="Tap prompt"
        value={exp.gesturePrompt ?? ""}
        onChange={(e) => patch({ gesturePrompt: e.target.value })}
        placeholder="Tap to react"
        maxLength={60}
      />
    </div>
  );
}

function StoryEditor({ exp, patch }: PartProps) {
  const pages = exp.pages ?? [];
  const set = (p: StoryPage[]) => patch({ pages: p });
  const update = (i: number, field: keyof StoryPage, value: string) => {
    const next = [...pages];
    next[i] = { ...next[i], [field]: value };
    set(next);
  };

  return (
    <div className="space-y-3">
      <Hint>Each page is turned one at a time, like a little book. End on the page that lands.</Hint>
      {pages.map((p, i) => (
        <ListRow
          key={p.id}
          index={i}
          count={pages.length}
          label={`Page ${i + 1}`}
          onUp={() => set(move(pages, i, -1))}
          onDown={() => set(move(pages, i, 1))}
          onDelete={() => set(pages.filter((_, idx) => idx !== i))}
        >
          <Input
            label="Page title (optional)"
            value={p.title ?? ""}
            onChange={(e) => update(i, "title", e.target.value)}
            placeholder="Chapter One"
            maxLength={80}
          />
          <TextArea
            label="Page text"
            value={p.body}
            onChange={(e) => update(i, "body", e.target.value)}
            placeholder="Write this page..."
            rows={3}
            maxLength={500}
            showCharCounter
          />
        </ListRow>
      ))}
      <AddButton onClick={() => set([...pages, { id: uid("pg"), title: "", body: "" }])} label="Add page" />
    </div>
  );
}

function ScratchEditor({ exp, patch }: PartProps) {
  return (
    <div className="space-y-3">
      <Hint>The message (in Personalisation) is hidden under foil, they scratch to reveal it.</Hint>
      <Input
        label="Scratch prompt"
        value={exp.scratchHint ?? ""}
        onChange={(e) => patch({ scratchHint: e.target.value })}
        placeholder="Scratch here to reveal!"
        maxLength={50}
      />
    </div>
  );
}

function GiftEditor({ exp, patch }: PartProps) {
  return (
    <div className="space-y-3">
      <Hint>How many taps to unwrap before the gift opens? The message is in Personalisation.</Hint>
      <Slider
        label={`Wrapping layers: ${exp.wrapLayers ?? 3}`}
        min={1}
        max={6}
        value={exp.wrapLayers ?? 3}
        onChange={(v) => patch({ wrapLayers: v })}
      />
    </div>
  );
}

function BalloonEditor({ exp, patch }: PartProps) {
  return (
    <div className="space-y-3">
      <Hint>How many balloons must be popped to reveal the message (in Personalisation)?</Hint>
      <Slider
        label={`Balloons: ${exp.balloonCount ?? 6}`}
        min={3}
        max={12}
        value={exp.balloonCount ?? 6}
        onChange={(v) => patch({ balloonCount: v })}
      />
    </div>
  );
}

function QuizEditor({ exp, patch }: PartProps) {
  const questions = exp.questions ?? [];
  const set = (q: QuizQuestion[]) => patch({ questions: q });
  const setQ = (i: number, value: string) => {
    const n = [...questions];
    n[i] = { ...n[i], q: value };
    set(n);
  };
  const setOpt = (qi: number, oi: number, value: string) => {
    const n = [...questions];
    const opts = [...n[qi].options];
    opts[oi] = value;
    n[qi] = { ...n[qi], options: opts };
    set(n);
  };
  const setAnswer = (qi: number, oi: number) => {
    const n = [...questions];
    n[qi] = { ...n[qi], answer: oi };
    set(n);
  };
  const addOpt = (qi: number) => {
    const n = [...questions];
    if (n[qi].options.length >= 4) return;
    n[qi] = { ...n[qi], options: [...n[qi].options, ""] };
    set(n);
  };
  const removeOpt = (qi: number, oi: number) => {
    const n = [...questions];
    if (n[qi].options.length <= 2) return;
    const opts = n[qi].options.filter((_, k) => k !== oi);
    const answer = n[qi].answer >= opts.length ? 0 : n[qi].answer;
    n[qi] = { ...n[qi], options: opts, answer };
    set(n);
  };

  return (
    <div className="space-y-3">
      <Hint>Add questions and tap the ✓ to mark the correct answer. The closing message is in Personalisation.</Hint>
      {questions.map((q, qi) => (
        <ListRow
          key={q.id}
          index={qi}
          count={questions.length}
          label={`Question ${qi + 1}`}
          onUp={() => set(move(questions, qi, -1))}
          onDown={() => set(move(questions, qi, 1))}
          onDelete={() => set(questions.filter((_, k) => k !== qi))}
        >
          <Input label="Question" value={q.q} onChange={(e) => setQ(qi, e.target.value)} maxLength={160} placeholder="Ask something…" />
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAnswer(qi, oi)}
                  title="Mark correct"
                  className={clsx(
                    "w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center text-xs cursor-pointer",
                    q.answer === oi ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "border-border text-muted-foreground"
                  )}
                >
                  ✓
                </button>
                <input
                  value={opt}
                  onChange={(e) => setOpt(qi, oi, e.target.value)}
                  maxLength={100}
                  placeholder={`Option ${oi + 1}`}
                  className="flex-1 h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeOpt(qi, oi)}
                  disabled={q.options.length <= 2}
                  className="w-7 h-7 shrink-0 rounded-lg border border-border text-muted-foreground hover:text-destructive disabled:opacity-30 cursor-pointer flex items-center justify-center"
                  title="Remove option"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {q.options.length < 4 && (
              <button
                type="button"
                onClick={() => addOpt(qi)}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                + Add option
              </button>
            )}
          </div>
        </ListRow>
      ))}
      <AddButton
        onClick={() =>
          set([...questions, { id: uid("q"), q: "", options: ["", ""], answer: 0 }])
        }
        label="Add question"
      />
    </div>
  );
}

function MatchEditor({ exp, patch }: PartProps) {
  return (
    <div className="space-y-3">
      <Hint>How many pairs must be matched to reveal the message (in Personalisation)?</Hint>
      <Slider
        label={`Pairs: ${exp.matchPairs ?? 4}`}
        min={3}
        max={8}
        value={exp.matchPairs ?? 4}
        onChange={(v) => patch({ matchPairs: v })}
      />
    </div>
  );
}

function WaitTimeEditor({ exp, patch }: PartProps) {
  const secs = exp.waitSeconds ?? 180;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return (
    <div className="space-y-3">
      <Hint>
        How long must the recipient wait patiently, without touching the screen or leaving, before
        the message unlocks? The editor preview always uses a short 10-second timer for testing.
      </Hint>
      <Slider
        label={`Wait time: ${mins}m ${rem.toString().padStart(2, "0")}s`}
        min={15}
        max={600}
        value={secs}
        onChange={(v) => patch({ waitSeconds: v })}
      />
    </div>
  );
}

function TargetScoreEditor({ exp, patch, label, min = 3, max = 30, fallback = 10 }: PartProps & { label: string; min?: number; max?: number; fallback?: number }) {
  const value = exp.targetScore ?? fallback;
  return (
    <div className="space-y-3">
      <Hint>{label}</Hint>
      <Slider
        label={`Target: ${value}`}
        min={min}
        max={max}
        value={value}
        onChange={(v) => patch({ targetScore: v })}
      />
    </div>
  );
}

function GrowEditor({ exp, patch }: PartProps) {
  const stages = (exp.growStages ?? []).join(" ");
  return (
    <div className="space-y-3">
      <Hint>The emoji stages it grows through (space-separated). The last one is the bloom.</Hint>
      <Input
        label="Grow stages"
        value={stages}
        onChange={(e) =>
          patch({ growStages: e.target.value.trim() ? e.target.value.trim().split(/\s+/).slice(0, 8) : [] })
        }
        placeholder="🌱 🌿 🌷 🌸 🌺"
      />
    </div>
  );
}

/**
 * Per-experience starter templates + a one-line description of what the theme reads from
 * config.experience. Keyed by experienceId. This is what tells the creator HOW to fill the JSON.
 */
const EXPERIENCE_TEMPLATES: Record<string, { desc: string; example: Record<string, unknown> }> = {
  "the-chat-log-replay": {
    desc: "A fake text-message conversation that replays. `messages` is the thread.",
    example: { messages: [{ from: "them", text: "Hey, are you free?" }, { from: "me", text: "Always for you ❤️" }], speedMultiplier: 8 },
  },
  "the-chaotic-group-chat-simulator": {
    desc: "A group chat that floods in. `messages` = who says what.",
    example: { messages: [{ sender: "Mum", text: "HAPPY BIRTHDAY!!!" }, { sender: "Dad", text: "🎉🎉" }] },
  },
  "the-artifact-museum-3d-carousel": {
    desc: "A museum of your memories. Each `items` entry is an exhibit.",
    example: { items: [{ title: "Our first trip", body: "Rome, 2019", emoji: "✈️" }] },
  },
  "the-breathing-sync-lung-visualizer": {
    desc: "A guided breathing exercise. `rhythm` = [inhale, hold, exhale, hold] in ms.",
    example: { rhythm: [4000, 7000, 8000, 1000] },
  },
  "the-audio-guestbook-rotary-dialer": {
    desc: "A rotary phone the recipient dials. `targetNumber` is the number to reach you.",
    example: { targetNumber: "5550199" },
  },
  "the-countdown-to-reunion": {
    desc: "A countdown between two dates. Use ISO date strings.",
    example: { startDate: "2024-01-01", targetDate: "2025-01-01" },
  },
  "the-digital-compass-gps-homing": {
    desc: "A compass that points to a place. Set the destination coordinates.",
    example: { targetLat: 40.7128, targetLng: -74.006, radiusMeters: 100 },
  },
};

/** Generic guidance for the many themes whose main knob is a list called `items`. */
const GENERIC_ITEMS_TEMPLATE = { items: [{ title: "First item", body: "Describe it here" }] };

/**
 * Universal fallback: edit the raw experience settings as JSON, WITH guidance. Shows the fields
 * the theme currently uses as chips and offers a starter template so the creator knows exactly
 * what to type. Every experience reads its knobs from config.experience.
 */
function AdvancedJsonEditor({ exp, patch, experienceId }: PartProps & { experienceId?: string }) {
  const template = experienceId ? EXPERIENCE_TEMPLATES[experienceId] : undefined;
  const hasContent = exp && Object.keys(exp).length > 0;
  const [draft, setDraft] = useState(() =>
    JSON.stringify(hasContent ? exp : template?.example ?? GENERIC_ITEMS_TEMPLATE, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const currentKeys = exp ? Object.keys(exp) : [];

  return (
    <details className="rounded-xl border border-border/70 bg-secondary/10 group mt-3">
      <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-muted-foreground flex items-center justify-between hover:text-foreground">
        <span>Advanced settings (JSON)</span>
        <span className="group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="px-3 pb-3 space-y-2">
        <Hint>
          {template?.desc ?? "Every option this experience supports lives here. Edit the values and press Apply, the preview updates instantly. Most themes use an `items` list."}
        </Hint>

        {currentKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In use:</span>
            {currentKeys.map((k) => (
              <span key={k} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{k}</span>
            ))}
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setApplied(false); }}
          rows={9}
          spellCheck={false}
          placeholder={JSON.stringify(template?.example ?? GENERIC_ITEMS_TEMPLATE, null, 2)}
          className="w-full font-mono text-[11px] leading-relaxed bg-card border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary resize-y placeholder:text-muted-foreground/50"
        />
        {error && <p className="text-[11px] font-bold text-destructive">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setDraft(JSON.stringify(template?.example ?? GENERIC_ITEMS_TEMPLATE, null, 2)); setApplied(false); }}
            className="shrink-0 px-2.5 py-2 rounded-lg bg-secondary text-muted-foreground text-[11px] font-bold hover:text-foreground transition-colors cursor-pointer"
            title="Load an example you can edit"
          >
            Insert example
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                const parsed = JSON.parse(draft);
                if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                  throw new Error("Must be a JSON object { ... }");
                }
                patch(parsed);
                setError(null);
                setApplied(true);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Invalid JSON");
                setApplied(false);
              }
            }}
            className="flex-1 py-2 rounded-lg bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25 transition-colors cursor-pointer"
          >
            {applied ? "Applied ✓" : "Apply settings"}
          </button>
        </div>
      </div>
    </details>
  );
}

/**
 * Universal "how the ending looks" panel, colour/size/background/alignment of the reveal message.
 * Stored on config.experience.reveal; experiences read it via lib/themes/revealStyle.ts.
 */
function RevealStyleEditor({ exp, patch }: PartProps) {
  const reveal = ((exp as any)?.reveal ?? {}) as {
    titleColor?: string; bodyColor?: string; bg?: string; scale?: number; align?: string;
  };
  const setReveal = (p: Record<string, unknown>) => patch({ reveal: { ...reveal, ...p } } as any);

  return (
    <details className="rounded-xl border border-border/70 bg-secondary/10 group mt-3" open>
      <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-bold text-muted-foreground flex items-center justify-between hover:text-foreground">
        <span>Ending / message style</span>
        <span className="group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="px-3 pb-3 space-y-3">
        <Hint>Style the final message the recipient sees when the experience finishes.</Hint>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            Title colour
            <input type="color" value={reveal.titleColor ?? "#111827"} onChange={(e) => setReveal({ titleColor: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-none bg-transparent p-0" />
          </label>
          <label className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            Body colour
            <input type="color" value={reveal.bodyColor ?? "#374151"} onChange={(e) => setReveal({ bodyColor: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-none bg-transparent p-0" />
          </label>
          <label className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
            Background
            <input type="color" value={reveal.bg && reveal.bg.startsWith("#") ? reveal.bg : "#ffffff"} onChange={(e) => setReveal({ bg: e.target.value })} className="w-8 h-7 rounded cursor-pointer border-none bg-transparent p-0" />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-bold text-muted-foreground">
            Alignment
            <select value={reveal.align ?? "center"} onChange={(e) => setReveal({ align: e.target.value })} className="bg-card border border-border rounded-md px-1.5 py-1 text-[11px] cursor-pointer">
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </label>
        </div>
        <Slider label={`Text size: ${Math.round((reveal.scale ?? 1) * 100)}%`} min={70} max={160} value={Math.round((reveal.scale ?? 1) * 100)} onChange={(v) => setReveal({ scale: v / 100 })} />
        {(reveal.titleColor || reveal.bodyColor || reveal.bg || reveal.scale || reveal.align) && (
          <button type="button" onClick={() => patch({ reveal: undefined } as any)} className="text-[11px] font-bold text-muted-foreground hover:text-destructive cursor-pointer">Reset to theme default</button>
        )}
      </div>
    </details>
  );
}

// ------------------------------ dispatcher ------------------------------

export const ExperienceEditor = React.memo(function ExperienceEditor({ theme }: { theme: Theme }) {
  const experience = useEditorStore((state) => state.config.experience);
  const updateField = useEditorStore((state) => state.updateField);
  const exp: ExperienceConfig = experience ?? theme.experienceDefaults ?? {};

  const patch = (partial: Partial<ExperienceConfig>) =>
    updateField("experience", { ...exp, ...partial });

  const specific = (() => {
  switch (theme.experienceId) {
    case "memory-timeline":
      return <MilestonesEditor exp={exp} patch={patch} />;
    case "unlock-layers":
      return <LayersEditor exp={exp} patch={patch} />;
    case "future-message":
      return <FutureEditor exp={exp} patch={patch} />;
    case "puzzle-reveal":
      return <PuzzleEditor exp={exp} patch={patch} />;
    case "reaction-gesture":
      return <GestureEditor exp={exp} patch={patch} />;
    case "story-mode":
      return <StoryEditor exp={exp} patch={patch} />;
    case "scratch-message":
      return <ScratchEditor exp={exp} patch={patch} />;
    case "gift-unwrap":
      return <GiftEditor exp={exp} patch={patch} />;
    case "balloon-pop":
      return <BalloonEditor exp={exp} patch={patch} />;
    case "quiz-reveal":
      return <QuizEditor exp={exp} patch={patch} />;
    case "memory-match":
      return <MatchEditor exp={exp} patch={patch} />;
    case "tap-to-grow":
      return <GrowEditor exp={exp} patch={patch} />;
    case "the-delayed-gratification-patience-test":
    case "the-delayed-gratification":
      return <WaitTimeEditor exp={exp} patch={patch} />;
    case "the-time-capsule-seal":
    case "the-multi-key-time-capsule":
      return <FutureEditor exp={exp} patch={patch} />;
    case "the-crt-channel-surfer":
      // Each "moment" becomes a TV channel the recipient surfs through.
      return <MilestonesEditor exp={exp} patch={patch} />;
    case "the-historic-rewind":
      return (
        <div className="space-y-3">
          <Input
            type="datetime-local"
            label="The special date to rewind to"
            value={toLocalInput(exp.unlockDate)}
            onChange={(e) => patch({ unlockDate: fromLocalInput(e.target.value) })}
          />
          <Hint>
            The card rewinds the years from today back to this date, their birthday, your
            anniversary, the day you met, then shows what the world was like back then plus
            your message.
          </Hint>
        </div>
      );
    case "the-snake-game":
      return (
        <TargetScoreEditor
          exp={exp}
          patch={patch}
          label="How many apples must the snake eat to win and reveal the message?"
          min={3}
          max={30}
          fallback={10}
        />
      );
    case "the-golf-putt":
      return (
        <div className="space-y-4">
          <TargetScoreEditor
            exp={exp}
            patch={patch}
            label="How many shots does the recipient get to sink the putt and reveal the message?"
            min={1}
            max={12}
            fallback={3}
          />
          <div className="space-y-2">
            <Hint>Pick the course layout (the obstacles the ball bounces off).</Hint>
            <div className="grid grid-cols-2 gap-2">
              {(["open", "classic", "tricky", "maze"] as const).map((c) => {
                const active = ((exp as any)?.course ?? "classic") === c && !(exp as any)?.obstacles;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => patch({ obstacles: undefined, course: c } as any)}
                    className={clsx(
                      "py-2 rounded-lg text-xs font-bold capitalize border transition-colors cursor-pointer",
                      active ? "bg-primary/20 border-primary text-primary" : "bg-secondary/20 border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <Hint>Or set custom obstacles in Advanced settings: <code>{'{ "obstacles": [{ "x": 100, "y": 300, "w": 100, "h": 20 }] }'}</code> (course space is 400×600).</Hint>
          </div>
        </div>
      );
    default:
      return (
        <Hint>
          Personalise the message in <strong>Personalisation</strong> and colours &amp; fonts in{" "}
          <strong>Style</strong>. This experience&apos;s own options are in Advanced settings below.
        </Hint>
      );
  }
  })();

  return (
    <>
      {specific}
      <RevealStyleEditor exp={exp} patch={patch} />
      <AdvancedJsonEditor exp={exp} patch={patch} experienceId={theme.experienceId} />
    </>
  );
});

export default ExperienceEditor;
