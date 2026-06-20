import { PrismaLessonDislikeRepository } from "../../repositories/prisma/prisma-lesson-dislike-repository";
import { PrismaLessonLikeRepository } from "../../repositories/prisma/prisma-lesson-like-repository";
import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { AddLessonLikeUseCase } from "../../use-cases/entities/LessonLike/add";

export function makeAddLessonLikeUseCase() {
  return new AddLessonLikeUseCase(
    new PrismaLessonLikeRepository(),
    new PrismaLessonDislikeRepository(),
    new PrismaLessonRepository(),
  );
}
