import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeIntensity, ThemeMode } from '@repo/core';

/**
 * Appearance preferences — UI state ONLY (server state stays in TanStack Query).
 * `previewTeam` lets onboarding re-theme live while the user taps nations,
 * before a profile exists in Firestore.
 */
interface PrefsState {
  mode: ThemeMode;
  intensity: ThemeIntensity;
  previewTeam: string | null;
  setMode: (m: ThemeMode) => void;
  setIntensity: (i: ThemeIntensity) => void;
  setPreviewTeam: (code: string | null) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      mode: 'dark',
      intensity: 'full',
      previewTeam: null,
      setMode: (mode) => set({ mode }),
      setIntensity: (intensity) => set({ intensity }),
      setPreviewTeam: (previewTeam) => set({ previewTeam }),
    }),
    {
      name: 'ko-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ mode, intensity }) => ({ mode, intensity }),
    },
  ),
);
