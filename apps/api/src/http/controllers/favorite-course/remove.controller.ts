import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeRemoveFavoriteCourseUseCase } from "../../../utils/factories/make-remove-favorite-course-use-case";
import { FavoriteCourseNotFoundError } from "../../../use-cases/errors/favorite-course-not-found";

export async function removeFavorite(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const removeFavoriteParamsSchema = z.object({
    courseId: z.string(),
  });

  const { courseId } = removeFavoriteParamsSchema.parse(request.params);

  try {
    const removeFavoriteCourseUseCase = makeRemoveFavoriteCourseUseCase();

    await removeFavoriteCourseUseCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof FavoriteCourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
