import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetCategoryBySlugUseCase } from "../../../utils/factories/make-get-category-by-slug-use-case";
import { CategoryNotFoundError } from "../../../use-cases/errors/category-not-found";

export async function getBySlug(request: FastifyRequest, reply: FastifyReply) {
  const getCategoryBySlugParamsSchema = z.object({
    slug: z.string(),
  });

  const { slug } = getCategoryBySlugParamsSchema.parse(request.params);

  try {
    const getCategoryBySlugUseCase = makeGetCategoryBySlugUseCase();

    const { category } = await getCategoryBySlugUseCase.execute({ slug });

    return reply.status(200).send({ category });
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}

