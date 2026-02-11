import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetUserByIdUseCase } from "../../../utils/factories/make-get-user-by-id-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";
import { sanitizeUser } from "../../utils/sanitize";
import { Role } from "@prisma/client";

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const getUserByIdParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getUserByIdParamsSchema.parse(request.params);

  try {
    const getUserByIdUseCase = makeGetUserByIdUseCase();

    const { user } = await getUserByIdUseCase.execute({ id });

    // Sanitizar usuário - admin pode ver dados completos
    const sanitized = sanitizeUser(user, {
      requestingUserId: request.user.id,
      requestingUserRole: request.user.role as Role,
      isAdmin: true,
    });

    return reply.status(200).send({
      user: sanitized,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}



