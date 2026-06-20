import { PrismaLessonDislikeRepository } from "../../repositories/prisma/prisma-lesson-dislike-repository";
import { PrismaLessonLikeRepository } from "../../repositories/prisma/prisma-lesson-like-repository";
import { RemoveLessonLikeUseCase } from "../../use-cases/entities/LessonLike/remove";

export function makeRemoveLessonLikeUseCase() {
  return new RemoveLessonLikeUseCase(
    new PrismaLessonLikeRepository(),
    new PrismaLessonDislikeRepository(),
  );
}
