import { PrismaCourseDislikeRepository } from "../../repositories/prisma/prisma-course-dislike-repository";
import { PrismaCourseLikeRepository } from "../../repositories/prisma/prisma-course-like-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { AddCourseDislikeUseCase } from "../../use-cases/entities/CourseDislike/add";

export function makeAddCourseDislikeUseCase() {
  return new AddCourseDislikeUseCase(
    new PrismaCourseDislikeRepository(),
    new PrismaCourseLikeRepository(),
    new PrismaCourseRepository(),
  );
}
