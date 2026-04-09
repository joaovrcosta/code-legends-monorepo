"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { StreakCongratsModal } from "@/components/streak-congrats-modal";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
      <StreakCongratsModal />
    </SessionProvider>
  );
}
