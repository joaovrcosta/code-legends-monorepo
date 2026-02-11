import { verifyRBAC } from "./verify-rbac";
import { Role } from "@prisma/client";

export const verifyInstructorOrAdmin = verifyRBAC([Role.INSTRUCTOR, Role.ADMIN]);
