import { User, Role } from "@prisma/client";
import type {
  UserPublicDTO,
  UserPrivateDTO,
  UserFullDTO,
  CourseDTO,
  CertificatePublicDTO,
  CertificatePrivateDTO,
} from "@code-legends/shared-types";
import {
  toUserPublicDTO,
  toUserPrivateDTO,
  toUserFullDTO,
} from "../dtos/user.dto";
import { toCourseDTO } from "../dtos/course.dto";
import {
  toCertificatePublicDTO,
  toCertificatePrivateDTO,
} from "../dtos/certificate.dto";

export interface SanitizeContext {
  requestingUserId?: string;
  requestingUserRole?: Role;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export function sanitizeUser(
  user: User & { Address?: any },
  context: SanitizeContext
): UserPublicDTO | UserPrivateDTO | UserFullDTO {
  const isOwner = context.isOwner ?? (context.requestingUserId === user.id);
  const isAdmin = context.isAdmin ?? (context.requestingUserRole === Role.ADMIN);

  if (isAdmin || isOwner) {
    return toUserFullDTO(user);
  }

  if (context.requestingUserId) {
    return toUserPrivateDTO(user);
  }

  return toUserPublicDTO(user);
}

export function sanitizeUsers(
  users: (User & { Address?: any })[],
  context: SanitizeContext
): (UserPublicDTO | UserPrivateDTO | UserFullDTO)[] {
  return users.map((user) => sanitizeUser(user, context));
}

export function sanitizeCourse(course: any, totalDuration?: string | null): CourseDTO {
  return toCourseDTO(course, totalDuration);
}

export function sanitizeCourses(courses: any[]): CourseDTO[] {
  return courses.map((course) => sanitizeCourse(course));
}

export function sanitizeCertificate(
  certificate: any,
  context: SanitizeContext
): CertificatePublicDTO | CertificatePrivateDTO {
  const isOwner = context.isOwner ?? (context.requestingUserId === certificate.userId);
  const isAdmin = context.isAdmin ?? (context.requestingUserRole === Role.ADMIN);

  if (!context.requestingUserId) {
    return toCertificatePublicDTO(certificate);
  }

  if (isOwner || isAdmin) {
    return toCertificatePrivateDTO(certificate);
  }

  return toCertificatePublicDTO(certificate);
}

export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[]
): Omit<T, keyof T> {
  const sanitized = { ...obj };
  sensitiveFields.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
}

export const SENSITIVE_USER_FIELDS = [
  "password",
  "document",
  "rg",
  "phone",
  "foreign_phone",
  "birth_date",
  "born_in",
  "fullname",
  "gender",
  "marital_status",
  "occupation",
  "Address",
] as const;


