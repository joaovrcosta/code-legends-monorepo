import { FastifyReply, FastifyRequest } from "fastify";
import { makeListCategoriesUseCase } from "../../../utils/factories/make-list-categories-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listCategoriesUseCase = makeListCategoriesUseCase();

    const { categories } = await listCategoriesUseCase.execute();

    return reply.status(200).send({ categories });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
