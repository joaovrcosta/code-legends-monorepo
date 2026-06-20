import { PrismaCourseDislikeRepository } from "../../repositories/prisma/prisma-course-dislike-repository";
import { PrismaCourseLikeRepository } from "../../repositories/prisma/prisma-course-like-repository";
import { GetCourseLikeStatusUseCase } from "../../use-cases/entities/CourseLike/get-status";

export function makeGetCourseLikeStatusUseCase() {
  return new GetCourseLikeStatusUseCase(
    new PrismaCourseLikeRepository(),
    new PrismaCourseDislikeRepository(),
  );
}
