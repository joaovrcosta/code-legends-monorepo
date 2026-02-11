import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeResetProgressUseCase } from "../../../utils/factories/make-reset-progress-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function resetProgress(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const resetProgressParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = resetProgressParamsSchema.parse(request.params);

  try {
    const resetProgressUseCase = makeResetProgressUseCase();

    const result = await resetProgressUseCase.execute({
      userId: request.user.id,
      courseId: id,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message === "User is not enrolled in this course"
    ) {
      return reply.status(403).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}


