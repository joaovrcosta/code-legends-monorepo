import { FastifyReply, FastifyRequest } from "fastify";
import { makeListRequestsUseCase } from "../../../utils/factories/make-list-requests-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listRequestsUseCase = makeListRequestsUseCase();

    const { requests } = await listRequestsUseCase.execute();

    return reply.status(200).send({ requests });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
