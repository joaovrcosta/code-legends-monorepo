import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCourseUseCase } from "../../../utils/factories/make-create-course-use-case";
import { CourseAlreadyExistsError } from "../../../use-cases/errors/course-already-exists";
import { InstructorNotFoundError } from "../../../use-cases/errors/instructor-not-found";
import { CategoryNotFoundError } from "../../../use-cases/errors/category-not-found";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCourseBodySchema = z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    level: z.string(),
    instructorId: z.string(),
    categoryId: z.string().optional(),
    thumbnail: z.string().optional(),
    icon: z.string().optional(),
    colorHex: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFree: z.boolean().optional(),
    active: z.boolean().optional(),
    releaseAt: z.string().datetime().optional(),
  });

  const {
    title,
    slug,
    description,
    level,
    instructorId,
    categoryId,
    thumbnail,
    icon,
    colorHex,
    tags,
    isFree,
    active,
    releaseAt,
  } = createCourseBodySchema.parse(request.body);

  try {
    const createCourseUseCase = makeCreateCourseUseCase();

    const { course } = await createCourseUseCase.execute({
      title,
      slug,
      description,
      level,
      instructorId,
      categoryId: categoryId ?? null,
      thumbnail: thumbnail ?? null,
      icon: icon ?? null,
      colorHex: colorHex ?? null,
      tags: tags ?? [],
      isFree: isFree ?? false,
      active: active ?? true,
      releaseAt: releaseAt ? new Date(releaseAt) : null,
    });

    return reply.status(201).send({
      course,
    });
  } catch (error) {
    if (error instanceof CourseAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof InstructorNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof CategoryNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message === "User is not an instructor"
    ) {
      return reply.status(403).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
