import { FastifyReply, FastifyRequest } from "fastify";
import { makeListFavoriteCoursesUseCase } from "../../../utils/factories/make-list-favorite-courses-use-case";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function listFavorites(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const listFavoriteCoursesUseCase = makeListFavoriteCoursesUseCase();

    const { favoriteCourses } = await listFavoriteCoursesUseCase.execute({
      userId: request.user.id,
    });

    return reply.status(200).send({
      favoriteCourses,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
