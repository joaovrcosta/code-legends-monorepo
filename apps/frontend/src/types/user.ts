import type {
  UserPublicDTO,
  UserPrivateDTO,
  UserFullDTO,
} from "@code-legends/shared-types";

export type { UserPublicDTO, UserPrivateDTO, UserFullDTO } from "@code-legends/shared-types";

export type User = Omit<UserPrivateDTO, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt?: string | Date;
};

export interface UserMeResponse {
  user: User;
}

export type AuthenticatedUser = User;

export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserUpdateData {
  name?: string;
  avatar?: string;
  email?: string;
}
