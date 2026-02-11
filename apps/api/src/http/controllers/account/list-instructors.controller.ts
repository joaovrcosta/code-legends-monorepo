import { FastifyReply, FastifyRequest } from "fastify";
import { makeListInstructorsUseCase } from "../../../utils/factories/make-list-instructors-use-case";
import { sanitizeUsers } from "../../utils/sanitize";
import { Role } from "@prisma/client";

export async function listInstructors(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listInstructorsUseCase = makeListInstructorsUseCase();

    const { instructors } = await listInstructorsUseCase.execute();

    // Sanitizar instrutores baseado no role do usuário solicitante
    const requestingUserRole = request.user.role as Role;
    const isAdmin = requestingUserRole === Role.ADMIN;

    // Admin vê dados completos, Instructor vê dados privados (RBAC já garantiu acesso)
    const sanitized = sanitizeUsers(instructors, {
      requestingUserId: request.user.id,
      requestingUserRole: requestingUserRole,
      isAdmin,
    });

    return reply.status(200).send({
      instructors: sanitized,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
