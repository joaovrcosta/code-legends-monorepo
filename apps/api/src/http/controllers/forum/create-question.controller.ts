import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateForumQuestionUseCase } from "../../../utils/factories/make-create-forum-question-use-case";
import { ForumQuestionInvalidError } from "../../../use-cases/errors/forum-question-invalid";

function truncatePreview(body: string, max = 120): string {
  const plain = body.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}...`;
}

export async function createQuestion(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    body: z.string().min(1),
    courseId: z.string().nullable().optional(),
    lessonId: z.number().int().positive().nullable().optional(),
  });

  const { body, courseId, lessonId } = bodySchema.parse(request.body);

  try {
    const useCase = makeCreateForumQuestionUseCase();
    const { question } = await useCase.execute({
      authorId: request.user.id,
      body,
      courseId: courseId ?? null,
      lessonId: lessonId ?? null,
    });

    return reply.status(201).send({
      question: {
        ...question,
        preview: truncatePreview(question.body),
      },
    });
  } catch (error) {
    if (error instanceof ForumQuestionInvalidError) {
      return reply.status(400).send({ message: error.message });
    }
    throw error;
  }
}
