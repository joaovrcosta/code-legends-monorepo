import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { Role } from "@prisma/client";

interface RoleCacheEntry {
  role: Role;
  timestamp: number;
}

const roleCache = new Map<string, RoleCacheEntry>();
const CACHE_TTL = 30 * 1000; // 30 segundos

export function verifyRBAC(allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try { 
      await request.jwtVerify();

      const userId = request.user.id;
      const tokenRole = request.user.role as Role;

      const cached = roleCache.get(userId);
      const now = Date.now();

      let userRole: Role;

      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        userRole = cached.role;
      } else {
        const usersRepository = new PrismaUsersRepository();
        const user = await usersRepository.findById(userId);

        if (!user) {
          return reply.status(401).send({ message: "User not found" });
        }

        userRole = user.role;
        
        roleCache.set(userId, {
          role: userRole,
          timestamp: now,
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return reply.status(403).send({
          message: `Forbidden Access: You are not authorized to access this resource`,
        });
      }
      request.user.role = userRole;
    } catch (err) {
      return reply.status(401).send({ message: "Unauthorized" });
    }
  };
}

