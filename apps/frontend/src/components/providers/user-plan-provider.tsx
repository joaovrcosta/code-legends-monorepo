"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { UserPlan } from "@code-legends/shared-types";
import {
  type CapabilitiesMap,
  type PlanFeature,
} from "@code-legends/plans";
import {
  getCapabilitiesFromAPI,
  type ActivePlanSummary,
} from "@/actions/user/get-capabilities";
import {
  hasCatalogPaidFromCapabilities,
  hasPathUnitFromCapabilities,
  hasCareerEnrollFromCapabilities,
  normalizeUserPlan,
  capabilitiesFromPlanSlug,
} from "@/lib/user-plan";

export type UserPlanContextValue = {
  plan: UserPlan;
  planSlug: string;
  activePlan: ActivePlanSummary;
  capabilities: CapabilitiesMap;
  /** true após /me/capabilities responder (ou usuário deslogado). */
  capabilitiesReady: boolean;
  isPremium: boolean;
  hasPaidPlan: boolean;
  isFree: boolean;
  canAccessPathUnit: boolean;
  hasFeature: (feature: PlanFeature) => boolean;
  refreshPlan: () => Promise<void>;
};

const UserPlanContext = createContext<UserPlanContextValue | null>(null);

type UserPlanProviderProps = {
  children: ReactNode;
  initialPlan: UserPlan;
};

export function UserPlanProvider({
  children,
  initialPlan,
}: UserPlanProviderProps) {
  const { data: session, status } = useSession();
  const sessionPlan = normalizeUserPlan(
    (session?.user as { plan?: string } | undefined)?.plan,
  );

  const [capabilitiesData, setCapabilitiesData] = useState<{
    capabilities: CapabilitiesMap;
    activePlan: ActivePlanSummary;
    hasPaidPlan: boolean;
  } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const refreshPlan = useCallback(async () => {
    if (!session?.user) {
      setCapabilitiesData(null);
      return;
    }

    const data = await getCapabilitiesFromAPI();
    if (data) {
      setCapabilitiesData({
        capabilities: data.capabilities,
        activePlan: data.activePlan,
        hasPaidPlan: data.hasPaidPlan,
      });
    }
  }, [session?.user]);

  useEffect(() => {
    if (!isHydrated || status === "loading") return;
    void refreshPlan();
  }, [isHydrated, status, refreshPlan, sessionPlan]);

  const activePlan = capabilitiesData?.activePlan ?? null;
  const planSlug =
    activePlan?.slug ??
    (!isHydrated
      ? initialPlan
      : status === "loading"
        ? initialPlan
        : sessionPlan);

  const capabilities =
    capabilitiesData?.capabilities ?? capabilitiesFromPlanSlug(planSlug);
  const capabilitiesReady = !session?.user || capabilitiesData !== null;

  const plan = normalizeUserPlan(planSlug);

  const value = useMemo<UserPlanContextValue>(
    () => ({
      plan,
      planSlug,
      activePlan,
      capabilities,
      capabilitiesReady,
      isPremium: hasCareerEnrollFromCapabilities(capabilities) &&
        hasPathUnitFromCapabilities(capabilities),
      hasPaidPlan:
        capabilitiesData?.hasPaidPlan ??
        hasCatalogPaidFromCapabilities(capabilities),
      isFree: !hasCatalogPaidFromCapabilities(capabilities),
      canAccessPathUnit: hasPathUnitFromCapabilities(capabilities),
      hasFeature: (feature: PlanFeature) => capabilities[feature] === true,
      refreshPlan,
    }),
    [
      plan,
      planSlug,
      activePlan,
      capabilities,
      capabilitiesReady,
      capabilitiesData?.hasPaidPlan,
      refreshPlan,
    ],
  );

  return (
    <UserPlanContext.Provider value={value}>{children}</UserPlanContext.Provider>
  );
}

export function useUserPlanContext(): UserPlanContextValue {
  const context = useContext(UserPlanContext);
  if (!context) {
    throw new Error("useUserPlan must be used within UserPlanProvider");
  }
  return context;
}
