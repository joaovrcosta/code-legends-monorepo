import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateCurrentModuleUseCase } from "../../../utils/factories/make-update-current-module-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { ModuleNotFoundError } from "../../../use-cases/errors/module-not-found";

export async function updateCurrent(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const updateCurrentModuleParamsSchema = z.object({
    courseId: z.string(),
    moduleId: z.string(),
  });

  const { courseId, moduleId } = updateCurrentModuleParamsSchema.parse(
    request.params
  );

  try {
    const updateCurrentModuleUseCase = makeUpdateCurrentModuleUseCase();

    const { userCourse } = await updateCurrentModuleUseCase.execute({
      userId: request.user.id,
      courseId,
      moduleId,
    });

    return reply.status(200).send({ userCourse });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof ModuleNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      (error.message === "User is not enrolled in this course" ||
        error.message === "Module does not belong to this course" ||
        error.message === "Module is locked. Complete the previous module first.")
    ) {
      return reply.status(403).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

