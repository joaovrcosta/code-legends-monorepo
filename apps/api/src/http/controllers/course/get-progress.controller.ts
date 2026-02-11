import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetCourseProgressUseCase } from "../../../utils/factories/make-get-course-progress-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function getCourseProgress(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getProgressParamsSchema = z.object({
    courseIdentifier: z.string(),
  });

  const { courseIdentifier } = getProgressParamsSchema.parse(request.params);

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      courseIdentifier
    );

  const courseId = isUUID ? courseIdentifier : undefined;
  const slug = isUUID ? undefined : courseIdentifier;

  try {
    const getCourseProgressUseCase = makeGetCourseProgressUseCase();

    const progress = await getCourseProgressUseCase.execute({
      userId: request.user.id,
      courseId,
      slug,
    });

    return reply.status(200).send(progress);
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

