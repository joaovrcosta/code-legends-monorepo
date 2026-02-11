import { User, Role } from "@prisma/client";
import {
  UserPublicDTO,
  UserPrivateDTO,
  UserFullDTO,
  toUserPublicDTO,
  toUserPrivateDTO,
  toUserFullDTO,
} from "../dtos/user.dto";
import { CourseDTO, toCourseDTO } from "../dtos/course.dto";
import { CertificatePublicDTO, CertificatePrivateDTO, toCertificatePublicDTO, toCertificatePrivateDTO } from "../dtos/certificate.dto";

/**
 * Determina qual nível de DTO usar baseado no contexto da requisição
 */
export interface SanitizeContext {
  requestingUserId?: string;
  requestingUserRole?: Role;
  isOwner?: boolean;
  isAdmin?: boolean;
}

/**
 * Sanitiza dados de usuário baseado no contexto
 * - Público: qualquer pessoa pode ver
 * - Privado: apenas o próprio usuário ou admin
 * - Completo: apenas admin ou próprio usuário (inclui documentos)
 */
export function sanitizeUser(
  user: User & { Address?: any },
  context: SanitizeContext
): UserPublicDTO | UserPrivateDTO | UserFullDTO {
  const isOwner = context.isOwner ?? (context.requestingUserId === user.id);
  const isAdmin = context.isAdmin ?? (context.requestingUserRole === Role.ADMIN);

  // Admin ou próprio usuário: dados completos (inclui documentos sensíveis)
  if (isAdmin || isOwner) {
    return toUserFullDTO(user);
  }

  // Outros usuários autenticados: dados privados (sem documentos)
  if (context.requestingUserId) {
    return toUserPrivateDTO(user);
  }

  // Público: apenas dados básicos
  return toUserPublicDTO(user);
}

/**
 * Sanitiza lista de usuários
 */
export function sanitizeUsers(
  users: (User & { Address?: any })[],
  context: SanitizeContext
): (UserPublicDTO | UserPrivateDTO | UserFullDTO)[] {
  return users.map((user) => sanitizeUser(user, context));
}

/**
 * Sanitiza dados de curso
 */
export function sanitizeCourse(course: any): CourseDTO {
  return toCourseDTO(course);
}

/**
 * Sanitiza lista de cursos
 */
export function sanitizeCourses(courses: any[]): CourseDTO[] {
  return courses.map((course) => sanitizeCourse(course));
}

/**
 * Sanitiza certificado baseado no contexto
 * - Público: para verificação pública (sem dados sensíveis do usuário)
 * - Privado: apenas para o dono ou admin
 */
export function sanitizeCertificate(
  certificate: any,
  context: SanitizeContext
): CertificatePublicDTO | CertificatePrivateDTO {
  const isOwner = context.isOwner ?? (context.requestingUserId === certificate.userId);
  const isAdmin = context.isAdmin ?? (context.requestingUserRole === Role.ADMIN);

  // Se for verificação pública (sem userId no context), retorna DTO público
  if (!context.requestingUserId) {
    return toCertificatePublicDTO(certificate);
  }

  // Se for o dono ou admin, retorna DTO privado completo
  if (isOwner || isAdmin) {
    return toCertificatePrivateDTO(certificate);
  }

  // Por padrão, retorna público (mas isso não deveria acontecer se houver verificação de ownership)
  return toCertificatePublicDTO(certificate);
}

/**
 * Remove campos sensíveis de um objeto genérico
 * Útil para casos onde não há DTO específico
 */
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

/**
 * Campos sensíveis padrão que devem ser removidos de respostas públicas
 */
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


