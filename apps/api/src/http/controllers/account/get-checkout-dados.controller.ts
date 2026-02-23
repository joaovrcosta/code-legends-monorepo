import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../lib/prisma";

/**
 * Retorna os dados do usuário e endereço para preencher o formulário "Meus dados" do checkout.
 */
export async function getCheckoutDados(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      fullname: true,
      document: true,
      phone: true,
      Address: true,
    },
  });

  if (!user) {
    return reply.status(404).send({ message: "Usuário não encontrado" });
  }

  const address = user.Address;

  return reply.status(200).send({
    email: user.email ?? "",
    fullname: user.fullname ?? user.name ?? "",
    document: user.document ?? "",
    phone: user.phone ?? "",
    livingAbroad: address?.foreign_country ?? false,
    address: {
      cep: address?.postal_code ?? "",
      street: address?.street_name ?? "",
      number: address?.number ?? "",
      complement: address?.complement ?? "",
      noNumber: !address?.number && address?.street_name !== undefined,
      neighborhood: address?.neighborhood ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
    },
  });
}
