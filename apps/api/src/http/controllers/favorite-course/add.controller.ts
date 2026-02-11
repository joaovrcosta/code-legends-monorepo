import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAddFavoriteCourseUseCase } from "../../../utils/factories/make-add-favorite-course-use-case";
import { FavoriteCourseAlreadyExistsError } from "../../../use-cases/errors/favorite-course-already-exists";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { UserNotFoundError } from "../../../use-cases/errors/user-not-found";

export async function addFavorite(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const addFavoriteParamsSchema = z.object({
    courseId: z.string(),
  });

  const { courseId } = addFavoriteParamsSchema.parse(request.params);

  try {
    const addFavoriteCourseUseCase = makeAddFavoriteCourseUseCase();

    const { favoriteCourse } = await addFavoriteCourseUseCase.execute({
      userId: request.user.id,
      courseId,
    });

    return reply.status(201).send({
      favoriteCourse,
    });
  } catch (error) {
    if (error instanceof FavoriteCourseAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
