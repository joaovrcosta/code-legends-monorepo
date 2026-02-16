import { Role } from "./common";
import type { Address } from "./common";

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

export interface UserPrivateDTO extends UserPublicDTO {
    email: string;
    onboardingCompleted: boolean;
    onboardingGoal: string | null;
    onboardingCareer: string | null;
    totalXp: number;
    level: number;
    xpToNextLevel: number;
}

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
