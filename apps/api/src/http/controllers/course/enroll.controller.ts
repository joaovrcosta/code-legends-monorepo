import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeEnrollCourseUseCase } from "../../../utils/factories/make-enroll-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function enroll(request: FastifyRequest, reply: FastifyReply) {
  const enrollCourseParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = enrollCourseParamsSchema.parse(request.params);

  try {
    const enrollCourseUseCase = makeEnrollCourseUseCase();

    const { userCourse } = await enrollCourseUseCase.execute({
      userId: request.user.id,
      courseId: id,
    });

    return reply.status(201).send({
      userCourse,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
