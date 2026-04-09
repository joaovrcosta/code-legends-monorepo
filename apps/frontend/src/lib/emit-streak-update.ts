"use client";

export type StreakUpdateDetail = {
  current: number;
  best: number;
  totalActiveDays: number;
};

export function emitStreakUpdate(detail: StreakUpdateDetail) {
  try {
    window.dispatchEvent(new CustomEvent<StreakUpdateDetail>("cl-streak-updated", { detail }));
  } catch {
    // no-op
  }
}

