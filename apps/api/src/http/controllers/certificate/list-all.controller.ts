import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListAllCertificatesUseCase } from "../../../utils/factories/make-list-all-certificates-use-case";

export async function listAllCertificates(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  });

  const { page, limit } = querySchema.parse(request.query);

  const listAllCertificatesUseCase = makeListAllCertificatesUseCase();

  const { certificates, total } = await listAllCertificatesUseCase.execute({
    page,
    limit,
  });

  return reply.status(200).send({
    certificates,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
