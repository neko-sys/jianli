import { create } from 'zustand';
import type { OllamaConfig } from '../core/ai/ollamaClient';
import { defaultOllamaConfig } from '../core/ai/ollamaClient';

interface SettingsState {
  ollama: OllamaConfig;
  setOllama: (next: OllamaConfig) => void;
}

const LS_KEY = 'resume-builder-settings';

const load = (): OllamaConfig => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    return defaultOllamaConfig;
  }
  try {
    const parsed = JSON.parse(raw) as OllamaConfig;
    return { ...defaultOllamaConfig, ...parsed };
  } catch {
    return defaultOllamaConfig;
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ollama: load(),
  setOllama: (next) => {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    set({ ollama: next });
  },
}));
