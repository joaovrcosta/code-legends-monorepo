import type { CourseDislike } from "@prisma/client";

export interface ICourseDislikeRepository {
  add(userId: string, courseId: string): Promise<CourseDislike>;
  remove(userId: string, courseId: string): Promise<void>;
  findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<CourseDislike | null>;
}
