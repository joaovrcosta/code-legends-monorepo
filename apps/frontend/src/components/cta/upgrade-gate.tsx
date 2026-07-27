import type { ReactNode } from "react";
import { getUpgradeEligibility } from "@/lib/upgrade-eligibility";

/**
 * Server Component gate: renders children only when the user can still upgrade.
 * UserProfiler and account layout are RSCs — import this directly (no slot needed).
 */
export async function UpgradeGate({ children }: { children: ReactNode }) {
  const { canUpgrade } = await getUpgradeEligibility();
  if (!canUpgrade) return null;
  return children;
}
