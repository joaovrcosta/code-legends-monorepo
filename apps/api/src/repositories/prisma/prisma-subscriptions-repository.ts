import { prisma } from "../../lib/prisma";
import {
  ISubscriptionsRepository,
  SubscriptionRow,
} from "../subscriptions-repository";

export class PrismaSubscriptionsRepository
  implements ISubscriptionsRepository
{
  async findLatestByUserIdOrderedByEndsAt(
    userId: string
  ): Promise<SubscriptionRow | null> {
    const row = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { endsAt: "desc" },
      select: { id: true, endsAt: true, plan: true },
    });
    if (!row) return null;
    return {
      id: row.id,
      endsAt: row.endsAt,
      plan: row.plan,
    };
  }
}
