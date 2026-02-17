import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateRequestUseCase } from "../../../utils/factories/make-create-request-use-case";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createRequestBodySchema = z.object({
    type: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    data: z.string().optional(),
  });

  const { type, title, description, data } = createRequestBodySchema.parse(
    request.body
  );

  try {
    const createRequestUseCase = makeCreateRequestUseCase();

    const { request: newRequest } = await createRequestUseCase.execute({
      userId: request.user.id,
      type,
      title: title ?? null,
      description: description ?? null,
      data: data ?? null,
    });

    return reply.status(201).send({ request: newRequest });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
