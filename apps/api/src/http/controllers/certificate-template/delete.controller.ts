import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteCertificateTemplateUseCase } from "../../../utils/factories/make-delete-certificate-template-use-case";

export async function deleteTemplate(request: FastifyRequest, reply: FastifyReply) {
  const paramSchema = z.object({
    id: z.string().cuid(),
  });

  const { id } = paramSchema.parse(request.params);

  const useCase = makeDeleteCertificateTemplateUseCase();
  await useCase.execute({ id });

  return reply.status(204).send();
}
