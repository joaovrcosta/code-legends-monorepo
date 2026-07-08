import { User, Address } from "@prisma/client";
import type {
  UserPublicDTO,
  UserPrivateDTO,
  UserFullDTO,
} from "@code-legends/shared-types";

export type {
  UserPublicDTO,
  UserPrivateDTO,
  UserFullDTO,
} from "@code-legends/shared-types";

type PlanRecordSelect = {
  id: string;
  slug: string;
  name: string;
  colorHex: string | null;
  imageUrl: string | null;
};

type UserWithPlan = User & {
  planRecord?: PlanRecordSelect | null;
  subscriptions?: Array<{ planRecord: PlanRecordSelect | null }>;
};

function resolveEffectivePlanRecord(
  user: UserWithPlan,
): PlanRecordSelect | null {
  const fromSubscription = user.subscriptions?.[0]?.planRecord;
  if (fromSubscription) return fromSubscription;
  if (user.planRecord) return user.planRecord;
  return null;
}

export function resolveUserPlanSlug(user: UserWithPlan): string {
  return resolveEffectivePlanRecord(user)?.slug ?? "FREE";
}

export function toUserPublicDTO(user: UserWithPlan): UserPublicDTO {
  const effectivePlan = resolveEffectivePlanRecord(user);

  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    slug: user.slug,
    bio: user.bio,
    expertise: user.expertise,
    role: user.role,
    plan: effectivePlan?.slug ?? "FREE",
    planId: effectivePlan?.id ?? user.planId,
    planName: effectivePlan?.name ?? null,
    planColorHex: effectivePlan?.colorHex ?? null,
    planImageUrl: effectivePlan?.imageUrl ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toUserPrivateDTO(user: UserWithPlan): UserPrivateDTO {
  return {
    ...toUserPublicDTO(user),
    email: user.email,
    onboardingCompleted: user.onboardingCompleted,
    onboardingGoal: user.onboardingGoal,
    onboardingCareer: user.onboardingCareer,
    totalXp: user.totalXp,
    level: user.level,
    xpToNextLevel: user.xpToNextLevel,
  };
}

export function toUserFullDTO(
  user: UserWithPlan & { Address?: Address | null },
): UserFullDTO {
  return {
    ...toUserPrivateDTO(user),
    lastLogin: user.lastLogin,
    birth_date: user.birth_date,
    born_in: user.born_in,
    document: user.document,
    foreign_phone: user.foreign_phone,
    fullname: user.fullname,
    gender: user.gender,
    marital_status: user.marital_status,
    occupation: user.occupation,
    phone: user.phone,
    rg: user.rg,
    address: user.Address || null,
  };
}
