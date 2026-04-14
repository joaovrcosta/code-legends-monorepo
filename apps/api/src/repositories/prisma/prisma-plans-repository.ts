import { prisma } from "../../lib/prisma";
import { ActivePlanRow, IPlansRepository } from "../plans-repository";

export class PrismaPlansRepository implements IPlansRepository {
  async findFirstActiveBySlug(slug: string): Promise<ActivePlanRow | null> {
    const row = await prisma.plan.findFirst({
      where: { slug, active: true },
      select: {
        slug: true,
        name: true,
        imageUrl: true,
        colorHex: true,
      },
    });
    return row;
  }
}
