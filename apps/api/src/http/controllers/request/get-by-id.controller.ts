import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetRequestByIdUseCase } from "../../../utils/factories/make-get-request-by-id-use-case";
import { RequestNotFoundError } from "../../../use-cases/errors/request-not-found";

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const getRequestByIdParamsSchema = z.object({
    id: z.string(),
  });

  const { id } = getRequestByIdParamsSchema.parse(request.params);

  try {
    const getRequestByIdUseCase = makeGetRequestByIdUseCase();

    const { request: foundRequest } = await getRequestByIdUseCase.execute(id);

    return reply.status(200).send({ request: foundRequest });
  } catch (error) {
    if (error instanceof RequestNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
