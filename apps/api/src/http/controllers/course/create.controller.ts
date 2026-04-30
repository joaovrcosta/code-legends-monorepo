import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { makeCreateCourseUseCase } from "../../../utils/factories/make-create-course-use-case";
import { CourseAlreadyExistsError } from "../../../use-cases/errors/course-already-exists";
import { InstructorNotFoundError } from "../../../use-cases/errors/instructor-not-found";
import { CategoryNotFoundError } from "../../../use-cases/errors/category-not-found";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCourseBodySchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    slug: z.string().min(1, "Slug é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    level: z.string().min(1, "Nível é obrigatório"),
    instructorId: z.string().min(1, "Instrutor é obrigatório"),
    categoryId: z
      .string()
      .optional()
      .transform((v) => (v != null && v.trim() === "" ? undefined : v)),
    thumbnail: z
      .string()
      .optional()
      .transform((v) => (v != null && v.trim() === "" ? undefined : v)),
    icon: z
      .string()
      .optional()
      .transform((v) => (v != null && v.trim() === "" ? undefined : v)),
    colorHex: z
      .string()
      .optional()
      .transform((v) => (v != null && v.trim() === "" ? undefined : v)),
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
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return reply.status(400).send({
        message: "Dados inválidos para criar curso",
        issues,
      });
    }

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
      (error.message === "User is not an instructor or admin" ||
        error.message === "User is not an instructor")
    ) {
      return reply.status(403).send({ message: error.message });
    }

    // Prisma FK / constraint errors -> mensagem amigável
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        // FK violation (ex.: categoryId inválido)
        return reply.status(400).send({
          message:
            "Dados inválidos: verifique Instrutor/Categoria (IDs) e tente novamente.",
        });
      }
      if (error.code === "P2002") {
        return reply.status(409).send({
          message: "Já existe um curso com esse slug.",
        });
      }
    }

    // Log do erro para debug
    console.error("Error creating course:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body: request.body,
    });

    // Em desenvolvimento, retorna mais detalhes
    if (process.env.NODE_ENV !== "production") {
      return reply.status(500).send({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
