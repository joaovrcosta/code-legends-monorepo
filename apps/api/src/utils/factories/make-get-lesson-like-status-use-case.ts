import { PrismaLessonDislikeRepository } from "../../repositories/prisma/prisma-lesson-dislike-repository";
import { PrismaLessonLikeRepository } from "../../repositories/prisma/prisma-lesson-like-repository";
import { GetLessonLikeStatusUseCase } from "../../use-cases/entities/LessonLike/get-status";

export function makeGetLessonLikeStatusUseCase() {
  return new GetLessonLikeStatusUseCase(
    new PrismaLessonLikeRepository(),
    new PrismaLessonDislikeRepository(),
  );
}
