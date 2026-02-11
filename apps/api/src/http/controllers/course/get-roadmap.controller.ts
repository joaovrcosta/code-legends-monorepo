import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetRoadmapUseCase } from "../../../utils/factories/make-get-roadmap-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function getRoadmap(request: FastifyRequest, reply: FastifyReply) {
  const getRoadmapParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getRoadmapParamsSchema.parse(request.params);

  try {
    const getRoadmapUseCase = makeGetRoadmapUseCase();

    const roadmap = await getRoadmapUseCase.execute({
      userId: request.user.id,
      courseId: id,
    });

    return reply.status(200).send(roadmap);
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
