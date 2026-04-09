"use client";

import type { ContinueCourseResult } from "@/actions/course";
import { useStreakCongratsStore } from "@/stores/streak-congrats-store";

const SAO_PAULO_TZ = "America/Sao_Paulo";

function todayKeyInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) return null;
  return `${y}-${m}-${d}`;
}

export function maybeShowStreakCongrats(result: ContinueCourseResult) {
  const streak = result?.streak;
  if (!streak?.increasedToday) return;

  const key = todayKeyInSaoPaulo();
  if (!key) return;

  const storageKey = `cl_streak_congrats_shown:${key}`;
  try {
    if (sessionStorage.getItem(storageKey) === "1") return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
  }
  useStreakCongratsStore.getState().open({
    current: streak.current,
    best: streak.best,
  });
}

