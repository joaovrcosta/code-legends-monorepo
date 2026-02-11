import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeContinueToNextModuleUseCase } from "../../../utils/factories/make-continue-to-next-module-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";

export async function continueToNextModule(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const continueToNextModuleParamsSchema = z.object({
    courseId: z.string(),
  });

  const { courseId } = continueToNextModuleParamsSchema.parse(request.params);

  try {
    const continueToNextModuleUseCase = makeContinueToNextModuleUseCase();

    const { userCourse, nextModuleId, wasUnlocked } = await continueToNextModuleUseCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(200).send({
      message: wasUnlocked 
        ? "Next module unlocked and navigation successful" 
        : "Navigation to next module successful",
      userCourse,
      nextModuleId,
      wasUnlocked,
    });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      (error.message === "User is not enrolled in this course" ||
        error.message === "Course has no modules" ||
        error.message === "There is no next module. Course completed!" ||
        error.message === "Current module is not completed. Complete all lessons before continuing to the next module.")
    ) {
      return reply.status(403).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

