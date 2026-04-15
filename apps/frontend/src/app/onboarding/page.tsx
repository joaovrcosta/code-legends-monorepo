import { getCurrentUser } from "@/actions/user/get-current-user";
import { OnboardingWelcomeClient } from "@/components/onboarding/onboarding-welcome-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboarding - Code Legends",
  description: "Configure seu perfil e comece sua jornada de aprendizado.",
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const greetingName = firstName || "Lenda";

  return (
    <div className="flex min-h-screen flex-col bg-[#0D0D12]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        <OnboardingWelcomeClient greetingName={greetingName} />
      </div>
    </div>
  );
}
