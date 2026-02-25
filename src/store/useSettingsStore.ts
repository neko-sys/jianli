import { create } from 'zustand';
import type { OllamaConfig } from '../core/ai/ollamaClient';
import { defaultOllamaConfig } from '../core/ai/ollamaClient';

interface PersistedSettings {
  ollama: OllamaConfig;
  debugMode: boolean;
}

interface SettingsState {
  ollama: OllamaConfig;
  debugMode: boolean;
  setOllama: (next: OllamaConfig) => void;
  setDebugMode: (next: boolean) => void;
}

const LS_KEY = 'resume-builder-settings';

const load = (): PersistedSettings => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    return {
      ollama: defaultOllamaConfig,
      debugMode: false,
    };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {
        ollama: defaultOllamaConfig,
        debugMode: false,
      };
    }

    const parsedObj = parsed as Partial<PersistedSettings> | OllamaConfig;
    const hasLegacyShape = !('ollama' in (parsedObj as Record<string, unknown>));
    if (hasLegacyShape) {
      return {
        ollama: { ...defaultOllamaConfig, ...(parsedObj as OllamaConfig) },
        debugMode: false,
      };
    }

    const typed = parsedObj as Partial<PersistedSettings>;
    return {
      ollama: { ...defaultOllamaConfig, ...(typed.ollama ?? {}) },
      debugMode: Boolean(typed.debugMode),
    };
  } catch {
    return {
      ollama: defaultOllamaConfig,
      debugMode: false,
    };
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...load(),
  setOllama: (next) => {
    const snapshot = { ...get(), ollama: next };
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        ollama: snapshot.ollama,
        debugMode: snapshot.debugMode,
      }),
    );
    set({ ollama: next });
  },
  setDebugMode: (next) => {
    const snapshot = { ...get(), debugMode: next };
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        ollama: snapshot.ollama,
        debugMode: snapshot.debugMode,
      }),
    );
    set({ debugMode: next });
  },
}));
