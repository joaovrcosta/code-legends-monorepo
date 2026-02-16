import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listTagsQuerySchema = z.object({
    search: z.string().optional(),
  });

  const { search } = listTagsQuerySchema.parse(request.query);

  try {
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const tags = await prisma.tag.findMany({
      where,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
      take: search ? 20 : 100, // Limita resultados quando há busca
    });

    return reply.status(200).send({ tags });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
