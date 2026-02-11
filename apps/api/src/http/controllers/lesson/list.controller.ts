import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListLessonsUseCase } from "../../../utils/factories/make-list-lessons-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listLessonsParamsSchema = z.object({
    groupId: z.coerce.number(),
  });

  const { groupId } = listLessonsParamsSchema.parse(request.params);

  try {
    const listLessonsUseCase = makeListLessonsUseCase();

    const { lessons } = await listLessonsUseCase.execute({
      groupId,
    });

    return reply.status(200).send({ lessons });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
