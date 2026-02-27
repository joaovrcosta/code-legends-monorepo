import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

const createPlanBodySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  amountCents: z.number().int().min(0).optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  externalId: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
});

export async function createPlan(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = createPlanBodySchema.parse(request.body);
    const plan = await prisma.plan.create({
      data: {
        slug: body.slug.toUpperCase(),
        name: body.name,
        description: body.description ?? null,
        amountCents: body.amountCents ?? 0,
        order: body.order ?? 0,
        active: body.active ?? true,
        externalId: body.externalId ?? null,
        productName: body.productName ?? null,
      },
    });
    return reply.status(201).send(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: "Invalid body", errors: error.errors });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
