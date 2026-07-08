"use client";

import { useSyncExternalStore } from "react";

/** false no SSR e no primeiro paint do cliente; true após hidratação. */
export function useIsClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
