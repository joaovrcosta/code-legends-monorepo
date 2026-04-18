"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";

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

const PostPaymentWelcomeGate = dynamic(
  () =>
    import("@/components/providers/post-payment-welcome-gate").then(
      (m) => m.PostPaymentWelcomeGate,
    ),
  { ssr: false },
);

interface ProvidersProps {
  children: React.ReactNode;
  session: ProvidersSession;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session ?? undefined}>
      {children}
      <Toaster />
      <StreakCongratsModal />
      <WelcomePaidModal />
      <PostPaymentWelcomeGate />
    </SessionProvider>
  );
}
