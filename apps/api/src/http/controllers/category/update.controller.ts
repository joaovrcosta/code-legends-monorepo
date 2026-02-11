import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateCategoryUseCase } from "../../../utils/factories/make-update-category-use-case";
import { CategoryNotFoundError } from "../../../use-cases/errors/category-not-found";
import { CategoryAlreadyExistsError } from "../../../use-cases/errors/category-already-exists";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateCategoryParamsSchema = z.object({
    id: z.string(),
  });

  const updateCategoryBodySchema = z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    order: z.number().optional(),
    active: z.boolean().optional(),
  });

  const { id } = updateCategoryParamsSchema.parse(request.params);
  const { name, slug, description, icon, color, order, active } =
    updateCategoryBodySchema.parse(request.body);

  try {
    const updateCategoryUseCase = makeUpdateCategoryUseCase();

    const { category } = await updateCategoryUseCase.execute({
      id,
      name,
      slug,
      description,
      icon,
      color,
      order,
      active,
    });

    return reply.status(200).send({ category });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof CategoryAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
