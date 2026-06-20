import type { CourseLike } from "@prisma/client";

export interface ICourseLikeRepository {
  add(userId: string, courseId: string): Promise<CourseLike>;
  remove(userId: string, courseId: string): Promise<void>;
  findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<CourseLike | null>;
  countByCourseId(courseId: string): Promise<number>;
}
