import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUnenrollFromCourseUseCase } from "../../../utils/factories/make-unenroll-from-course-use-case";

export async function unenroll(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const bodySchema = z.object({
    userId: z.string(),
  });

  const { id } = paramsSchema.parse(request.params);
  const { userId } = bodySchema.parse(request.body);

  try {
    const useCase = makeUnenrollFromCourseUseCase();

    const result = await useCase.execute({
      userId,
      courseId: id,
    });

    return reply.status(200).send(result);
  } catch (error) {
    console.error("Erro ao desmatricular usuário do curso:", error);

    const message =
      error instanceof Error ? error.message : "Erro ao desmatricular usuário";

    return reply.status(400).send({ message });
  }
}

