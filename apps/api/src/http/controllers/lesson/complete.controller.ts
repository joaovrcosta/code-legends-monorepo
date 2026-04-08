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

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "814d8b",
      },
      body: JSON.stringify({
        sessionId: "814d8b",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "complete.controller.ts:success",
        message: "complete lesson 200",
        data: { lessonId: id, hasNext: result.nextLessonId != null },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return reply.status(200).send(result);
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "814d8b",
      },
      body: JSON.stringify({
        sessionId: "814d8b",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "complete.controller.ts:catch",
        message: "complete lesson handler threw",
        data: {
          lessonId: id,
          name: error instanceof Error ? error.name : "unknown",
          errMsg: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
    // #region agent log
    const errMsg = error instanceof Error ? error.message : String(error);
    const errName = error instanceof Error ? error.name : typeof error;
    fetch('http://127.0.0.1:7242/ingest/61681d87-9b85-44a2-a3f8-024fd9404ca8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'d6a1ea'},body:JSON.stringify({sessionId:'d6a1ea',runId:'pre-fix',hypothesisId:'H2',location:'complete.controller.ts:generic_500',message:'Complete lesson unhandled error',data:{lessonId:id,errName,errMsg:errMsg.slice(0,500)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return reply.status(500).send({ 
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
}
