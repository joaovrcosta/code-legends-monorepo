import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUnlockNextModuleUseCase } from "../../../utils/factories/make-unlock-next-module-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function unlockNextModule(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const unlockNextModuleParamsSchema = z.object({
    courseId: z.string(),
  });

  const { courseId } = unlockNextModuleParamsSchema.parse(request.params);

  try {
    const unlockNextModuleUseCase = makeUnlockNextModuleUseCase();

    const { userCourse, nextModuleId } = await unlockNextModuleUseCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(200).send({
      message: "Next module unlocked successfully",
      userCourse,
      nextModuleId,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      (error.message === "User is not enrolled in this course" ||
        error.message === "Course has no modules" ||
        error.message === "Current module is not completed. Complete all lessons before unlocking the next module." ||
        error.message === "There is no next module to unlock. Course completed!")
    ) {
      return reply.status(403).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

