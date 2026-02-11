import { verifyRBAC } from "./verify-rbac";
import { Role } from "@prisma/client";

/**
 * Middleware que verifica se o usuário tem role ADMIN.
 * Usa verificação robusta no banco de dados para prevenir privilege escalation.
 */
export const verifyAdmin = verifyRBAC([Role.ADMIN]);
