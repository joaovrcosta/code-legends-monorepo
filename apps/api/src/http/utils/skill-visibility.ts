import { Role } from "@prisma/client";

export function canViewUserSkills(params: {
  requestingUserId: string;
  requestingUserRole?: string;
  targetUserId: string;
}) {
  const { requestingUserId, requestingUserRole, targetUserId } = params;

  if (requestingUserRole === Role.ADMIN || requestingUserRole === Role.INSTRUCTOR) {
    return true;
  }

  return requestingUserId === targetUserId;
}
