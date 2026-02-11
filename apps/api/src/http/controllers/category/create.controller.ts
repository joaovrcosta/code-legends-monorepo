import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCategoryUseCase } from "../../../utils/factories/make-create-category-use-case";
import { CategoryAlreadyExistsError } from "../../../use-cases/errors/category-already-exists";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCategoryBodySchema = z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    order: z.number().optional(),
    active: z.boolean().optional(),
  });

  const { name, slug, description, icon, color, order, active } =
    createCategoryBodySchema.parse(request.body);

  try {
    const createCategoryUseCase = makeCreateCategoryUseCase();

    const { category } = await createCategoryUseCase.execute({
      name,
      slug,
      description: description ?? null,
      icon: icon ?? null,
      color: color ?? null,
      order: order ?? 0,
      active: active ?? true,
    });

    return reply.status(201).send({ category });
  } catch (error) {
    if (error instanceof CategoryAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
