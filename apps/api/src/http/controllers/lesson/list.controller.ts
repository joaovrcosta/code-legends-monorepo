import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListLessonsUseCase } from "../../../utils/factories/make-list-lessons-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listLessonsParamsSchema = z.object({
    groupId: z.coerce.number(),
  });

  const listLessonsQuerySchema = z.object({
    includeContent: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value !== "false"),
  });

  const { groupId } = listLessonsParamsSchema.parse(request.params);
  const { includeContent } = listLessonsQuerySchema.parse(request.query ?? {});

  try {
    const listLessonsUseCase = makeListLessonsUseCase();

    const { lessons } = await listLessonsUseCase.execute({
      groupId,
      includeContent,
    });

    return reply.status(200).send({ lessons });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
