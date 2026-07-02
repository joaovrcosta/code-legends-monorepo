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
import { getUserFromAPI } from "@/actions/user/get-user-from-api";
import {
  canAccessPathUnit,
  hasPaidPlan,
  isFreePlan,
  isPremium,
  normalizeUserPlan,
} from "@/lib/user-plan";

export type UserPlanContextValue = {
  plan: UserPlan;
  isPremium: boolean;
  hasPaidPlan: boolean;
  isFree: boolean;
  canAccessPathUnit: boolean;
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

  const [planFromApi, setPlanFromApi] = useState<UserPlan | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const refreshPlan = useCallback(async () => {
    if (!session?.user) {
      setPlanFromApi(null);
      return;
    }

    const user = await getUserFromAPI();
    if (user) {
      setPlanFromApi(normalizeUserPlan(user.plan));
    }
  }, [session?.user]);

  useEffect(() => {
    if (!isHydrated || status === "loading") return;
    void refreshPlan();
  }, [isHydrated, status, refreshPlan, sessionPlan]);

  const plan = !isHydrated
    ? initialPlan
    : (planFromApi ?? (status === "loading" ? initialPlan : sessionPlan));

  const value = useMemo<UserPlanContextValue>(
    () => ({
      plan,
      isPremium: isPremium(plan),
      hasPaidPlan: hasPaidPlan(plan),
      isFree: isFreePlan(plan),
      canAccessPathUnit: canAccessPathUnit(plan),
      refreshPlan,
    }),
    [plan, refreshPlan],
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
