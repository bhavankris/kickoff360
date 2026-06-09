import { create } from 'zustand';
import { todayISO } from '@repo/core';

/**
 * UI state ONLY (per the architecture rule). Server/data state lives in TanStack
 * Query, never here. This holds things like the currently-viewed schedule date.
 */
interface UiState {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (d: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedDate: todayISO(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
}));
