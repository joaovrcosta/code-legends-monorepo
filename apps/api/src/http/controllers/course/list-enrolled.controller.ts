import { FastifyReply, FastifyRequest } from "fastify";
import { makeListEnrolledCoursesUseCase } from "../../../utils/factories/make-list-enrolled-courses-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function listEnrolled(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const listEnrolledCoursesUseCase = makeListEnrolledCoursesUseCase();

    const { userCourses } = await listEnrolledCoursesUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send({
      userCourses,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
