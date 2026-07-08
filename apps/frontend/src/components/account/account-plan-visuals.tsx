"use client";

import {
  PlanAvatarRing,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/plan-avatar-ring";
import { UserPlanSubscriberBadge } from "@/components/ui/subscriber-badge";

type AccountPlanVisualsProps = {
  avatarSrc?: string | null;
  avatarFallback: string;
  fallbackPlan?: string | null;
  avatarClassName?: string;
};

export function AccountPlanAvatar({
  avatarSrc,
  avatarFallback,
  fallbackPlan,
  avatarClassName = "h-32 w-32",
}: AccountPlanVisualsProps) {
  return (
    <PlanAvatarRing
      className={avatarClassName}
      fallbackPlan={fallbackPlan}
    >
      <AvatarImage src={avatarSrc || ""} />
      <AvatarFallback className="text-xl">{avatarFallback}</AvatarFallback>
    </PlanAvatarRing>
  );
}

export function AccountPlanBadge() {
  return <UserPlanSubscriberBadge />;
}
