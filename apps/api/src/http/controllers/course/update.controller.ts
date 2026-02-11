import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateCourseUseCase } from "../../../utils/factories/make-update-course-use-case";
import { CourseNotFoundError } from "../../../use-cases/errors/course-not-found";
import { CourseAlreadyExistsError } from "../../../use-cases/errors/course-already-exists";
import { CategoryNotFoundError } from "../../../use-cases/errors/category-not-found";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateCourseParamsSchema = z.object({
    id: z.string(),
  });

  const updateCourseBodySchema = z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    level: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    colorHex: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    isFree: z.boolean().optional(),
    active: z.boolean().optional(),
    releaseAt: z.string().datetime().nullable().optional(),
  });

  const { id } = updateCourseParamsSchema.parse(request.params);
  const {
    title,
    slug,
    description,
    level,
    categoryId,
    thumbnail,
    icon,
    colorHex,
    tags,
    isFree,
    active,
    releaseAt,
  } = updateCourseBodySchema.parse(request.body);

  try {
    const updateCourseUseCase = makeUpdateCourseUseCase();

    const { course } = await updateCourseUseCase.execute({
      id,
      title,
      slug,
      description,
      level,
      categoryId,
      thumbnail,
      icon,
      colorHex,
      tags,
      isFree,
      active,
      releaseAt: releaseAt ? new Date(releaseAt) : undefined,
    });

    return reply.status(200).send({ course });
  } catch (error) {
    if (error instanceof CourseNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof CourseAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof CategoryNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
