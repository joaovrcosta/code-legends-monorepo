import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListModulesUseCase } from "../../../utils/factories/make-list-modules-use-case";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listModulesParamsSchema = z.object({
    courseId: z.string(),
  });

  const { courseId } = listModulesParamsSchema.parse(request.params);

  try {
    const listModulesUseCase = makeListModulesUseCase();

    const { modules } = await listModulesUseCase.execute({
      courseId,
    });

    return reply.status(200).send({ modules });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
