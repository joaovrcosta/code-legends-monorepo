import { PrismaLessonDislikeRepository } from "../../repositories/prisma/prisma-lesson-dislike-repository";
import { PrismaLessonLikeRepository } from "../../repositories/prisma/prisma-lesson-like-repository";
import { RemoveLessonDislikeUseCase } from "../../use-cases/entities/LessonDislike/remove";

export function makeRemoveLessonDislikeUseCase() {
  return new RemoveLessonDislikeUseCase(
    new PrismaLessonDislikeRepository(),
    new PrismaLessonLikeRepository(),
  );
}
