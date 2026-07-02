"use client";

import { useState } from "react";
import Link from "next/link";
import { enrollInCareer } from "@/actions/career";
import { Button } from "@/components/ui/button";
import { CareerEnrollPremiumGateDialog } from "@/components/career/career-enroll-premium-gate-dialog";
import { useUserPlan } from "@/hooks/use-user-plan";
import { UserPlan } from "@code-legends/shared-types";
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

function planToBlocked(plan: UserPlan): CareerEnrollBlockedPlan | null {
  if (plan === UserPlan.PREMIUM) return null;
  if (plan === UserPlan.PRO) return "PRO";
  return "FREE";
}

export function EnrollCareerButton({
  careerId,
  isEnrolled,
  notEnrolledLabel = "Inscrever-se",
  enrolledLabel = "Já inscrito",
  reactivatePremiumLabel = "Reativar Premium",
  loadingLabel = "Inscrevendo...",
  className,
}: {
  careerId: string;
  isEnrolled: boolean;
  notEnrolledLabel?: string;
  enrolledLabel?: string;
  reactivatePremiumLabel?: string;
  loadingLabel?: string;
  className?: string;
}) {
  const { plan, isPremium } = useUserPlan();
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

    if (!isPremium) {
      const blocked = planToBlocked(plan);
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

  const buttonClassName = ["rounded-full", className].filter(Boolean).join(" ");

  if (isEnrolled && !isPremium) {
    return (
      <Button asChild className={buttonClassName}>
        <Link href="/plans" className="flex w-full items-center justify-center">
          {reactivatePremiumLabel}
        </Link>
      </Button>
    );
  }

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
        className={buttonClassName}
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
