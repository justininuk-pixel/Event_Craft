import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { CardConfig } from "../themes/types";

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

        // Manage history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(state.config)));

        // Cap history at 50 steps
        if (newHistory.length > 50) {
          newHistory.shift();
        }

        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
    },

    commitHistory: () => {
      set((state) => {
        // Manage history explicitly
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(state.config)));

        if (newHistory.length > 50) {
          newHistory.shift();
        }

        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          state.config = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
        }
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          state.config = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
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
      if (typeof window !== "undefined") {
        localStorage.setItem(`draft-${themeId}`, JSON.stringify(config));
      }
    },

    restoreDraft: (themeId) => {
      if (typeof window === "undefined") return false;
      const draft = localStorage.getItem(`draft-${themeId}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          get().setConfig(parsed);
          return true;
        } catch (e) {
          console.error("Failed to parse draft", e);
          return false;
        }
      }
      return false;
    },

    setActiveTab: (tab) => {
      set((state) => {
        state.activeTab = tab;
      });
    },
  }))
);
