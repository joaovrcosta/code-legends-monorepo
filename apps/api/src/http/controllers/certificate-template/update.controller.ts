import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeUpdateCertificateTemplateUseCase } from "../../../utils/factories/make-update-certificate-template-use-case";

export async function updateTemplate(request: FastifyRequest, reply: FastifyReply) {
  const paramSchema = z.object({
    id: z.string().cuid(),
  });

  const bodySchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
  });

  const { id } = paramSchema.parse(request.params);
  const { name, description } = bodySchema.parse(request.body);

  const useCase = makeUpdateCertificateTemplateUseCase();
  const { template } = await useCase.execute({ id, name, description });

  return reply.status(200).send({ template });
}
