import { FastifyReply, FastifyRequest } from "fastify";
import { makeListUsersUseCase } from "../../../utils/factories/make-list-users-use-case";
import { sanitizeUsers } from "../../utils/sanitize";
import { Role } from "@prisma/client";

export async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listUsersUseCase = makeListUsersUseCase();

    const { users } = await listUsersUseCase.execute();

    // Sanitizar usuários - admin pode ver dados completos
    const sanitized = sanitizeUsers(users, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isAdmin: true,
    });

    return reply.status(200).send({
      users: sanitized,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}

