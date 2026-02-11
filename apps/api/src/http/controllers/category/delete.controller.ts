import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteCategoryUseCase } from "../../../utils/factories/make-delete-category-use-case";
import { CategoryNotFoundError } from "../../../use-cases/errors/category-not-found";

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteCategoryParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = deleteCategoryParamsSchema.parse(request.params);

  try {
    const deleteCategoryUseCase = makeDeleteCategoryUseCase();

    await deleteCategoryUseCase.execute({ id });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof CategoryNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
