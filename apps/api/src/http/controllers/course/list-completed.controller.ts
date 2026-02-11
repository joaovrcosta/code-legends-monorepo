import { FastifyReply, FastifyRequest } from "fastify";
import { makeListCompletedCoursesUseCase } from "../../../utils/factories/make-list-completed-courses-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function listCompleted(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const listCompletedCoursesUseCase = makeListCompletedCoursesUseCase();

    const result = await listCompletedCoursesUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

