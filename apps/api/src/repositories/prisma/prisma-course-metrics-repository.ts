import { prisma } from "../../lib/prisma";
import { computeReactionAverageRating } from "../../utils/compute-reaction-average-rating";
import type {
  CourseMetricsData,
  ICourseMetricsRepository,
} from "../course-metrics-repository";

function normalizeProgress(value: number | null): number {
  if (value == null) return 0;
  const pct = value <= 1 ? value * 100 : value;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

export class PrismaCourseMetricsRepository implements ICourseMetricsRepository {
  async getByCourseId(courseId: string): Promise<CourseMetricsData | null> {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return null;
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        submodule: {
          module: { courseId },
        },
      },
      select: {
        id: true,
        title: true,
        submodule: {
          select: {
            title: true,
            module: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const lessonIds = lessons.map((lesson) => lesson.id);

    const [
      enrollments,
      completions,
      progressAggregate,
      favorites,
      certificates,
      courseLikes,
      courseDislikes,
      lessonsCompleted,
      likesGrouped,
      dislikesGrouped,
    ] = await Promise.all([
      prisma.userCourse.count({ where: { courseId } }),
      prisma.userCourse.count({ where: { courseId, isCompleted: true } }),
      prisma.userCourse.aggregate({
        where: { courseId },
        _avg: { progress: true },
      }),
      prisma.favoriteCourse.count({ where: { courseId } }),
      prisma.certificate.count({ where: { courseId } }),
      prisma.courseLike.count({ where: { courseId } }),
      prisma.courseDislike.count({ where: { courseId } }),
      lessonIds.length > 0
        ? prisma.userProgress.count({
            where: {
              taskId: { in: lessonIds },
              isCompleted: true,
            },
          })
        : Promise.resolve(0),
      lessonIds.length > 0
        ? prisma.lessonLike.groupBy({
            by: ["lessonId"],
            where: { lessonId: { in: lessonIds } },
            _count: { lessonId: true },
          })
        : Promise.resolve([]),
      lessonIds.length > 0
        ? prisma.lessonDislike.groupBy({
            by: ["lessonId"],
            where: { lessonId: { in: lessonIds } },
            _count: { lessonId: true },
          })
        : Promise.resolve([]),
    ]);

    const likesMap = new Map(
      likesGrouped.map((row) => [row.lessonId, row._count.lessonId]),
    );
    const dislikesMap = new Map(
      dislikesGrouped.map((row) => [row.lessonId, row._count.lessonId]),
    );

    const completionRate =
      enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0;

    const lessonReactions = lessons
      .map((lesson) => {
        const likes = likesMap.get(lesson.id) ?? 0;
        const dislikes = dislikesMap.get(lesson.id) ?? 0;
        const ratingCount = likes + dislikes;

        return {
          lessonId: lesson.id,
          title: lesson.title,
          moduleTitle: lesson.submodule.module.title,
          groupTitle: lesson.submodule.title,
          likes,
          dislikes,
          ratingCount,
          averageRating: computeReactionAverageRating(likes, dislikes),
        };
      })
      .sort((a, b) => {
        const ratingA = a.averageRating ?? -1;
        const ratingB = b.averageRating ?? -1;
        if (ratingB !== ratingA) return ratingB - ratingA;
        if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
        if (b.likes !== a.likes) return b.likes - a.likes;
        return b.dislikes - a.dislikes;
      });

    return {
      summary: {
        enrollments,
        completions,
        completionRate,
        averageProgress: normalizeProgress(progressAggregate._avg.progress),
        favorites,
        certificates,
        courseLikes,
        courseDislikes,
        totalLessons: lessons.length,
        lessonsCompleted,
      },
      lessonReactions,
    };
  }
}
