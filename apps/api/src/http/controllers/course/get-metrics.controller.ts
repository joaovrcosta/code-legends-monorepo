import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetCourseMetricsUseCase } from "../../../utils/factories/make-get-course-metrics-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function getCourseMetrics(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    id: z.string(),
  });

  const { id } = paramsSchema.parse(request.params);

  try {
    const useCase = makeGetCourseMetricsUseCase();
    const metrics = await useCase.execute({ courseId: id });
    return reply.status(200).send(metrics);
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    console.error("Erro ao buscar métricas do curso:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
