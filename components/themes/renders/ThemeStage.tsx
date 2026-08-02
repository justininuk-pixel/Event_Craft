"use client";

import React from "react";
import { Theme, CardConfig, Contribution } from "@/lib/themes/types";
import { ThemeRenderer } from "./ThemeRenderer";
import { ExperienceHost, hasExperience } from "../experiences/ExperienceHost";

interface ThemeStageProps {
  theme: Theme;
  config: CardConfig;
  mode: "gallery-mini" | "editor-preview" | "full";
  contributions?: Contribution[];
  onInteractionComplete?: () => void;
}

/**
 * Single entry point for rendering a theme's surface. If the theme is an
 * "experience" (has a unique mini-app mechanic) it renders via ExperienceHost;
 * otherwise it falls back to the metadata-driven ThemeRenderer. This keeps every
 * call site (gallery, editor, viewer) agnostic to which kind of theme it is.
 */
export function ThemeStage(props: ThemeStageProps) {
  // Only route to the experience host when the id actually maps to a mini-app
  // (directly or via alias). Themes whose experienceId has no implementation
  // fall back to the styled ThemeRenderer instead of rendering a blank surface.
  if (props.theme.experienceId && hasExperience(props.theme.experienceId)) {
    return <ExperienceHost {...props} />;
  }
  return <ThemeRenderer {...props} />;
}

export default ThemeStage;
