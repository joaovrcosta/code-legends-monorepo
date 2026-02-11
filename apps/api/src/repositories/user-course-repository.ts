import { UserCourse } from "@prisma/client";

export interface IUserCourseRepository {
  enroll(userId: string, courseId: string): Promise<UserCourse>;
  findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<UserCourse | null>;
  findById(id: string): Promise<UserCourse | null>;
  update(id: string, data: Partial<UserCourse>): Promise<UserCourse>;
  findByUserId(userId: string): Promise<UserCourse[]>;
}
