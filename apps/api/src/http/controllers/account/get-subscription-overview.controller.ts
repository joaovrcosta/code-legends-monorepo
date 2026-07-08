import { FastifyReply, FastifyRequest } from "fastify";
import { PlanFeatures } from "@code-legends/plans";
import { prisma } from "../../../lib/prisma";
import { makePlanAccessService } from "../../../utils/factories/make-plan-access-service";

export async function getSubscriptionOverview(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user.id;
    const planAccess = makePlanAccessService();

    const [activePlan, capabilities, subscription] = await Promise.all([
      planAccess.getActivePlan(userId),
      planAccess.getCapabilities(userId),
      prisma.subscription.findFirst({
        where: { userId },
        orderBy: { endsAt: "desc" },
        select: {
          id: true,
          status: true,
          startsAt: true,
          endsAt: true,
          planRecord: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              imageUrl: true,
              colorHex: true,
              amountCents: true,
            },
          },
        },
      }),
    ]);

    const hasPaidPlan =
      capabilities[PlanFeatures.CATALOG_PAID] ||
      (activePlan?.amountCents ?? 0) > 0;

    const plan = activePlan
      ? {
          id: activePlan.id,
          slug: activePlan.slug,
          name: activePlan.name,
          description: null as string | null,
          imageUrl: activePlan.imageUrl,
          colorHex: activePlan.colorHex,
          amountCents: activePlan.amountCents,
        }
      : null;

    return reply.status(200).send({
      plan,
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.planRecord.slug,
            status: subscription.status,
            startsAt: subscription.startsAt,
            endsAt: subscription.endsAt,
          }
        : null,
      hasPaidPlan,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
}
