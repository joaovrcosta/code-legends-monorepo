"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { StreakCongratsModal } from "@/components/streak-congrats-modal";
import { WelcomePaidModal } from "@/components/welcome-paid-modal";
import { PostPaymentWelcomeGate } from "@/components/providers/post-payment-welcome-gate";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
      <StreakCongratsModal />
      <WelcomePaidModal />
      <PostPaymentWelcomeGate />
    </SessionProvider>
  );
}
