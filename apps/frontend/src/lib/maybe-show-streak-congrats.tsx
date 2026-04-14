"use client";

import type { ContinueCourseResult } from "@/actions/course";
import { useStreakCongratsStore } from "@/stores/streak-congrats-store";
import { emitStreakUpdate } from "@/lib/emit-streak-update";

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
  if (streak) {
    emitStreakUpdate({
      current: streak.current,
      best: streak.best,
      totalActiveDays: streak.totalActiveDays,
    });
  }
  if (!streak?.increasedToday) return;

  const key = todayKeyInSaoPaulo();
  if (!key) return;

  const storageKey = `cl_streak_congrats_shown:${key}`;
  const disableGuard =
    process.env.NEXT_PUBLIC_DISABLE_STREAK_CONGRATS_GUARD === "1";
  if (!disableGuard) {
    try {
      const raw = sessionStorage.getItem(storageKey);
      const lastShownTotal = raw ? Number(raw) : null;
      const currentTotal = streak.totalActiveDays ?? 0;

      if (
        lastShownTotal != null &&
        Number.isFinite(lastShownTotal) &&
        lastShownTotal >= 0
      ) {
        if (currentTotal >= lastShownTotal) return;
      }

      sessionStorage.setItem(storageKey, String(currentTotal));
    } catch {
    }
  }
  useStreakCongratsStore.getState().open({
    current: streak.current,
    best: streak.best,
    totalActiveDays: streak.totalActiveDays,
  });
}

