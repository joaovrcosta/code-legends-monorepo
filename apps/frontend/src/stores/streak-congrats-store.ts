import { create } from "zustand";

type StreakCongratsPayload = {
  current: number;
  best: number;
  totalActiveDays: number;
};

type StreakCongratsStore = {
  isOpen: boolean;
  payload: StreakCongratsPayload | null;
  open: (payload: StreakCongratsPayload) => void;
  close: () => void;
};

export const useStreakCongratsStore = create<StreakCongratsStore>((set) => ({
  isOpen: false,
  payload: null,
  open: (payload) => set({ isOpen: true, payload }),
  close: () => set({ isOpen: false }),
}));

