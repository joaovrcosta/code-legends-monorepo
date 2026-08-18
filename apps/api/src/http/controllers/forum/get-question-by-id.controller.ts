import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetForumQuestionByIdUseCase } from "../../../utils/factories/make-get-forum-question-by-id-use-case";
import { ForumQuestionNotFoundError } from "../../../use-cases/errors/forum-question-not-found";

export async function getQuestionById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().min(1),
  });

  const { id } = paramsSchema.parse(request.params);

  try {
    const useCase = makeGetForumQuestionByIdUseCase();
    const { question } = await useCase.execute({
      id,
      requesterId: request.user.id,
      requesterRole: request.user.role,
    });
    return reply.status(200).send({ question });
  } catch (error) {
    if (error instanceof ForumQuestionNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    throw error;
  }
}
