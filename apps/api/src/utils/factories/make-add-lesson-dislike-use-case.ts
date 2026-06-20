import { PrismaLessonDislikeRepository } from "../../repositories/prisma/prisma-lesson-dislike-repository";
import { PrismaLessonLikeRepository } from "../../repositories/prisma/prisma-lesson-like-repository";
import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { AddLessonDislikeUseCase } from "../../use-cases/entities/LessonDislike/add";

export function makeAddLessonDislikeUseCase() {
  return new AddLessonDislikeUseCase(
    new PrismaLessonDislikeRepository(),
    new PrismaLessonLikeRepository(),
    new PrismaLessonRepository(),
  );
}
