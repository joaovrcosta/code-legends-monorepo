import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateForumAnswerUseCase } from "../../../utils/factories/make-create-forum-answer-use-case";
import { ForumQuestionInvalidError } from "../../../use-cases/errors/forum-question-invalid";
import { ForumQuestionNotFoundError } from "../../../use-cases/errors/forum-question-not-found";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized";

export async function createAnswer(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string().min(1),
  });
  const bodySchema = z.object({
    body: z.string().min(1),
  });

  const { id } = paramsSchema.parse(request.params);
  const { body } = bodySchema.parse(request.body);

  try {
    const useCase = makeCreateForumAnswerUseCase();
    const { answer } = await useCase.execute({
      questionId: id,
      authorId: request.user.id,
      authorRole: request.user.role,
      body,
    });

    return reply.status(201).send({ answer });
  } catch (error) {
    if (error instanceof ForumQuestionNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof ForumQuestionInvalidError) {
      return reply.status(400).send({ message: error.message });
    }
    if (error instanceof UnauthorizedError) {
      return reply.status(403).send({ message: error.message });
    }
    throw error;
  }
}
