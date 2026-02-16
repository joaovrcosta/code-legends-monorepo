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

export function toUserPublicDTO(user: User): UserPublicDTO {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    slug: user.slug,
    bio: user.bio,
    expertise: user.expertise,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toUserPrivateDTO(user: User): UserPrivateDTO {
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

export function toUserFullDTO(user: User & { Address?: Address | null }): UserFullDTO {
  return {
    ...toUserPrivateDTO(user),
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

