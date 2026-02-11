import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetLessonByCourseIdAndSlugUseCase } from "../../../utils/factories/make-get-lesson-by-course-id-and-slug-use-case";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";

export async function getLessonBySlug(request: FastifyRequest, reply: FastifyReply) {
  const getLessonParamsSchema = z.object({
    courseId: z.string(),
    lessonSlug: z.string(),
  });

  const { courseId, lessonSlug } = getLessonParamsSchema.parse(request.params);

  try {
    const getLessonByCourseIdAndSlugUseCase = makeGetLessonByCourseIdAndSlugUseCase();

    const { lesson, moduleTitle, status, isCurrent, canReview, navigation } = await getLessonByCourseIdAndSlugUseCase.execute({
      courseId,
      slug: lessonSlug,
      userId: request.user.id,
    });

    return reply.status(200).send({ lesson, moduleTitle, status, isCurrent, canReview, navigation });
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

