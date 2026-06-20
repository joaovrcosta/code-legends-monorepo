import { PrismaCourseDislikeRepository } from "../../repositories/prisma/prisma-course-dislike-repository";
import { PrismaCourseLikeRepository } from "../../repositories/prisma/prisma-course-like-repository";
import { RemoveCourseDislikeUseCase } from "../../use-cases/entities/CourseDislike/remove";

export function makeRemoveCourseDislikeUseCase() {
  return new RemoveCourseDislikeUseCase(
    new PrismaCourseDislikeRepository(),
    new PrismaCourseLikeRepository(),
  );
}
