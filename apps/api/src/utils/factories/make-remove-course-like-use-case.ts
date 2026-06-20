import { PrismaCourseDislikeRepository } from "../../repositories/prisma/prisma-course-dislike-repository";
import { PrismaCourseLikeRepository } from "../../repositories/prisma/prisma-course-like-repository";
import { RemoveCourseLikeUseCase } from "../../use-cases/entities/CourseLike/remove";

export function makeRemoveCourseLikeUseCase() {
  return new RemoveCourseLikeUseCase(
    new PrismaCourseLikeRepository(),
    new PrismaCourseDislikeRepository(),
  );
}
