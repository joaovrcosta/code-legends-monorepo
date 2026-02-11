import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJWTOptional(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    // Se conseguir verificar, request.user será definido automaticamente
  } catch (err) {
    // Não retorna erro, apenas deixa request.user como undefined
    // Isso permite que a rota funcione para usuários não autenticados
    return;
  }
}

