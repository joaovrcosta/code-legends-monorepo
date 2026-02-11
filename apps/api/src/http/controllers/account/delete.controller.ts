import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteUserUseCase } from "../../../utils/factories/make-delete-user-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteUserParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteUserParamsSchema.parse(request.params);

  try {
    const deleteUserUseCase = makeDeleteUserUseCase();

    await deleteUserUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}



