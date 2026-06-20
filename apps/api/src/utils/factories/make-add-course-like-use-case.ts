import { PrismaCourseDislikeRepository } from "../../repositories/prisma/prisma-course-dislike-repository";
import { PrismaCourseLikeRepository } from "../../repositories/prisma/prisma-course-like-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { AddCourseLikeUseCase } from "../../use-cases/entities/CourseLike/add";

export function makeAddCourseLikeUseCase() {
  return new AddCourseLikeUseCase(
    new PrismaCourseLikeRepository(),
    new PrismaCourseDislikeRepository(),
    new PrismaCourseRepository(),
  );
}
