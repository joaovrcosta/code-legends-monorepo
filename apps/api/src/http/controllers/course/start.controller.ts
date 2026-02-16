import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeStartCourseUseCase } from "../../../utils/factories/make-start-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function start(request: FastifyRequest, reply: FastifyReply) {
  const startCourseParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = startCourseParamsSchema.parse(request.params);

  try {
    const startCourseUseCase = makeStartCourseUseCase();

    const { userCourse } = await startCourseUseCase.execute({
      userId: request.user.id,
      courseId: id,
    });

    return reply.status(200).send({
      userCourse,
    });
  } catch (error) {
    console.error("Error in start course:", error);

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message === "User is not enrolled in this course"
    ) {
      return reply.status(403).send({ message: error.message });
    }

    return reply.status(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
