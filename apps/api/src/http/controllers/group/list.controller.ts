import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListGroupsUseCase } from "../../../utils/factories/make-list-groups-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listGroupsParamsSchema = z.object({
    moduleId: z.string(),
  });

  const { moduleId } = listGroupsParamsSchema.parse(request.params);

  try {
    const listGroupsUseCase = makeListGroupsUseCase();

    const { groups } = await listGroupsUseCase.execute({
      moduleId,
    });

    return reply.status(200).send({ groups });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
