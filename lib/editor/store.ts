import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CardConfig } from "../themes/types";

const HISTORY_LIMIT = 50;

/**
 * Structured deep clone, used for history snapshots.
 *
 * `JSON.parse(JSON.stringify(...))` was ~3x slower and silently mangled the config: `undefined`
 * values were dropped and Dates/Maps degraded to strings/`{}`. structuredClone preserves them.
 */
function cloneConfig(config: CardConfig): CardConfig {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(config);
    } catch {
      // Non-cloneable value (e.g. a function slipped into config), fall through.
    }
  }
  return JSON.parse(JSON.stringify(config)) as CardConfig;
}

/** Truncates any redo branch, appends the current config, and caps the stack. */
function pushHistory(state: { config: CardConfig; history: CardConfig[]; historyIndex: number }) {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(cloneConfig(state.config));

  // Trim from the front until we're inside the cap. The previous single `shift()` only ever
  // dropped one entry, which is correct here but breaks if the cap is ever lowered.
  while (newHistory.length > HISTORY_LIMIT) {
    newHistory.shift();
  }

  state.history = newHistory;
  state.historyIndex = newHistory.length - 1;
}

interface EditorState {
  config: CardConfig;
  history: CardConfig[];
  historyIndex: number;
  isDirty: boolean;
  activeTab: string;
}

interface EditorActions {
  setConfig: (config: CardConfig) => void;
  updateField: <K extends keyof CardConfig>(key: K, value: CardConfig[K], skipHistory?: boolean) => void;
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  resetToDefaults: (defaultConfig: CardConfig) => void;
  saveDraft: (themeId: string) => void;
  restoreDraft: (themeId: string) => boolean;
  setActiveTab: (tab: string) => void;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => ({
    config: {
      title: "",
      subtitle: "",
      body: "",
      recipient: "",
      sender: "",
      palette: {
        primary: "#000000",
        secondary: "#000000",
        accent: "#000000",
        background: "#000000",
        text: "#000000",
        textSecondary: "#000000",
      },
      fontHeading: "",
      fontBody: "",
      animationSpeed: "normal",
      animationsEnabled: true,
      stickers: [],
      deliveryStyle: "envelope",
      audioPreset: "none",
      audioVolume: 0.5,
      audioAutoplay: true,
      isCollaborative: false,
      maxContributors: 20,
      collabPassword: "",
      scheduledAt: "",
      password: "",
      hasRsvp: false,
    },
    history: [],
    historyIndex: -1,
    isDirty: false,
    activeTab: "content",

    setConfig: (config) => {
      set((state) => {
        state.config = config;
        state.history = [config];
        state.historyIndex = 0;
        state.isDirty = false;
      });
    },

    updateField: (key, value, skipHistory = false) => {
      set((state) => {
        // Update the specific key
        state.config[key] = value;
        state.isDirty = true;

        if (skipHistory) return;

        pushHistory(state);
      });
    },

    commitHistory: () => {
      set((state) => {
        pushHistory(state);
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          state.config = cloneConfig(state.history[state.historyIndex]);
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          state.config = cloneConfig(state.history[state.historyIndex]);
        }
      });
    },

    resetToDefaults: (defaultConfig) => {
      set((state) => {
        state.config = defaultConfig;
        state.history = [defaultConfig];
        state.historyIndex = 0;
        state.isDirty = false;
      });
    },

    saveDraft: (themeId) => {
      const { config } = get();
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(`draft-${themeId}`, JSON.stringify(config));
      } catch (e) {
        // QuotaExceededError (large base64 media in the config) used to throw straight out of
        // the autosave path and surface as an unhandled error in the editor.
        console.warn("Could not save draft, storage unavailable or full", e);
      }
    },

    restoreDraft: (themeId) => {
      if (typeof window === "undefined") return false;
      try {
        const draft = localStorage.getItem(`draft-${themeId}`);
        if (!draft) return false;

        const parsed = JSON.parse(draft);
        // Guard against a corrupted or hand-edited draft: setConfig() would otherwise install
        // a non-object as the editor config and every consumer of config.palette would throw.
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !parsed.palette) {
          console.warn("Ignoring malformed draft for", themeId);
          return false;
        }

        get().setConfig(parsed as CardConfig);
        return true;
      } catch (e) {
        console.error("Failed to restore draft", e);
        return false;
      }
    },

    setActiveTab: (tab) => {
      set((state) => {
        state.activeTab = tab;
      });
    },
  }))
);
