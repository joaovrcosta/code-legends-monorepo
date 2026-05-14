"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { enrollInCareer } from "@/actions/career";
import { Button } from "@/components/ui/button";
import { CareerEnrollPremiumGateDialog } from "@/components/career/career-enroll-premium-gate-dialog";
import {
  CAREER_ENROLL_PREMIUM_REQUIRED,
  type CareerEnrollBlockedPlan,
} from "@/lib/career-enroll-gate";

function isPremiumGateError(
  e: unknown,
): e is Error & { code: string; currentPlan: CareerEnrollBlockedPlan } {
  return (
    e instanceof Error &&
    (e as Error & { code?: string }).code === CAREER_ENROLL_PREMIUM_REQUIRED &&
    ((e as Error & { currentPlan?: string }).currentPlan === "FREE" ||
      (e as Error & { currentPlan?: string }).currentPlan === "PRO")
  );
}

function sessionPlanToBlocked(
  plan: string | undefined,
): CareerEnrollBlockedPlan | null {
  if (plan === "PREMIUM") return null;
  if (plan === "PRO") return "PRO";
  return "FREE";
}

export function EnrollCareerButton({
  careerId,
  isEnrolled,
  notEnrolledLabel = "Inscrever-se",
  enrolledLabel = "Já inscrito",
  loadingLabel = "Inscrevendo...",
  className,
}: {
  careerId: string;
  isEnrolled: boolean;
  notEnrolledLabel?: string;
  enrolledLabel?: string;
  loadingLabel?: string;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateVariant, setGateVariant] = useState<CareerEnrollBlockedPlan | null>(
    null,
  );

  const openGate = (variant: CareerEnrollBlockedPlan) => {
    setGateVariant(variant);
    setGateOpen(true);
  };

  const handleEnroll = async () => {
    if (isEnrolled || isLoading) return;

    const plan = (session?.user as { plan?: string } | undefined)?.plan;
    if (status === "authenticated" && plan !== "PREMIUM") {
      const blocked = sessionPlanToBlocked(plan);
      if (blocked) {
        openGate(blocked);
        return;
      }
    }

    try {
      setIsLoading(true);
      await enrollInCareer(careerId);
      window.location.reload();
    } catch (e) {
      if (isPremiumGateError(e)) {
        openGate(e.currentPlan);
        return;
      }
      const msg = e instanceof Error ? e.message : "Erro ao se inscrever";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CareerEnrollPremiumGateDialog
        open={gateOpen}
        onOpenChange={(open) => {
          setGateOpen(open);
          if (!open) setGateVariant(null);
        }}
        variant={gateVariant}
      />
      <Button
        onClick={handleEnroll}
        disabled={isEnrolled || isLoading}
        className={["rounded-full", className].filter(Boolean).join(" ")}
      >
        {isEnrolled
          ? enrolledLabel
          : isLoading
            ? loadingLabel
            : notEnrolledLabel}
      </Button>
    </>
  );
}
