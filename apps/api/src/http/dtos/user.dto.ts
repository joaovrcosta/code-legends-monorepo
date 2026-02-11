import { User, Address, Role } from "@prisma/client";

/**
 * DTO para dados públicos de usuário (visível para qualquer pessoa)
 */
export interface UserPublicDTO {
  id: string;
  name: string;
  avatar: string | null;
  slug: string | null;
  bio: string | null;
  expertise: string[];
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para dados privados de usuário (visível apenas para o próprio usuário ou admin)
 */
export interface UserPrivateDTO extends UserPublicDTO {
  email: string;
  onboardingCompleted: boolean;
  onboardingGoal: string | null;
  onboardingCareer: string | null;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
}

/**
 * DTO para dados completos de usuário (apenas para admin ou próprio usuário)
 * Inclui campos sensíveis como documentos e endereço
 */
export interface UserFullDTO extends UserPrivateDTO {
  birth_date: Date | null;
  born_in: string | null;
  document: string | null;
  foreign_phone: string | null;
  fullname: string | null;
  gender: string | null;
  marital_status: string;
  occupation: string | null;
  phone: string | null;
  rg: string | null;
  address: Address | null;
}

/**
 * Converte User do Prisma para DTO público
 */
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

/**
 * Converte User do Prisma para DTO privado
 */
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

/**
 * Converte User do Prisma para DTO completo (inclui campos sensíveis)
 * Use apenas quando o usuário solicitante for o próprio usuário ou admin
 */
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

