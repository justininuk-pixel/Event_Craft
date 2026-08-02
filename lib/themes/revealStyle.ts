import type { CardConfig } from "./types";

/**
 * Creator-controlled styling for an experience's final "reveal" (the message shown when the
 * mini-app completes). Stored under `config.experience.reveal` so it persists via the schema's
 * passthrough — no migration needed. Any experience can opt in by spreading these styles onto its
 * payload title / body / container, so the ending is dynamic and changeable across the app.
 */
export interface RevealStyle {
  titleColor?: string;
  bodyColor?: string;
  bg?: string;        // solid colour or CSS gradient for the reveal card background
  scale?: number;     // 0.7–1.6 multiplier on text size
  align?: "left" | "center" | "right";
}

export function getRevealStyle(config: CardConfig): Required<Pick<RevealStyle, "scale" | "align">> & RevealStyle {
  const r = ((config.experience as any)?.reveal ?? {}) as RevealStyle;
  const scale = Number.isFinite(Number(r.scale)) && Number(r.scale)! > 0
    ? Math.max(0.7, Math.min(1.6, Number(r.scale)))
    : 1;
  return { align: r.align ?? "center", scale, titleColor: r.titleColor, bodyColor: r.bodyColor, bg: r.bg };
}

/** Inline styles for a reveal card built from the creator's reveal settings. */
export function revealCardStyles(config: CardConfig) {
  const s = getRevealStyle(config);
  return {
    container: (s.bg ? { background: s.bg } : {}) as React.CSSProperties,
    title: {
      ...(s.titleColor ? { color: s.titleColor } : {}),
      fontSize: `${s.scale * 2.25}rem`,
      textAlign: s.align,
    } as React.CSSProperties,
    body: {
      ...(s.bodyColor ? { color: s.bodyColor } : {}),
      fontSize: `${s.scale * 1.1}rem`,
      textAlign: s.align,
    } as React.CSSProperties,
  };
}
