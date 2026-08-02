"use client";

import React, { useEffect, useState } from "react";
import { Theme } from "../../../lib/themes/types";
import { getDefaultConfig } from "../../../lib/editor/defaults";
import { useEditorStore } from "../../../lib/editor/store";
import { EditorLayout } from "../../../components/editor/EditorLayout";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

interface EditorClientProps {
  theme: Theme;
  isCollabParam: boolean;
  isDraftParam?: boolean;
}

/**
 * Client half of the editor route. The theme itself is resolved on the server (so the 1.3MB
 * registry never ships to the client); everything draft/config-related stays here.
 */
export function EditorClient({ theme, isCollabParam, isDraftParam }: EditorClientProps) {
  const themeId = theme.id;
  const { setConfig, restoreDraft, saveDraft, config, updateField } = useEditorStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only restore draft if explicitly requested (e.g. from a drafts page)
    let restored = false;
    if (isDraftParam) {
      restored = restoreDraft(themeId);
    }
    
    if (!restored) {
      const defaultConfig = getDefaultConfig(theme);
      if (isCollabParam) {
        defaultConfig.isCollaborative = true;
      }
      setConfig(defaultConfig);
    } else if (isCollabParam) {
      // If we restored a draft but collab query param is explicitly true, force enable it
      updateField("isCollaborative", true);
    }

    setTimeout(() => {
      setInitialized(true);
    }, 0);
  }, [themeId, restoreDraft, setConfig, theme, isCollabParam, isDraftParam, updateField]);

  // Debounced auto-save draft to localStorage whenever config edits occur
  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      saveDraft(themeId);
    }, 1000);

    return () => clearTimeout(timer);
  }, [config, initialized, themeId, saveDraft]);

  if (!initialized) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-4 animate-in fade-in duration-500">
        <LoadingSpinner size="lg" />
        <span className="text-xs font-mono font-bold tracking-wider">Initializing editor workbench...</span>
      </div>
    );
  }

  return <EditorLayout theme={theme} />;
}
