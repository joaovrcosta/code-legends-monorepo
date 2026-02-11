import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeContinueCourseUseCase } from "../../../utils/factories/make-continue-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function continueCourse(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const continueCourseParamsSchema = z.object({
    id: z.string().optional(), // Opcional: se não fornecido, usa o curso ativo
  });

  const { id } = continueCourseParamsSchema.parse(request.params);

  try {
    const continueCourseUseCase = makeContinueCourseUseCase();

    const result = await continueCourseUseCase.execute({
      userId: request.user.id,
      courseId: id, // Pode ser undefined, o use case vai buscar o curso ativo
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
