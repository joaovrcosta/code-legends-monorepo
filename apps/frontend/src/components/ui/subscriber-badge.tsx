"use client";

import * as React from "react";
import { Lightning } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPlan } from "@/hooks/use-user-plan";
import {
  shouldShowCareerPremiumUpsellBadge,
  shouldShowCareerTrackPremiumBadge,
  shouldShowExclusiveCatalogBadge,
} from "@/lib/user-plan";
import {
  formatPlanBadgeLabel,
  isUnpaidPlanSlug,
  planBadgeBackgroundStyle,
  toDisplayPlanSlug,
} from "@/lib/plan-display-utils";

export const SUBSCRIBER_BADGE_LABEL = "Exclusivo" as const;
export const PREMIUM_BADGE_LABEL = "Premium" as const;
export const PRO_BADGE_LABEL = "PRO" as const;

export const subscriberBadgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold uppercase tracking-wide text-white",
  {
    variants: {
      variant: {
        exclusive: "bg-subscriber-gradient",
        premium: "bg-premium-gradient",
        pro: "bg-pro-plan-gradient",
      },
      size: {
        sm: "px-2.5 py-1 text-[10px]",
        md: "px-2.5 py-1 text-[10px]",
      },
    },
    defaultVariants: {
      variant: "exclusive",
      size: "md",
    },
  },
);

export type SubscriberBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof subscriberBadgeVariants> & {
    label?: string;
  };

const DEFAULT_LABEL_BY_VARIANT = {
  exclusive: SUBSCRIBER_BADGE_LABEL,
  premium: PREMIUM_BADGE_LABEL,
  pro: PRO_BADGE_LABEL,
} as const;

const BADGE_SIZE_CLASS = {
  sm: "px-2.5 py-1 text-[10px]",
  md: "px-2.5 py-1 text-[10px]",
} as const;

const BADGE_SKELETON_SIZE_CLASS = {
  sm: "h-5 w-14",
  md: "h-5 w-16",
} as const;

export function PlanBadgeSkeleton({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <Skeleton
      className={cn(
        "rounded-full",
        BADGE_SKELETON_SIZE_CLASS[size],
        className,
      )}
      aria-hidden
    />
  );
}

export type DynamicPlanBadgeProps = {
  label: string;
  colorHex?: string | null;
  slug?: string | null;
  imageUrl?: string | null;
  className?: string;
  size?: "sm" | "md";
};

export function DynamicPlanBadge({
  label,
  colorHex,
  slug,
  imageUrl,
  className,
  size = "md",
}: DynamicPlanBadgeProps) {
  const iconSrc = imageUrl?.trim();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold uppercase tracking-wide text-white",
        BADGE_SIZE_CLASS[size],
        className,
      )}
      style={{ background: planBadgeBackgroundStyle(colorHex, slug) }}
    >
      {iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconSrc}
          alt=""
          width={12}
          height={12}
          className="h-3 w-3 shrink-0 rounded-full object-cover"
          aria-hidden
        />
      ) : (
        <Lightning
          size={12}
          weight="fill"
          className="shrink-0 text-white"
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

/** Badge de plano do usuário — visível para qualquer plano pago ativo. */
export function UserPlanSubscriberBadge({
  className,
  size,
}: {
  className?: string;
  size?: VariantProps<typeof subscriberBadgeVariants>["size"];
}) {
  const { activePlan, hasPaidPlan, planSlug, capabilitiesReady } =
    useUserPlan();

  const hasPlanVisuals =
    hasPaidPlan &&
    !isUnpaidPlanSlug(planSlug) &&
    Boolean(formatPlanBadgeLabel(activePlan?.name, planSlug));

  if (!capabilitiesReady && hasPaidPlan && !hasPlanVisuals) {
    return <PlanBadgeSkeleton size={size ?? "md"} className={className} />;
  }

  if (!hasPaidPlan || isUnpaidPlanSlug(planSlug)) {
    return null;
  }

  const label = formatPlanBadgeLabel(activePlan?.name, planSlug);
  if (!label) return null;

  const colorHex = activePlan?.colorHex ?? null;
  const imageUrl = activePlan?.imageUrl ?? null;
  const displaySlug = toDisplayPlanSlug(activePlan?.slug ?? planSlug);

  return (
    <DynamicPlanBadge
      label={label}
      colorHex={colorHex}
      slug={displaySlug}
      imageUrl={imageUrl}
      size={size ?? "md"}
      className={className}
    />
  );
}

/** Badge Premium em cards de trilha de carreira (FREE e PRO). */
export function CareerTrackPremiumBadge({
  className,
  size,
  variant = "premium",
}: {
  className?: string;
  size?: VariantProps<typeof subscriberBadgeVariants>["size"];
  variant?: "exclusive" | "premium";
}) {
  const { plan } = useUserPlan();
  if (!shouldShowCareerTrackPremiumBadge(plan)) return null;

  return (
    <SubscriberBadge variant={variant} size={size} className={className} />
  );
}

/** Badge Premium para upsell em banner de carreira e Path Units (FREE e PRO). */
export function FreeUserPremiumUpsellBadge({
  className,
  size,
}: {
  className?: string;
  size?: VariantProps<typeof subscriberBadgeVariants>["size"];
}) {
  const { plan } = useUserPlan();
  if (!shouldShowCareerPremiumUpsellBadge(plan)) return null;

  return (
    <SubscriberBadge variant="premium" size={size} className={className} />
  );
}

/** Badge Exclusivo em conteúdo pago do catálogo (apenas FREE). */
export function ExclusiveCatalogBadge({
  className,
  size,
}: {
  className?: string;
  size?: VariantProps<typeof subscriberBadgeVariants>["size"];
}) {
  const { plan } = useUserPlan();
  if (!shouldShowExclusiveCatalogBadge(plan)) return null;

  return (
    <SubscriberBadge variant="exclusive" size={size} className={className} />
  );
}

export function SubscriberBadge({
  className,
  size,
  variant = "exclusive",
  label,
  ...props
}: SubscriberBadgeProps) {
  const resolvedLabel =
    label ?? DEFAULT_LABEL_BY_VARIANT[variant ?? "exclusive"];

  return (
    <span
      className={cn(subscriberBadgeVariants({ size, variant }), className)}
      {...props}
    >
      <Lightning
        size={12}
        weight="fill"
        className="shrink-0 text-white"
        aria-hidden
      />
      {resolvedLabel}
    </span>
  );
}
