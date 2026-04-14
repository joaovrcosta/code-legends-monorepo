"use client";

import { create } from "zustand";

export type WelcomePaidPayload = {
  paymentId?: string | null;
  planSlug: string | null;
  planName: string | null;
  planImageUrl: string | null;
  planColorHex?: string | null;
  subscriptionId: string | null;
  endsAt: string | null;
  welcomeSubtitle?: string | null;
};

type WelcomePaidStore = {
  isOpen: boolean;
  payload: WelcomePaidPayload | null;
  open: (payload: WelcomePaidPayload) => void;
  close: () => void;
};

export const useWelcomePaidStore = create<WelcomePaidStore>((set) => ({
  isOpen: false,
  payload: null,
  open: (payload) => set({ isOpen: true, payload }),
  close: () => set({ isOpen: false, payload: null }),
}));

