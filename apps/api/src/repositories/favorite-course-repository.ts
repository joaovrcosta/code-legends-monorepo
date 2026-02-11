import { FavoriteCourse } from "@prisma/client";

export interface IFavoriteCourseRepository {
  add(userId: string, courseId: string): Promise<FavoriteCourse>;
  remove(userId: string, courseId: string): Promise<void>;
  findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<FavoriteCourse | null>;
  listByUserId(userId: string): Promise<FavoriteCourse[]>;
}

