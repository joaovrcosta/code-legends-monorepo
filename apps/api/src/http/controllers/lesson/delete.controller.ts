import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteLessonUseCase } from "../../../utils/factories/make-delete-lesson-use-case";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteLessonParamsSchema = z.object({
    id: z.coerce.number(),
  });

  const { id } = deleteLessonParamsSchema.parse(request.params);

  try {
    const deleteLessonUseCase = makeDeleteLessonUseCase();

    await deleteLessonUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
