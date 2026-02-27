import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../lib/prisma";

export async function getSubscriptionOverview(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const hasPaidPlan =
      user.plan === "PRO" || user.plan === "PREMIUM";

    const [subscription, plan] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId },
        orderBy: { endsAt: "desc" },
        select: {
          id: true,
          plan: true,
          status: true,
          startsAt: true,
          endsAt: true,
        },
      }),
      prisma.plan.findFirst({
        where: { slug: user.plan, active: true },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          amountCents: true,
        },
      }),
    ]);

    return reply.status(200).send({
      plan: plan ?? null,
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
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
