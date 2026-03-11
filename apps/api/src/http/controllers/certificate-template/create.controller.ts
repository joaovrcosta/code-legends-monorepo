import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateCertificateTemplateUseCase } from "../../../utils/factories/make-create-certificate-template-use-case";

export async function createTemplate(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    name: z.string().min(1),
    description: z.string(),
  });

  const { name, description } = bodySchema.parse(request.body);

  const useCase = makeCreateCertificateTemplateUseCase();
  const { template } = await useCase.execute({ name, description });

  return reply.status(201).send({ template });
}
