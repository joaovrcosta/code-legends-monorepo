import { FastifyReply, FastifyRequest } from "fastify";
import { ForumQuestionStatus, Role } from "@prisma/client";
import { z } from "zod";
import { makeListForumQuestionsUseCase } from "../../../utils/factories/make-list-forum-questions-use-case";

function truncatePreview(body: string, max = 120): string {
  const plain = body.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}...`;
}

export async function listQuestions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    status: z.nativeEnum(ForumQuestionStatus).optional(),
    courseId: z.union([z.string(), z.literal("geral")]).optional(),
    q: z.string().optional(),
  });

  const { status, courseId, q } = querySchema.parse(request.query);

  const isStaff =
    request.user.role === Role.INSTRUCTOR ||
    request.user.role === Role.ADMIN;

  const useCase = makeListForumQuestionsUseCase();
  const { questions } = await useCase.execute({
    status,
    courseId: courseId === "geral" ? null : courseId,
    q,
    authorId: isStaff ? undefined : request.user.id,
  });

  return reply.status(200).send({
    questions: questions.map((question) => ({
      ...question,
      preview: truncatePreview(question.body),
    })),
  });
}
