import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { LessonNotFoundError } from "../../../use-cases/errors/lesson-not-found";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { makeCompleteLessonUseCase } from "../../../utils/factories/make-complete-lesson-use-case";

export async function complete(request: FastifyRequest, reply: FastifyReply) {
  const completeLessonParamsSchema = z.object({
    id: z.string().transform(Number),
  });

  const completeLessonBodySchema = z.object({
    score: z.number().optional(),
  });

  const { id } = completeLessonParamsSchema.parse(request.params);
  const { score } = completeLessonBodySchema.parse(request.body || {});

  try {
    const completeLessonUseCase = makeCompleteLessonUseCase();

    const result = await completeLessonUseCase.execute({
      userId: request.user.id,
      lessonId: id,
      score,
    });

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return reply.status(404).send({ 
        success: false,
        error: error.message,
        code: "LESSON_NOT_FOUND"
      });
    }

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ 
        success: false,
        error: error.message,
        code: "COURSE_NOT_FOUND"
      });
    }

    if (
      error instanceof Error &&
      error.message === "User is not enrolled in this course"
    ) {
      return reply.status(403).send({ 
        success: false,
        error: error.message,
        code: "NOT_ENROLLED"
      });
    }

    if (
      error instanceof Error &&
      (error.message === "User not found" || error.message === "Group not found")
    ) {
      return reply.status(500).send({ 
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR"
      });
    }

    console.error("Error completing lesson:", error);
    return reply.status(500).send({ 
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
}
