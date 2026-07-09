import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { planFeaturesArraySchema } from "@code-legends/plans";
import { prisma } from "../../../lib/prisma";

const updatePlanBodySchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  colorHex: z.string().optional().nullable(),
  amountCents: z.number().int().min(0).optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  externalId: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
  features: planFeaturesArraySchema.optional(),
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

    if (existing.slug === 'FREE' && body.features !== undefined) {
      return reply.status(400).send({
        message: 'As funcionalidades do plano FREE são fixas no sistema e não podem ser editadas',
      });
    }

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug.toUpperCase() }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.colorHex !== undefined && { colorHex: body.colorHex }),
        ...(body.amountCents !== undefined && { amountCents: body.amountCents }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.externalId !== undefined && { externalId: body.externalId }),
        ...(body.productName !== undefined && { productName: body.productName }),
        ...(body.features !== undefined && { features: body.features }),
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
