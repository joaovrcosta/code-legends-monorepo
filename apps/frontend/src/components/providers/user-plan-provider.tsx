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
  type CapabilitiesResponse,
} from "@/actions/user/get-capabilities";
import {
  hasCatalogPaidFromCapabilities,
  hasPathUnitFromCapabilities,
  hasCareerEnrollFromCapabilities,
  normalizeUserPlan,
  capabilitiesFromPlanSlug,
} from "@/lib/user-plan";
import {
  isPaidPlanSlug,
  toDisplayPlanSlug,
} from "@/lib/plan-display-utils";

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

type CapabilitiesState = {
  capabilities: CapabilitiesMap;
  activePlan: ActivePlanSummary;
  hasPaidPlan: boolean;
};

function mapCapabilitiesResponse(
  data: CapabilitiesResponse,
): CapabilitiesState {
  return {
    capabilities: data.capabilities,
    activePlan: data.activePlan,
    hasPaidPlan: data.hasPaidPlan,
  };
}

type UserPlanProviderProps = {
  children: ReactNode;
  initialPlan: UserPlan;
  initialCapabilities: CapabilitiesResponse | null;
  serverCapabilitiesFetched: boolean;
};

export function UserPlanProvider({
  children,
  initialPlan,
  initialCapabilities,
  serverCapabilitiesFetched,
}: UserPlanProviderProps) {
  const { data: session, status } = useSession();
  const sessionPlan = normalizeUserPlan(
    (session?.user as { plan?: string } | undefined)?.plan,
  );

  const [capabilitiesData, setCapabilitiesData] = useState<CapabilitiesState | null>(
    () =>
      initialCapabilities ? mapCapabilitiesResponse(initialCapabilities) : null,
  );
  const [capabilitiesFetchDone, setCapabilitiesFetchDone] = useState(
    () => serverCapabilitiesFetched,
  );

  const sessionPlanSlug = String(
    (session?.user as { plan?: string } | undefined)?.plan ?? "",
  ).toUpperCase();

  const refreshPlan = useCallback(
    async (options?: { background?: boolean }) => {
      if (!session?.user) {
        setCapabilitiesData(null);
        setCapabilitiesFetchDone(true);
        return;
      }

      const isBackground = options?.background ?? true;

      if (!isBackground) {
        setCapabilitiesFetchDone(false);
      }

      const data = await getCapabilitiesFromAPI();
      setCapabilitiesData(
        data
          ? mapCapabilitiesResponse(data)
          : {
              capabilities: capabilitiesFromPlanSlug(
                sessionPlanSlug || String(initialPlan),
              ),
              activePlan: null,
              hasPaidPlan: false,
            },
      );
      setCapabilitiesFetchDone(true);
    },
    [session?.user, sessionPlanSlug, initialPlan],
  );

  useEffect(() => {
    if (status === "loading") return;
    void refreshPlan({ background: serverCapabilitiesFetched });
  }, [status, refreshPlan, sessionPlan, serverCapabilitiesFetched]);

  const activePlan = capabilitiesData?.activePlan ?? null;
  const capabilitiesSeedSlug =
    activePlan?.slug ?? (sessionPlanSlug || String(initialPlan));
  const planSlug =
    toDisplayPlanSlug(activePlan?.slug) ||
    toDisplayPlanSlug(sessionPlanSlug) ||
    toDisplayPlanSlug(String(initialPlan));

  const capabilities =
    capabilitiesData?.capabilities ??
    capabilitiesFromPlanSlug(capabilitiesSeedSlug);
  const hasServerSnapshot = serverCapabilitiesFetched && capabilitiesFetchDone;
  const capabilitiesReady =
    hasServerSnapshot || !session?.user || capabilitiesFetchDone;

  const plan = normalizeUserPlan(planSlug || capabilitiesSeedSlug);

  const value = useMemo<UserPlanContextValue>(
    () => ({
      plan,
      planSlug,
      activePlan,
      capabilities,
      capabilitiesReady,
      isPremium:
        hasCareerEnrollFromCapabilities(capabilities) &&
        hasPathUnitFromCapabilities(capabilities),
      hasPaidPlan:
        capabilitiesData?.hasPaidPlan ??
        (isPaidPlanSlug(sessionPlanSlug) ||
          hasCatalogPaidFromCapabilities(capabilities)),
      isFree: !hasCatalogPaidFromCapabilities(capabilities),
      canAccessPathUnit: hasPathUnitFromCapabilities(capabilities),
      hasFeature: (feature: PlanFeature) => capabilities[feature] === true,
      refreshPlan: () => refreshPlan(),
    }),
    [
      plan,
      planSlug,
      activePlan,
      capabilities,
      capabilitiesReady,
      capabilitiesData?.hasPaidPlan,
      sessionPlanSlug,
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
