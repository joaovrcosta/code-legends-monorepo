"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarProps,
} from "@/components/ui/avatar";
import { useUserPlan } from "@/hooks/use-user-plan";
import {
  isPaidPlanSlug,
  planAvatarRingStyle,
  toDisplayPlanSlug,
} from "@/lib/plan-display-utils";

type PlanAvatarRingProps = Omit<AvatarProps, "ringVariant" | "ringStyle"> & {
  fallbackPlan?: string | null;
};

function PlanAvatarRingSkeleton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-fit flex-shrink-0 rounded-full bg-white/10 p-[2px] animate-pulse">
      <div className="rounded-full bg-surface-2 p-[6px]">
        <Avatar className={className}>{children}</Avatar>
      </div>
    </div>
  );
}

export function PlanAvatarRing({
  fallbackPlan,
  children,
  className,
  ...props
}: PlanAvatarRingProps) {
  const { activePlan, hasPaidPlan, planSlug, capabilitiesReady } =
    useUserPlan();

  const mayHavePaidPlan =
    hasPaidPlan || isPaidPlanSlug(fallbackPlan) || isPaidPlanSlug(planSlug);

  const resolvedSlug = toDisplayPlanSlug(
    activePlan?.slug ?? planSlug ?? fallbackPlan,
  );

  if (!capabilitiesReady && mayHavePaidPlan && !resolvedSlug) {
    return (
      <PlanAvatarRingSkeleton className={className}>
        {children}
      </PlanAvatarRingSkeleton>
    );
  }

  if (
    !hasPaidPlan &&
    !isPaidPlanSlug(fallbackPlan) &&
    !isPaidPlanSlug(planSlug)
  ) {
    return (
      <Avatar className={className} {...props}>
        {children}
      </Avatar>
    );
  }

  if (!resolvedSlug) {
    return (
      <Avatar className={className} {...props}>
        {children}
      </Avatar>
    );
  }

  return (
    <Avatar
      className={className}
      ringStyle={planAvatarRingStyle(activePlan?.colorHex, resolvedSlug)}
      {...props}
    >
      {children}
    </Avatar>
  );
}

export { AvatarFallback, AvatarImage };
