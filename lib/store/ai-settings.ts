import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'mistral' | 'groq' | 'cohere' | 'perplexity' | 'openrouter' | 'ollama' | 'lmstudio';

export interface AISettingsState {
  userName: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  setUserName: (name: string) => void;
  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setBaseUrl: (url: string) => void;
  isConfigured: () => boolean;
}

export const useAISettings = create<AISettingsState>()(
  persist(
    (set, get) => ({
      userName: '',
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-1.5-flash',
      baseUrl: 'http://localhost:11434',
      
      setUserName: (name) => set({ userName: name }),
      setProvider: (provider) => set({ provider }),
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      
      isConfigured: () => {
        const state = get();
        if (state.provider === 'ollama' || state.provider === 'lmstudio') {
          return state.baseUrl.trim().length > 0;
        }
        return state.apiKey.trim().length > 0;
      }
    }),
    {
      name: 'event-craft-ai-settings', // unique name for localStorage key
      partialize: (state) => ({
        userName: state.userName,
        provider: state.provider,
        model: state.model,
        baseUrl: state.baseUrl,
      }),
    }
  )
);
