import { PrismaLessonRepository } from "../../repositories/prisma/prisma-lesson-repository";
import { PrismaVideoRepository } from "../../repositories/prisma/prisma-video-repository";
import { PrismaVideoProviderRepository } from "../../repositories/prisma/prisma-video-provider-repository";
import { PrismaArticleRepository } from "../../repositories/prisma/prisma-article-repository";
import { PrismaQuizRepository } from "../../repositories/prisma/prisma-quiz-repository";
import { PrismaProjectRepository } from "../../repositories/prisma/prisma-project-repository";
import { PrismaLabRepository } from "../../repositories/prisma/prisma-lab-repository";
import { UpdateLessonUseCase } from "../../use-cases/entities/Lesson/update";

export function makeUpdateLessonUseCase() {
  const lessonRepository = new PrismaLessonRepository();
  const videoRepository = new PrismaVideoRepository();
  const videoProviderRepository = new PrismaVideoProviderRepository();
  const articleRepository = new PrismaArticleRepository();
  const quizRepository = new PrismaQuizRepository();
  const projectRepository = new PrismaProjectRepository();
  const labRepository = new PrismaLabRepository();
  const updateLessonUseCase = new UpdateLessonUseCase(
    lessonRepository,
    videoRepository,
    videoProviderRepository,
    articleRepository,
    quizRepository,
    projectRepository,
    labRepository
  );

  return updateLessonUseCase;
}
