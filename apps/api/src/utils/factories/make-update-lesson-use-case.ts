import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaVideoRepository } from "../../repositories/prisma/prisma-video-repository";
import { PrismaArticleRepository } from "../../repositories/prisma/prisma-article-repository";
import { UpdateLessonUseCase } from "../../use-cases/entities/Lesson/update";

export function makeUpdateLessonUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const videoRepository = new PrismaVideoRepository();
  const articleRepository = new PrismaArticleRepository();
  const updateLessonUseCase = new UpdateLessonUseCase(
    lessonRepository,
    videoRepository,
    articleRepository
  );

  return updateLessonUseCase;
}
