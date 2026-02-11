import { FastifyReply, FastifyRequest } from "fastify";
import { makeMyLearningUseCase } from "../../../utils/factories/make-my-learning-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function myLearning(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const myLearningUseCase = makeMyLearningUseCase();

    const result = await myLearningUseCase.execute({
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








