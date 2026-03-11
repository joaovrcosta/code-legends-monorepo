import { prisma } from "../../lib/prisma";
import { DashboardOverviewMetrics, IDashboardRepository } from "../dashboard-repository";

export class PrismaDashboardRepository implements IDashboardRepository {
  async getOverviewMetrics(): Promise<DashboardOverviewMetrics> {
    const totalUsers = await prisma.user.count({
      where: {
        role: "STUDENT",
      },
    });

    const totalActiveSubscriptions = await prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Sum all paid payments
    const payments = await prisma.payment.aggregate({
      _sum: {
        amountCents: true,
      },
      where: {
        status: "PAID",
      },
    });

    const totalMRR = payments._sum.amountCents || 0;

    const totalCourses = await prisma.course.count({
      where: {
        status: "PUBLISHED",
      },
    });

    const recentUserCourses = await prisma.userCourse.findMany({
      take: 5,
      orderBy: {
        enrolledAt: "desc",
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    });

    const recentEnrollments = recentUserCourses.map((uc) => ({
      id: uc.id,
      userId: uc.userId,
      userName: uc.user.name,
      courseId: uc.courseId,
      courseTitle: uc.course.title,
      enrolledAt: uc.enrolledAt,
    }));

    const popularCourses = await prisma.course.findMany({
      take: 5,
      orderBy: {
        subscriptions: "desc",
      },
      select: {
        id: true,
        title: true,
        subscriptions: true,
      },
    });

    return {
      totalUsers,
      totalActiveSubscriptions,
      totalMRR,
      totalCourses,
      recentEnrollments,
      popularCourses: popularCourses.map((c) => ({
        id: c.id,
        title: c.title,
        enrollmentCount: c.subscriptions,
      })),
    };
  }
}
