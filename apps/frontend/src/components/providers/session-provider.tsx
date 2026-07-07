"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { SessionProvider } from "next-auth/react";
import { UserPlan } from "@code-legends/shared-types";
import { Toaster } from "@/components/ui/toaster";
import { AccountToastHost } from "@/lib/show-account-toast";
import { UserPlanProvider } from "@/components/providers/user-plan-provider";

export type ProvidersSession = ComponentProps<
  typeof SessionProvider
>["session"];

const StreakCongratsModal = dynamic(
  () =>
    import("@/components/streak-congrats-modal").then(
      (m) => m.StreakCongratsModal,
    ),
  { ssr: false },
);

const WelcomePaidModal = dynamic(
  () =>
    import("@/components/welcome-paid-modal").then((m) => m.WelcomePaidModal),
  { ssr: false },
);

interface ProvidersProps {
  children: React.ReactNode;
  session: ProvidersSession;
  initialPlan: UserPlan;
}

export function Providers({ children, session, initialPlan }: ProvidersProps) {
  return (
    <SessionProvider session={session ?? undefined}>
      <UserPlanProvider initialPlan={initialPlan}>
        {children}
        <Toaster />
        <AccountToastHost />
        <StreakCongratsModal />
        <WelcomePaidModal />
      </UserPlanProvider>
    </SessionProvider>
  );
}
