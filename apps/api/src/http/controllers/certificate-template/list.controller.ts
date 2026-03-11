import { FastifyReply, FastifyRequest } from "fastify";
import { makeListCertificateTemplatesUseCase } from "../../../utils/factories/make-list-certificate-templates-use-case";

export async function listTemplates(request: FastifyRequest, reply: FastifyReply) {
  const useCase = makeListCertificateTemplatesUseCase();
  const { templates } = await useCase.execute();

  return reply.status(200).send({ templates });
}
