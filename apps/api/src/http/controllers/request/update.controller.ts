import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateRequestUseCase } from "../../../utils/factories/make-update-request-use-case";
import { RequestNotFoundError } from "../../../use-cases/errors/request-not-found";

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateRequestParamsSchema = z.object({
    id: z.string(),
  });

  const updateRequestBodySchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "IN_PROGRESS"]).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    data: z.string().optional(),
    response: z.string().optional(),
  });

  const { id } = updateRequestParamsSchema.parse(request.params);
  const body = updateRequestBodySchema.parse(request.body);

  try {
    const updateRequestUseCase = makeUpdateRequestUseCase();

    const { request: updatedRequest } = await updateRequestUseCase.execute(id, {
      status: body.status,
      title: body.title ?? null,
      description: body.description ?? null,
      data: body.data ?? null,
      response: body.response ?? null,
      respondedBy: request.user.id,
    });

    return reply.status(200).send({ request: updatedRequest });
  } catch (error) {
    if (error instanceof RequestNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
