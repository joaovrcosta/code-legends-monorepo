import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makePublishCourseUseCase } from "../../../utils/factories/make-publish-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function publish(request: FastifyRequest, reply: FastifyReply) {
  const publishCourseParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = publishCourseParamsSchema.parse(request.params);

  try {
    const publishCourseUseCase = makePublishCourseUseCase();

    const { course } = await publishCourseUseCase.execute({
      courseId: id,
    });

    return reply.status(200).send({ course });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof Error && error.message.includes("Não é possível publicar")) {
      return reply.status(400).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
