import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";

const updatePlanBodySchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  amountCents: z.number().int().min(0).optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  externalId: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
});

export async function updatePlan(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const body = updatePlanBodySchema.parse(request.body);

    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Plan not found" });
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug.toUpperCase() }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amountCents !== undefined && { amountCents: body.amountCents }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.externalId !== undefined && { externalId: body.externalId }),
        ...(body.productName !== undefined && { productName: body.productName }),
      },
    });
    return reply.status(200).send(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message: "Invalid body", errors: error.errors });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
